const CedarTree = ({ className = "", size = 48 }: { className?: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Cedar tree - Lebanese flag style */}
    <path
      d="M50 5 L42 22 L35 18 L40 28 L30 24 L37 34 L25 30 L34 40 L20 36 L32 46 L18 44 L30 52 L46 48 L46 95 L54 95 L54 48 L70 52 L82 44 L68 46 L80 36 L66 40 L75 30 L63 34 L70 24 L60 28 L65 18 L58 22 Z"
      fill="currentColor"
    />
    {/* Trunk */}
    <rect x="46" y="90" width="8" height="25" fill="currentColor" opacity="0.7" />
  </svg>
);

export default CedarTree;
