import React from 'react';

const TEAL  = '#1D9E75';
const CORAL = '#D85A30';
const DARK  = '#1A1A2E';

/**
 * StatCard
 * A reusable metric card with an icon, value, label, and optional trend indicator.
 *
 * Props
 * ─────
 * label      {string}  – metric label, e.g. "Total utilisateurs"
 * value      {string}  – formatted value, e.g. "1 234"
 * icon       {string}  – emoji or any React node
 * color      {string}  – accent hex (e.g. TEAL)
 * lightColor {string}  – soft background hex (e.g. TEAL_LIGHT)
 * trend      {number}  – optional % change; positive = up, negative = down
 * trendLabel {string}  – context label, e.g. "ce mois"
 * onClick    {func}    – optional click handler
 */
const StatCard = ({
  label,
  value,
  icon,
  color,
  lightColor,
  trend,
  trendLabel,
  onClick,
}) => (
  <div
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    style={{
      background: '#fff',
      border: '1px solid #EBEBEB',
      borderRadius: 16,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.15s, box-shadow 0.15s',
      cursor: onClick ? 'pointer' : 'default',
      userSelect: 'none',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    {/* Decorative circle */}
    <div
      style={{
        position: 'absolute',
        right: -12,
        top: -12,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: lightColor,
        opacity: 0.7,
        pointerEvents: 'none',
      }}
    />

    {/* Icon */}
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        background: lightColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>

    {/* Label + value */}
    <div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: DARK,
          letterSpacing: -0.5,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>

    {/* Trend badge */}
    {trend !== undefined && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          color: trend >= 0 ? TEAL : CORAL,
        }}
      >
        <span style={{ fontWeight: 700 }}>{trend >= 0 ? '↑' : '↓'}</span>
        <span style={{ fontWeight: 600 }}>{Math.abs(trend)}%</span>
        {trendLabel && (
          <span style={{ color: '#aaa', fontWeight: 400 }}>{trendLabel}</span>
        )}
      </div>
    )}
  </div>
);

export default StatCard;
