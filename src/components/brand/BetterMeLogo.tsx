import React from "react";

interface BetterMeLogoProps {
  className?: string;
  variant?: "full" | "symbol" | "white";
  size?: number | string;
}

export default function BetterMeLogo({
  className = "",
  variant = "full",
  size,
}: BetterMeLogoProps) {
  if (variant === "symbol") {
    const s = size || 36;
    return (
      <svg
        width={s}
        height={s}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="BetterMe Symbol"
      >
        <circle cx="24" cy="11" r="5" fill="#007AFF" />
        <path
          d="M12 21C16 19 21 21 24 23C27 21 32 19 36 21C35 27 30 36 24 37C23 37 21 33 21 30C21 26 15 23 12 21Z"
          fill="#007AFF"
        />
        <path
          d="M23 27C23 27 28 25 33 28C35 34 31 39 25 39C24 39 24 32 23 27Z"
          fill="#22C55E"
        />
        <path
          d="M25 37C27 33 29 30 32 29"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const isWhite = variant === "white";
  const h = size || 36;

  return (
    <svg
      height={h}
      viewBox="0 0 160 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="BetterMe Logo"
    >
      <g id="betterme-symbol">
        <circle cx="24" cy="11" r="5" fill={isWhite ? "#FFFFFF" : "#007AFF"} />
        <path
          d="M12 21C16 19 21 21 24 23C27 21 32 19 36 21C35 27 30 36 24 37C23 37 21 33 21 30C21 26 15 23 12 21Z"
          fill={isWhite ? "#FFFFFF" : "#007AFF"}
        />
        <path
          d="M23 27C23 27 28 25 33 28C35 34 31 39 25 39C24 39 24 32 23 27Z"
          fill={isWhite ? "#FFFFFF" : "#22C55E"}
        />
        <path
          d="M25 37C27 33 29 30 32 29"
          stroke={isWhite ? "#007AFF" : "#FFFFFF"}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
      <text
        x="44"
        y="29"
        fontFamily="var(--font-headline), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="20"
        fontWeight="700"
        fill={isWhite ? "#FFFFFF" : "#101010"}
        letterSpacing="-0.4"
      >
        Better<tspan fill={isWhite ? "#FFFFFF" : "#007AFF"}>Me</tspan>
      </text>
    </svg>
  );
}
