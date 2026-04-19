import Common "common";
import OrderTypes "orders";

module {
  public type RazorpayPaymentRecord = {
    razorpayPaymentId : Text;
    razorpayOrderId : Text;
    amount : Nat; // in paise
    email : Text;
    userPrincipal : Text;
    orderId : Common.OrderId;
    items : [OrderTypes.OrderItem];
    paymentMethod : Text; // card / upi / netbanking / wallet / qr
    status : Text; // success / failed
    errorMessage : Text; // empty string if no error
    timestamp : Common.Timestamp;
  };

  public type RazorpayStats = {
    totalTransactions : Nat;
    successCount : Nat;
    failedCount : Nat;
    totalRevenue : Nat; // sum of successful amounts in paise
  };
};
