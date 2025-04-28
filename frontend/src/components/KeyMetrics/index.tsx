import React from 'react';
import './styles.css';

interface MetricItemProps {
  icon: string;
  label: string;
  value: number;
  color?: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ icon, label, value, color }) => {
  return (
    <div className="metric-item">
      <div className="metric-icon" style={{ color }}>
        {icon}
      </div>
      <div className="metric-details">
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
      </div>
    </div>
  );
};

const KeyMetrics: React.FC = () => {
  return (
    <div className="metrics-container">
      <h2>Key Metrics</h2>
      <div className="metrics-list">
        <MetricItem 
          icon="⚠️" 
          label="Overdue Tasks" 
          value={3} 
          color="#f44336"
        />
        
        <MetricItem 
          icon="🔥" 
          label="High Priority Today" 
          value={2} 
          color="#ff9800"
        />
        
        <MetricItem 
          icon="👤" 
          label="Pending Follow-ups" 
          value={1} 
          color="#2196f3"
        />
        
        <MetricItem 
          icon="📅" 
          label="Meetings Today" 
          value={1} 
          color="#4caf50"
        />
        
        <MetricItem 
          icon="📊" 
          label="Active Projects" 
          value={4} 
          color="#9c27b0"
        />
      </div>
    </div>
  );
};

export default KeyMetrics; 