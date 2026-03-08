import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import HakoCompanion from "@/features/hako/components/HakoCompanion";

function RootLayout() {
  return (
    <div className="app-root">
      <Header />

      <main className="app-main">
        <Outlet />
      </main>

      <HakoCompanion />

      <Footer />
    </div>
  );
}

export default RootLayout;
