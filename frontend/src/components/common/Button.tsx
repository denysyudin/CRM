import React from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...rest
}) => {
  const buttonClasses = [
    'app-button',
    `app-button-${variant}`,
    `app-button-${size}`,
    fullWidth ? 'app-button-full-width' : '',
    isLoading ? 'app-button-loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && <span className="app-button-spinner"></span>}
      {icon && !isLoading && <span className="app-button-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button; 