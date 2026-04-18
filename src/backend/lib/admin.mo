module {
  public func verifyAdminPassword(password : Text, adminHash : Text) : Bool {
    password == adminHash;
  };
};
