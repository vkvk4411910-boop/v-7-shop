import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import OrderTypes "types/orders";
import AdminTypes "types/admin";
import Common "types/common";
import InventoryLib "lib/inventory";
import OrdersApi "mixins/orders-api";
import ReviewsApi "mixins/reviews-api";
import AdminApi "mixins/admin-api";
import ReviewLib "lib/reviews";
import ReviewTypes "types/reviews";
import StripePaymentApi "mixins/stripe-payment-api";
import UpiPaymentApi "mixins/upi-payment-api";
import AltPaymentApi "mixins/alt-payment-api";



actor {
  let orders = List.empty<OrderTypes.Order>();
  let nextOrderId = { var value : Nat = 1 };
  let adminPasswordHash : Text = "justvishal";

  // Stripe secret key — defaults to test placeholder; configure before going live
  let stripeSecretKey : Text = "sk_test_placeholder";

  // Reviews state
  let reviewStore : ReviewLib.ReviewStore = Map.empty<ReviewTypes.ProductId, List.List<ReviewTypes.Review>>();
  let nextReviewId = { var value : Nat = 1 };

  // Admin state
  let contacts = List.empty<AdminTypes.ContactSubmission>();
  let nextContactId = { var value : Nat = 1 };
  let loginEvents = List.empty<AdminTypes.LoginEvent>();
  let inventory : InventoryLib.InventoryStore = Map.empty<Common.ProductId, AdminTypes.InventoryItem>();

  // UPI payment records
  let upiPayments = List.empty<OrderTypes.UpiPaymentRecord>();

  // Alt payment records (PayPal, Razorpay, Cashfree)
  let altPayments = List.empty<OrderTypes.AltPaymentRecord>();

  // Seed fake reviews once at initialization
  var seedReviewsDone : Bool = false;

  if (not seedReviewsDone) {
    let day : Int = 86_400_000_000_000; // 1 day in nanoseconds
    let now : Int = Time.now();

    // nike-001 — Nike Air Max 270
    ignore ReviewLib.addReview(reviewStore, nextReviewId, "nike-001", "Rahul Sharma", 5,
      "Absolutely love these shoes! The Air Max 270 cushioning makes long walks feel effortless. The design is super stylish and I get compliments every time I wear them.", now - day * 12);
    ignore ReviewLib.addReview(reviewStore, nextReviewId, "nike-001", "Sneha Iyer", 4,
      "Great comfort and build quality. The sole grip is excellent on all surfaces. Sizing runs slightly large so order half a size down.", now - day * 5);

    // adidas-001 — Adidas Ultraboost 22
    ignore ReviewLib.addReview(reviewStore, nextReviewId, "adidas-001", "Amit Kumar", 5,
      "The Ultraboost 22 is hands down the best running shoe I have ever owned. The Primeknit upper fits like a sock and the Boost midsole returns energy with every step. Worth every rupee.", now - day * 20);
    ignore ReviewLib.addReview(reviewStore, nextReviewId, "adidas-001", "Pooja Mehta", 4,
      "Really comfortable for both gym and casual use. The torsion bar gives good stability. Wish there were more colour options but the quality is excellent.", now - day * 7);

    // levis-001 — Levi's 511 Slim Fit Jeans
    ignore ReviewLib.addReview(reviewStore, nextReviewId, "levis-001", "Vikram Nair", 5,
      "Perfect slim fit without being too tight. The denim quality is top notch and the stretch fabric makes it very comfortable to wear all day. True to size.", now - day * 30);
    ignore ReviewLib.addReview(reviewStore, nextReviewId, "levis-001", "Deepika Rajput", 3,
      "Good jeans overall but the colour faded slightly after a few washes. The fit and cut are great though and they look very stylish. Would recommend washing inside out.", now - day * 15);

    // zara-001 — Zara Floral Maxi Dress
    ignore ReviewLib.addReview(reviewStore, nextReviewId, "zara-001", "Ananya Singh", 5,
      "This dress is absolutely gorgeous! The floral print is vibrant and the fabric is lightweight and breathable. Got so many compliments at a family wedding. Packaging was also beautiful.", now - day * 9);
    ignore ReviewLib.addReview(reviewStore, nextReviewId, "zara-001", "Kavita Rao", 4,
      "Lovely dress with great drape. The maxi length is perfect for formal and casual occasions alike. The stitching is neat and the colours are exactly as shown in the photos.", now - day * 3);

    // puma-001 — Puma RS-X3 Puzzle
    ignore ReviewLib.addReview(reviewStore, nextReviewId, "puma-001", "Arjun Verma", 5,
      "The RS-X3 Puzzle is a head turner! The chunky sole and bold colour blocking make it stand out from the crowd. Comfort is excellent for all-day wear and the build quality feels premium.", now - day * 18);
    ignore ReviewLib.addReview(reviewStore, nextReviewId, "puma-001", "Riya Desai", 4,
      "Very stylish sneakers with a unique retro look. The cushioning is great and they pair well with both jeans and joggers. Delivery was fast and the shoes were well packed.", now - day * 6);

    // lakme-001 — Lakme 9 to 5 Weightless Foundation
    ignore ReviewLib.addReview(reviewStore, nextReviewId, "lakme-001", "Priya Patel", 5,
      "This foundation is a game changer for Indian skin tones. It gives a natural matte finish without looking cakey and lasts through a full day of office work. The shade range is also impressive.", now - day * 25);
    ignore ReviewLib.addReview(reviewStore, nextReviewId, "lakme-001", "Meera Joshi", 4,
      "Lightweight formula that feels like skin. Blends easily and offers medium to full coverage depending on how much you build it up. Great value for money compared to international brands.", now - day * 11);

    seedReviewsDone := true;
  };

  include OrdersApi(orders, nextOrderId, adminPasswordHash);
  include ReviewsApi(reviewStore, nextReviewId);
  include AdminApi(contacts, nextContactId, loginEvents, inventory, orders, adminPasswordHash, reviewStore);
  include StripePaymentApi(orders, stripeSecretKey, adminPasswordHash);
  include UpiPaymentApi(upiPayments, orders, adminPasswordHash);
  include AltPaymentApi(altPayments, orders, adminPasswordHash);
};
