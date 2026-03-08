// 若未來要從遠端 API 取得資源，可以在這裡改為 fetch。
import { supabase } from "./supabaseClient";

const RESOURCE_KEY = "warmisle_resources_v2";

/**
 * 預設的心理資源清單（示意資料）。
 * 之後可以依實際需求擴充或改成後端維護。
 *
 * @type {Array<{
 *  id: number,
 *  name: string,
 *  city: string,
 *  district?: string,
 *  type: "psychiatry" | "counseling" | "support",
 *  isFree: boolean,
 *  tags?: string[],
 *  phone?: string,
 *  url?: string,
 *  note?: string
 * }>}
 */
const DEFAULT_RESOURCES = [
  {
    id: 1,
    name: "暖島身心科診所",
    city: "台北市",
    district: "大安區",
    type: "psychiatry",
    isFree: false,
    tags: ["健保", "成人", "青少年"],
    phone: "02-0000-0001",
    url: "https://example.com/clinic-taipei",
    note: "提供一般身心科門診與睡眠相關評估。"
  },
  {
    id: 2,
    name: "海風心理諮商所",
    city: "台北市",
    district: "中山區",
    type: "counseling",
    isFree: false,
    tags: ["自費", "個別諮商", "伴侶諮商"],
    phone: "02-0000-0002",
    url: "https://example.com/counseling-taipei",
    note: "主題包含壓力調適、人際關係與情緒困擾。"
  },
  {
    id: 3,
    name: "城市生命線（免付費專線）",
    city: "全國",
    type: "support",
    isFree: true,
    tags: ["免費", "電話", "24 小時"],
    phone: "1995",
    url: "https://example.com/helpline",
    note: "需要有人聽你說說話時，可以匿名打來。"
  },
  {
    id: 4,
    name: "晨光社區心理諮商方案",
    city: "新北市",
    district: "板橋區",
    type: "support",
    isFree: true,
    tags: ["免費", "社區方案", "限名額"],
    url: "https://example.com/community-newtaipei",
    note: "由地方單位提供之短期免費諮商服務，需事先預約。"
  },
  {
    id: 5,
    name: "海灣身心科診所",
    city: "高雄市",
    district: "鼓山區",
    type: "psychiatry",
    isFree: false,
    tags: ["健保", "藥物治療", "心理治療轉介"],
    phone: "07-000-0005"
  },
  {
    id: 6,
    name: "向陽心理諮商中心",
    city: "台中市",
    district: "西屯區",
    type: "counseling",
    isFree: false,
    tags: ["自費", "學生優惠"],
    url: "https://example.com/counseling-taichung"
  }
];

/**
 * 載入心理資源列表，優先使用 localStorage，否則回傳預設值。
 * @returns {typeof DEFAULT_RESOURCES}
 */
export function loadResources() {
  if (typeof window === "undefined") return DEFAULT_RESOURCES;
  try {
    const raw = window.localStorage.getItem(RESOURCE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_RESOURCES;
  } catch (error) {
    console.warn("Failed to load resources from localStorage", error);
    return DEFAULT_RESOURCES;
  }
}

/**
 * 將心理資源列表存入 localStorage。
 * @param {typeof DEFAULT_RESOURCES} resources
 */
export function saveResources(resources) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RESOURCE_KEY, JSON.stringify(resources));
  } catch (error) {
    console.warn("Failed to save resources to localStorage", error);
  }
}

/**
 * 從 Supabase 抓取心理資源清單，失敗時會退回本地預設資料。
 *
 * 注意：你需要在 Supabase 建立 `resources` 資料表，欄位名稱
 * 建議與 DEFAULT_RESOURCES 結構相同（或在這裡做對應）。
 */
export async function fetchResources() {
  // 如果還沒設定 Supabase，就直接用本地資料。
  if (!supabase) {
    return loadResources();
  }

  try {
    const { data, error } = await supabase.from("resources").select("*");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return loadResources();
    }

    // 這裡簡單假設表格欄位名稱與 DEFAULT_RESOURCES 一致；
    // 若你使用 snake_case，可以在這裡做 mapping。
    return data.map((row, index) => ({
      id: row.id ?? index + 1,
      name: row.name,
      city: row.city,
      district: row.district ?? undefined,
      type: row.type,
      isFree: typeof row.isFree === "boolean" ? row.isFree : !!row.is_free,
      tags: row.tags ?? [],
      phone: row.phone ?? undefined,
      url: row.url ?? undefined,
      note: row.note ?? undefined,
    }));
  } catch (error) {
    console.warn("Failed to fetch resources from Supabase, falling back to local data", error);
    return loadResources();
  }
}

// ===== Supabase CRUD helpers =====

export async function listResourcesRemote() {
  if (!supabase) return loadResources();

  try {
    const { data, error } = await supabase.from("resources").select("*").order("id", {
      ascending: true,
    });

    if (error) throw error;

    if (!data || data.length === 0) return loadResources();

    return data.map((row, index) => ({
      id: row.id ?? index + 1,
      name: row.name,
      city: row.city,
      district: row.district ?? undefined,
      type: row.type,
      isFree: typeof row.isFree === "boolean" ? row.isFree : !!row.is_free,
      tags: row.tags ?? [],
      phone: row.phone ?? undefined,
      url: row.url ?? undefined,
      note: row.note ?? undefined,
    }));
  } catch (error) {
    console.warn("Failed to list resources from Supabase", error);
    return loadResources();
  }
}

export async function createResource(payload) {
  if (!supabase) throw new Error("Supabase is not configured");

  const insertPayload = {
    name: payload.name,
    city: payload.city,
    district: payload.district || null,
    type: payload.type,
    is_free: payload.isFree ?? payload.is_free ?? false,
    tags: payload.tags || [],
    phone: payload.phone || null,
    url: payload.url || null,
    note: payload.note || null,
  };

  const { data, error } = await supabase
    .from("resources")
    .insert([insertPayload])
    .select("*")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    city: data.city,
    district: data.district ?? undefined,
    type: data.type,
    isFree: typeof data.isFree === "boolean" ? data.isFree : !!data.is_free,
    tags: data.tags ?? [],
    phone: data.phone ?? undefined,
    url: data.url ?? undefined,
    note: data.note ?? undefined,
  };
}

export async function updateResource(id, payload) {
  if (!supabase) throw new Error("Supabase is not configured");

  const updatePayload = {
    name: payload.name,
    city: payload.city,
    district: payload.district || null,
    type: payload.type,
    is_free:
      typeof payload.isFree === "boolean"
        ? payload.isFree
        : payload.is_free ?? null,
    tags: payload.tags || [],
    phone: payload.phone || null,
    url: payload.url || null,
    note: payload.note || null,
  };

  const { data, error } = await supabase
    .from("resources")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    city: data.city,
    district: data.district ?? undefined,
    type: data.type,
    isFree: typeof data.isFree === "boolean" ? data.isFree : !!data.is_free,
    tags: data.tags ?? [],
    phone: data.phone ?? undefined,
    url: data.url ?? undefined,
    note: data.note ?? undefined,
  };
}

export async function deleteResource(id) {
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase.from("resources").delete().eq("id", id);

  if (error) throw error;
}
