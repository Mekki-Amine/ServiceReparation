import React from "react";

export const Card = ({
  children,
  className = "",
  hover = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 ${
        hover ? "hover:shadow-xl hover:scale-105" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};


