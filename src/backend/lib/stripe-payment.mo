import Types "../types/stripe-payment";
import OrderTypes "../types/orders";
import Common "../types/common";
import List "mo:core/List";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Float "mo:core/Float";

module {
  // IC management canister types for http_request
  type HttpHeader = { name : Text; value : Text };
  type HttpRequestArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    method : { #get; #head; #post };
    headers : [HttpHeader];
    body : ?Blob;
    transform : ?{
      function : shared query ({ response : HttpRequestResult; context : Blob }) -> async HttpRequestResult;
      context : Blob;
    };
    is_replicated : ?Bool;
  };
  type HttpRequestResult = {
    status : Nat;
    headers : [HttpHeader];
    body : Blob;
  };

  type ICManagement = actor {
    http_request : HttpRequestArgs -> async HttpRequestResult;
  };

  let ic : ICManagement = actor "aaaaa-aa";

  // Convert Float rupees to Nat paise (multiply by 100, truncate)
  func rupeesToPaise(rupees : Float) : Nat {
    if (rupees < 0.0) { return 0 };
    let i = (rupees * 100.0).toInt();
    if (i < 0) { return 0 };
    i.toNat();
  };

  // Minimal URL encode for Stripe form fields (encode % first to avoid double-encoding)
  func urlEncode(s : Text) : Text {
    s
      .replace(#text "%", "%25")
      .replace(#text "&", "%26")
      .replace(#text "=", "%3D")
      .replace(#text "?", "%3F")
      .replace(#text "#", "%23")
      .replace(#text "{", "%7B")
      .replace(#text "}", "%7D")
      .replace(#text ":", "%3A")
      .replace(#text "/", "%2F")
      .replace(#text " ", "+");
  };

  // Build application/x-www-form-urlencoded body for Stripe Checkout Session
  func buildCheckoutBody(request : Types.CreateCheckoutSessionRequest) : Text {
    var body = "mode=payment";
    body #= "&success_url=" # urlEncode(request.successUrl);
    body #= "&cancel_url=" # urlEncode(request.cancelUrl);
    body #= "&metadata[order_id]=" # request.orderId.toText();

    var i = 0;
    for (item in request.lineItems.values()) {
      let paise = rupeesToPaise(item.priceRupees);
      body #= "&line_items[" # i.toText() # "][price_data][currency]=inr";
      body #= "&line_items[" # i.toText() # "][price_data][unit_amount]=" # paise.toText();
      body #= "&line_items[" # i.toText() # "][price_data][product_data][name]=" # urlEncode(item.name);
      body #= "&line_items[" # i.toText() # "][quantity]=" # item.quantity.toText();
      i += 1;
    };
    body;
  };

  // Extract a JSON string value: finds `"key":"<value>"` and returns value
  func extractJsonString(json : Text, key : Text) : ?Text {
    let needle = "\"" # key # "\":\"";
    // Split on the needle — first segment is before it, second is value + rest
    let iter = json.split(#text needle);
    ignore iter.next(); // discard part before key
    switch (iter.next()) {
      case null null;
      case (?valueAndRest) {
        // Value ends at first unescaped quote
        switch (valueAndRest.split(#text "\"").next()) {
          case null null;
          case (?value) ?value;
        };
      };
    };
  };

  // Create a Stripe Checkout Session via IC HTTP outcall
  public func createCheckoutSession<system>(
    request : Types.CreateCheckoutSessionRequest,
    stripeSecretKey : Text,
  ) : async Types.CreateCheckoutSessionResult {
    let formBody = buildCheckoutBody(request);
    let httpRequest : HttpRequestArgs = {
      url = "https://api.stripe.com/v1/checkout/sessions";
      max_response_bytes = ?65536 : ?Nat64;
      method = #post;
      headers = [
        { name = "Authorization"; value = "Bearer " # stripeSecretKey },
        { name = "Content-Type"; value = "application/x-www-form-urlencoded" },
        { name = "Stripe-Version"; value = "2024-06-20" },
      ];
      body = ?formBody.encodeUtf8();
      transform = null;
      is_replicated = ?true;
    };

    let response = await (with cycles = 60_000_000_000) ic.http_request(httpRequest);
    let responseText = switch (response.body.decodeUtf8()) {
      case null { return #err("Failed to decode Stripe response body") };
      case (?t) t;
    };

    if (response.status == 200) {
      switch (extractJsonString(responseText, "url")) {
        case null { #err("Stripe session URL not found in response: " # responseText) };
        case (?url) { #ok(url) };
      };
    } else {
      #err("Stripe API error (HTTP " # response.status.toText() # "): " # responseText);
    };
  };

  // Verify a Stripe Checkout Session payment status
  public func verifyPayment<system>(
    sessionId : Text,
    stripeSecretKey : Text,
  ) : async Types.PaymentStatus {
    let httpRequest : HttpRequestArgs = {
      url = "https://api.stripe.com/v1/checkout/sessions/" # sessionId;
      max_response_bytes = ?65536 : ?Nat64;
      method = #get;
      headers = [
        { name = "Authorization"; value = "Bearer " # stripeSecretKey },
        { name = "Stripe-Version"; value = "2024-06-20" },
      ];
      body = null;
      transform = null;
      is_replicated = ?true;
    };

    let response = await (with cycles = 60_000_000_000) ic.http_request(httpRequest);
    let responseText = switch (response.body.decodeUtf8()) {
      case null { return #err("Failed to decode Stripe response body") };
      case (?t) t;
    };

    if (response.status != 200) {
      return #err("Stripe API error (HTTP " # response.status.toText() # "): " # responseText);
    };

    switch (extractJsonString(responseText, "payment_status")) {
      case null { #err("payment_status not found in Stripe response") };
      case (?status) {
        if (status == "paid" or status == "no_payment_required") { #paid }
        else if (status == "unpaid") { #unpaid }
        else { #expired };
      };
    };
  };

  // Confirm order payment: set stripeTransactionId and status = #confirmed
  public func confirmOrderPayment(
    orders : List.List<OrderTypes.Order>,
    orderId : Common.OrderId,
    sessionId : Text,
  ) : Bool {
    var found = false;
    orders.mapInPlace(func(o) {
      if (o.id == orderId) {
        found := true;
        { o with stripeTransactionId = ?sessionId; status = #confirmed };
      } else {
        o;
      }
    });
    found;
  };
};
