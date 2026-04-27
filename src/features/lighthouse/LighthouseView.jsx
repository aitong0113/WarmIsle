import React, { useEffect, useMemo, useState } from "react";
import { loadResources, fetchResources } from "@/services/resourceService";

function LighthouseView() {
  const [resources, setResources] = useState(loadResources());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchResources()
      .then((remote) => {
        if (isMounted && remote && Array.isArray(remote)) {
          setResources(remote);
        }
      })
      .catch((error) => {
        console.warn("Failed to fetch remote resources, using local fallback", error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [type, setType] = useState("all");
  const [price, setPrice] = useState("all"); // all | free

  const cities = useMemo(() => {
    const set = new Set();
    resources.forEach((r) => {
      if (r.city) set.add(r.city);
    });
    return Array.from(set);
  }, [resources]);

  const filtered = useMemo(() => {
    if (!Array.isArray(resources)) return [];

    const q = query.trim().toLowerCase();

    return resources.filter((r) => {
      if (city !== "all" && r.city !== city) return false;
      if (type !== "all" && r.type !== type) return false;
      if (price === "free" && !r.isFree) return false;

      if (!q) return true;

      const text = [
        r.name,
        r.city,
        r.district,
        ...(r.tags || []),
        r.note
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [resources, query, city, type, price]);

  const renderTypeLabel = (t) => {
    if (t === "psychiatry") return "身心科";
    if (t === "counseling") return "心理諮商所";
    if (t === "support") return "免費／社區支持";
    return "其他";
  };

  return (
    <section className="lighthouse">
      <div className="lighthouse-scene" aria-hidden="true">
        <div className="lighthouse-scene__beam lighthouse-scene__beam--left" />
        <div className="lighthouse-scene__beam lighthouse-scene__beam--right" />
        <div className="lighthouse-scene__orb" />
      </div>

      <header className="lighthouse-header">
        <p className="lighthouse-header__eyebrow">Lighthouse Room</p>
        <h1>心理燈塔</h1>
        <p className="lighthouse-subtitle">
          這裡放著一些在需要時可以求助的資源，可以依縣市、類型或關鍵字查找。
        </p>
      </header>

      <div className="lighthouse-filters">
        <input
          type="text"
          className="lighthouse-search"
          placeholder="輸入關鍵字，例如：諮商、身心科、學生優惠"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-hako-hover="可以先打你最在意的詞，例如學校附近、免費、或失眠。"
        />

        <div className="lighthouse-filter-row">
          <label className="lighthouse-filter">
            <span>縣市</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              data-hako-hover="先從縣市縮小範圍，會比較快找到你真的去得到的地方。"
            >
              <option value="all">全部縣市</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="lighthouse-filter">
            <span>類型</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              data-hako-hover="如果你已經知道想找身心科或諮商所，可以先在這裡篩。"
            >
              <option value="all">全部類型</option>
              <option value="psychiatry">身心科</option>
              <option value="counseling">心理諮商所</option>
              <option value="support">免費／社區方案</option>
            </select>
          </label>

          <label className="lighthouse-filter">
            <span>費用</span>
            <select
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              data-hako-hover="如果你現在只想先看免費資源，這裡可以幫你先過濾。"
            >
              <option value="all">不限</option>
              <option value="free">只看免費資源</option>
            </select>
          </label>
        </div>
      </div>

      <div className="lighthouse-results">
        {loading ? (
          <p className="lighthouse-empty">載入中⋯⋯</p>
        ) : filtered.length === 0 ? (
          <p className="lighthouse-empty">找不到符合的資源，試試看換個縣市或關鍵字。</p>
        ) : (
          <ul className="resource-list">
            {filtered.map((item) => (
              <li key={item.id} className="resource-card">
                <div className="resource-card-main">
                  <h2 className="resource-name">{item.name}</h2>
                  <div className="resource-meta">
                    <span className="badge badge-soft">{renderTypeLabel(item.type)}</span>
                    <span className="badge badge-outline">
                      {item.isFree ? "免費" : "付費 / 健保"}
                    </span>
                    {item.city && (
                      <span className="resource-location">
                        {item.city}
                        {item.district ? ` · ${item.district}` : ""}
                      </span>
                    )}
                  </div>
                  {item.note && <p className="resource-note">{item.note}</p>}
                  {item.tags && item.tags.length > 0 && (
                    <div className="resource-tags">
                      {item.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="resource-card-actions">
                  {item.phone && (
                    <a
                      className="btn btn-ghost"
                      href={`tel:${item.phone}`}
                      data-hako-hover="如果你已經準備好，直接打電話會比一直查資料更快被接住。"
                      data-hako-click="我幫你把電話準備好了，深呼吸一下再撥也可以。"
                    >
                      撥打電話
                    </a>
                  )}
                  {item.url && (
                    <a
                      className="btn btn-soft"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      data-hako-hover="先看看官方網站的服務內容，能幫你判斷這裡適不適合。"
                      data-hako-click="我把網站打開了，你可以先看服務方式、地點和預約資訊。"
                    >
                      前往網站
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default LighthouseView;
