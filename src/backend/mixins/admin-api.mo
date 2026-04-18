import List "mo:core/List";
import Set "mo:core/Set";
import Common "../types/common";
import OrderTypes "../types/orders";
import AdminTypes "../types/admin";
import AdminLib "../lib/admin";
import ContactLib "../lib/contacts";
import LoginLib "../lib/logins";
import InventoryLib "../lib/inventory";
import ReviewLib "../lib/reviews";
import ReviewTypes "../types/reviews";

mixin (
  contacts : List.List<AdminTypes.ContactSubmission>,
  nextContactId : { var value : Nat },
  loginEvents : List.List<AdminTypes.LoginEvent>,
  inventory : InventoryLib.InventoryStore,
  orders : List.List<OrderTypes.Order>,
  adminPasswordHash : Text,
  reviewStore : ReviewLib.ReviewStore,
) {
  // ── Contact Us ──────────────────────────────────────────────────────────────

  public shared func submitContactForm(
    name : Text,
    email : Text,
    message : Text,
  ) : async { #ok : AdminTypes.ContactId; #err : Text } {
    ContactLib.submitContact(contacts, nextContactId, name, email, message);
  };

  public shared ({ caller }) func adminGetContactSubmissions(
    password : Text
  ) : async [AdminTypes.ContactSubmission] {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return [];
    };
    ContactLib.getAllContacts(contacts);
  };

  public shared ({ caller }) func adminMarkContactRead(
    password : Text,
    id : AdminTypes.ContactId,
  ) : async { #ok; #err : Text } {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return #err "Unauthorized";
    };
    let found = ContactLib.markContactRead(contacts, id);
    if (found) #ok else #err "Contact not found";
  };

  // ── Login tracking ──────────────────────────────────────────────────────────

  public shared ({ caller }) func recordLogin(
    method : AdminTypes.LoginMethod,
    displayName : ?Text,
  ) : async () {
    LoginLib.recordLogin(loginEvents, caller, method, displayName);
  };

  public shared ({ caller }) func adminGetLoginHistory(
    password : Text
  ) : async [AdminTypes.LoginEvent] {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return [];
    };
    LoginLib.getAllLoginEvents(loginEvents);
  };

  // ── Inventory management ────────────────────────────────────────────────────

  public shared ({ caller }) func adminGetInventory(
    password : Text
  ) : async [AdminTypes.InventoryItem] {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return [];
    };
    InventoryLib.getAllInventory(inventory);
  };

  public shared ({ caller }) func adminUpdateStock(
    password : Text,
    productId : Common.ProductId,
    inStock : Bool,
  ) : async { #ok; #err : Text } {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return #err "Unauthorized";
    };
    let _ = InventoryLib.updateStock(inventory, productId, inStock);
    #ok;
  };

  public shared ({ caller }) func adminDeleteProduct(
    password : Text,
    productId : Common.ProductId,
  ) : async { #ok; #err : Text } {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return #err "Unauthorized";
    };
    let found = InventoryLib.deleteProduct(inventory, productId);
    if (found) #ok else #err "Product not found";
  };

  public shared ({ caller }) func adminUpdateProduct(
    password : Text,
    productId : Common.ProductId,
    updates : AdminTypes.ProductUpdate,
  ) : async { #ok; #err : Text } {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return #err "Unauthorized";
    };
    let found = InventoryLib.updateProduct(inventory, productId, updates);
    if (found) #ok else #err "Product not found";
  };

  // ── Damaged orders ──────────────────────────────────────────────────────────

  public shared ({ caller }) func adminFlagOrderDamaged(
    password : Text,
    orderId : Common.OrderId,
    damaged : Bool,
  ) : async { #ok; #err : Text } {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return #err "Unauthorized";
    };
    var found = false;
    orders.mapInPlace(func(o) {
      if (o.id == orderId) {
        found := true;
        { o with isDamaged = damaged };
      } else {
        o;
      }
    });
    if (found) #ok else #err "Order not found";
  };

  public shared ({ caller }) func adminGetDamagedOrders(
    password : Text
  ) : async [OrderTypes.Order] {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return [];
    };
    orders.filter(func(o) { o.isDamaged }).toArray();
  };

  // ── Out of stock ────────────────────────────────────────────────────────────

  public shared ({ caller }) func adminGetOutOfStockProducts(
    password : Text
  ) : async [AdminTypes.InventoryItem] {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return [];
    };
    InventoryLib.getOutOfStock(inventory);
  };

  // ── All reviews ─────────────────────────────────────────────────────────────

  public shared ({ caller }) func adminGetAllReviews(
    password : Text
  ) : async [ReviewTypes.Review] {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return [];
    };
    ReviewLib.getAllReviews(reviewStore);
  };

  // ── Dashboard stats ─────────────────────────────────────────────────────────

  public shared ({ caller }) func adminGetDashboardStats(
    password : Text
  ) : async ?AdminTypes.DashboardStats {
    if (not AdminLib.verifyAdminPassword(password, adminPasswordHash)) {
      return null;
    };
    let totalProducts = inventory.size();
    let inStockCount = inventory.entries()
      .filter(func((_, item)) { item.inStock })
      .size();
    let totalOrders = orders.size();
    let customerSet = Set.empty<Common.UserId>();
    var deliveredOrders : Nat = 0;
    var refundedOrders : Nat = 0;
    var cancelledOrders : Nat = 0;
    var damagedOrders : Nat = 0;
    orders.forEach(func(o) {
      customerSet.add(o.userId);
      switch (o.status) {
        case (#delivered) { deliveredOrders += 1 };
        case (#refunded)  { refundedOrders  += 1 };
        case (#cancelled) { cancelledOrders += 1 };
        case (_) {};
      };
      if (o.isDamaged) { damagedOrders += 1 };
    });
    let uniqueCustomers = customerSet.size();
    ?{
      totalProducts;
      inStockCount;
      totalOrders;
      uniqueCustomers;
      deliveredOrders;
      refundedOrders;
      cancelledOrders;
      damagedOrders;
    };
  };
};
