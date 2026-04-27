import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { getCurrentUser, onAuthStateChange, toUserState } from "@/services/authService";
import { setAuthState } from "@/features/user/store/userSlice";

function AuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const syncAuthState = (user) => {
      if (!isMounted) return;
      dispatch(setAuthState(toUserState(user)));
    };

    getCurrentUser()
      .then(syncAuthState)
      .catch(() => syncAuthState(null));

    const unsubscribe = onAuthStateChange((user) => {
      syncAuthState(user);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [dispatch]);

  return null;
}

export default AuthBootstrap;