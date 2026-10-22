import React from 'react';
import { AvatarConfig } from '../../types/game';

interface AvatarRendererProps {
  avatar: AvatarConfig;
  size?: number;
  className?: string;
}

export const AVATAR_COLORS = [
  '#FFD13B', // Skribbl yellow
  '#38BDF8', // Cyan blue
  '#4ADE80', // Mint green
  '#F472B6', // Bubblegum pink
  '#A78BFA', // Lavender purple
  '#FB923C', // Tangerine orange
  '#F87171', // Coral red
  '#2DD4BF', // Teal
  '#FBBF24', // Warm amber
  '#E2E8F0', // Ghost white
];

export const TOTAL_EYES = 8;
export const TOTAL_MOUTHS = 8;

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  avatar,
  size = 64,
  className = ''
}) => {
  const { color = '#FFD13B', eyes = 0, mouth = 0 } = avatar || {};

  // Render eye expressions
  const renderEyes = () => {
    switch (eyes % TOTAL_EYES) {
      case 1: // Winking
        return (
          <>
            <circle cx="36" cy="42" r="6" fill="#1e293b" />
            <circle cx="38" cy="40" r="2" fill="#ffffff" />
            <path d="M 58 43 Q 66 38 72 45" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </>
        );
      case 2: // Happy squint / arcs
        return (
          <>
            <path d="M 28 44 Q 36 34 44 44" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 56 44 Q 64 34 72 44" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </>
        );
      case 3: // Cool sunglasses
        return (
          <>
            <rect x="24" y="36" width="22" height="15" rx="5" fill="#0f172a" />
            <rect x="54" y="36" width="22" height="15" rx="5" fill="#0f172a" />
            <line x1="44" y1="41" x2="56" y2="41" stroke="#0f172a" strokeWidth="4" />
            <line x1="28" y1="40" x2="40" y2="46" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <line x1="58" y1="40" x2="70" y2="46" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          </>
        );
      case 4: // Googly wide eyes
        return (
          <>
            <circle cx="35" cy="40" r="9" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="37" cy="41" r="4.5" fill="#1e293b" />
            <circle cx="65" cy="40" r="11" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="63" cy="41" r="5" fill="#1e293b" />
          </>
        );
      case 5: // Dizzy swirls / crosses
        return (
          <>
            <line x1="31" y1="36" x2="41" y2="46" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <line x1="41" y1="36" x2="31" y2="46" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <line x1="59" y1="36" x2="69" y2="46" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            <line x1="69" y1="36" x2="59" y2="46" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
          </>
        );
      case 6: // Cute kawaii sparkle
        return (
          <>
            <circle cx="36" cy="42" r="7" fill="#1e293b" />
            <circle cx="38" cy="39" r="2.5" fill="#ffffff" />
            <circle cx="34" cy="44" r="1.5" fill="#ffffff" />
            <circle cx="64" cy="42" r="7" fill="#1e293b" />
            <circle cx="66" cy="39" r="2.5" fill="#ffffff" />
            <circle cx="62" cy="44" r="1.5" fill="#ffffff" />
          </>
        );
      case 7: // Sleepy / bored flat lines
        return (
          <>
            <line x1="28" y1="42" x2="44" y2="42" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="56" y1="42" x2="72" y2="42" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
          </>
        );
      case 0:
      default: // Normal cute round eyes
        return (
          <>
            <circle cx="36" cy="42" r="6" fill="#1e293b" />
            <circle cx="38" cy="40" r="2" fill="#ffffff" />
            <circle cx="64" cy="42" r="6" fill="#1e293b" />
            <circle cx="66" cy="40" r="2" fill="#ffffff" />
          </>
        );
    }
  };

  // Render mouth expressions
  const renderMouth = () => {
    switch (mouth % TOTAL_MOUTHS) {
      case 1: // Open wide grin
        return (
          <path
            d="M 33 60 Q 50 78 67 60 Z"
            fill="#be123c"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        );
      case 2: // Tongue sticking out
        return (
          <>
            <path d="M 34 60 Q 50 72 66 60" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 45 64 Q 50 78 55 64 Z" fill="#f43f5e" stroke="#1e293b" strokeWidth="2.5" />
          </>
        );
      case 3: // Cute small circle 'O' mouth
        return (
          <circle cx="50" cy="65" r="7" fill="#be123c" stroke="#1e293b" strokeWidth="3" />
        );
      case 4: // Smirk sideways
        return (
          <path d="M 36 65 Q 52 66 66 56" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
        );
      case 5: // Cool mustache!
        return (
          <>
            <path
              d="M 50 63 C 45 56, 32 58, 28 65 C 36 67, 44 65, 50 63 C 56 65, 64 67, 72 65 C 68 58, 55 56, 50 63 Z"
              fill="#1e293b"
            />
          </>
        );
      case 6: // Surprised flat drop
        return (
          <ellipse cx="50" cy="66" rx="8" ry="11" fill="#1e293b" />
        );
      case 7: // Meh / neutral line
        return (
          <line x1="36" y1="65" x2="64" y2="65" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
        );
      case 0:
      default: // Normal sweet smile
        return (
          <path
            d="M 34 60 Q 50 76 66 60"
            stroke="#1e293b"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
        );
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-md"
      >
        {/* Head Base */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill={color}
          stroke="#1e293b"
          strokeWidth="4"
        />
        {/* Soft highlight reflection on top left */}
        <ellipse
          cx="38"
          cy="26"
          rx="18"
          ry="7"
          fill="#ffffff"
          opacity="0.35"
          transform="rotate(-25 38 26)"
        />
        {/* Blush cheeks */}
        <circle cx="26" cy="54" r="5" fill="#f43f5e" opacity="0.35" />
        <circle cx="74" cy="54" r="5" fill="#f43f5e" opacity="0.35" />

        {/* Eyes & Mouth components */}
        {renderEyes()}
        {renderMouth()}
      </svg>
    </div>
  );
};
