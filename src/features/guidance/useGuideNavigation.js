import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { syncGuidanceClick } from "@/services/guidanceApi";
import { getGuestUserId } from "@/services/guestUser";
import { recordGuidanceClick } from "@/services/guidanceService";

function useGuideNavigation(source = "guide") {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user || {});
  const hasPaidAccess = user?.hasPaidAccess || false;

  return ({ action, guide }) => {
    if (!action?.to) return;

    const requiresPaid = ["/campfire", "/meditation", "/lighthouse"].includes(action.to);
    const nextState = {
      source,
      guideState: guide?.state,
      riskLevel: guide?.riskLevel,
      crisisPlan: guide?.crisisPlan || null,
    };

    recordGuidanceClick({
      state: guide?.state,
      actionId: action.id,
    });

    syncGuidanceClick({
      userId: user?.id || getGuestUserId(),
      source,
      pagePath: location.pathname,
      actionId: action.id,
      actionTo: action.to,
      guideState: guide?.state,
      riskLevel: guide?.riskLevel,
      contextTarget: action.to,
    }).catch((error) => {
      console.warn("Failed to persist guidance click remotely", error);
    });

    if (!user?.isAuthenticated) {
      navigate("/login", { state: { from: { pathname: action.to } } });
      return;
    }

    if (requiresPaid && !hasPaidAccess) {
      navigate("/account", {
        state: {
          lockedFeature: action.label,
          from: action.to,
          returnTo: action.to,
          source,
        },
      });
      return;
    }

    navigate(action.to, { state: nextState });
  };
}

export default useGuideNavigation;