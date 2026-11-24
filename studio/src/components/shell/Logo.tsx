export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="lm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a99dff" />
          <stop offset="1" stopColor="#5ee1ff" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="#11131a" stroke="url(#lm)" strokeOpacity="0.5" />
      <path d="M10 8v16h12" fill="none" stroke="url(#lm)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="21.5" cy="11.5" r="3" fill="url(#lm)" />
    </svg>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-[17px] font-bold tracking-tight text-white">Lumora</span>
    </div>
  );
}
