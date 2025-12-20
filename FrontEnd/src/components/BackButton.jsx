import React from 'react';
import { useNavigate } from 'react-router-dom';

export const BackButton = ({ to = '/', label = '← Retour', className = '' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200 ${className}`}
    >
      {label}
    </button>
  );
};


