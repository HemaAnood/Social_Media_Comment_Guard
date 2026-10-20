import { useEffect, useState } from "react";
import Logo from "./Logo";

export default function Splash({ onDone }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1400);
    const doneTimer = setTimeout(() => onDone(), 1800);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #6C5CE7, #FF7AB6)",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.4s ease",
        zIndex: 999,
      }}
    >
      <div style={{ animation: "ks-pop 0.6s ease" }}>
        <Logo size={90} />
      </div>
      <h1 className="ks-heading" style={{ color: "white", fontSize: 32, marginTop: 16, letterSpacing: 0.5 }}>
        KindSphere
      </h1>
      <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 4 }}>
        Comment safely. Connect kindly.
      </p>
      <style>{`
        @keyframes ks-pop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}