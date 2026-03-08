"use client";
import React, { useState } from "react";
import { G, INIT_WO, INIT_NOTIFS } from "./data";
import { LoginScreen, Dashboard, AssetsScreen } from "./screens1";
import { PlansScreen, WorkOrdersScreen, NotificationsScreen, ReportsScreen } from "./screens2";

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Panel de Control", icon: "▦" },
  { id: "assets", label: "Activos", icon: "⬡" },
  { id: "plans", label: "Planes PM", icon: "◎" },
  { id: "workorders", label: "Ordenes de Trabajo", icon: "☰" },
  { id: "notifications", label: "Notificaciones", icon: "◉" },
  { id: "reports", label: "Reportes y KPIs", icon: "↗" },
];

interface SidebarProps {
  screen: string;
  setScreen: (screen: string) => void;
  unreadCount: number;
  onLogout: () => void;
}

function Sidebar({ screen, setScreen, unreadCount, onLogout }: SidebarProps) {
  return (
    <div style={{ width: 240, background: "#07101f", borderRight: "1px solid #1e3a5f", display: "flex", flexDirection: "column", flexShrink: 0, height: "100%" }}>
      <div style={{ padding: "20px 18px", borderBottom: "1px solid #1e3a5f" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "#f59e0b", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.01em", lineHeight: 1 }}>APEX</div>
            <div style={{ fontSize: 10, color: "#334155", letterSpacing: "0.09em", lineHeight: 1.6, textTransform: "uppercase" }}>Maintenance</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {NAV_ITEMS.map(item => {
          const active = screen === item.id;
          return (
            <button key={item.id} onClick={() => setScreen(item.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 7, border: "none", background: active ? "#f59e0b22" : "transparent", color: active ? "#f59e0b" : "#64748b", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: active ? 700 : 500, marginBottom: 2, transition: "all 0.15s", position: "relative", fontFamily: "inherit" }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#0f2040"; e.currentTarget.style.color = "#94a3b8"; } }}
              onMouseLeave={e => { e.currentTarget.style.background = active ? "#f59e0b22" : "transparent"; e.currentTarget.style.color = active ? "#f59e0b" : "#64748b"; }}>
              {active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 22, background: "#f59e0b", borderRadius: "0 3px 3px 0" }} />}
              <span style={{ fontSize: 14, width: 18, textAlign: "center", lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.id === "notifications" && unreadCount > 0 && (
                <span style={{ background: "#ef4444", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{unreadCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "14px 16px", borderTop: "1px solid #1e3a5f" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, background: "#1e3a5f", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#94a3b8", flexShrink: 0 }}>SM</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", lineHeight: 1 }}>Supervisor M.</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Supervisor · Demo</div>
          </div>
        </div>
        <button onClick={onLogout}
          style={{ width: "100%", background: "none", border: "1px solid #1e3a5f", color: "#475569", fontSize: 12, padding: "7px", borderRadius: 5, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.color = "#475569"; }}>
          Cerrar sesion
        </button>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("login");
  const [wo, setWo] = useState(INIT_WO);
  const [notifs, setNotifs] = useState(INIT_NOTIFS);

  const unreadCount = notifs.filter(n => !n.leida).length;

  if (screen === "login") {
    return (
      <>
        <style>{G}</style>
        <LoginScreen onLogin={() => setScreen("dashboard")} />
      </>
    );
  }

  return (
    <>
      <style>{G}</style>
      <div style={{ display: "flex", height: "100vh", background: "#060e20", overflow: "hidden" }}>
        <Sidebar
          screen={screen}
          setScreen={setScreen}
          unreadCount={unreadCount}
          onLogout={() => setScreen("login")}
        />
        <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          {screen === "dashboard" && <Dashboard wo={wo} />}
          {screen === "assets" && <AssetsScreen wo={wo} />}
          {screen === "plans" && <PlansScreen />}
          {screen === "workorders" && <WorkOrdersScreen wo={wo} setWo={setWo} />}
          {screen === "notifications" && <NotificationsScreen notifs={notifs} setNotifs={setNotifs} />}
          {screen === "reports" && <ReportsScreen wo={wo} />}
        </main>
      </div>
    </>
  );
}
