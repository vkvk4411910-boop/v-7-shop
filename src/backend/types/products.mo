import Common "common";

module {
  public type Product = {
    id : Common.ProductId;
    name : Text;
    brand : Text;
    category : Text;
    price : Float;
    imageUrl : Text;
    description : Text;
    colors : [Text];
    sizes : [Text];
  };
};
