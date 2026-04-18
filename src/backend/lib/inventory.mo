import Map "mo:core/Map";
import Time "mo:core/Time";
import Common "../types/common";
import AdminTypes "../types/admin";

module {
  public type InventoryStore = Map.Map<Common.ProductId, AdminTypes.InventoryItem>;

  public func getAllInventory(
    inventory : InventoryStore
  ) : [AdminTypes.InventoryItem] {
    inventory.entries().toArray().map<(Common.ProductId, AdminTypes.InventoryItem), AdminTypes.InventoryItem>(
      func((_, item)) { item }
    );
  };

  public func updateStock(
    inventory : InventoryStore,
    productId : Common.ProductId,
    inStock : Bool,
  ) : Bool {
    let existing = inventory.get(productId);
    let item : AdminTypes.InventoryItem = switch (existing) {
      case (?e) { { productId = e.productId; inStock; updatedAt = Time.now() } };
      case null {
        { productId; inStock; updatedAt = Time.now() };
      };
    };
    inventory.add(productId, item);
    true;
  };

  public func deleteProduct(
    inventory : InventoryStore,
    productId : Common.ProductId,
  ) : Bool {
    let exists = inventory.get(productId) != null;
    inventory.remove(productId);
    exists;
  };

  public func updateProduct(
    inventory : InventoryStore,
    productId : Common.ProductId,
    updates : AdminTypes.ProductUpdate,
  ) : Bool {
    switch (inventory.get(productId)) {
      case null false;
      case (?existing) {
        let inStock = switch (updates.inStock) {
          case (?v) v;
          case null existing.inStock;
        };
        inventory.add(productId, { productId = existing.productId; inStock; updatedAt = Time.now() });
        true;
      };
    };
  };

  public func getOutOfStock(
    inventory : InventoryStore
  ) : [AdminTypes.InventoryItem] {
    inventory.entries()
      .filter(func((_, item)) { not item.inStock })
      .toArray()
      .map<(Common.ProductId, AdminTypes.InventoryItem), AdminTypes.InventoryItem>(
        func((_, item)) { item }
      );
  };
};
