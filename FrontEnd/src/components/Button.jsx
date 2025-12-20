import React from "react";

export const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) => {
  const baseStyles =
    "px-6 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary:
      "bg-yellow-500 hover:bg-yellow-600 text-black focus:ring-yellow-500 shadow-md hover:shadow-lg",
    secondary:
      "bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-500 shadow-md hover:shadow-lg",
    outline:
      "bg-transparent border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black focus:ring-yellow-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};


