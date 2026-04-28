const GUIDANCE_PROFILE_KEY = "warmisle_guidance_profile_v1";

const EMPTY_PROFILE = {
  actionCounts: {},
  stateCounts: {},
  lastActionId: "",
  lastState: "",
  updatedAt: "",
};

export function loadGuidanceProfile() {
  if (typeof window === "undefined") {
    return EMPTY_PROFILE;
  }

  try {
    const raw = window.localStorage.getItem(GUIDANCE_PROFILE_KEY);
    if (!raw) return EMPTY_PROFILE;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return EMPTY_PROFILE;
    }

    return {
      actionCounts: parsed.actionCounts && typeof parsed.actionCounts === "object" ? parsed.actionCounts : {},
      stateCounts: parsed.stateCounts && typeof parsed.stateCounts === "object" ? parsed.stateCounts : {},
      lastActionId: parsed.lastActionId || "",
      lastState: parsed.lastState || "",
      updatedAt: parsed.updatedAt || "",
    };
  } catch (error) {
    console.warn("Failed to load guidance profile from localStorage", error);
    return EMPTY_PROFILE;
  }
}

export function saveGuidanceProfile(profile) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(GUIDANCE_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn("Failed to save guidance profile to localStorage", error);
  }
}

export function recordGuidanceClick({ state, actionId }) {
  if (!actionId) return EMPTY_PROFILE;

  const profile = loadGuidanceProfile();
  const nextProfile = {
    ...profile,
    actionCounts: {
      ...profile.actionCounts,
      [actionId]: (profile.actionCounts?.[actionId] || 0) + 1,
    },
    stateCounts: {
      ...profile.stateCounts,
      ...(state
        ? {
            [state]: (profile.stateCounts?.[state] || 0) + 1,
          }
        : {}),
    },
    lastActionId: actionId,
    lastState: state || "",
    updatedAt: new Date().toISOString(),
  };

  saveGuidanceProfile(nextProfile);
  return nextProfile;
}

export function getActionPreferenceScore(profile, actionId) {
  return profile?.actionCounts?.[actionId] || 0;
}

export function getTopPreferredAction(profile, actionIds = []) {
  return [...actionIds]
    .map((actionId) => ({ actionId, score: getActionPreferenceScore(profile, actionId) }))
    .sort((left, right) => right.score - left.score)[0] || { actionId: "", score: 0 };
}