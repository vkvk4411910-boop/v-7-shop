import Common "common";

module {
  public type ContactId = Nat;

  public type ContactSubmission = {
    id : ContactId;
    name : Text;
    email : Text;
    message : Text;
    submittedAt : Common.Timestamp;
    isRead : Bool;
  };

  public type LoginMethod = {
    #internetIdentity;
    #admin;
  };

  public type LoginEvent = {
    principal : Common.UserId;
    method : LoginMethod;
    timestamp : Common.Timestamp;
    displayName : ?Text;
  };

  public type DashboardStats = {
    totalProducts : Nat;
    inStockCount : Nat;
    totalOrders : Nat;
    uniqueCustomers : Nat;
    deliveredOrders : Nat;
    refundedOrders : Nat;
    cancelledOrders : Nat;
    damagedOrders : Nat;
  };

  public type InventoryItem = {
    productId : Common.ProductId;
    inStock : Bool;
    updatedAt : Common.Timestamp;
  };

  public type ProductUpdate = {
    price : ?Float;
    inStock : ?Bool;
  };
};
