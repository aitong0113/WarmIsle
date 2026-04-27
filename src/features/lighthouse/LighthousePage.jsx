import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import { getHakoMessageForEvent } from "../hako/hakoScripts";
import { showByEvent } from "../hako/store/hakoSlice";
import LighthouseView from "./LighthouseView";

function LighthousePage() {
  const dispatch = useDispatch();

  useEffect(() => {
    const message = getHakoMessageForEvent({ type: "open_resource" });
    if (message) {
      dispatch(showByEvent(message));
    }
  }, [dispatch]);

  return (
    <LighthouseView />
  );
}

export default LighthousePage;
