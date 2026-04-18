import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import AdminTypes "../types/admin";

module {
  public func submitContact(
    contacts : List.List<AdminTypes.ContactSubmission>,
    nextId : { var value : Nat },
    name : Text,
    email : Text,
    message : Text,
  ) : { #ok : AdminTypes.ContactId; #err : Text } {
    if (name.size() == 0) return #err "Name is required";
    if (email.size() == 0) return #err "Email is required";
    if (message.size() == 0) return #err "Message is required";

    let id = nextId.value;
    nextId.value += 1;

    let submission : AdminTypes.ContactSubmission = {
      id;
      name;
      email;
      message;
      submittedAt = Time.now();
      isRead = false;
    };

    contacts.add(submission);

    #ok id;
  };

  public func getAllContacts(
    contacts : List.List<AdminTypes.ContactSubmission>
  ) : [AdminTypes.ContactSubmission] {
    contacts.toArray();
  };

  public func markContactRead(
    contacts : List.List<AdminTypes.ContactSubmission>,
    id : AdminTypes.ContactId,
  ) : Bool {
    var found = false;
    contacts.mapInPlace(func(c) {
      if (c.id == id) {
        found := true;
        { c with isRead = true };
      } else {
        c;
      }
    });
    found;
  };
};
