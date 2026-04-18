import List "mo:core/List";
import Time "mo:core/Time";
import OrderTypes "../types/orders";
import Common "../types/common";
import AdminLib "../lib/admin";
import OrderLib "../lib/orders";

mixin (
  upiPayments : List.List<OrderTypes.UpiPaymentRecord>,
  orders : List.List<OrderTypes.Order>,
  adminPasswordHash : Text,
) {
  /// Record a UPI payment for an order and confirm it.
  /// Saves the UPI transaction record and sets the order status to #confirmed.
  public shared ({ caller }) func recordUpiPayment(
    orderId : Common.OrderId,
    upiTransactionId : Text,
    amount : Nat,
  ) : async { #ok : Text; #err : Text } {
    // Verify the order exists and belongs to the caller
    switch (orders.find(func(o) { o.id == orderId and o.userId == caller })) {
      case null { return #err "Order not found or unauthorized" };
      case (?_) {};
    };

    let record : OrderTypes.UpiPaymentRecord = {
      orderId;
      upiTransactionId;
      amount;
      timestamp = Time.now();
      status = "completed";
    };
    upiPayments.add(record);

    // Confirm the order
    let _ = OrderLib.updateOrderStatus(orders, orderId, #confirmed);

    #ok "UPI payment recorded";
  };

  /// Admin: Get all UPI payment records.
  public shared ({ caller }) func adminGetUpiPayments(
    password : Text
  ) : async [OrderTypes.UpiPaymentRecord] {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return [];
    };
    upiPayments.toArray();
  };
};
