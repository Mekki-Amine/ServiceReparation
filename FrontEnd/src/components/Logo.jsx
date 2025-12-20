import React from 'react';
import logoImage from '../assets/logo.png';

export const Logo = ({ className = "w-28 h-28" }) => {
  return (
    <img 
      src={logoImage} 
      alt="Fixer Logo" 
      className={className}
      style={{ 
        objectFit: 'contain',
        backgroundColor: 'transparent'
      }}
    />
  );
};
