import { useEffect, useState } from "react";
import logoImage from "@/imports/footwearempirelogowhite.png"; 

export default function LoadingScreen() {
  const [hiding, setHiding] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden"; // lock scroll while loading
    const t1 = setTimeout(() => setHiding(true), 2600);   // start fade-out
    const t2 = setTimeout(() => {                          // unmount + unlock
      setGone(true);
      document.body.style.overflow = "";
    }, 3400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-secondary transition-all duration-700 ease-out ${
        hiding ? "opacity-0 scale-[1.04] pointer-events-none" : "opacity-100"
      }`}
    >
      {/* soft vignette for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.07) 0%, rgba(0,0,0,0.3) 100%)" }}
      />

      {/* logo: pops in, emerald shine sweeps left → right */}
      <div
        className="relative overflow-hidden px-8 py-4"
        style={{ animation: "logoPop 0.9s cubic-bezier(0.2, 1.4, 0.4, 1) both" }}
      >
        <img
          src={logoImage}
          alt="Footwear Empire"
          className="h-24 md:h-32 w-auto object-contain [filter:brightness(0)_invert(1)] drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)]"
        />
      </div>

      {/* tagline */}
      <p
        className="mt-5 px-6 text-center text-[10px] md:text-xs font-semibold tracking-[0.35em] uppercase text-emerald-100/70"
        style={{ animation: "taglineUp 0.8s ease 1.4s both" }}
      >
        Where Your Feet Rule Like Royalty
      </p>
    </div>
  );
}