import { useState } from "react";
import Sidebar from "./Sidebar";
import Header  from "./Header";
import { globalStyles } from "./globalStyles";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  inventory: "Inventory",
  borrow:    "Borrow / Return",
  users:     "User Management",
  storage:   "Storage",
  audit:     "Audit Log",
};

export default function MainLayout({ children, defaultPage = "dashboard" }) {
  const [activePage, setActivePage] = useState(defaultPage);
  console.log(activePage);

  // Allow children to receive activePage so they can render the right content
  const childWithPage = typeof children === "function"
    ? children(activePage, setActivePage)
    : children;

  return (
    <>
      <style>{globalStyles}</style>

      <div className="app-shell">

        <Sidebar activePage={activePage} onNavigate={setActivePage} />

        <div className="shell-main">
          <Header title={PAGE_TITLES[activePage] || "Dashboard"} />

          <main className="page-content">
            {childWithPage}
          </main>
        </div>

      </div>
    </>
  );
}