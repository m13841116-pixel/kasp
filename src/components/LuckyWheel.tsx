import React, { useState, useEffect } from 'react';
import { Gift, X, Sparkles, Copy, Check, ArrowLeft, RefreshCw, Clock, Tag, Trophy } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface LuckyWheelProps {
  onRequestCustomApp?: () => void;
}

interface PrizeItem {
  id: number;
  shortLabel: string;
  fullTitle: string;
  pct: number;
  codePrefix: string;
  color: string;
  textColor: string;
  weight?: number;
}

export const LuckyWheel: React.FC<LuckyWheelProps> = ({ onRequestCustomApp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultPrize, setResultPrize] = useState<PrizeItem | null>(null);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  
  // 24-hour lock mechanism
  const [lastSpinTime, setLastSpinTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  const defaultPrizes: PrizeItem[] = [
    { id: 0, shortLabel: '۱۰٪ تخفیف', fullTitle: '۱۰٪ تخفیف ویژه توسعه نرم‌افزار', pct: 10, codePrefix: 'OFF10', color: '#ec4899', textColor: '#ffffff', weight: 20 },
    { id: 1, shortLabel: '۲۰٪ تخفیف', fullTitle: '۲۰٪ تخفیف ویژه سفارش پروژه', pct: 20, codePrefix: 'OFF20', color: '#8b5cf6', textColor: '#ffffff', weight: 20 },
    { id: 2, shortLabel: '۳۰٪ تخفیف', fullTitle: '۳۰٪ تخفیف طلایی طراحی نرم‌افزار', pct: 30, codePrefix: 'OFF30', color: '#3b82f6', textColor: '#ffffff', weight: 15 },
    { id: 3, shortLabel: '۸۰٪ تخفیف', fullTitle: '🔥 ۸۰٪ تخفیف استثنایی ویژه شروع کار', pct: 80, codePrefix: 'OFF80', color: '#f43f5e', textColor: '#ffffff', weight: 5 },
    { id: 4, shortLabel: 'دامنه .ir', fullTitle: '🌐 ۱ سال دامنه .ir رایگان', pct: 100, codePrefix: 'FREE-IR', color: '#06b6d4', textColor: '#ffffff', weight: 15 },
    { id: 5, shortLabel: 'اکانت زوپیت', fullTitle: '🛍️ اکانت فروشگاهی رایگان زوپیت (Zoopit.ir)', pct: 100, codePrefix: 'ZOOPIT', color: '#10b981', textColor: '#ffffff', weight: 10 },
    { id: 6, shortLabel: 'لوگو رایگان', fullTitle: '🎨 طراحی لوگو اختصاصی رایگان', pct: 100, codePrefix: 'FREE-LOGO', color: '#f59e0b', textColor: '#ffffff', weight: 10 },
    { id: 7, shortLabel: 'پشتیبانی', fullTitle: '🛡️ ۲ ماه پشتیبانی و نگهداری رایگان', pct: 100, codePrefix: 'FREE-SUP', color: '#6366f1', textColor: '#ffffff', weight: 5 },
    { id: 8, shortLabel: '۲M نقدی', fullTitle: '💵 ۲,۰۰۰,۰۰۰ تومان جایزه نقدی', pct: 100, codePrefix: 'CASH2M', color: '#eab308', textColor: '#ffffff', weight: 0 },
  ];

  const [prizes, setPrizes] = useState<PrizeItem[]>(defaultPrizes);

  useEffect(() => {
    // Fetch server prize settings
    apiFetch('/api/wheel-settings')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.prizesConfig) && data.prizesConfig.length > 0) {
          setPrizes(data.prizesConfig);
        }
      })
      .catch(err => console.error('Failed to load wheel settings:', err));
  }, [isOpen]);

  useEffect(() => {
    const savedTime = localStorage.getItem('kasp_wheel_last_spin');
    if (savedTime) {
      const timeNum = parseInt(savedTime, 10);
      if (!isNaN(timeNum)) {
        setLastSpinTime(timeNum);
      }
    }
  }, []);

  // Countdown timer for 24 hours lock
  useEffect(() => {
    if (!lastSpinTime) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const nextSpinAvailable = lastSpinTime + (24 * 60 * 60 * 1000);
      const diff = nextSpinAvailable - now;

      if (diff <= 0) {
        setTimeLeft(null);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastSpinTime]);

  const canSpin = !timeLeft;

  const spin = async () => {
    if (isSpinning || !canSpin) return;

    setIsSpinning(true);
    setResultPrize(null);
    setDiscountCode(null);
    setCopied(false);

    // Calculate weighted selection
    const totalWeight = prizes.reduce((acc, p) => acc + (p.weight ?? 10), 0);
    let prizeIndex = 0;
    if (totalWeight > 0) {
      let randomNum = Math.random() * totalWeight;
      for (let i = 0; i < prizes.length; i++) {
        const w = prizes[i].weight ?? 10;
        if (randomNum < w) {
          prizeIndex = i;
          break;
        }
        randomNum -= w;
      }
    } else {
      prizeIndex = Math.floor(Math.random() * prizes.length);
    }

    const chosenPrize = prizes[prizeIndex];

    // Calculate angles based on number of prizes
    const sliceAngle = 360 / prizes.length;
    const midAngle = prizeIndex * sliceAngle + (sliceAngle / 2);
    const extraSpins = 6 * 360;
    const targetRotation = (270 - midAngle) + extraSpins;

    setRotation(targetRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      setResultPrize(chosenPrize);

      // Unique code generation
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const generatedCode = `KASP-${chosenPrize.codePrefix}-${randomPart}`;
      setDiscountCode(generatedCode);

      // Save code on backend
      try {
        await apiFetch('/api/wheel/save-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: generatedCode,
            prize: chosenPrize.fullTitle,
            discountPercent: chosenPrize.pct
          })
        });
      } catch (err) {
        console.error('Error saving code:', err);
      }

      const now = Date.now();
      setLastSpinTime(now);
      localStorage.setItem('kasp_wheel_last_spin', now.toString());
    }, 5200);
  };

  const copyCodeToClipboard = () => {
    if (!discountCode) return;
    navigator.clipboard.writeText(discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyToOrder = () => {
    if (discountCode) {
      navigator.clipboard.writeText(discountCode);
      localStorage.setItem('kasp_active_discount', discountCode);
    }
    setIsOpen(false);
    if (onRequestCustomApp) {
      onRequestCustomApp();
    } else {
      const customAppEl = document.getElementById('custom-app');
      if (customAppEl) customAppEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Floating Always Visible Gift Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        <button
          onClick={() => setIsOpen(true)}
          className="relative group bg-gradient-to-r from-purple-600 via-rose-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 border-2 border-white/20 animate-pulse"
          title="گردونه شانس و هدیه‌های روزانه KASP"
        >
          <Gift className="w-7 h-7 group-hover:rotate-12 transition-transform" />
          
          {canSpin && (
            <span className="absolute -top-2 -left-2 bg-amber-400 text-slate-950 font-black text-[11px] px-2 py-0.5 rounded-full border border-slate-900 shadow-md">
              ۱ شانس
            </span>
          )}

          <div className="absolute -top-12 right-0 bg-slate-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-black shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 pointer-events-none">
            🎁 گردونه شانس روزانه (تخفیف تا ۸۰٪، دامنه & اکانت زوپیت)
          </div>
        </button>
      </div>

      {/* Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" 
            onClick={() => !isSpinning && setIsOpen(false)}
          />

          <div className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl max-w-lg w-full relative z-10 overflow-hidden border border-slate-800 animate-fadeIn p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
            <button 
              onClick={() => setIsOpen(false)}
              disabled={isSpinning}
              className="absolute top-5 left-5 p-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50 z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 text-rose-400 border border-rose-500/30">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white">گردونه شانس KASP.ir</h3>
              <p className="text-slate-400 text-xs max-w-xs mx-auto">
                هر ۲۴ ساعت ۱ شانس رایگان برای دریافت کد جایزه اختصاصی (تخفیف تا ۸۰٪، دامنه .ir یا اکانت فروشگاهی زوپیت)
              </p>

              {/* Wheel graphic */}
              {!resultPrize ? (
                <div className="py-2">
                  <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto my-2">
                    {/* Top Pointer Needle */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_4px_10px_rgba(245,158,11,0.6)]">
                      <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
                        <path d="M14 36L2 6C0.5 3.5 2.2 0 5.2 0H22.8C25.8 0 27.5 3.5 26 6L14 36Z" fill="url(#pointer-grad)" />
                        <defs>
                          <linearGradient id="pointer-grad" x1="14" y1="0" x2="14" y2="36" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FCD34D" />
                            <stop offset="1" stopColor="#F59E0B" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* SVG Wheel Canvas */}
                    <div className="w-full h-full rounded-full border-8 border-slate-800 shadow-[0_0_50px_rgba(139,92,246,0.3)] bg-slate-950 p-1 relative">
                      <svg 
                        viewBox="0 0 300 300" 
                        className="w-full h-full rounded-full overflow-hidden transition-transform ease-out"
                        style={{ 
                          transform: `rotate(${rotation}deg)`,
                          transitionDuration: '5.2s',
                          transitionTimingFunction: 'cubic-bezier(0.15, 0.85, 0.15, 1)'
                        }}
                      >
                        {prizes.map((prize, idx) => {
                          const sliceAngle = 360 / prizes.length;
                          const startAngleDeg = idx * sliceAngle;
                          const endAngleDeg = (idx + 1) * sliceAngle;
                          const startRad = (startAngleDeg * Math.PI) / 180;
                          const endRad = (endAngleDeg * Math.PI) / 180;
                          
                          const x1 = 150 + 140 * Math.cos(startRad);
                          const y1 = 150 + 140 * Math.sin(startRad);
                          const x2 = 150 + 140 * Math.cos(endRad);
                          const y2 = 150 + 140 * Math.sin(endRad);

                          const pathData = `M 150 150 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 140 140 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

                          // Text position
                          const midAngleDeg = idx * sliceAngle + (sliceAngle / 2);
                          const midRad = (midAngleDeg * Math.PI) / 180;
                          const textR = 92;
                          const tx = 150 + textR * Math.cos(midRad);
                          const ty = 150 + textR * Math.sin(midRad);

                          // Text angle orientation
                          let textRot = midAngleDeg;
                          if (midAngleDeg > 90 && midAngleDeg < 270) {
                            textRot += 180;
                          }

                          return (
                            <g key={idx}>
                              <path 
                                d={pathData} 
                                fill={prize.color} 
                                stroke="#0f172a" 
                                strokeWidth="2.5" 
                              />
                              <text
                                x={tx}
                                y={ty}
                                fill={prize.textColor}
                                fontSize="11"
                                fontWeight="900"
                                textAnchor="middle"
                                dominantBaseline="central"
                                transform={`rotate(${textRot}, ${tx}, ${ty})`}
                                className="select-none pointer-events-none filter drop-shadow"
                              >
                                {prize.shortLabel}
                              </text>
                            </g>
                          );
                        })}

                        {/* Metallic Center Hub */}
                        <circle cx="150" cy="150" r="32" fill="#0f172a" stroke="#f59e0b" strokeWidth="4" />
                        <circle cx="150" cy="150" r="22" fill="url(#hub-grad)" />
                        <defs>
                          <linearGradient id="hub-grad" x1="128" y1="128" x2="172" y2="172" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#a855f7" />
                            <stop offset="1" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                        <text x="150" y="151" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" dominantBaseline="central">
                          KASP
                        </text>
                      </svg>
                    </div>
                  </div>

                  {/* Prizes Legend Grid */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <p className="text-[11px] font-bold text-slate-400 mb-2.5 flex items-center justify-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>جوایز موجود روی گردونه:</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-right">
                      {prizes.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
                          <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: p.color }} />
                          <span className="text-[11px] font-bold text-slate-300 truncate">{p.fullTitle}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Result Screen */
                <div className="py-6 space-y-5 animate-fadeIn">
                  <div className="inline-flex p-4 rounded-3xl bg-amber-400/10 border border-amber-400/20 text-amber-400 text-5xl">
                    🎉
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-400">تبریک! شما برنده جایزه زیر شدید:</h4>
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400 mt-2 leading-relaxed">
                      {resultPrize.fullTitle}
                    </div>
                  </div>

                  {discountCode && (
                    <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-2.5">
                      <p className="text-xs font-bold text-slate-400">کد جایزه اختصاصی شما (یک‌بارمصرف):</p>
                      <div className="flex items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-purple-500/30">
                        <span className="font-mono text-sm font-black text-purple-300 tracking-wider dir-ltr select-all">
                          {discountCode}
                        </span>
                        <button
                          onClick={copyCodeToClipboard}
                          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>کپی شد!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>کپی کد</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-amber-400 font-medium">
                        ⚠️ این کد فقط ۱ بار در ثبت سفارش پروژه قابل استفاده است.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleApplyToOrder}
                    className="w-full py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <span>اعمال جایزه و رفتن به فرم سفارش</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Action Buttons & 24-Hour Timer Status */}
              {!resultPrize && (
                <div className="space-y-3 pt-3">
                  {canSpin ? (
                    <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5 bg-emerald-500/10 py-2 px-3 rounded-xl border border-emerald-500/20">
                      <Sparkles className="w-4 h-4" />
                      <span>شانس ۲۴ ساعته امروز شما فعال است!</span>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5 bg-amber-500/10 py-2.5 px-3 rounded-xl border border-amber-500/20">
                      <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                      <span>
                        شانس بعدی شما در:{' '}
                        <strong className="font-mono font-bold text-sm text-amber-300 dir-ltr inline-block">
                          {String(timeLeft?.hours).padStart(2, '0')}:{String(timeLeft?.minutes).padStart(2, '0')}:{String(timeLeft?.seconds).padStart(2, '0')}
                        </strong>
                      </span>
                    </div>
                  )}

                  <button
                    onClick={spin}
                    disabled={isSpinning || !canSpin}
                    className="w-full py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-purple-600 via-rose-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {isSpinning ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>در حال چرخش گردونه...</span>
                      </>
                    ) : canSpin ? (
                      <span>بچرخان و جایزه بگیر!</span>
                    ) : (
                      <span>فرصت امروز شما استفاده شده است</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
