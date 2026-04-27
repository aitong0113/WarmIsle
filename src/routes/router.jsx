import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import IslandPage from "@/features/island/IslandPage";
import EmotionPage from "@/features/emotion/EmotionPage";
import HakoCabinPage from "@/features/hakoCabin/HakoCabinPage";
import HakoCabinPremiumPage from "@/features/hakoCabin/HakoCabinPremiumPage";
import LighthousePage from "@/features/lighthouse/LighthousePage";
import LighthouseAdminPage from "@/features/lighthouse/LighthouseAdminPage";
import CampfirePage from "@/features/campfire/CampfirePage";
import MeditationPage from "@/features/meditation/MeditationPage";
import LoginPage from "@/features/user/LoginPage";
import MemberCenterPage from "@/features/user/MemberCenterPage";
import UpgradePage from "@/features/user/UpgradePage";
import RequireAdminRoute from "@/features/user/components/RequireAdminRoute";
import RequireAuthRoute from "@/features/user/components/RequireAuthRoute";
import RequirePaidRoute from "@/features/user/components/RequirePaidRoute";
import RootLayout from "@/layout/RootLayout";
import HomeEntryPage from "@/features/home/HomeEntryPage";
import EntryGate from "@/features/home/EntryGate";
import HomeCenterIntroPage from "@/features/homeCenter/HomeCenterIntroPage";
import HomeCenterTodayPage from "@/features/homeCenter/HomeCenterTodayPage";
import HomeCenterJournalPage from "@/features/homeCenter/HomeCenterJournalPage";
import HomeCenterStatusPage from "@/features/homeCenter/HomeCenterStatusPage";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route
            path="/"
            element={(
              <RequireAuthRoute>
                <EntryGate />
              </RequireAuthRoute>
            )}
          />
          <Route
            path="/intro"
            element={(
              <RequireAuthRoute>
                <HomeEntryPage />
              </RequireAuthRoute>
            )}
          />
          <Route
            path="/island"
            element={(
              <RequireAuthRoute>
                <IslandPage />
              </RequireAuthRoute>
            )}
          />
          <Route
            path="/home-center"
            element={<Navigate to="/home-center/today" replace />}
          />
          <Route
            path="/home-center/intro"
            element={(
              <RequireAuthRoute>
                <HomeCenterIntroPage />
              </RequireAuthRoute>
            )}
          />
          <Route
            path="/home-center/today"
            element={(
              <RequireAuthRoute>
                <HomeCenterTodayPage />
              </RequireAuthRoute>
            )}
          />
          <Route
            path="/home-center/journal"
            element={(
              <RequireAuthRoute>
                <HomeCenterJournalPage />
              </RequireAuthRoute>
            )}
          />
          <Route
            path="/home-center/status"
            element={(
              <RequireAuthRoute>
                <HomeCenterStatusPage />
              </RequireAuthRoute>
            )}
          />
          <Route
            path="/beach"
            element={(
              <RequireAuthRoute>
                <EmotionPage />
              </RequireAuthRoute>
            )}
          />
          <Route
            path="/hako-cabin"
            element={(
              <RequireAuthRoute>
                <HakoCabinPage />
              </RequireAuthRoute>
            )}
          />
          <Route
            path="/hako-cabin/premium"
            element={(
              <RequirePaidRoute featureName="哈可小屋付費版">
                <HakoCabinPremiumPage />
              </RequirePaidRoute>
            )}
          />
          <Route path="/harbor" element={<Navigate to="/beach" replace />} />
          <Route path="/daily-dock" element={<Navigate to="/beach" replace />} />
          <Route
            path="/lighthouse"
            element={(
              <RequirePaidRoute featureName="心理燈塔">
                <LighthousePage />
              </RequirePaidRoute>
            )}
          />
          <Route
            path="/lighthouse-admin"
            element={(
              <RequireAdminRoute>
                <LighthouseAdminPage />
              </RequireAdminRoute>
            )}
          />
          <Route
            path="/campfire"
            element={(
              <RequirePaidRoute featureName="營火廣場">
                <CampfirePage />
              </RequirePaidRoute>
            )}
          />
          <Route
            path="/meditation"
            element={(
              <RequirePaidRoute featureName="冥想碼頭">
                <MeditationPage />
              </RequirePaidRoute>
            )}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/account"
            element={(
              <RequireAuthRoute>
                <MemberCenterPage />
              </RequireAuthRoute>
            )}
          />
          <Route
            path="/upgrade"
            element={(
              <RequireAuthRoute>
                <UpgradePage />
              </RequireAuthRoute>
            )}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;