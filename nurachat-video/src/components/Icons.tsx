import React from 'react';

// Minimal 24px line icons, drawn for this film (no third-party marks).
export type IconName =
  | 'message'
  | 'chat'
  | 'sparkle'
  | 'reply'
  | 'filter'
  | 'repeat'
  | 'calendar'
  | 'user'
  | 'bolt'
  | 'check'
  | 'clock'
  | 'link';

const PATHS: Record<IconName, React.ReactNode> = {
  message: (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
    </>
  ),
  chat: (
    <>
      <path d="M12 3.5a8.5 8.5 0 0 0-7.4 12.7L3.5 20.5l4.4-1.1A8.5 8.5 0 1 0 12 3.5z" />
      <path d="M8.5 10.5h7M8.5 13.5h4.5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" />
    </>
  ),
  reply: (
    <>
      <path d="M10 8V4L3 11l7 7v-4c5 0 8 1.5 11 5-1-6-4-11-11-11z" />
    </>
  ),
  filter: (
    <>
      <path d="M3 5h18l-7 8v6l-4 2v-8z" />
    </>
  ),
  repeat: (
    <>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a3 3 0 0 1 3-3h15" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a3 3 0 0 1-3 3H3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8.5 15l2.2 2.2 4.8-4.7" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.2-4 4.2-6 8-6s6.8 2 8 6" />
    </>
  ),
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </>
  ),
};

export const Icon: React.FC<{name: IconName; size?: number; color?: string; stroke?: number}> = ({
  name,
  size = 32,
  color = 'currentColor',
  stroke = 1.8,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {PATHS[name]}
  </svg>
);
