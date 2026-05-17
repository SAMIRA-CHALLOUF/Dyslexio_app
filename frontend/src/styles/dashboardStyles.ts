import type { CSSProperties } from "react";

// Small helper — forces TypeScript to treat every object as CSSProperties,
// eliminating the "string is not assignable to TextAlign" family of errors.
const css = (obj: CSSProperties): CSSProperties => obj;

export const colors = {
  bg: "#F0F2F8",
  card: "#FFFFFF",
  border: "#E2E5EF",
  text: "#111827",
  muted: "#6B7280",
  subtle: "#9CA3AF",
  primary: "#4F6EF7",
  primaryDark: "#3451D1",
  primaryLight: "#EEF2FF",
  teal: "#0891B2",
  tealLight: "#E0F7FA",
  amber: "#D97706",
  amberLight: "#FEF3C7",
  coral: "#F43F5E",
  coralLight: "#FFE4E9",
  green: "#10B981",
  greenLight: "#D1FAE5",
  purple: "#7C3AED",
  purpleLight: "#EDE9FE",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  orange: "#EA580C",
  orangeLight: "#FFEDD5",
};

export const shadow = {
  card: "0 1px 3px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.04)",
  soft: "0 8px 32px rgba(16,24,40,.12)",
  glow: "0 0 0 3px rgba(79,110,247,.15)",
};

export const layout = {
  shell: css({
    display: "flex", minHeight: "100vh", width: "100%",
    background: colors.bg, color: colors.text,
    fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
  }),

  sidebar: (collapsed: boolean): CSSProperties => ({
    width: collapsed ? 68 : 248,
    transition: "width .25s cubic-bezier(.4,0,.2,1)",
    background: "#FFF",
    borderRight: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
    overflowX: "hidden",
  }),

  sidebarHeader: css({
    display: "flex", alignItems: "center", gap: 10,
    padding: "18px 14px 14px", borderBottom: `1px solid ${colors.border}`,
    minHeight: 64,
  }),

  brandBadge: css({
    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.teal})`,
    color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 16,
    boxShadow: "0 2px 8px rgba(79,110,247,.4)",
  }),

  navSection: css({
    padding: "16px 12px 4px", fontSize: 10, color: colors.subtle,
    fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em",
  }),

  navItem: (active: boolean): CSSProperties => ({
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 10px", margin: "2px 8px",
    borderRadius: 9, cursor: "pointer",
    background: active ? colors.primaryLight : "transparent",
    color: active ? colors.primaryDark : colors.muted,
    fontWeight: active ? 700 : 500,
    textDecoration: "none", fontSize: 14,
    transition: "all 0.15s ease",
    whiteSpace: "nowrap", overflow: "hidden",
  }),

  main: css({ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }),

  topbar: css({
    height: 64, display: "flex", alignItems: "center", gap: 12,
    padding: "0 28px", borderBottom: `1px solid ${colors.border}`,
    background: "rgba(255,255,255,.92)", backdropFilter: "blur(12px)",
    position: "sticky", top: 0, zIndex: 10,
  }),

  iconBtn: css({
    width: 36, height: 36, borderRadius: 9, border: "none",
    background: "transparent", cursor: "pointer",
    display: "grid", placeItems: "center",
    transition: "background .15s",
  }),

  searchInput: css({
    height: 38, padding: "0 12px", borderRadius: 9,
    border: `1px solid ${colors.border}`, outline: "none",
    width: 300, fontSize: 14, background: colors.bg,
    color: colors.text,
  }),

  content: css({
    padding: 28, maxWidth: 1280, margin: "0 auto",
    width: "100%", boxSizing: "border-box",
  }),

  card: css({
    background: colors.card, border: `1px solid ${colors.border}`,
    borderRadius: 16, boxShadow: shadow.card,
  }),

  cardPadded: css({
    background: colors.card, border: `1px solid ${colors.border}`,
    borderRadius: 16, boxShadow: shadow.card, padding: 24,
  }),

  statCard: css({
    padding: 22, display: "flex",
    justifyContent: "space-between", alignItems: "flex-start",
  }),

  statValue: css({ fontSize: 28, fontWeight: 800, marginTop: 6, letterSpacing: "-.5px" }),

  statLabel: css({
    fontSize: 11, fontWeight: 700, letterSpacing: ".07em",
    textTransform: "uppercase", color: colors.muted,
  }),

  statDelta: (positive: boolean): CSSProperties => ({
    fontSize: 11, fontWeight: 600, marginTop: 4,
    color: positive ? colors.green : colors.danger,
  }),

  grid3: css({ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }),
  grid4: css({ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }),

  btn: (variant: "primary" | "danger" | "ghost" | "text" = "primary"): CSSProperties => ({
    height: 38, padding: "0 16px", borderRadius: 9, fontSize: 14, fontWeight: 600,
    border: variant === "ghost" ? `1px solid ${colors.border}` : "none",
    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
    background:
      variant === "primary" ? colors.primary
      : variant === "danger" ? colors.danger
      : variant === "ghost" ? "#fff"
      : "transparent",
    color: variant === "primary" || variant === "danger" ? "#fff" : colors.text,
    boxShadow:
      variant === "primary" ? "0 2px 6px rgba(79,110,247,.3)"
      : variant === "danger" ? "0 2px 6px rgba(220,38,38,.25)"
      : "none",
    transition: "all .15s ease",
  }),

  badge: (color: "teal" | "amber" | "green" | "coral" | "purple" | "muted" = "teal"): CSSProperties => {
    const map = {
      teal:   { bg: colors.tealLight,   fg: colors.teal },
      amber:  { bg: colors.amberLight,  fg: colors.amber },
      green:  { bg: colors.greenLight,  fg: colors.green },
      coral:  { bg: colors.coralLight,  fg: colors.coral },
      purple: { bg: colors.purpleLight, fg: colors.purple },
      muted:  { bg: colors.bg,          fg: colors.muted },
    };
    const c = map[color] ?? map.muted;
    return {
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 700,
      background: c.bg, color: c.fg,
    };
  },

  table: css({ width: "100%", borderCollapse: "collapse", fontSize: 14 }),

  th: css({
    textAlign: "left", padding: "11px 16px",
    color: colors.subtle, fontSize: 11, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: ".06em",
    borderBottom: `1px solid ${colors.border}`, background: "#FAFBFD",
  }),

  td: css({ padding: "13px 16px", borderBottom: `1px solid ${colors.border}` }),

  avatar: css({
    width: 36, height: 36, borderRadius: 10,
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.teal})`,
    color: "#fff", display: "grid", placeItems: "center",
    fontSize: 12, fontWeight: 700, flexShrink: 0, letterSpacing: ".03em",
  }),

  // Modal
  modalOverlay: css({
    position: "fixed", inset: 0, background: "rgba(15,23,42,.5)",
    display: "grid", placeItems: "center", zIndex: 50, padding: 16,
  }),

  modal: css({
    background: "#fff", borderRadius: 18, width: "100%",
    maxWidth: 580, maxHeight: "92vh", overflow: "auto", boxShadow: shadow.soft,
  }),

  modalHeader: css({ padding: "22px 26px 18px", borderBottom: `1px solid ${colors.border}` }),
  modalBody:   css({ padding: "22px 26px", display: "grid", gap: 14 }),
  modalFooter: css({
    padding: "16px 26px", borderTop: `1px solid ${colors.border}`,
    display: "flex", justifyContent: "flex-end", gap: 10,
  }),

  field: css({ display: "grid", gap: 5 }),
  label: css({ fontSize: 12, fontWeight: 600, color: colors.muted }),

  input: css({
    height: 40, padding: "0 12px",
    border: `1px solid ${colors.border}`, borderRadius: 9,
    fontSize: 14, outline: "none", background: "#fff",
    color: colors.text, transition: "border-color .15s, box-shadow .15s",
  }),

  textarea: css({
    padding: "10px 12px", border: `1px solid ${colors.border}`,
    borderRadius: 9, fontSize: 14, outline: "none", background: "#fff",
    color: colors.text, resize: "vertical", fontFamily: "inherit",
    transition: "border-color .15s",
  }),

  row2: css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }),
  row3: css({ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }),
  divider: css({ height: 1, background: colors.border, margin: "4px 0" }),

  sectionTitle: css({
    fontSize: 12, fontWeight: 700, color: colors.muted,
    textTransform: "uppercase", letterSpacing: ".06em",
  }),

  pageHeader: css({
    display: "flex", justifyContent: "space-between", alignItems: "center",
    flexWrap: "wrap", gap: 12, marginBottom: 24,
  }),

  emptyState: css({ padding: "56px 24px", textAlign: "center", color: colors.muted }),
};