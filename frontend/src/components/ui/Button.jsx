import React from 'react';
import { Link } from 'react-router-dom';

const variants = {
  primary: "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5",
  secondary: "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-200 hover:text-blue-700 hover:bg-blue-50/50 shadow-sm hover:-translate-y-0.5",
  outline: "bg-transparent border border-gray-200 text-gray-600 hover:bg-gray-50",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-50",
  danger: "bg-red-50 text-red-600 hover:bg-red-100",
};

const sizes = {
  sm: "px-4 py-2 text-xs font-bold",
  md: "px-6 py-3 text-sm font-bold",
  lg: "px-8 py-4 text-base font-bold",
  xl: "px-10 py-5 text-lg font-extrabold",
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
  const baseClasses = "flex items-center justify-center gap-2 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer no-underline";
  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`;

  if (to && !disabled) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {loading && (
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        )}
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
      {loading && (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

