import React, { ReactNode } from 'react';
import './styles.css';

interface WidgetWrapperProps {
  title: string;
  icon?: string;
  className?: string;
  children: ReactNode;
}

/**
 * A wrapper component for dashboard widgets that provides consistent styling
 * and scrollable content area
 */
const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
  title,
  icon,
  className = '',
  children
}) => {
  return (
    <div className={`widget-wrapper ${className}`}>
      <h2 className="widget-title">
        {icon && <span className="widget-icon">{icon}</span>}
        {title}
      </h2>
      
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

export default WidgetWrapper; 