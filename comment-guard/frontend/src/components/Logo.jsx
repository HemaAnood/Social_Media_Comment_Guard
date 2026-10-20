export default function Logo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ksGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6C5CE7" />
          <stop offset="100%" stopColor="#FF7AB6" />
        </linearGradient>
      </defs>
      <path
        d="M50 5 L90 20 V48 C90 72 73 90 50 97 C27 90 10 72 10 48 V20 Z"
        fill="url(#ksGrad)"
      />
      <path
        d="M50 30 C46 22 34 22 30 32 C27 40 33 48 50 62 C67 48 73 40 70 32 C66 22 54 22 50 30 Z"
        fill="white"
      />
    </svg>
  );
}