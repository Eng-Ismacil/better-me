import React from "react";

interface IconProps {
  name: string;
  size?: number | string;
  className?: string;
}

export default function Icon({ name, size = 20, className = "" }: IconProps) {
  const pixelSize = typeof size === "number" ? `${size}px` : size;
  return (
    <span
      className={`material-symbols-outlined select-none inline-flex items-center justify-center ${className}`}
      style={{ fontSize: pixelSize, width: pixelSize, height: pixelSize }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
