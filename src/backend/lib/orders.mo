import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Types "../types/orders";
import Common "../types/common";

module {
  public func placeOrder(
    orders : List.List<Types.Order>,
    nextId : { var value : Nat },
    caller : Common.UserId,
    request : Types.PlaceOrderRequest,
  ) : Types.Order {
    let id = nextId.value;
    nextId.value += 1;

    let total : Float = request.items.foldLeft(0.0, func(acc : Float, item : Types.OrderItem) : Float {
      acc + item.price * item.quantity.toFloat()
    });

    let order : Types.Order = {
      id;
      userId = caller;
      items = request.items;
      address = request.address;
      paymentMethod = request.paymentMethod;
      status = #pending;
      createdAt = Time.now();
      total;
      isDamaged = false;
      stripeTransactionId = request.stripeTransactionId;
    };

    orders.add(order);

    order;
  };

  public func getUserOrders(
    orders : List.List<Types.Order>,
    userId : Common.UserId,
  ) : [Types.Order] {
    orders.filter(func(o) { o.userId == userId }).toArray();
  };

  public func getAllOrders(orders : List.List<Types.Order>) : [Types.Order] {
    orders.toArray();
  };

  public func cancelOrder(
    orders : List.List<Types.Order>,
    orderId : Common.OrderId,
    caller : Common.UserId,
  ) : Bool {
    var found = false;
    orders.mapInPlace(func(o) {
      if (o.id == orderId and o.userId == caller) {
        found := true;
        { o with status = #cancelled };
      } else {
        o;
      }
    });
    found;
  };

  public func updateOrderStatus(
    orders : List.List<Types.Order>,
    orderId : Common.OrderId,
    newStatus : Types.OrderStatus,
  ) : Bool {
    var found = false;
    orders.mapInPlace(func(o) {
      if (o.id == orderId) {
        found := true;
        { o with status = newStatus };
      } else {
        o;
      }
    });
    found;
  };
};
