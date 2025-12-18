import React, { useState, useRef, useMemo } from 'react';
import { TeamMember } from '../types';

interface WheelProps {
  members: TeamMember[];
  onWinner: (member: TeamMember) => void;
  isSpinning: boolean;
  setIsSpinning: (val: boolean) => void;
}

// Generates distinct premium gradients
const getGradient = (index: number) => {
  const PRESETS = [
    { start: '#6366f1', end: '#8b5cf6' }, // Indigo -> Violet
    { start: '#dadb2c', end: '#fca5a5' }, // Lime -> Red (Unique)
    { start: '#ec4899', end: '#be185d' }, // Pink -> Pink Dark
    { start: '#3b82f6', end: '#2563eb' }, // Blue
    { start: '#f97316', end: '#ea580c' }, // Orange
    { start: '#10b981', end: '#059669' }, // Emerald
    { start: '#f43f5e', end: '#e11d48' }, // Rose
    { start: '#06b6d4', end: '#0891b2' }, // Cyan
  ];
  return PRESETS[index % PRESETS.length];
};

export const Wheel: React.FC<WheelProps> = ({ members, onWinner, isSpinning, setIsSpinning }) => {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const totalSlices = members.length;

  // -- SVG MATH HELPERS --
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  const slices = useMemo(() => {
    if (totalSlices === 0) return [];

    // If only 1 person, full circle
    if (totalSlices === 1) {
      return [{ path: 'M -1 0 A 1 1 0 1 1 1 0 A 1 1 0 1 1 -1 0', colorIdx: 0 }];
    }

    let cumulativePercent = 0;

    return members.map((_, i) => {
      const startPercent = cumulativePercent;
      const slicePercent = 1 / totalSlices;
      cumulativePercent += slicePercent;

      const [startX, startY] = getCoordinatesForPercent(startPercent);
      const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

      const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

      const pathData = [
        `M ${startX} ${startY}`, // Move to starting point on arc
        `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc to end point
        `L 0 0`, // Line to center
      ].join(' ');

      return { path: pathData, colorIdx: i };
    });
  }, [totalSlices, members]);


  // -- SOUNDS --
  // Use BASE_URL to ensure paths work correctly on GitHub Pages (/daily-ti-cyber/) and localhost (/)
  const baseUrl = import.meta.env.BASE_URL || '/';
  const spinSound = useRef(new Audio(`${baseUrl}spin.mp3`));
  const winSound = useRef(new Audio(`${baseUrl}win.mp3`));

  React.useEffect(() => {
    spinSound.current.volume = 0.5;
    winSound.current.volume = 0.6;
  }, []);

  const spin = () => {
    if (isSpinning || totalSlices === 0) return;

    setIsSpinning(true);

    // Play sound
    spinSound.current.currentTime = 0;
    spinSound.current.loop = true;
    spinSound.current.play().catch(() => { });

    // Add randomness + minimal spins
    const extraDegrees = 360 * 6 + Math.floor(Math.random() * 360);
    const newRotation = rotation + extraDegrees;

    setRotation(newRotation);

    // Start fade out 500ms before the end
    setTimeout(() => {
      const fadeInterval = setInterval(() => {
        if (spinSound.current.volume > 0.1) {
          spinSound.current.volume -= 0.1;
        } else {
          spinSound.current.volume = 0;
          clearInterval(fadeInterval);
        }
      }, 50);
    }, 3500);

    setTimeout(() => {
      setIsSpinning(false);

      spinSound.current.pause();
      spinSound.current.volume = 0.5; // Reset for next spin

      winSound.current.currentTime = 0;
      winSound.current.play().catch(() => { });

      const finalRotationMod = newRotation % 360;
      let winningAngle = (270 - finalRotationMod) % 360;
      if (winningAngle < 0) winningAngle += 360;

      const winningPercent = winningAngle / 360;
      const winnerIndex = Math.floor(winningPercent * totalSlices);

      onWinner(members[winnerIndex]);
    }, 4000);
  };

  if (totalSlices === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 w-80 bg-slate-50 rounded-full border-4 border-dashed border-slate-300 shadow-inner group transition-all hover:bg-slate-100">
        <div className="bg-slate-200 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
          <span className="text-2xl">🎉</span>
        </div>
        <p className="text-slate-400 font-bold px-8 text-center uppercase tracking-widest text-xs leading-relaxed">
          Daily Finalizada!
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center my-8">
      {/* Pointer (Premium 3D feel) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-40">
        <div className="relative w-12 h-16 drop-shadow-xl">
          {/* Main pointer body */}
          <div className="w-full h-full bg-rose-600 [clip-path:polygon(0%_0%,100%_0%,50%_100%)]"></div>
          {/* Shine highlight */}
          <div className="absolute top-0 inset-x-3 h-3 bg-white/30 rounded-full blur-[1px]"></div>
        </div>
      </div>

      {/* Main Wheel Container - Significantly Larger */}
      <div
        ref={wheelRef}
        className="relative w-[30rem] h-[30rem] md:w-[32rem] md:h-[32rem] rounded-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] bg-slate-800 ring-8 ring-slate-900/50"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)' : 'none'
        }}
      >
        {/* SVG Layer for Perfect Geometry */}
        <svg
          viewBox="-1 -1 2 2"
          className="w-full h-full transform rotate-0"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Define Gradients dynamically */}
            {members.map((_, i) => {
              const g = getGradient(i);
              return (
                <linearGradient key={`grad-${i}`} id={`slice-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={g.start} />
                  <stop offset="100%" stopColor={g.end} />
                </linearGradient>
              )
            })}
          </defs>

          {slices.map((slice, i) => (
            <g key={`poly-${i}`}>
              <path
                d={slice.path}
                fill={`url(#slice-grad-${slice.colorIdx})`}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="0.008"
              />
            </g>
          ))}
        </svg>

        {/* Glossy Overlay (Shine) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-10"></div>
        <div className="absolute inset-[6px] rounded-full border border-white/10 pointer-events-none z-10"></div>

        {/* Text Layer (HTML for clear rendering) */}
        {members.map((m, i) => {
          // Angle in degrees
          const degreesperSlice = 360 / totalSlices;
          const centerAngle = degreesperSlice * i + degreesperSlice / 2;

          return (
            <div
              key={`text-${m.id}`}
              className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 flex items-center justify-center p-0"
              style={{
                transform: `rotate(${centerAngle}deg)`
              }}
            >
              {/* Container pushed to edge: width 50% starts at center, ends at right edge. 
                  flex-row-reverse aligns items to the right (edge). 
              */}
              <div className="w-[50%] absolute right-0 flex items-center justify-end pr-12">
                <span
                  className="text-white font-black text-sm uppercase tracking-widest whitespace-nowrap drop-shadow-md origin-center"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  {m.name}
                </span>
              </div>
            </div>
          );
        })}

        {/* Center Cap - Scaled up */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-slate-900 rounded-full border-[6px] border-slate-700 shadow-2xl z-30 flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full border border-white/20 shadow-inner flex items-center justify-center">
            <span className="text-xl font-black text-white">TI</span>
          </div>
        </div>

      </div>

      <button
        onClick={spin}
        disabled={isSpinning}
        className={`mt-14 px-12 py-6 rounded-2xl font-black text-sm tracking-[0.25em] text-white transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-2xl uppercase w-full max-w-[280px] flex items-center justify-center gap-3 ${isSpinning ? 'bg-slate-700 cursor-not-allowed opacity-80 shadow-none' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/30'}`}
      >
        {isSpinning ? (
          <>
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce"></span>
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce delay-100"></span>
            <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce delay-200"></span>
          </>
        ) : (
          'Girar'
        )}
      </button>
    </div>
  );
};
