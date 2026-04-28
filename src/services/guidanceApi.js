import { supabase } from "./supabaseClient";

const GUIDANCE_EVENTS_TABLE = "hako_guidance_events";

export async function syncGuidanceClick(event) {
  if (!supabase || !event?.userId || !event?.actionId) return null;

  const payload = {
    user_id: event.userId,
    source: event.source || "guide",
    page_path: event.pagePath || "",
    action_id: event.actionId,
    action_to: event.actionTo || "",
    guide_state: event.guideState || null,
    risk_level: event.riskLevel || null,
    context_target: event.contextTarget || null,
  };

  const { data, error } = await supabase
    .from(GUIDANCE_EVENTS_TABLE)
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.warn("Failed to sync guidance click", error);
    return null;
  }

  return data;
}