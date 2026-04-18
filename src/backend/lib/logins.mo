import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import AdminTypes "../types/admin";

module {
  public func recordLogin(
    loginEvents : List.List<AdminTypes.LoginEvent>,
    principal : Common.UserId,
    method : AdminTypes.LoginMethod,
    displayName : ?Text,
  ) : () {
    let event : AdminTypes.LoginEvent = {
      principal;
      method;
      timestamp = Time.now();
      displayName;
    };
    loginEvents.add(event);
  };

  public func getAllLoginEvents(
    loginEvents : List.List<AdminTypes.LoginEvent>
  ) : [AdminTypes.LoginEvent] {
    // Return sorted descending by timestamp
    let arr = loginEvents.toArray();
    arr.sort(func(a, b) {
      if (a.timestamp > b.timestamp) #less
      else if (a.timestamp < b.timestamp) #greater
      else #equal
    });
  };
};
