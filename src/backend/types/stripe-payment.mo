import Common "common";

module {
  public type StripeLineItem = {
    name : Text;
    quantity : Nat;
    // price in INR rupees (will be converted to paise x100 when sent to Stripe)
    priceRupees : Float;
  };

  public type CreateCheckoutSessionRequest = {
    orderId : Common.OrderId;
    lineItems : [StripeLineItem];
    successUrl : Text;
    cancelUrl : Text;
  };

  public type CreateCheckoutSessionResult = {
    #ok : Text;   // Stripe checkout session URL
    #err : Text;  // error message
  };

  public type PaymentStatus = {
    #paid;
    #unpaid;
    #expired;
    #err : Text;
  };
};
