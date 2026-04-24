'use client';

import type { CSSProperties, ReactNode } from 'react';

const ui = {
  surface: 'var(--app-surface, #ffffff)',
  surfaceSubtle: 'var(--app-surface-subtle, #f8fafc)',
  surfaceMuted: 'var(--app-surface-muted, #eef2f7)',
  textPrimary: 'var(--app-text-primary, #111827)',
  textSecondary: 'var(--app-text-secondary, #667085)',
  textMuted: 'var(--app-text-muted, #94a3b8)',
  borderSoft: 'var(--app-border-soft, #dde3ea)',
  border: 'var(--app-border, #cbd5e1)',
  brand: 'var(--app-brand, #d89b2b)',
  brandDark: 'var(--app-brand-dark, #b7791f)',
  brandSoft: 'var(--app-brand-soft, #fff4db)',
  shadowCard: 'var(--app-shadow-card, 0 1px 2px rgb(15 23 42 / 0.04))',
};

function getBadgeTone(color: string) {
  const normalized = color.toLowerCase();

  if (['#22c55e', '#16a34a'].includes(normalized)) {
    return { background: '#dcfce7', color: '#166534', border: '#bbf7d0' };
  }
  if (['#ef4444', '#dc2626'].includes(normalized)) {
    return { background: '#fee2e2', color: '#991b1b', border: '#fecaca' };
  }
  if (['#3b82f6', '#2563eb', '#1d4ed8', '#0d9488'].includes(normalized)) {
    return { background: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' };
  }
  if (['#f59e0b', '#f97316', '#d89b2b', '#b7791f'].includes(normalized)) {
    return { background: '#fef3c7', color: '#b7791f', border: '#fde68a' };
  }

  return { background: '#eef2f7', color: '#667085', border: '#dde3ea' };
}

interface BadgeProps {
  label: string;
  color: string;
}

export function Badge({ label, color }: BadgeProps) {
  const tone = getBadgeTone(color);

  return (
    <span
      style={{
        fontSize: 11,
        padding: '3px 9px',
        borderRadius: 999,
        fontWeight: 700,
        letterSpacing: '0.02em',
        background: tone.background,
        color: tone.color,
        border: `1px solid ${tone.border}`,
        whiteSpace: 'nowrap',
        fontFamily: 'monospace',
      }}
    >
      {label}
    </span>
  );
}

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: ReactNode;
}

export function KpiCard({
  label,
  value,
  sub,
  color = '#2563eb',
  icon,
}: KpiCardProps) {
  const tone = getBadgeTone(color);

  return (
    <div
      style={{
        background: ui.surface,
        border: `1px solid ${ui.borderSoft}`,
        borderRadius: 14,
        padding: '18px 20px',
        boxShadow: ui.shadowCard,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: ui.textSecondary,
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            lineHeight: 1.4,
          }}
        >
          {label}
        </div>
        {icon && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: 10,
              background: tone.background,
              color: tone.color,
              fontSize: 14,
            }}
          >
            {icon}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: ui.textPrimary,
          fontFamily: 'monospace',
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: ui.textMuted }}>{sub}</div>}
    </div>
  );
}

interface ThProps {
  children: ReactNode;
}

export function Th({ children }: ThProps) {
  return (
    <th
      style={{
        padding: '11px 14px',
        textAlign: 'left',
        fontSize: 11,
        fontWeight: 700,
        color: ui.textSecondary,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        borderBottom: `1px solid ${ui.borderSoft}`,
        whiteSpace: 'nowrap',
        background: ui.surfaceSubtle,
      }}
    >
      {children}
    </th>
  );
}

interface TdProps {
  children: ReactNode;
  mono?: boolean;
  bold?: boolean;
}

export function Td({ children, mono, bold }: TdProps) {
  return (
    <td
      style={{
        padding: '12px 14px',
        fontSize: 13,
        color: bold ? ui.textPrimary : ui.textSecondary,
        borderBottom: `1px solid ${ui.borderSoft}`,
        fontFamily: mono ? 'monospace' : 'inherit',
        fontWeight: bold ? 650 : 400,
      }}
    >
      {children}
    </td>
  );
}

interface PageHeaderProps {
  title: string;
  sub?: string;
  action?: ReactNode;
}

export function PageHeader({ title, sub, action }: PageHeaderProps) {
  return (
    <div className='border-app-border-soft mb-6 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between'>
      <div>
        <h1 className='text-app-text-primary flex items-center gap-3 text-2xl font-bold tracking-tight'>
          <span className='bg-app-brand inline-block h-6 w-1 rounded-full' />
          {title}
        </h1>
        {sub && (
          <p className='text-app-text-secondary mt-1.5 ml-4 text-sm'>{sub}</p>
        )}
      </div>
      {action}
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Card({ children, style: s, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: ui.surface,
        border: `1px solid ${ui.borderSoft}`,
        borderRadius: 14,
        padding: '18px 20px',
        boxShadow: ui.shadowCard,
        ...s,
      }}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
}

export function CardTitle({ children }: CardTitleProps) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: ui.textSecondary,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

interface RowDataProps {
  label: string;
  value: ReactNode;
}

export function RowData({ label, value }: RowDataProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        padding: '9px 0',
        borderBottom: `1px solid ${ui.borderSoft}`,
        fontSize: 13,
      }}
    >
      <span style={{ color: ui.textSecondary }}>{label}</span>
      <span style={{ color: ui.textPrimary, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

interface BtnPrimaryProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function BtnPrimary({ children, onClick, disabled }: BtnPrimaryProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? ui.surfaceMuted : ui.brandDark,
        color: disabled ? ui.textMuted : '#ffffff',
        fontWeight: 700,
        fontSize: 13,
        padding: '9px 18px',
        borderRadius: 9,
        border: disabled ? `1px solid ${ui.borderSoft}` : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
        opacity: disabled ? 0.85 : 1,
      }}
    >
      {children}
    </button>
  );
}

interface BtnGhostProps {
  children: ReactNode;
  onClick?: () => void;
}

export function BtnGhost({ children, onClick }: BtnGhostProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: ui.surface,
        border: `1px solid ${ui.border}`,
        color: ui.textSecondary,
        fontSize: 12,
        fontWeight: 650,
        padding: '6px 14px',
        borderRadius: 9,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

interface BtnBackProps {
  onClick?: () => void;
}

export function BtnBack({ onClick }: BtnBackProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: ui.surface,
        border: `1px solid ${ui.border}`,
        color: ui.textSecondary,
        borderRadius: 9,
        padding: '7px 16px',
        fontSize: 13,
        cursor: 'pointer',
        marginBottom: 20,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'inherit',
      }}
    >
      ← Volver
    </button>
  );
}

interface DataTableProps {
  head: string[];
  children: ReactNode;
}

export function DataTable({ head, children }: DataTableProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}
      >
        <thead>
          <tr>
            {head.map((h, i) => (
              <Th key={i}>{h}</Th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgb(15 23 42 / 0.34)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
        padding: 16,
      }}
    >
      <Card className='max-h-[90vh] w-full max-w-[520px] overflow-y-auto'>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 22,
          }}
        >
          <h2 style={{ fontSize: 17, fontWeight: 800, color: ui.textPrimary }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: ui.textMuted,
              fontSize: 22,
              cursor: 'pointer',
              lineHeight: 1,
              fontFamily: 'inherit',
            }}
          >
            x
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <div style={{ marginBottom: 15 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: ui.textSecondary,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

interface ModalFooterProps {
  onCancel: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
}

export function ModalFooter({
  onCancel,
  onConfirm,
  confirmLabel = 'Guardar',
}: ModalFooterProps) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
      <button
        onClick={onCancel}
        style={{
          flex: 1,
          background: ui.surface,
          border: `1px solid ${ui.border}`,
          color: ui.textSecondary,
          borderRadius: 8,
          padding: 10,
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        style={{
          flex: 1,
          background: ui.brandDark,
          color: '#ffffff',
          fontWeight: 700,
          borderRadius: 8,
          padding: 10,
          fontSize: 13,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
