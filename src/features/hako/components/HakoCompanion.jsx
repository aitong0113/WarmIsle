import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import hakoPlaceholder from "../../../assets/characters/hako/hako-sit.png";
import { buildHoverGuide } from "@/features/guidance/guideSystem";
import useEmotionGuide from "@/features/guidance/useEmotionGuide";
import useGuideNavigation from "@/features/guidance/useGuideNavigation";
import { getHakoMessageForEvent, getHakoPageMessage } from "../hakoScripts";
import { showMessage } from "../store/hakoSlice";

function HakoCompanion() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [hoverTargetPath, setHoverTargetPath] = useState("");
  const guide = useEmotionGuide();
  const goWithGuide = useGuideNavigation("hako-companion");
  const { visible, message } = useSelector((state) => state.hako || {});
  const shouldShowGuide = ["/island", "/beach", "/home-center/today", "/lighthouse"].some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`),
  );
  const hoverGuide = hoverTargetPath ? buildHoverGuide({ targetPath: hoverTargetPath, currentGuide: guide }) : null;
  const activeGuide = hoverGuide || guide;
  const shouldShowCrisis = shouldShowGuide && activeGuide?.state === "help" && activeGuide?.crisisPlan && !hoverGuide;

  useEffect(() => {
    dispatch(showMessage(getHakoPageMessage(location.pathname)));
    setIsExpanded(Boolean(shouldShowGuide));
    setIsPinned(false);
  }, [dispatch, location.pathname, shouldShowGuide]);

  useEffect(() => {
    const resolveElement = (target) => {
      if (target instanceof Element) return target;
      return target?.parentElement || null;
    };

    const isInsideCompanion = (target) => {
      const element = resolveElement(target);
      return Boolean(element?.closest(".hako-companion"));
    };

    const resolveTargetPath = (target) => {
      const element = resolveElement(target);
      const trigger = element?.closest("a[href], [data-hako-target]");
      const datasetTarget = trigger?.getAttribute("data-hako-target");
      if (datasetTarget?.startsWith("/")) return datasetTarget;

      if (trigger instanceof HTMLAnchorElement) {
        const href = trigger.getAttribute("href") || "";
        if (href.startsWith("/")) return href;
      }

      return "";
    };

    const updateFromDataset = (target, attributeName, datasetKey, type) => {
      const element = resolveElement(target);
      const trigger = element?.closest(`[${attributeName}][data-hako-priority]`);
      const nextMessage = trigger?.dataset?.[datasetKey];

      if (!nextMessage) return false;

      dispatch(
        showMessage(
          getHakoMessageForEvent({
            type,
            payload: { message: nextMessage },
          }) || nextMessage,
        ),
      );

      return true;
    };

    const handleMouseOver = (event) => {
      const nextTargetPath = resolveTargetPath(event.target);
      setHoverTargetPath(nextTargetPath);

      if (updateFromDataset(event.target, "data-hako-hover", "hakoHover", "island_hover")) {
        if (!isPinned) {
          setIsExpanded(true);
        }
        setIsExpanded(true);
        return;
      }

      if (!isInsideCompanion(event.target) && !isPinned) {
        setIsExpanded(false);
        setHoverTargetPath("");
      }
    };

    const handleFocusIn = (event) => {
      const nextTargetPath = resolveTargetPath(event.target);
      setHoverTargetPath(nextTargetPath);

      if (updateFromDataset(event.target, "data-hako-hover", "hakoHover", "island_hover")) {
        if (!isPinned) {
          setIsExpanded(true);
        }
        setIsExpanded(true);
        return;
      }

      if (!isInsideCompanion(event.target) && !isPinned) {
        setIsExpanded(false);
        setHoverTargetPath("");
      }
    };

    const handleMouseOut = (event) => {
      const nextElement = event.relatedTarget;
      if (isInsideCompanion(nextElement)) return;

      const nextTargetPath = resolveTargetPath(nextElement);
      setHoverTargetPath(nextTargetPath);

      if (!nextTargetPath && !isPinned) {
        setIsExpanded(false);
      }
    };

    const handleClick = (event) => {
      if (updateFromDataset(event.target, "data-hako-click", "hakoClick", "button_hint")) {
        setIsExpanded(true);
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("click", handleClick);
    };
  }, [dispatch, isPinned]);

  if (!visible || !message) return null;

  return (
    <div className={`hako-companion${isPinned ? " is-pinned" : ""}`}>
      <button
        type="button"
        className="hako-companion-avatar"
        onClick={() => {
          setIsPinned((current) => {
            const nextPinned = !current;
            setIsExpanded(nextPinned || shouldShowGuide);
            return nextPinned;
          });
        }}
        aria-label={isExpanded ? "收合哈可引導" : "展開哈可引導"}
      >
        <img src={hakoPlaceholder} alt="哈可" />
      </button>
      {isExpanded && (
        <div className="hako-companion-bubble">
          {/* 頁面訊息 */}
          <p className="hako-companion-bubble__message">{message}</p>

          {shouldShowGuide && activeGuide && (
            <div className="hako-companion-guide">
              {/* 狀態 badge 與主標題 */}
              <div className="hako-companion-guide__head">
                <span className={`hako-companion-guide__badge hako-companion-guide__badge--${activeGuide.state}`}>
                  {activeGuide.badgeLabel}
                </span>
                <span className="hako-companion-guide__title">{activeGuide.title}</span>
              </div>
              {/* 主說明文案 */}
              <div className="hako-companion-guide__desc">
                <p className="hako-companion-guide__copy">{activeGuide.message}</p>
                {activeGuide.companionLine && (
                  <p className="hako-companion-guide__copy hako-companion-guide__copy--soft">{activeGuide.companionLine}</p>
                )}
              </div>

              {/* 危機提示區塊 */}
              {shouldShowCrisis && (
                <div className={`hako-companion-crisis hako-companion-crisis--${activeGuide.riskLevel}`}>
                  <strong className="hako-companion-crisis__title">{activeGuide.crisisPlan.alertTitle}</strong>
                  <p className="hako-companion-crisis__body">{activeGuide.crisisPlan.alertBody}</p>
                  <div className="hako-companion-crisis__actions">
                    {activeGuide.crisisPlan.contacts.slice(0, 3).map((contact) => (
                      <a key={contact.id} href={contact.href} className="hako-companion-crisis__link">
                        {contact.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* 行動按鈕區塊 */}
              <div className="hako-companion-guide__actions">
                <button
                  type="button"
                  className="hako-companion-guide__action hako-companion-guide__action--primary"
                  onClick={() => goWithGuide({ action: activeGuide.primaryAction, guide: activeGuide })}
                >
                  {activeGuide.primaryAction.label}
                </button>
                {activeGuide.secondaryAction && (
                  <button
                    type="button"
                    className="hako-companion-guide__action"
                    onClick={() => goWithGuide({ action: activeGuide.secondaryAction, guide: activeGuide })}
                  >
                    {activeGuide.secondaryAction.label}
                  </button>
                )}
              </div>

              {/* 學習提示/副文案 */}
              {activeGuide.learningHint && !shouldShowCrisis && (
                <p className="hako-companion-guide__hint">{activeGuide.learningHint}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HakoCompanion;
