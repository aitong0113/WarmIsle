// Haku
import hakuSit from "@/assets/characters/hako/hako-sit.png";

// Pino
import pinoClose from "@/assets/characters/pino/close.png";

// Nami
import namiCalm from "@/assets/characters/nami/calm.png";

export const characterMap = {
  haku: {
    neutral: hakuSit,
    happy: hakuSit, // 先用同一張
    sad: hakuSit,
  },
  pino: {
    neutral: pinoClose,
    happy: pinoClose,
    sad: pinoClose,
  },
  nami: {
    neutral: namiCalm,
    calm: namiCalm,
    sad: namiCalm,
  },
};