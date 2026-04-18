import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/reviews";
import ReviewLib "../lib/reviews";

mixin (
  reviewStore : ReviewLib.ReviewStore,
  nextReviewId : { var value : Nat },
) {
  public shared func submitReview(
    productId : Text,
    reviewerName : Text,
    rating : Nat,
    text : Text,
  ) : async { #ok : Types.ReviewId; #err : Text } {
    if (reviewerName.size() == 0) return #err "Name is required";
    if (text.size() == 0) return #err "Review text is required";
    if (rating == 0 or rating > 5) return #err "Rating must be between 1 and 5";
    let id = ReviewLib.addReview(reviewStore, nextReviewId, productId, reviewerName, rating, text, Time.now());
    #ok id;
  };

  public query func getReviews(productId : Text) : async [Types.Review] {
    ReviewLib.getReviews(reviewStore, productId);
  };

  public query func getAverageRating(productId : Text) : async ?Float {
    ReviewLib.getAverageRating(reviewStore, productId);
  };
};
