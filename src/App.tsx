import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import OverviewPage from "@/pages/OverviewPage";
import AnomaliesPage from "@/pages/AnomaliesPage";
import StatisticsPage from "@/pages/StatisticsPage";
import SurgeryDetailPage from "@/pages/SurgeryDetailPage";
import ProcedureConfigPage from "@/pages/ProcedureConfigPage";
import { useAppStore } from "@/store/useAppStore";

function AppLayout() {
  const location = useLocation();
  const showSidebar = location.pathname !== "/surgery/:id" && !location.pathname.startsWith("/surgery/");

  return (
    <div className="min-h-screen bg-background-page flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar />}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/anomaly" element={<AnomaliesPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/surgery/:id" element={<SurgeryDetailPage />} />
            <Route path="/procedure" element={<ProcedureConfigPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { login, user } = useAppStore();

  useEffect(() => {
    if (!user) {
      login();
    }
  }, [login, user]);

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
