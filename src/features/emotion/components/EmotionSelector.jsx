import React from "react";

import { EMOTION_OPTIONS } from "../config/emotionOptions";

function EmotionSelector({ onSelect }) {
  return (
    <div>
      {EMOTION_OPTIONS.map((option) => (
        <button
          key={option.id}
          className="emotion-btn"
          onClick={() => onSelect(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default EmotionSelector;
