import React from "react";

interface IconProps {
  name: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export default function Icon({
  name,
  size = 20,
  className = "",
  style,
  onClick,
}: IconProps) {
  const pixelSize = typeof size === "number" ? `${size}px` : size;
  return (
    <span
      className={`material-symbols-outlined select-none inline-flex items-center justify-center ${className}`}
      style={{ fontSize: pixelSize, width: pixelSize, height: pixelSize, ...style }}
      onClick={onClick}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
