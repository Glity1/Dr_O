import React from 'react';

const WhiteBox = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  shadow = 'shadow',
  border = 'border-2 border-yellow-400',
  hover = false
}) => {
  const baseClasses = `bg-white rounded-lg ${padding} ${shadow} ${border}`;
  const hoverClasses = hover ? 'hover:shadow-md transition-shadow' : '';
  const finalClasses = `${baseClasses} ${hoverClasses} ${className}`.trim();

  return (
    <div className={finalClasses}>
      {children}
    </div>
  );
};

export default WhiteBox;









