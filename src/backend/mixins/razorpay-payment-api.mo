import List "mo:core/List";
import Common "../types/common";
import OrderTypes "../types/orders";
import RazorpayTypes "../types/razorpay-payment";
import RazorpayLib "../lib/razorpay-payments";
import OrderLib "../lib/orders";
import AdminLib "../lib/admin";

mixin (
  razorpayPayments : List.List<RazorpayTypes.RazorpayPaymentRecord>,
  orders : List.List<OrderTypes.Order>,
  adminPasswordHash : Text,
) {
  /// Record a Razorpay payment outcome after the client-side callback.
  /// Called by the frontend after payment succeeds or fails.
  /// On success the corresponding order is confirmed.
  public shared ({ caller }) func recordRazorpayPayment(
    razorpayPaymentId : Text,
    razorpayOrderId : Text,
    amount : Nat,
    email : Text,
    orderId : Common.OrderId,
    items : [OrderTypes.OrderItem],
    paymentMethod : Text,
    status : Text,
    errorMessage : Text,
  ) : async { #ok : RazorpayTypes.RazorpayPaymentRecord; #err : Text } {
    let userPrincipal = caller.toText();

    let record = RazorpayLib.recordRazorpayPayment(
      razorpayPayments,
      razorpayPaymentId,
      razorpayOrderId,
      amount,
      email,
      userPrincipal,
      orderId,
      items,
      paymentMethod,
      status,
      errorMessage,
    );

    if (status == "success") {
      let _ = OrderLib.updateOrderStatus(orders, orderId, #confirmed);
    };

    #ok record;
  };

  /// Admin: return all Razorpay payment records.
  public shared ({ caller }) func adminGetRazorpayPayments(
    password : Text
  ) : async [RazorpayTypes.RazorpayPaymentRecord] {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return [];
    };
    RazorpayLib.getRazorpayPayments(razorpayPayments);
  };

  /// Admin: return aggregate Razorpay stats (total revenue, success/fail counts).
  public shared ({ caller }) func adminGetRazorpayStats(
    password : Text
  ) : async ?RazorpayTypes.RazorpayStats {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return null;
    };
    ?RazorpayLib.computeRazorpayStats(razorpayPayments);
  };

  /// User: return own Razorpay payment records.
  public shared ({ caller }) func getMyRazorpayPayments() : async [RazorpayTypes.RazorpayPaymentRecord] {
    RazorpayLib.getRazorpayPaymentsByUser(razorpayPayments, caller.toText());
  };
};
