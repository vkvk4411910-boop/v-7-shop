import Common "common";

module {
  public type ReviewId = Nat;
  public type ProductId = Common.ProductId;

  public type Review = {
    id : ReviewId;
    productId : ProductId;
    reviewerName : Text;
    rating : Nat;
    text : Text;
    timestamp : Common.Timestamp;
  };
};
