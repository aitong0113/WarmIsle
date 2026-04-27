import {
  BsArrowCounterclockwise,
  BsBarChartLine,
  BsCalendarCheck,
  BsJournalText,
} from "react-icons/bs";

export const HOME_CENTER_PAGES = [
  {
    id: "intro",
    label: "重看入口",
    title: "重看入口",
    kicker: "首頁功能",
    path: "/home-center/intro",
    icon: BsArrowCounterclockwise,
  },
  {
    id: "today",
    label: "今日情緒",
    title: "今日情緒",
    kicker: "首頁功能",
    path: "/home-center/today",
    icon: BsJournalText,
  },
  {
    id: "journal",
    label: "心情紀錄",
    title: "心情紀錄",
    kicker: "首頁功能",
    path: "/home-center/journal",
    icon: BsCalendarCheck,
  },
  {
    id: "status",
    label: "我的狀態",
    title: "我的狀態",
    kicker: "首頁功能",
    path: "/home-center/status",
    icon: BsBarChartLine,
  },
];

export function getHomeCenterPage(pageId) {
  return HOME_CENTER_PAGES.find((page) => page.id === pageId) || HOME_CENTER_PAGES[0];
}