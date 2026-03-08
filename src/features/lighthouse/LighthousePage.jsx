import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { getHakoMessageForEvent } from "../hako/hakoScripts";
import { showByEvent } from "../hako/store/hakoSlice";
import { fetchHakoAiReply } from "../../services/hakoAiClient";
import LighthouseView from "./LighthouseView";

function LighthousePage() {
  const dispatch = useDispatch();

  useEffect(() => {
    const message = getHakoMessageForEvent({ type: "open_resource" });
    if (message) {
      dispatch(showByEvent(message));
    }

    fetchHakoAiReply({ type: "open_resource" })
      .then((aiMessage) => {
        if (aiMessage) {
          dispatch(showByEvent(aiMessage));
        }
      })
      .catch((error) => {
        console.warn("Failed to get AI Hako reply for resource", error);
      });
  }, [dispatch]);

  return (
    <LighthouseView />
  );
}

export default LighthousePage;
