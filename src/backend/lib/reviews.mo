import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Types "../types/reviews";

module {
  public type ReviewStore = Map.Map<Types.ProductId, List.List<Types.Review>>;

  public func addReview(
    store : ReviewStore,
    nextId : { var value : Nat },
    productId : Types.ProductId,
    reviewerName : Text,
    rating : Nat,
    text : Text,
    timestamp : Int,
  ) : Types.ReviewId {
    let id = nextId.value;
    nextId.value += 1;

    let review : Types.Review = {
      id;
      productId;
      reviewerName;
      rating;
      text;
      timestamp;
    };

    let list = switch (store.get(productId)) {
      case (?l) l;
      case null {
        let l = List.empty<Types.Review>();
        store.add(productId, l);
        l;
      };
    };
    list.add(review);

    id;
  };

  public func getReviews(
    store : ReviewStore,
    productId : Types.ProductId,
  ) : [Types.Review] {
    switch (store.get(productId)) {
      case (?list) list.toArray();
      case null [];
    };
  };

  public func getAllReviews(store : ReviewStore) : [Types.Review] {
    let result = List.empty<Types.Review>();
    for ((_, list) in store.entries()) {
      result.append(list);
    };
    result.toArray();
  };

  public func getAverageRating(
    store : ReviewStore,
    productId : Types.ProductId,
  ) : ?Float {
    switch (store.get(productId)) {
      case null null;
      case (?list) {
        let size = list.size();
        if (size == 0) return null;
        let total : Nat = list.foldLeft(0, func(acc : Nat, r : Types.Review) : Nat { acc + r.rating });
        ?(total.toFloat() / size.toFloat());
      };
    };
  };
};
