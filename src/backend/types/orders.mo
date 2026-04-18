import Common "common";

module {
  public type OrderStatus = {
    #pending;
    #confirmed;
    #shipped;
    #delivered;
    #cancelled;
    #refunded;
  };

  public type PaymentMethod = {
    #cod;
    #online;
    #upi;
    #paypal;
    #razorpay;
    #cashfree;
  };

  public type AltPaymentRecord = {
    orderId : Common.OrderId;
    paymentMethod : Text;
    transactionId : Text;
    amount : Float;
    status : Text;
    timestamp : Common.Timestamp;
  };

  public type UpiPaymentRecord = {
    orderId : Common.OrderId;
    upiTransactionId : Text;
    amount : Nat;
    timestamp : Common.Timestamp;
    status : Text;
  };

  public type Address = {
    state : Text;
    city : Text;
    pin : Text;
    houseNumber : Text;
  };

  public type OrderItem = {
    productId : Common.ProductId;
    name : Text;
    quantity : Nat;
    price : Float;
  };

  public type Order = {
    id : Common.OrderId;
    userId : Common.UserId;
    items : [OrderItem];
    address : Address;
    paymentMethod : PaymentMethod;
    status : OrderStatus;
    createdAt : Common.Timestamp;
    total : Float;
    isDamaged : Bool;
    stripeTransactionId : ?Text;
  };

  public type PlaceOrderRequest = {
    items : [OrderItem];
    address : Address;
    paymentMethod : PaymentMethod;
    stripeTransactionId : ?Text;
  };
};
