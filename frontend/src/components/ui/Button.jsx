import React from 'react';
import { Link } from 'react-router-dom';

const variants = {
  primary: "bg-[var(--color-obsidian)] text-white hover:bg-[var(--color-cinnabar)] transition-colors",
  secondary: "bg-[var(--color-cinnabar)] text-white hover:opacity-90",
  outline: "bg-transparent border border-[var(--color-obsidian)] text-[var(--color-obsidian)] hover:bg-[var(--color-obsidian)] hover:text-white transition-all",
  ghost: "bg-transparent text-[var(--color-obsidian)] hover:opacity-60",
  danger: "bg-[var(--color-cinnabar)]/10 text-[var(--color-cinnabar)] hover:bg-[var(--color-cinnabar)] hover:text-white transition-colors",
};

const sizes = {
  sm: "px-4 py-2 text-[10px] font-mono uppercase tracking-widest",
  md: "px-6 py-3 text-[11px] font-mono uppercase tracking-widest",
  lg: "px-8 py-4 text-[12px] font-mono uppercase tracking-[0.2em]",
  xl: "px-10 py-5 text-[14px] font-mono uppercase tracking-[0.3em]",
};

export function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  disabled = false, 
  loading = false,
  onClick,
  type = "button",
  to,
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center gap-3 rounded-none transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer no-underline";
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`;

  const LoadingIcon = () => (
    <span className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {loading && <LoadingIcon />}
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <LoadingIcon />}
      {children}
    </button>
  );
}
