import React from 'react';

interface KaspLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const KaspLogo: React.FC<KaspLogoProps> = ({
  className = '',
  iconOnly = false,
  size = 'md',
  showTagline = false,
}) => {
  // Dimensions for icon size
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Premium Vector SVG Logo Mark */}
      <div className={`${iconSizes[size]} shrink-0 flex items-center justify-center relative group`}>
        {/* Glow halo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-cyan-500 rounded-2xl opacity-40 blur-md group-hover:opacity-75 transition-opacity duration-300" />
        
        {/* Vector SVG Badge */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full relative z-10 drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="kaspGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <linearGradient id="kaspGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
          
          {/* Outer Rounded Container */}
          <rect x="5" y="5" width="90" height="90" rx="26" fill="#0B132B" stroke="url(#kaspGrad1)" strokeWidth="3" />
          
          {/* Vertical Stem of K */}
          <rect x="25" y="24" width="13" height="52" rx="6.5" fill="url(#kaspGrad1)" />
          
          {/* Upper Diagonal Arm of K */}
          <path d="M38 48 L65 25 C67.5 23 72 25 72 29 L72 34 C72 36.5 70.5 38.5 68.5 40 L49 55 Z" fill="url(#kaspGrad1)" />
          
          {/* Lower Diagonal Arm of K */}
          <path d="M45 49 L68.5 70 C70.5 71.5 72 73.5 72 76 L72 80 C72 83.5 67.5 85 65 83 L38 58 Z" fill="url(#kaspGrad2)" />
          
          {/* Neural Node Glow Dot */}
          <circle cx="71" cy="29" r="4.5" fill="#38BDF8" className="animate-pulse" />
          <circle cx="71" cy="78" r="4.5" fill="#F43F5E" className="animate-pulse" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className={`font-black tracking-widest text-slate-900 dark:text-white uppercase ${textSizes[size]}`}>
              KASP
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 shadow-sm">
              کاسپ
            </span>
          </div>
          {showTagline && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              kasp.ir • پلتفرم هوش مصنوعی و نرم‌افزار
            </span>
          )}
        </div>
      )}
    </div>
  );
};
