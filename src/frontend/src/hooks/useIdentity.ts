import { deriveAvatarColor, useStore } from "@/store/useStore";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useEffect } from "react";

export function useIdentity() {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();

  const setLoggedIn = useStore((s) => s.setLoggedIn);
  const setUserDisplayName = useStore((s) => s.setUserDisplayName);
  const setUserAvatarColor = useStore((s) => s.setUserAvatarColor);
  const setUserPrincipal = useStore((s) => s.setUserPrincipal);

  // A user is logged in when an identity exists and it's NOT the anonymous principal.
  // This covers both: freshly logged in AND restored from local storage on page reload.
  const principalObj = identity?.getPrincipal();
  const isAnonymous = principalObj ? principalObj.isAnonymous() : true;
  const isLoggedIn = !!identity && !isAnonymous && !isInitializing;
  const isLoading = loginStatus === "logging-in" || isInitializing;
  const principalStr =
    principalObj && !isAnonymous ? principalObj.toText() : "";

  useEffect(() => {
    if (isInitializing) return; // wait until AuthClient finishes loading

    setLoggedIn(isLoggedIn);
    if (isLoggedIn && principalStr) {
      const shortId = principalStr.slice(0, 5).toUpperCase();
      setUserDisplayName(`Gmail User (${shortId})`);
      setUserAvatarColor(deriveAvatarColor(principalStr));
      setUserPrincipal(principalStr);
    } else if (!isLoggedIn) {
      setUserPrincipal("");
    }
  }, [
    isLoggedIn,
    isInitializing,
    principalStr,
    setLoggedIn,
    setUserDisplayName,
    setUserAvatarColor,
    setUserPrincipal,
  ]);

  return {
    login,
    logout: clear,
    isLoggedIn,
    isLoading,
    identity,
    loginStatus,
    principal: principalObj,
    principalStr,
  };
}
