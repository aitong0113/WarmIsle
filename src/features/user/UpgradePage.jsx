import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { setStoredSubscriptionTier, toUserState, updateUserProfile } from "@/services/authService";
import { createLinePayCheckout, createStripeCheckoutSession } from "@/services/upgradeCheckout";
import { setAuthState } from "@/features/user/store/userSlice";

const PLAN_OPTIONS = [
  {
    id: "monthly",
    name: "月付方案",
    price: "NT$ 220 / 月",
    helper: "彈性續訂，適合先體驗看看",
  },
  {
    id: "yearly",
    name: "年付方案",
    price: "NT$ 2,280 / 年",
    helper: "平均每月 NT$ 190，現省 NT$ 360",
  },
];

const PAYMENT_PROVIDERS = [
  {
    id: "stripe",
    name: "Stripe",
    helper: "信用卡 / Apple Pay",
  },
  {
    id: "linepay",
    name: "LINE Pay",
    helper: "適合台灣在地付款流程",
  },
];

const UPGRADE_BENEFITS = [
  "解鎖心理燈塔，拿到更明確的心理資源入口",
  "進入營火廣場與冥想碼頭，讓情緒調節不只停在記錄",
  "開啟哈可小屋付費版，延伸更深的陪伴對話",
];

function UpgradePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user || {});
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(query.get("plan") === "yearly" ? "yearly" : "monthly");
  const [selectedProviderId, setSelectedProviderId] = useState(query.get("provider") === "linepay" ? "linepay" : "stripe");

  const lockedFeature = query.get("lockedFeature") || location.state?.lockedFeature || "暖心島付費內容";
  const backTo = location.state?.from || "/account";
  const returnTo = query.get("returnTo") || location.state?.returnTo || "/hako-cabin/premium";
  const currentPlanLabel = user?.subscriptionTier === "paid" ? "付費訂閱" : "免費方案";
  const checkoutState = query.get("checkout") || "";

  const orderSummary = useMemo(
    () => ({
      name: selectedPlanId === "yearly" ? "Warm Isle Plus 年訂閱" : "Warm Isle Plus 月訂閱",
      price: selectedPlanId === "yearly" ? "NT$ 2,280 / 年" : "NT$ 220 / 月",
      unlocks: lockedFeature,
    }),
    [lockedFeature, selectedPlanId],
  );

  const selectedProvider = PAYMENT_PROVIDERS.find((provider) => provider.id === selectedProviderId) || PAYMENT_PROVIDERS[0];

  const buildUpgradeResultPath = (result) => {
    const params = new URLSearchParams({
      checkout: result,
      provider: selectedProviderId,
      plan: selectedPlanId,
      lockedFeature,
      returnTo,
    });
    return `/upgrade?${params.toString()}`;
  };

  const completeUpgrade = async (mode) => {
    try {
      setIsSubmitting(true);
      setStatus(mode === "hosted-return" ? "正在確認付款結果⋯⋯" : "正在建立付款與升級資料⋯⋯");
      const updatedUser = await updateUserProfile({ subscription_tier: "paid" });
      setStoredSubscriptionTier(user?.email, "paid");
      dispatch(setAuthState(toUserState(updatedUser)));
      navigate(returnTo, {
        replace: true,
        state: {
          upgraded: true,
          unlockedFeature: lockedFeature,
          upgradeMode: mode,
        },
      });
    } catch (error) {
      console.error("Upgrade failed", error);
      if (error?.name === "AuthSessionMissingError") {
        setStoredSubscriptionTier(user?.email, "paid");
        dispatch(
          setAuthState({
            ...user,
            subscriptionTier: "paid",
            hasPaidAccess: true,
            authReady: true,
          }),
        );
        navigate(returnTo, {
          replace: true,
          state: {
            upgraded: true,
            unlockedFeature: lockedFeature,
            upgradeMode: mode === "hosted-return" ? "local-demo" : mode,
          },
        });
        return;
      }

      setStatus("升級失敗，請稍後再試。若之後接第三方金流，這裡可以改成回傳付款失敗訊息。");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (checkoutState === "success") {
      completeUpgrade("hosted-return");
      return;
    }

    if (checkoutState === "canceled") {
      setStatus("你已取消付款，方案還維持在目前狀態。準備好時可以再重新結帳。");
    }
  }, [checkoutState]);

  const handleUpgrade = async () => {
    if (user?.hasPaidAccess || isSubmitting) return;

    if (selectedProviderId === "stripe") {
      try {
        setIsSubmitting(true);
        setStatus("正在前往 Stripe 結帳頁⋯⋯");
        const checkout = await createStripeCheckoutSession({
          planId: selectedPlanId,
          lockedFeature,
          returnTo,
        });

        if (checkout?.url) {
          window.location.assign(checkout.url);
          return;
        }
      } catch (error) {
        console.error("Failed to create Stripe checkout session", error);
        setStatus("Stripe 結帳初始化失敗，先切回站內模擬付款流程。請確認 Edge Function 與 Stripe 金鑰設定。");
      } finally {
        setIsSubmitting(false);
      }
    }

    if (selectedProviderId === "linepay") {
      try {
        setIsSubmitting(true);
        setStatus("正在前往 LINE Pay 結帳頁⋯⋯");
        const checkout = await createLinePayCheckout({
          planId: selectedPlanId,
          lockedFeature,
          returnTo,
        });

        if (checkout?.url) {
          window.location.assign(checkout.url);
          return;
        }
      } catch (error) {
        console.error("Failed to create LINE Pay checkout request", error);
        setStatus("LINE Pay 建單失敗，先切回站內模擬付款流程。請確認 Channel 設定與 Edge Function 金鑰。");
      } finally {
        setIsSubmitting(false);
      }
    }

    navigate(buildUpgradeResultPath("success"), { replace: true });
  };

  return (
    <div className="container upgrade-page">
      <section className="upgrade-page__hero">
        <div>
          <p className="member-center-eyebrow">升級方案</p>
          <h1>把暖心島從記錄，升級成真正陪你走一段路的空間</h1>
          <p>
            你目前是{currentPlanLabel}。完成升級後，會立即開放{lockedFeature}與其他付費內容。
          </p>
        </div>
        <Link
          to={backTo}
          className="btn btn-soft"
          data-hako-hover="如果你想先回上一頁再看看，也可以先不急著結帳。"
          data-hako-click="好，我們先回上一頁。"
        >回上一頁</Link>
      </section>

      <div className="upgrade-page__grid">
        <section className="upgrade-page__card">
          <h2>你會解鎖什麼</h2>
          <ul className="upgrade-page__benefits">
            {UPGRADE_BENEFITS.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>

          <div className="upgrade-page__plans" role="tablist" aria-label="升級方案週期">
            {PLAN_OPTIONS.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className={`upgrade-plan-option${selectedPlanId === plan.id ? " is-active" : ""}`}
                onClick={() => setSelectedPlanId(plan.id)}
                role="tab"
                aria-selected={selectedPlanId === plan.id}
                tabIndex={selectedPlanId === plan.id ? 0 : -1}
                data-hako-target="/upgrade"
                data-hako-priority="primary"
                data-hako-hover={`這是${plan.name}，${plan.helper}。`}
                data-hako-click={`好，我們先選${plan.name}。`}
              >
                <span className="upgrade-plan-option__name">{plan.name}</span>
                <strong className="upgrade-plan-option__price">{plan.price}</strong>
                <span className="upgrade-plan-option__helper">{plan.helper}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="upgrade-page__card upgrade-page__card--checkout">
          <p className="upgrade-page__label">付款摘要</p>
          <h2>{orderSummary.name}</h2>
          <p className="upgrade-page__price">{orderSummary.price}</p>
          <p className="upgrade-page__meta">本次主要解鎖：{orderSummary.unlocks}</p>

          <div className="upgrade-page__payment-box">
            <p>選擇結帳方式</p>
            <div className="upgrade-page__provider-list" role="tablist" aria-label="付款方式">
              {PAYMENT_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  className={`upgrade-provider-option${selectedProviderId === provider.id ? " is-active" : ""}`}
                  onClick={() => setSelectedProviderId(provider.id)}
                  role="tab"
                  aria-selected={selectedProviderId === provider.id}
                  tabIndex={selectedProviderId === provider.id ? 0 : -1}
                  data-hako-target="/upgrade"
                  data-hako-priority="primary"
                  data-hako-hover={provider.id === "stripe" ? "Stripe 適合信用卡和 Apple Pay。" : "LINE Pay 比較貼近台灣常用付款流程。"}
                  data-hako-click={provider.id === "stripe" ? "好，我們改用 Stripe 結帳。" : "好，我們改用 LINE Pay 結帳。"}
                >
                  <span>{provider.name}</span>
                  <small>{provider.helper}</small>
                </button>
              ))}
            </div>
            <p className="upgrade-page__payment-note">
              {selectedProviderId === "stripe"
                ? "Stripe 會透過 Edge Function 建立 Checkout Session，付款成功後回到 /upgrade?checkout=success，並由 webhook 寫回方案狀態。"
                : "LINE Pay 會透過 Edge Function 建立 server-side 訂單並回傳付款網址。這一版先完成建單與導轉，後續可再補 confirm / 對帳流程。"}
            </p>
          </div>

          <button
            type="button"
            className="btn upgrade-page__submit"
            disabled={user?.hasPaidAccess || isSubmitting}
            onClick={handleUpgrade}
            data-hako-target="/upgrade"
            data-hako-priority="primary"
            data-hako-hover={user?.hasPaidAccess ? "你已經解鎖完成，不需要再結一次帳。" : `按下去就會前往${selectedProvider.name}完成這次付款。`}
            data-hako-click={user?.hasPaidAccess ? "你已經是付費用戶了。" : `好，我現在帶你去${selectedProvider.name}結帳。`}
          >
            {user?.hasPaidAccess ? "你已經是付費用戶" : isSubmitting ? "處理中⋯⋯" : `前往 ${selectedProvider.name} 結帳`}
          </button>

          {status && <p className="upgrade-page__status">{status}</p>}
        </section>
      </div>
    </div>
  );
}

export default UpgradePage;