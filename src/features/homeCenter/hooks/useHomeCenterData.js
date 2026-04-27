import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import EmotionSelector from "../../emotion/components/EmotionSelector";
import { EMOTION_OPTIONS } from "../../emotion/config/emotionOptions";
import { addEmotionLog, setEmotion, setEmotionNote } from "../../emotion/store/emotionSlice";
import { syncEmotionLogApi } from "../../../services/emotionApi";
import { getGuestUserId } from "../../../services/guestUser";
import { formatLocalDate, todayLocalDate } from "../../../utils/date";

export { EmotionSelector };

export const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function buildStreakInfo(emotionLogs) {
  const loggedDates = new Set((emotionLogs || []).map((entry) => entry?.date).filter(Boolean));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  const todayKey = formatLocalDate(cursor);

  if (!loggedDates.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
    if (!loggedDates.has(formatLocalDate(cursor))) {
      return {
        count: 0,
        dates: new Set(),
        anchoredTo: null,
      };
    }
  }

  const dates = new Set();
  while (loggedDates.has(formatLocalDate(cursor))) {
    dates.add(formatLocalDate(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    count: dates.size,
    dates,
    anchoredTo: dates.has(todayKey) ? "today" : "yesterday",
  };
}

export function useHomeCenterData() {
  const dispatch = useDispatch();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => todayLocalDate());
  const [todayNoteDraft, setTodayNoteDraft] = useState("");
  const [journalFeedback, setJournalFeedback] = useState("");

  const todayEmotion = useSelector((state) => state.emotion?.todayEmotion || null);
  const emotionLogs = useSelector((state) => state.emotion?.emotionLogs || []);
  const today = todayLocalDate();

  const emotionMetaById = useMemo(
    () =>
      EMOTION_OPTIONS.reduce((acc, option) => {
        acc[option.id] = option;
        return acc;
      }, {}),
    [],
  );

  const todayLog = useMemo(
    () => emotionLogs.find((entry) => entry?.date === today) || null,
    [emotionLogs, today],
  );

  useEffect(() => {
    setTodayNoteDraft(todayLog?.note || "");
  }, [todayLog?.note]);

  const recentLog = useMemo(() => {
    return [...emotionLogs]
      .filter((entry) => entry?.date)
      .sort((left, right) => right.date.localeCompare(left.date))[0] || null;
  }, [emotionLogs]);

  const monthLabel = `${currentMonth.getFullYear()} 年 ${currentMonth.getMonth() + 1} 月`;
  const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

  const monthEntriesCount = useMemo(
    () => emotionLogs.filter((entry) => entry?.date?.startsWith(monthKey)).length,
    [emotionLogs, monthKey],
  );

  const streakInfo = useMemo(() => buildStreakInfo(emotionLogs), [emotionLogs]);

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const firstWeekday = firstOfMonth.getDay();

    const emotionByDate = emotionLogs.reduce((acc, log) => {
      if (!log?.date) return acc;
      acc[log.date] = log;
      return acc;
    }, {});

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(year, month, 1 - firstWeekday + index);
      const iso = formatLocalDate(day);
      const log = emotionByDate[iso] || null;

      return {
        date: iso,
        day: day.getDate(),
        isCurrentMonth: day.getMonth() === month,
        emotionId: log?.emotion || null,
        note: log?.note || "",
        isInStreak: streakInfo.dates.has(iso),
      };
    });
  }, [currentMonth, emotionLogs, streakInfo.dates]);

  const selectedDay = useMemo(
    () => monthDays.find((cell) => cell.date === selectedDate) || null,
    [monthDays, selectedDate],
  );

  const handleSelectTodayEmotion = (emotionId) => {
    dispatch(setEmotion(emotionId));
    dispatch(addEmotionLog({ emotion: emotionId, date: today }));
    setJournalFeedback("今天的情緒已經記下來了。");

    const userId = getGuestUserId();
    if (userId) {
      syncEmotionLogApi(userId, { emotion: emotionId, date: today }).catch((error) => {
        console.warn("Failed to sync home center emotion log", error);
      });
    }
  };

  const handleSaveTodayNote = () => {
    const trimmed = todayNoteDraft.trim();
    dispatch(setEmotionNote({ date: today, note: trimmed }));
    setJournalFeedback(trimmed ? "這句心情已經存進今天的紀錄。" : "今天的短日記已清空。");

    const userId = getGuestUserId();
    if (userId) {
      syncEmotionLogApi(userId, {
        emotion: todayLog?.emotion || todayEmotion || null,
        date: today,
        note: trimmed,
      }).catch((error) => {
        console.warn("Failed to sync home center emotion note", error);
      });
    }
  };

  const todayEmotionMeta = todayLog?.emotion ? emotionMetaById[todayLog.emotion] : emotionMetaById[todayEmotion];
  const recentEmotionMeta = recentLog?.emotion ? emotionMetaById[recentLog.emotion] : null;

  return {
    currentMonth,
    emotionMetaById,
    journalFeedback,
    monthDays,
    monthEntriesCount,
    monthLabel,
    recentEmotionMeta,
    recentLog,
    selectedDate,
    selectedDay,
    setCurrentMonth,
    setSelectedDate,
    setTodayNoteDraft,
    streakInfo,
    today,
    todayEmotion,
    todayEmotionMeta,
    todayLog,
    todayNoteDraft,
    handleSaveTodayNote,
    handleSelectTodayEmotion,
  };
}