import List "mo:core/List";
import Time "mo:core/Time";
import OrderTypes "../types/orders";
import Common "../types/common";
import AdminLib "../lib/admin";
import OrderLib "../lib/orders";

mixin (
  altPayments : List.List<OrderTypes.AltPaymentRecord>,
  orders : List.List<OrderTypes.Order>,
  adminPasswordHash : Text,
) {
  /// Record a PayPal / Razorpay / Cashfree payment and confirm the order.
  public shared ({ caller }) func recordAltPayment(
    orderId : Common.OrderId,
    paymentMethod : Text,
    transactionId : Text,
    amount : Float,
    password : Text,
  ) : async { #ok : Text; #err : Text } {
    // Either the caller owns the order, or an admin is confirming it
    let ownedByCaller = orders.find(func(o) { o.id == orderId and o.userId == caller }) != null;
    let isAdmin = AdminLib.verifyAdminPassword(password, adminPasswordHash);
    if (not ownedByCaller and not isAdmin) {
      return #err "Order not found or unauthorized";
    };

    let record : OrderTypes.AltPaymentRecord = {
      orderId;
      paymentMethod;
      transactionId;
      amount;
      status = "completed";
      timestamp = Time.now();
    };
    altPayments.add(record);

    let _ = OrderLib.updateOrderStatus(orders, orderId, #confirmed);
    #ok "Payment recorded";
  };

  /// Admin: Get all alternative payment records (PayPal, Razorpay, Cashfree).
  public shared ({ caller }) func adminGetAltPayments(
    password : Text
  ) : async [OrderTypes.AltPaymentRecord] {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return [];
    };
    altPayments.toArray();
  };
};
