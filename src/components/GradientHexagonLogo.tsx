import React from "react";

export function GradientHexagonLogo({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#00D4A8", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#7C3AED", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {/* Hexagone */}
      <polygon
        points="50,5 93.3,28.35 93.3,71.65 50,95 6.7,71.65 6.7,28.35"
        fill="url(#hexGradient)"
      />
      {/* Lettre V blanc */}
      <text
        x="50"
        y="72"
        fontSize="56"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        V
      </text>
    </svg>
  );
}
