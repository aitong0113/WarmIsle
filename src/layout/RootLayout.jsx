import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import HakoCompanion from "@/features/hako/components/HakoCompanion";
import AuthBootstrap from "@/features/user/components/AuthBootstrap";

function RootLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/intro";
  const isIslandPage = location.pathname === "/island";
  const isHakoCabinPage = location.pathname.startsWith("/hako-cabin");
  const isScenicPage = !isLandingPage;
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!location.state?.upgraded) return undefined;

    const featureLabel = location.state?.unlockedFeature || "付費內容";
    setToast({
      title: "已解鎖新區域",
      message: `${featureLabel} 現在可以直接進入了。`,
    });

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 3600);

    return () => window.clearTimeout(timeout);
  }, [location.key, location.state]);

  return (
    <div className="app-root">
      <AuthBootstrap />

      {toast && (
        <div className="app-toast" role="status" aria-live="polite">
          <span className="app-toast__icon" aria-hidden="true">
            <CheckCircle2 size={18} strokeWidth={2.4} />
          </span>
          <div className="app-toast__content">
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button type="button" className="app-toast__close" onClick={() => setToast(null)} aria-label="關閉提示">
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>
      )}

      {!isLandingPage && <Header />}

      <main
        className={`app-main ${isLandingPage ? "app-main--landing" : ""} ${
          isScenicPage ? "app-main--scenic" : ""
        } ${isIslandPage ? "app-main--island" : ""} ${isHakoCabinPage ? "app-main--hako-cabin" : ""}`}
      >
        <Outlet />
      </main>

      {!isLandingPage && !isHakoCabinPage && <HakoCompanion />}

      {!isLandingPage && <Footer />}
    </div>
  );
}

export default RootLayout;
