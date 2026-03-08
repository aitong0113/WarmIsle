import React, { useEffect, useMemo, useState } from "react";
import {
  listResourcesRemote,
  createResource,
  updateResource,
  deleteResource,
} from "@/services/resourceService";

const EMPTY_FORM = {
  id: null,
  name: "",
  city: "",
  district: "",
  type: "psychiatry",
  isFree: false,
  phone: "",
  url: "",
  note: "",
};

function LighthouseAdminPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    listResourcesRemote()
      .then((data) => {
        if (active) setResources(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.warn("Failed to load resources for admin", err);
        if (active) setError("載入失敗，請稍後再試");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const isEditing = useMemo(() => form.id != null, [form.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      name: item.name || "",
      city: item.city || "",
      district: item.district || "",
      type: item.type || "psychiatry",
      isFree: !!item.isFree,
      phone: item.phone || "",
      url: item.url || "",
      note: item.note || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!form.name || !form.city || !form.type) {
        setError("名稱、縣市與類型為必填");
        setSaving(false);
        return;
      }

      if (isEditing) {
        const updated = await updateResource(form.id, form);
        setResources((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } else {
        const created = await createResource(form);
        setResources((prev) => [...prev, created]);
      }

      handleReset();
    } catch (err) {
      console.error("Failed to save resource", err);
      setError("儲存失敗，請檢查欄位或稍後再試");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("確定要刪除這筆資源嗎？")) return;
    setSaving(true);
    setError("");
    try {
      await deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to delete resource", err);
      setError("刪除失敗，請稍後再試");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="container">
      <h1>心理燈塔資源管理</h1>
      <p>僅供站長使用的簡易後台。沒有登入保護，請勿公開連結。</p>

      <div className="card" style={{ marginTop: 16, marginBottom: 24 }}>
        <form onSubmit={handleSubmit} className="lighthouse-admin-form">
          <h2 style={{ marginTop: 0 }}>{isEditing ? "編輯資源" : "新增資源"}</h2>

          {error && <p style={{ color: "#c0392b" }}>{error}</p>}

          <div className="lighthouse-admin-grid">
            <label>
              名稱（必填）
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </label>

            <label>
              縣市（必填）
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </label>

            <label>
              行政區
              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
              />
            </label>

            <label>
              類型（必填）
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="psychiatry">身心科</option>
                <option value="counseling">心理諮商所</option>
                <option value="support">免費／社區方案</option>
              </select>
            </label>

            <label className="lighthouse-admin-checkbox">
              <input
                type="checkbox"
                name="isFree"
                checked={form.isFree}
                onChange={handleChange}
              />
              這是免費資源
            </label>

            <label>
              電話
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </label>

            <label>
              網站網址
              <input
                type="text"
                name="url"
                value={form.url}
                onChange={handleChange}
              />
            </label>
          </div>

          <label style={{ display: "block", marginTop: 12 }}>
            備註
            <textarea
              name="note"
              rows={3}
              value={form.note}
              onChange={handleChange}
            />
          </label>

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "儲存中⋯⋯" : isEditing ? "更新資源" : "新增資源"}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-soft" onClick={handleReset}>
                取消編輯
              </button>
            )}
          </div>
        </form>
      </div>

      <h2>現有資源列表</h2>
      {loading ? (
        <p>載入中⋯⋯</p>
      ) : resources.length === 0 ? (
        <p>目前沒有任何資源。</p>
      ) : (
        <table className="lighthouse-admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>名稱</th>
              <th>地點</th>
              <th>類型</th>
              <th>費用</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>
                  {item.city}
                  {item.district ? ` · ${item.district}` : ""}
                </td>
                <td>{item.type}</td>
                <td>{item.isFree ? "免費" : "付費/健保"}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-soft"
                    onClick={() => handleEdit(item)}
                  >
                    編輯
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{ marginLeft: 8, background: "#e57373" }}
                    onClick={() => handleDelete(item.id)}
                  >
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default LighthouseAdminPage;
