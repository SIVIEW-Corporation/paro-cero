'use client';

import React, { ReactNode } from 'react';

interface BadgeProps {
  label: string;
  color: string;
}

export function Badge({ label, color }: BadgeProps) {
  return (
    <span
      style={{
        fontSize: 11,
        padding: '2px 9px',
        borderRadius: 4,
        fontWeight: 700,
        letterSpacing: '0.04em',
        background: color + '20',
        color,
        border: `1px solid ${color}40`,
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
  color = '#3b82f6',
  icon,
}: KpiCardProps) {
  return (
    <div
      style={{
        background: '#0d1627',
        border: '1px solid #1e3a5f',
        borderRadius: 10,
        padding: '18px 20px',
        borderTop: `3px solid ${color}`,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: '#64748b',
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            lineHeight: 1.4,
          }}
        >
          {label}
        </div>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color,
          fontFamily: 'monospace',
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#475569' }}>{sub}</div>}
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
        padding: '10px 14px',
        textAlign: 'left',
        fontSize: 11,
        fontWeight: 700,
        color: '#64748b',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        borderBottom: '1px solid #1e3a5f',
        whiteSpace: 'nowrap',
        background: '#0a1628',
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
        padding: '11px 14px',
        fontSize: 13,
        color: bold ? '#f1f5f9' : '#cbd5e1',
        borderBottom: '1px solid #0d1f38',
        fontFamily: mono ? 'monospace' : 'inherit',
        fontWeight: bold ? 600 : 400,
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
    <div
      className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0'
      style={{
        marginBottom: 24,
        paddingBottom: 20,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background:
          'linear-gradient(90deg, rgba(251,191,36,0.03) 0%, transparent 100%)',
        padding: '16px 20px',
        marginLeft: -20,
        marginRight: -20,
        borderRadius: '8px 8px 0 0',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#f8fafc',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 4,
              height: 22,
              background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: 2,
            }}
          />
          {title}
        </h1>
        {sub && (
          <p
            style={{
              fontSize: 13,
              color: '#64748b',
              marginTop: 6,
              marginLeft: 16,
            }}
          >
            {sub}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Card({ children, style: s, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: '#0d1627',
        border: '1px solid #1e3a5f',
        borderRadius: 10,
        padding: '18px 20px',
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
        color: '#64748b',
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
        padding: '8px 0',
        borderBottom: '1px solid #0d1f38',
        fontSize: 13,
      }}
    >
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{value}</span>
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
        background: disabled ? '#64748b' : '#f59e0b',
        color: '#000',
        fontWeight: 700,
        fontSize: 13,
        padding: '9px 18px',
        borderRadius: 7,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
        opacity: disabled ? 0.6 : 1,
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
        background: 'none',
        border: '1px solid #1e3a5f',
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: 600,
        padding: '6px 14px',
        borderRadius: 6,
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
        background: 'none',
        border: '1px solid #1e3a5f',
        color: '#94a3b8',
        borderRadius: 6,
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
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
        background: 'rgba(0,0,0,0.75)',
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
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
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
          color: '#64748b',
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
  onConfirm: () => void;
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
          background: 'none',
          border: '1px solid #1e3a5f',
          color: '#94a3b8',
          borderRadius: 6,
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
          background: '#f59e0b',
          color: '#000',
          fontWeight: 700,
          borderRadius: 6,
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
