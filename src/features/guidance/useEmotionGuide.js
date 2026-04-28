import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { buildEmotionGuide } from "./guideSystem";
import { loadGuidanceProfile } from "@/services/guidanceService";
import { todayLocalDate } from "@/utils/date";

function useEmotionGuide(options = {}) {
  const location = useLocation();
  const today = todayLocalDate();
  const emotion = useSelector((state) => state.emotion || {});
  const todayLog = (emotion.emotionLogs || []).find((entry) => entry?.date === today) || null;

  const mood = options.mood ?? location.state?.prefillEmotionId ?? todayLog?.emotion ?? emotion.todayEmotion ?? "";
  const content = options.content ?? location.state?.prefillNote ?? todayLog?.note ?? "";
  const guidanceProfile = loadGuidanceProfile();

  return useMemo(
    () => buildEmotionGuide({ mood, content, preferenceCounts: guidanceProfile.actionCounts || {} }),
    [content, guidanceProfile.actionCounts, mood],
  );
}

export default useEmotionGuide;