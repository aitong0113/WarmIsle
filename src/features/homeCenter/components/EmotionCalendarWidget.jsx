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
            <span className="emotion-calendar-widget__day-number">{props.children}</span>
          </span>
          {emotionMeta?.iconSrc ? (
            <span className="emotion-calendar-widget__day-emotion" aria-hidden="true">
              <img src={emotionMeta.iconSrc} alt="" className="emotion-calendar-widget__day-emotion-icon" />
            </span>
          ) : null}
        </span>
        {notePreview ? (
          <span className={`emotion-calendar-widget__day-note${compact ? " is-compact" : ""}`}>{notePreview}</span>
        ) : null}
      </BaseDayButton>
    );
  });

  const selectedDateValue = selectedDate ? new Date(`${selectedDate}T00:00:00`) : undefined;

  return (
    <div className={`emotion-calendar-widget${compact ? " is-compact" : ""}`}>
      <div className="emotion-calendar-widget__summary">
        <section className="emotion-calendar-widget__summary-card" aria-label="本月紀錄摘要">
          <span className="emotion-calendar-widget__summary-label">本月紀錄</span>
          <strong className="emotion-calendar-widget__summary-value">
            <span className="emotion-calendar-widget__summary-number">{monthEntriesCount}</span>
            <span className="emotion-calendar-widget__summary-unit">則情緒記錄</span>
          </strong>
        </section>

        <section className="emotion-calendar-widget__summary-card emotion-calendar-widget__summary-card--accent" aria-live="polite">
          <span className="emotion-calendar-widget__summary-label">連續打卡</span>
          <strong className="emotion-calendar-widget__summary-value">
            <span className="emotion-calendar-widget__summary-number">{streakInfo.count}</span>
            <span className="emotion-calendar-widget__summary-unit">天</span>
          </strong>
        </section>
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