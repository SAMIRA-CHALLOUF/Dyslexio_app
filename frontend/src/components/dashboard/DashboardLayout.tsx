import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, GraduationCap, CreditCard, Settings, Menu, Bell, Search, ChevronRight } from "lucide-react";
import { layout, colors } from "../../styles/dashboardStyles.ts";

const items = [
  { title: "Vue d'ensemble", url: "/dashboard", icon: LayoutDashboard },
  { title: "Élèves", url: "/dashboard/eleves", icon: GraduationCap },
  { title: "Paiements", url: "/dashboard/paiements", icon: CreditCard },
];

const bottomItems = [
  { title: "Paramètres", url: "/dashboard/parametres", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  const NavItem = ({ item }: { item: typeof items[0] }) => {
    const active = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url));
    const Icon = item.icon;
    return (
      <NavLink
        key={item.url}
        to={item.url}
        end={item.url === "/dashboard"}
        style={layout.navItem(active)}
        title={collapsed ? item.title : undefined}
      >
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, flexShrink: 0, color: active ? colors.primaryDark : colors.muted }}>
          <Icon size={18} />
        </span>
        {!collapsed && <span style={{ flex: 1 }}>{item.title}</span>}
        {!collapsed && active && (
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.primary, flexShrink: 0 }} />
        )}
      </NavLink>
    );
  };

  return (
    <div style={layout.shell}>
      {/* Sidebar */}
      <aside style={layout.sidebar(collapsed)}>
        {/* Brand */}
        <div style={layout.sidebarHeader}>
          <div style={layout.brandBadge}>L</div>
          {!collapsed && (
            <div style={{ lineHeight: 1.15, overflow: "hidden" }}>
              <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: "nowrap" }}>LexiAide</div>
              <div style={{ fontSize: 10, color: colors.muted, textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600 }}>
                Établissement
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 0", flex: 1 }}>
          {!collapsed && (
            <div style={layout.navSection}>Gestion</div>
          )}
          {items.map((item) => <NavItem key={item.url} item={item} />)}
        </nav>

        {/* Bottom Nav */}
        <div style={{ padding: "8px 0 12px", borderTop: `1px solid ${colors.border}` }}>
          {bottomItems.map((item) => <NavItem key={item.url} item={item} />)}
        </div>
      </aside>

      {/* Main */}
      <div style={layout.main}>
        {/* Topbar */}
        <header style={layout.topbar}>
          <button
            style={layout.iconBtn}
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            <Menu size={19} color={colors.text} />
          </button>

          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={15} color={colors.muted} style={{ position: "absolute", left: 11, pointerEvents: "none" }} />
            <input
              style={{ ...layout.searchInput, paddingLeft: 36 }}
              placeholder="Rechercher un élève, une référence…"
            />
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{ ...layout.iconBtn, position: "relative" }} aria-label="Notifications">
              <Bell size={19} color={colors.text} />
              <span style={{
                position: "absolute", top: 7, right: 7,
                width: 7, height: 7, backgroundColor: colors.coral,
                borderRadius: "50%", border: "2px solid #fff"
              }} />
            </button>

            <div style={{
              display: "flex", alignItems: "center", gap: 9,
              background: colors.bg, padding: "5px 14px 5px 5px",
              borderRadius: 999, border: `1px solid ${colors.border}`,
            }}>
              <div style={{ ...layout.avatar, width: 30, height: 30, borderRadius: 8, fontSize: 10 }}>ÉS</div>
              <div style={{ fontSize: 12, lineHeight: 1.3 }}>
                <div style={{ fontWeight: 700, color: colors.text }}>École Saadia</div>
                <div style={{ color: colors.muted, fontSize: 11 }}>Administrateur</div>
              </div>
              <ChevronRight size={13} color={colors.muted} style={{ marginLeft: 2 }} />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={layout.content}>{children}</main>
      </div>
    </div>
  );
}