import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/razorpay-payment";
import Common "../types/common";
import OrderTypes "../types/orders";

module {
  /// Record a Razorpay payment (success or failure) after the client-side callback.
  public func recordRazorpayPayment(
    razorpayPayments : List.List<Types.RazorpayPaymentRecord>,
    razorpayPaymentId : Text,
    razorpayOrderId : Text,
    amount : Nat,
    email : Text,
    userPrincipal : Text,
    orderId : Common.OrderId,
    items : [OrderTypes.OrderItem],
    paymentMethod : Text,
    status : Text,
    errorMessage : Text,
  ) : Types.RazorpayPaymentRecord {
    let record : Types.RazorpayPaymentRecord = {
      razorpayPaymentId;
      razorpayOrderId;
      amount;
      email;
      userPrincipal;
      orderId;
      items;
      paymentMethod;
      status;
      errorMessage;
      timestamp = Time.now();
    };
    razorpayPayments.add(record);
    record;
  };

  /// Return all Razorpay payment records (admin).
  public func getRazorpayPayments(
    razorpayPayments : List.List<Types.RazorpayPaymentRecord>
  ) : [Types.RazorpayPaymentRecord] {
    razorpayPayments.toArray();
  };

  /// Return all Razorpay payment records for a specific user principal.
  public func getRazorpayPaymentsByUser(
    razorpayPayments : List.List<Types.RazorpayPaymentRecord>,
    userPrincipal : Text,
  ) : [Types.RazorpayPaymentRecord] {
    razorpayPayments.filter(func(r) { r.userPrincipal == userPrincipal }).toArray();
  };

  /// Compute aggregate stats over all Razorpay payment records.
  public func computeRazorpayStats(
    razorpayPayments : List.List<Types.RazorpayPaymentRecord>
  ) : Types.RazorpayStats {
    var successCount : Nat = 0;
    var failedCount : Nat = 0;
    var totalRevenue : Nat = 0;
    razorpayPayments.forEach(func(r) {
      if (r.status == "success") {
        successCount += 1;
        totalRevenue += r.amount;
      } else {
        failedCount += 1;
      };
    });
    {
      totalTransactions = successCount + failedCount;
      successCount;
      failedCount;
      totalRevenue;
    };
  };
};
