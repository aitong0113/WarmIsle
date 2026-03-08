import { BrowserRouter, Routes, Route } from "react-router-dom";

import IslandPage from "@/features/island/IslandPage";
import EmotionPage from "@/features/emotion/EmotionPage";
import HakoCabinPage from "@/features/hakoCabin/HakoCabinPage";
import HarborPage from "@/features/harbor/HarborPage";
import LighthousePage from "@/features/lighthouse/LighthousePage";
import LighthouseAdminPage from "@/features/lighthouse/LighthouseAdminPage";
import CampfirePage from "@/features/campfire/CampfirePage";
import MeditationPage from "@/features/meditation/MeditationPage";
import LoginPage from "@/features/user/LoginPage";
import MemberCenterPage from "@/features/user/MemberCenterPage";
import RootLayout from "@/layout/RootLayout";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<IslandPage />} />
          <Route path="/beach" element={<EmotionPage />} />
          <Route path="/hako-cabin" element={<HakoCabinPage />} />
          <Route path="/harbor" element={<HarborPage />} />
          <Route path="/daily-dock" element={<HarborPage />} />
          <Route path="/lighthouse" element={<LighthousePage />} />
          <Route path="/lighthouse-admin" element={<LighthouseAdminPage />} />
          <Route path="/campfire" element={<CampfirePage />} />
          <Route path="/meditation" element={<MeditationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<MemberCenterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;