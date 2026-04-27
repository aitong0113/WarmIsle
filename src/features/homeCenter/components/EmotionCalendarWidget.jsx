import { forwardRef } from "react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { DayButton as BaseDayButton, DayPicker } from "react-day-picker";

import "react-day-picker/style.css";

import { formatLocalDate } from "../../../utils/date";

function EmotionCalendarWidget({
  compact = false,
  currentMonth,
  emotionMetaById,
  monthDays,
  monthEntriesCount,
  selectedDate,
  selectedDay,
  setCurrentMonth,
  setSelectedDate,
  streakInfo,
  today,
}) {
  const calendarMetaByDate = monthDays.reduce((acc, cell) => {
    acc[cell.date] = cell;
    return acc;
  }, {});

  const CalendarDayButton = forwardRef(function CalendarDayButton(props, ref) {
    const dayKey = props.day.isoDate || formatLocalDate(props.day.date);
    const dayMeta = calendarMetaByDate[dayKey];
    const emotionMeta = emotionMetaById[dayMeta?.emotionId];
    const notePreview = dayMeta?.note?.trim() || "";
    const previousDate = new Date(`${dayKey}T00:00:00`);
    previousDate.setDate(previousDate.getDate() - 1);
    const nextDate = new Date(`${dayKey}T00:00:00`);
    nextDate.setDate(nextDate.getDate() + 1);
    const previousKey = formatLocalDate(previousDate);
    const nextKey = formatLocalDate(nextDate);
    const isStreak = Boolean(dayMeta?.isInStreak);
    const isStreakStart = isStreak && !calendarMetaByDate[previousKey]?.isInStreak;
    const isStreakEnd = isStreak && !calendarMetaByDate[nextKey]?.isInStreak;
    const dayButtonClassName = [
      "emotion-calendar-widget__day-button",
      compact ? "is-compact" : "",
      props.modifiers.outside ? "is-outside" : "",
      props.modifiers.today ? "is-today" : "",
      props.modifiers.selected ? "is-selected" : "",
      dayMeta?.emotionId ? "has-entry" : "",
      isStreak ? "is-streak" : "",
      isStreakStart ? "is-streak-start" : "",
      isStreakEnd ? "is-streak-end" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <BaseDayButton {...props} ref={ref} className={dayButtonClassName}>
        <span className="emotion-calendar-widget__day-topline">
          <span className="emotion-calendar-widget__day-dateblock">
            {props.modifiers.today ? <span className="emotion-calendar-widget__today-badge">今天</span> : null}
            <span className="emotion-calendar-widget__day-number">{props.children}</span>
          </span>
          <span className="emotion-calendar-widget__day-emotion" aria-hidden="true">
            {emotionMeta?.iconSrc ? (
              <img src={emotionMeta.iconSrc} alt="" className="emotion-calendar-widget__day-emotion-icon" />
            ) : null}
          </span>
        </span>
        {notePreview ? (
          <span className={`emotion-calendar-widget__day-note${compact ? " is-compact" : ""}`}>{notePreview}</span>
        ) : null}
        {isStreak ? (
          <span className="emotion-calendar-widget__day-streak" aria-hidden="true">
            🔥
          </span>
        ) : null}
      </BaseDayButton>
    );
  });

  const selectedDateValue = selectedDate ? new Date(`${selectedDate}T00:00:00`) : undefined;

  return (
    <div className={`emotion-calendar-widget${compact ? " is-compact" : ""}`}>
      <div className="emotion-calendar-widget__summary">
        <p className="emotion-calendar-widget__summary-text">這個月已經留下 {monthEntriesCount} 則情緒記錄。</p>
        <div className="emotion-calendar__streak" aria-live="polite">
          <strong>
            <span aria-hidden="true">🔥</span>
            連續打卡 {streakInfo.count} 天
          </strong>
          <span>
            {streakInfo.count === 0
              ? "從今天開始留下第一筆也可以。"
              : streakInfo.anchoredTo === "today"
                ? "今天也有把心情留在這裡。"
                : "昨天為止都還維持著這段連續記錄。"}
          </span>
        </div>
      </div>

      <DayPicker
        mode="single"
        locale={zhTW}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        selected={selectedDateValue}
        onSelect={(date) => {
          if (!date) return;
          setSelectedDate(formatLocalDate(date));
        }}
        showOutsideDays
        fixedWeeks
        className="emotion-calendar-widget__picker"
        components={{
          DayButton: CalendarDayButton,
        }}
        classNames={{
          root: "emotion-calendar-widget__root",
          month: "emotion-calendar-widget__month",
          day: "emotion-calendar-widget__day-cell",
          month_caption: "emotion-calendar-widget__caption",
          caption_label: "emotion-calendar-widget__caption-label",
          nav: "emotion-calendar-widget__nav",
          button_previous: "emotion-calendar-widget__nav-button emotion-calendar-widget__nav-button--prev",
          button_next: "emotion-calendar-widget__nav-button emotion-calendar-widget__nav-button--next",
          weekdays: "emotion-calendar-widget__weekdays",
          weekday: "emotion-calendar-widget__weekday",
          selected: "is-selected",
          today: "is-today",
          outside: "is-outside",
        }}
        modifiers={{
          hasEntry: (date) => Boolean(calendarMetaByDate[formatLocalDate(date)]?.emotionId),
          streak: (date) => Boolean(calendarMetaByDate[formatLocalDate(date)]?.isInStreak),
        }}
        modifiersClassNames={{
          hasEntry: "has-entry",
          streak: "is-streak",
        }}
        formatters={{
          formatCaption: (date) => format(date, "yyyy 年 M 月", { locale: zhTW }),
          formatWeekdayName: (date) => format(date, "EEEEE", { locale: zhTW }),
        }}
      />

      <div className="emotion-calendar-widget__detail">
        <strong>{selectedDay?.date || today}</strong>
        {emotionMetaById[selectedDay?.emotionId] ? (
          <p className="emotion-calendar-widget__detail-emotion">
            <img
              src={emotionMetaById[selectedDay?.emotionId]?.iconSrc}
              alt=""
              className="emotion-calendar__detail-emotion-icon"
              aria-hidden="true"
            />
            <span>{emotionMetaById[selectedDay?.emotionId]?.label}</span>
          </p>
        ) : (
          <p>這一天還沒有記下情緒。</p>
        )}
        <p>{selectedDay?.note || "這一天還沒有留下短日記。"}</p>
      </div>
    </div>
  );
}

export default EmotionCalendarWidget;