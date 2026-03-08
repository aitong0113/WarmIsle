import React from "react";
import { useDispatch, useSelector } from "react-redux";

import hakoPlaceholder from "../../../assets/characters/hako/hako-placeholder.svg";
import { hideMessage } from "../store/hakoSlice";

function HakoCompanion() {
  const dispatch = useDispatch();
  const { visible, message } = useSelector((state) => state.hako || {});

  if (!visible || !message) return null;

  const handleClose = () => {
    dispatch(hideMessage());
  };

  return (
    <div className="hako-companion">
      <div className="hako-companion-avatar">
        <img src={hakoPlaceholder} alt="Hako placeholder" />
      </div>
      <div className="hako-companion-bubble">
        <span>{message}</span>
        <button type="button" className="hako-companion-close" onClick={handleClose}>
          收起
        </button>
      </div>
    </div>
  );
}

export default HakoCompanion;
