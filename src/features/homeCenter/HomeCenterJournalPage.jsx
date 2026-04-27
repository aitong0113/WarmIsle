import HomeCenterShell from "./components/HomeCenterShell";
import EmotionCalendarWidget from "./components/EmotionCalendarWidget";
import { getHomeCenterPage } from "./config/homeCenterPages";
import { useHomeCenterData } from "./hooks/useHomeCenterData";

function HomeCenterJournalPage() {
  const page = getHomeCenterPage("journal");
  const {
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
  } = useHomeCenterData();

  return (
    <HomeCenterShell
      pageId={page.id}
      kicker={page.kicker}
      title={page.title}
      description="把散落的感受收進月曆裡，之後回頭看會比較知道自己怎麼走過來。"
    >
      <article className="home-center-card">
        <EmotionCalendarWidget
          currentMonth={currentMonth}
          emotionMetaById={emotionMetaById}
          monthDays={monthDays}
          monthEntriesCount={monthEntriesCount}
          selectedDate={selectedDate}
          selectedDay={selectedDay}
          setCurrentMonth={setCurrentMonth}
          setSelectedDate={setSelectedDate}
          streakInfo={streakInfo}
          today={today}
        />
      </article>
    </HomeCenterShell>
  );
}

export default HomeCenterJournalPage;