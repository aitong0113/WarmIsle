import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import DailyDockView from "./components/DailyDockView";
import { showMessage } from "@/features/hako/store/hakoSlice";

function HarborPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user || {});

  useEffect(() => {
    const rawName = user?.name;
    const hasCustomName = rawName && rawName !== "Abbie";
    const displayName = hasCustomName ? rawName : "旅人";

    const text = hasCustomName
      ? `嗨，${displayName}，今天想在小港口怎麼陪自己一下？`
      : "嗨，今天也來小港口看一看自己的心情。";

    dispatch(showMessage(text));
  }, [dispatch, user?.name]);

  return <DailyDockView />;
}

export default HarborPage;
