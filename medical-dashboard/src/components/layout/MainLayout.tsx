import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={cn("min-h-screen transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
