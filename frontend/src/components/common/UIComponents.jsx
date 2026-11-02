import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export function Card({ children, className = '', hover = false }) {
  return (
    <div
      class={`bg-surface-card rounded-xl border border-surface-border p-6 shadow-soft transition-all duration-200 ${
        hover ? 'hover:shadow-card hover:border-forest-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  icon: Icon,
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variants = {
    primary:
      'bg-forest-700 text-white hover:bg-forest-800 focus:ring-forest-600 shadow-sm',
    secondary:
      'bg-white text-charcoal-800 border border-surface-border hover:bg-surface-muted focus:ring-forest-600',
    mint:
      'bg-forest-100 text-forest-900 hover:bg-forest-200 focus:ring-forest-500 font-semibold',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost:
      'text-charcoal-600 hover:text-charcoal-900 hover:bg-surface-muted focus:ring-charcoal-400',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      class={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <span class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon class="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}

export function Badge({ children, variant = 'neutral', size = 'sm', className = '' }) {
  const variants = {
    neutral: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
    forest: 'bg-forest-100 text-forest-800 border-forest-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  return (
    <span
      class={`inline-flex items-center font-medium rounded-full border ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div class="w-full">
      {label && (
        <label for={inputId} class="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        class={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 transition-colors ${
          error ? 'border-red-500 focus:ring-red-400' : 'border-surface-border'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p class="text-xs text-red-600 mt-1">{error}</p>
      ) : helperText ? (
        <p class="text-xs text-charcoal-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  error,
  helperText,
  options = [],
  children,
  className = '',
  id,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div class="w-full">
      {label && (
        <label for={selectId} class="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        class={`w-full px-3.5 py-2 text-sm rounded-lg border bg-white text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 transition-colors ${
          error ? 'border-red-500 focus:ring-red-400' : 'border-surface-border'
        } ${className}`}
        {...props}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
      {error && <p class="text-xs text-red-600 mt-1">{error}</p>}
      {helperText && !error && <p class="text-xs text-charcoal-500 mt-1">{helperText}</p>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) {
  return (
    <div class="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-surface-border bg-white/50">
      {Icon && (
        <div class="w-12 h-12 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mb-4">
          <Icon class="w-6 h-6" />
        </div>
      )}
      <h3 class="text-base font-semibold text-charcoal-900">{title}</h3>
      {description && <p class="text-sm text-charcoal-500 max-w-sm mt-1 mb-5">{description}</p>}
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ count = 3, height = 'h-20' }) {
  return (
    <div class="space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} class={`w-full ${height} bg-charcoal-100/60 rounded-xl animate-pulse`} />
      ))}
    </div>
  );
}

export function AlertBanner({ type = 'info', title, message, className = '' }) {
  const configs = {
    info: { bg: 'bg-blue-50 border-blue-200 text-blue-900', icon: Info },
    success: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-900', icon: CheckCircle2 },
    warning: { bg: 'bg-amber-50 border-amber-200 text-amber-900', icon: AlertTriangle },
    error: { bg: 'bg-red-50 border-red-200 text-red-900', icon: AlertCircle },
  };

  const { bg, icon: Icon } = configs[type] || configs.info;

  return (
    <div class={`flex items-start gap-3 p-4 rounded-xl border ${bg} ${className}`}>
      <Icon class="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div>
        {title && <h4 class="font-semibold text-sm">{title}</h4>}
        {message && <p class="text-xs mt-0.5 leading-relaxed">{message}</p>}
      </div>
    </div>
  );
}

