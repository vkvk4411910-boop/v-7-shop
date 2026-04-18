import List "mo:core/List";
import Types "../types/stripe-payment";
import OrderTypes "../types/orders";
import Common "../types/common";
import StripeLib "../lib/stripe-payment";
import AdminLib "../lib/admin";

mixin (
  orders : List.List<OrderTypes.Order>,
  stripeSecretKey : Text,
  adminPasswordHash : Text,
) {
  /// Create a Stripe Checkout Session for an order.
  /// Returns the Stripe-hosted checkout URL to redirect the user to.
  /// Prices in lineItems are in INR rupees; conversion to paise (×100) is handled internally.
  public shared ({ caller }) func createStripeCheckoutSession(
    request : Types.CreateCheckoutSessionRequest
  ) : async Types.CreateCheckoutSessionResult {
    await StripeLib.createCheckoutSession(request, stripeSecretKey);
  };

  /// Verify payment status of a Stripe Checkout Session by session_id.
  /// Returns #paid, #unpaid, #expired, or #err(message).
  public shared ({ caller }) func verifyStripePayment(
    sessionId : Text
  ) : async Types.PaymentStatus {
    await StripeLib.verifyPayment(sessionId, stripeSecretKey);
  };

  /// Admin: Record a verified Stripe payment against an order.
  /// Sets the stripeTransactionId and marks order status as #confirmed.
  /// Requires admin password.
  public shared ({ caller }) func adminUpdateOrderPaymentStatus(
    password : Text,
    orderId : Common.OrderId,
    sessionId : Text,
  ) : async Bool {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return false;
    };
    StripeLib.confirmOrderPayment(orders, orderId, sessionId);
  };
};
