import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const navItems = [
  { path: "/home", icon: "🏠", label: "Home" },
  { path: "/send", icon: "💸", label: "Pay / Transfer" },
  { path: "/transactions", icon: "📋", label: "Transactions" },
  { path: "/addmoney", icon: "➕", label: "Add Money" },
  { path: "/profile", icon: "👤", label: "Profile" },
];

function AppLayout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">₹</span>
          <span className="logo-text">InstaPay</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          className="sidebar-logout"
          onClick={() => navigate("/signin")}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="main-area">
        {/* Top bar (mobile) */}
        <header className="topbar">
          <button
            className="menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
          <span className="topbar-title">InstaPay</span>
          <div className="topbar-avatar">A</div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
