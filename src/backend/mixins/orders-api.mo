import List "mo:core/List";
import Types "../types/orders";
import Common "../types/common";
import OrderLib "../lib/orders";
import AdminLib "../lib/admin";

mixin (
  orders : List.List<Types.Order>,
  nextOrderId : { var value : Nat },
  adminPasswordHash : Text,
) {
  public shared ({ caller }) func placeOrder(
    request : Types.PlaceOrderRequest
  ) : async Types.Order {
    OrderLib.placeOrder(orders, nextOrderId, caller, request);
  };

  public shared query ({ caller }) func getUserOrders() : async [Types.Order] {
    OrderLib.getUserOrders(orders, caller);
  };

  public shared ({ caller }) func cancelOrder(orderId : Common.OrderId) : async Bool {
    OrderLib.cancelOrder(orders, orderId, caller);
  };

  public shared ({ caller }) func adminGetAllOrders(password : Text) : async [Types.Order] {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return [];
    };
    OrderLib.getAllOrders(orders);
  };

  public shared ({ caller }) func adminUpdateOrderStatus(
    password : Text,
    orderId : Common.OrderId,
    newStatus : Types.OrderStatus,
  ) : async Bool {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return false;
    };
    OrderLib.updateOrderStatus(orders, orderId, newStatus);
  };

  public shared ({ caller }) func adminVerifyPassword(password : Text) : async Bool {
    AdminLib.verifyAdminPassword(password, adminPasswordHash);
  };
};
