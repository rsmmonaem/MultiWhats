import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textSize?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 32,
  className = "",
  showText = false,
  textSize = "text-base",
}) => {
  return (
    <div className={`inline-flex items-center space-x-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
      >
        <defs>
          {/* Main WhatsApp Emerald Gradient */}
          <linearGradient
            id="multiwhats-green-grad"
            x1="10"
            y1="10"
            x2="110"
            y2="110"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#2FE072" />
            <stop offset="60%" stopColor="#25D366" />
            <stop offset="100%" stopColor="#0EA85A" />
          </linearGradient>

          {/* Secondary Layer Gradient (Blue/Cyan - Account 2) */}
          <linearGradient
            id="multiwhats-blue-grad"
            x1="30"
            y1="10"
            x2="110"
            y2="90"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Tertiary Layer Gradient (Purple - Account 3) */}
          <linearGradient
            id="multiwhats-purple-grad"
            x1="50"
            y1="20"
            x2="110"
            y2="80"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>

          {/* Glass specular sheen */}
          <linearGradient
            id="multiwhats-gloss"
            x1="20"
            y1="15"
            x2="80"
            y2="75"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>

          {/* Shadow Filter */}
          <filter
            id="multiwhats-shadow"
            x="-10%"
            y="-10%"
            width="130%"
            height="130%"
            filterUnits="userSpaceOnUse"
          >
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="5"
              floodColor="#000000"
              floodOpacity="0.25"
            />
          </filter>
        </defs>

        {/* --- Background Account 3 (Purple layer - Multi-Account depth) --- */}
        <g opacity="0.85">
          <rect
            x="42"
            y="12"
            width="64"
            height="64"
            rx="22"
            fill="url(#multiwhats-purple-grad)"
          />
        </g>

        {/* --- Secondary Account 2 (Blue layer - Multi-Account depth) --- */}
        <g opacity="0.92">
          <rect
            x="26"
            y="24"
            width="72"
            height="72"
            rx="24"
            fill="url(#multiwhats-blue-grad)"
          />
        </g>

        {/* --- Primary WhatsApp Emerald Squircle Body --- */}
        <g filter="url(#multiwhats-shadow)">
          <rect
            x="12"
            y="32"
            width="76"
            height="76"
            rx="26"
            fill="url(#multiwhats-green-grad)"
          />
          {/* Subtle macOS Glass Reflection */}
          <rect
            x="12"
            y="32"
            width="76"
            height="38"
            rx="26"
            fill="url(#multiwhats-gloss)"
          />
        </g>

        {/* Speech Bubble Tail for WhatsApp identity */}
        <path
          d="M 22 96 L 14 108 C 13 109.5 15 111 16.5 110 L 32 104 Z"
          fill="#0EA85A"
        />

        {/* --- Foreground WhatsApp Phone Receiver Icon (White) --- */}
        <g transform="translate(24, 44)">
          <path
            d="M38.5 30.2c-.6-.3-3.6-1.8-4.2-2-.6-.2-1-.3-1.4.3-.4.6-1.7 2-2.1 2.5-.4.4-.8.5-1.4.2-.6-.3-2.6-.9-5-3-1.8-1.6-3.1-3.6-3.4-4.2-.4-.6 0-.9.3-1.2.3-.3.6-.7.9-1 .3-.3.4-.6.6-1 .2-.4.1-.7 0-1-.1-.3-1.4-3.4-1.9-4.6-.5-1.2-1.1-1-1.5-1-.4 0-.8 0-1.3 0-.5 0-1.2.2-1.8.8-.6.7-2.4 2.3-2.4 5.7 0 3.3 2.4 6.5 2.8 7 .4.4 4.8 7.3 11.6 10.2 1.6.7 2.9 1.1 3.9 1.4 1.6.5 3.1.4 4.3.2 1.3-.2 4-1.6 4.6-3.2.6-1.5.6-2.9.4-3.2-.2-.3-.6-.5-1.2-.8z"
            fill="#FFFFFF"
            className="drop-shadow-sm"
          />
        </g>

        {/* --- Multi-Account Badge Floating at Top-Right --- */}
        <g filter="url(#multiwhats-shadow)">
          <circle cx="86" cy="30" r="16" fill="#18181C" stroke="#25D366" strokeWidth="2.5" />
          {/* Multi-Account Dots representing 3 active accounts */}
          <circle cx="78" cy="30" r="3" fill="#25D366" />
          <circle cx="86" cy="30" r="3" fill="#38BDF8" />
          <circle cx="94" cy="30" r="3" fill="#A855F7" />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight leading-none ${textSize}`}>
            Multi<span className="text-emerald-500">Whats</span>
          </span>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase mt-0.5">
            Multi-Account Desktop
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
