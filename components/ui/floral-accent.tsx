export function FloralAccent({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M60 180 C40 150 20 120 25 90 C30 60 50 40 60 20 C70 40 90 60 95 90 C100 120 80 150 60 180Z"
        fill="white"
        stroke="#E8D4A8"
        strokeWidth="0.8"
        opacity="0.9"
      />
      <circle cx="60" cy="75" r="18" fill="#FAFAFA" stroke="#D4AF37" strokeWidth="0.6" />
      <circle cx="52" cy="70" r="8" fill="white" opacity="0.7" />
      <circle cx="68" cy="72" r="7" fill="white" opacity="0.6" />
      <path
        d="M30 130 Q20 110 35 100 Q45 115 30 130Z"
        fill="#E8EDE6"
        stroke="#C9A962"
        strokeWidth="0.5"
        opacity="0.8"
      />
      <path
        d="M90 125 Q100 105 85 95 Q75 110 90 125Z"
        fill="#E8EDE6"
        stroke="#C9A962"
        strokeWidth="0.5"
        opacity="0.8"
      />
      <path
        d="M15 160 Q5 140 20 130"
        stroke="#C9A962"
        strokeWidth="0.8"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M105 155 Q115 135 100 125"
        stroke="#C9A962"
        strokeWidth="0.8"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}
