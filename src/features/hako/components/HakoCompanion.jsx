import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import hakoPlaceholder from "../../../assets/characters/hako/hako-sit.png";
import { getHakoMessageForEvent, getHakoPageMessage } from "../hakoScripts";
import { showMessage } from "../store/hakoSlice";

function HakoCompanion() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { visible, message } = useSelector((state) => state.hako || {});

  useEffect(() => {
    dispatch(showMessage(getHakoPageMessage(location.pathname)));
    setIsExpanded(false);
  }, [dispatch, location.pathname]);

  useEffect(() => {
    const resolveElement = (target) => {
      if (target instanceof Element) return target;
      return target?.parentElement || null;
    };

    const isInsideCompanion = (target) => {
      const element = resolveElement(target);
      return Boolean(element?.closest(".hako-companion"));
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
      if (updateFromDataset(event.target, "data-hako-hover", "hakoHover", "island_hover")) {
        setIsExpanded(true);
        return;
      }

      if (!isInsideCompanion(event.target)) {
        setIsExpanded(false);
      }
    };

    const handleFocusIn = (event) => {
      if (updateFromDataset(event.target, "data-hako-hover", "hakoHover", "island_hover")) {
        setIsExpanded(true);
        return;
      }

      if (!isInsideCompanion(event.target)) {
        setIsExpanded(false);
      }
    };

    const handleClick = (event) => {
      if (updateFromDataset(event.target, "data-hako-click", "hakoClick", "button_hint")) {
        setIsExpanded(true);
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("click", handleClick);
    };
  }, [dispatch]);

  if (!visible || !message) return null;

  return (
    <div className="hako-companion">
      <div className="hako-companion-avatar">
        <img src={hakoPlaceholder} alt="哈可" />
      </div>
      {isExpanded && (
        <div className="hako-companion-bubble">
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}

export default HakoCompanion;
