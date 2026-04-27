import React from "react";

import { EMOTION_OPTIONS } from "../config/emotionOptions";

function EmotionSelector({ onSelect, disabled = false, selectedId = null }) {
  return (
    <div className="emotion-selector-inline">
      {EMOTION_OPTIONS.map((option) => {
        return (
          <button
            key={option.id}
            className={`emotion-btn emotion-btn-circle ${selectedId === option.id ? "is-selected" : ""}`}
            type="button"
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            aria-label={option.label}
            aria-pressed={selectedId === option.id}
            data-hako-priority="primary"
            data-hako-hover={`如果今天比較接近${option.label}，就先把它點下來，這不是在評分，只是在辨認自己。`}
            data-hako-click={`好，先把今天記成${option.label}。願意看見它，就已經很重要。`}
          >
            <img src={option.iconSrc} alt="" className="emotion-btn-circle__icon" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

export default EmotionSelector;
