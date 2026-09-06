import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Crown, 
  BrainCircuit, 
  MessageSquare, 
  Loader2, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  Radio, 
  FastForward, 
  Rewind,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { VoiceBriefing, VoiceInteractionResponse } from '../../server/brain/types';

interface VoiceAdvisorCardProps {
  projectId?: string;
  businessGoal: string;
  businessName?: string;
  initialBriefing?: VoiceBriefing | null;
  onAttachBriefing?: (briefing: VoiceBriefing) => void;
}

export const VoiceAdvisorCard: React.FC<VoiceAdvisorCardProps> = ({
  projectId = 'default-project',
  businessGoal,
  businessName,
  initialBriefing,
  onAttachBriefing
}) => {
  const [briefing, setBriefing] = useState<VoiceBriefing | null>(initialBriefing || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSectionKey, setActiveSectionKey] = useState<string>('whatItIs');
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  // Conversational Voice Query State
  const [isListening, setIsListening] = useState(false);
  const [voiceQueryText, setVoiceQueryText] = useState('');
  const [isAnsweringVoice, setIsAnsweringVoice] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ sender: 'user' | 'advisor'; text: string; bullet?: string }>>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load existing briefing on mount
  useEffect(() => {
    if (!briefing && projectId) {
      fetchExistingBriefing();
    }
  }, [projectId]);

  const fetchExistingBriefing = async () => {
    try {
      const res = await fetch(`/api/brain/voice/briefing/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.briefing) {
          setBriefing(data.briefing);
          if (onAttachBriefing) onAttachBriefing(data.briefing);
        }
      }
    } catch (err) {
      console.warn('[VoiceAdvisorCard] Could not fetch existing briefing:', err);
    }
  };

  const handleGenerateBriefing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/brain/voice/briefing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'خطا در برقراری ارتباط با سرور تولید صدای مشاور');
      }

      const data = await res.json();
      if (data.briefing) {
        setBriefing(data.briefing);
        if (onAttachBriefing) onAttachBriefing(data.briefing);
        // Start playback automatically on first generation
        setTimeout(() => {
          handlePlay(data.briefing);
        }, 400);
      }
    } catch (err: any) {
      console.error('[VoiceAdvisorCard] Generate error:', err);
      setError(err.message || 'متاسفانه در تولید خلاصه صوتی خطایی رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  // Audio Playback Handling (Supports Base64 Audio & Web Speech API)
  const handlePlay = (targetBriefing: VoiceBriefing | null = briefing) => {
    if (!targetBriefing) return;

    if (targetBriefing.audioBase64) {
      // Direct Audio Element Playback
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(err => {
            console.warn('[VoiceAdvisorCard] HTML5 Audio play failed, falling back to Web Speech:', err);
            playWithWebSpeech(targetBriefing.fullTranscript);
          });
        }
      }
    } else {
      // Fallback to Web Speech API
      if (isPlaying) {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.pause();
          setIsPlaying(false);
        }
      } else {
        playWithWebSpeech(targetBriefing.fullTranscript);
      }
    }
  };

  const playWithWebSpeech = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      alert('مرورگر شما از قابلیت پخش گفتار پشتیبانی نمی‌کند.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'fa-IR';
    utterance.rate = playbackRate;
    utterance.pitch = 1.0;

    // Find a Persian or compatible voice
    const voices = window.speechSynthesis.getVoices();
    const faVoice = voices.find(v => v.lang.includes('fa') || v.lang.includes('ar') || v.name.includes('Persian'));
    if (faVoice) {
      utterance.voice = faVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTime(duration || 60);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    setIsPlaying(false);
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    } else if (briefing) {
      playWithWebSpeech(briefing.fullTranscript);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    if (synthRef.current && isPlaying) {
      handleRestart();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyTranscript = () => {
    if (!briefing) return;
    navigator.clipboard.writeText(briefing.fullTranscript);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  // Conversational Voice Query (STT & TTS architecture)
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('مرورگر شما از ورودی میکروفون صوتی مستقیم پشتیبانی نمی‌کند. می‌توانید سوال خود را تایپ نمایید.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fa-IR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceQueryText(transcript);
        handleSendVoiceQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Error starting recognition:', e);
      setIsListening(false);
    }
  };

  const handleSendVoiceQuery = async (queryText?: string) => {
    const textToSend = queryText || voiceQueryText;
    if (!textToSend.trim()) return;

    setIsAnsweringVoice(true);
    setVoiceQueryText('');
    
    // Add user message to history
    setConversationHistory(prev => [...prev, { sender: 'user', text: textToSend }]);

    try {
      const res = await fetch('/api/brain/voice/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          userSpeechText: textToSend,
          contextMode: 'strategic'
        })
      });

      if (!res.ok) throw new Error('خطا در دریافت پاسخ مشاور');
      const data = await res.json();
      const answer: VoiceInteractionResponse = data.response;

      setConversationHistory(prev => [
        ...prev, 
        { sender: 'advisor', text: answer.spokenResponse, bullet: answer.bulletSummary }
      ]);

      // Read answer aloud
      playWithWebSpeech(answer.spokenResponse);
    } catch (err: any) {
      console.error('Voice interaction error:', err);
      setConversationHistory(prev => [
        ...prev,
        { sender: 'advisor', text: 'متاسفانه در پردازش گفتگوی صوتی مشکلی پیش آمد. لطفاً دوباره تلاش فرمایید.' }
      ]);
    } finally {
      setIsAnsweringVoice(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl relative overflow-hidden space-y-6">
      
      {/* Background Neon Elements */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hidden HTML Audio Element for Base64 WAV */}
      {briefing?.audioBase64 && (
        <audio
          ref={audioRef}
          src={`data:${briefing.audioMimeType || 'audio/wav'};base64,${briefing.audioBase64}`}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      )}

      {/* HEADER: KASP VOICE ADVISOR BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Mic className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold">
                KASP Voice Advisor
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                مبتنی بر گراف BusinessState
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white mt-1">
              🎙️ از مشاور ارشد KASP بشنو
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              خلاصه اجرایی صوتی و ۶ دیدگاه کلیدی مشاور اختصاصی پروژه «{businessName || businessGoal}»
            </p>
          </div>
        </div>

        {/* Action Button: Generate or Listen */}
        <div className="flex items-center gap-3 shrink-0">
          {!briefing ? (
            <button
              onClick={handleGenerateBriefing}
              disabled={loading}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>در حال ضبط و پردازش خلاصه اجرایی صوتی...</span>
                </>
              ) : (
                <>
                  <Radio className="w-5 h-5 text-amber-300" />
                  <span>تولید و پخش صدای مشاور KASP</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePlay(briefing)}
                className={`px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-[1.03] active:scale-95 ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                    : 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white shadow-indigo-600/30'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>توقف پخش</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current text-white" />
                    <span>پخش صدای مشاور KASP</span>
                  </>
                )}
              </button>

              <button
                onClick={handleGenerateBriefing}
                disabled={loading}
                title="تولید مجدد پادکست اختصاصی مشاور"
                className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
              >
                <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ACTIVE AUDIO PLAYER CONTROLLER */}
      {briefing && (
        <div className="bg-slate-950/70 border border-indigo-900/40 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePlay(briefing)}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 hover:scale-105 active:scale-95 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 transition-all shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {briefing.headline}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-mono text-indigo-400">
                    {formatTime(currentTime)} / {formatTime(duration || briefing.audioDurationSeconds || 90)}
                  </span>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-[11px] text-slate-400">
                    {briefing.voiceName || 'صدای استراتژیک KASP'}
                  </span>
                </div>
              </div>
            </div>

            {/* Playback Controls: Rate, Audio Wave Animation, Mute */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              {/* Playback Speed Multipliers */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px]">
                {[1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      playbackRate === rate 
                        ? 'bg-indigo-600 text-white font-bold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              <button
                onClick={handleRestart}
                title="شروع از ابتدا"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopyTranscript}
                title="کپی متن کامل خلاصه صوتی"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
              >
                {copiedTranscript ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Interactive Seek Bar & Audio Waveform */}
          <div className="space-y-1.5">
            <input
              type="range"
              min={0}
              max={duration || briefing.audioDurationSeconds || 90}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-emerald-400 transition-all"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>۰:۰۰</span>
              <span>{formatTime(duration || briefing.audioDurationSeconds || 90)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 6 KEY SPOKEN BRIEFING PILLARS */}
      {briefing && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>سرفصل‌های ۶ گانه خلاصه اجرایی صوتی مشاور KASP:</span>
            </h4>
            <button
              onClick={() => setShowFullTranscript(!showFullTranscript)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition-colors"
            >
              <span>{showFullTranscript ? 'بستن متن کامل' : 'مشاهده متن کامل پادکست'}</span>
              {showFullTranscript ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. What the business is */}
            <div 
              onClick={() => {
                setActiveSectionKey('whatItIs');
                playWithWebSpeech(briefing.sections.whatItIs.spokenText);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                activeSectionKey === 'whatItIs'
                  ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-950/40 scale-[1.01]'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black text-indigo-300 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <span>۱. این کسب‌وکار چیست؟</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300">ماهیت و ارزش</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">
                {briefing.sections.whatItIs.spokenText}
              </p>
              <div className="pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{briefing.sections.whatItIs.summaryBullet}</span>
              </div>
            </div>

            {/* 2. What KASP thinks about it */}
            <div 
              onClick={() => {
                setActiveSectionKey('kaspPerspective');
                playWithWebSpeech(briefing.sections.kaspPerspective.spokenText);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                activeSectionKey === 'kaspPerspective'
                  ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-950/40 scale-[1.01]'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-purple-400" />
                  <span>۲. دیدگاه صریح مشاور KASP</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300">ارزیابی عیار</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">
                {briefing.sections.kaspPerspective.spokenText}
              </p>
              <div className="pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{briefing.sections.kaspPerspective.summaryBullet}</span>
              </div>
            </div>

            {/* 3. Biggest Opportunity */}
            <div 
              onClick={() => {
                setActiveSectionKey('biggestOpportunity');
                playWithWebSpeech(briefing.sections.biggestOpportunity.spokenText);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                activeSectionKey === 'biggestOpportunity'
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/40 scale-[1.01]'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>۳. بزرگ‌ترین فرصت رشد</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300">اهرم برنده</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">
                {briefing.sections.biggestOpportunity.spokenText}
              </p>
              <div className="pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{briefing.sections.biggestOpportunity.summaryBullet}</span>
              </div>
            </div>

            {/* 4. Biggest Risk */}
            <div 
              onClick={() => {
                setActiveSectionKey('biggestRisk');
                playWithWebSpeech(briefing.sections.biggestRisk.spokenText);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                activeSectionKey === 'biggestRisk'
                  ? 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/40 scale-[1.01]'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>۴. بزرگ‌ترین ریسک و گلوگاه</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300">هشدار مرگبار</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">
                {briefing.sections.biggestRisk.spokenText}
              </p>
              <div className="pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{briefing.sections.biggestRisk.summaryBullet}</span>
              </div>
            </div>

            {/* 5. Next Three Actions */}
            <div 
              onClick={() => {
                setActiveSectionKey('nextThreeActions');
                playWithWebSpeech(briefing.sections.nextThreeActions.spokenText);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                activeSectionKey === 'nextThreeActions'
                  ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/40 scale-[1.01]'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>۵. سه اقدام فوری و کلیدی بعدی</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300">گام‌های ۱۴ تا ۳۰ روزه</span>
              </div>
              <ul className="space-y-1.5 mb-3 text-xs text-slate-300">
                {briefing.sections.nextThreeActions.actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{briefing.sections.nextThreeActions.summaryBullet}</span>
              </div>
            </div>

            {/* 6. What KASP would do if it were the founder */}
            <div 
              onClick={() => {
                setActiveSectionKey('ifKaspWereFounder');
                playWithWebSpeech(briefing.sections.ifKaspWereFounder.spokenText);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                activeSectionKey === 'ifKaspWereFounder'
                  ? 'bg-sky-950/40 border-sky-500/50 shadow-lg shadow-sky-950/40 scale-[1.01]'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-sky-400" />
                  <span>۶. اگر KASP جای بنیان‌گذار بود...</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300">دستور کار اول صبح فردا</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">
                {briefing.sections.ifKaspWereFounder.spokenText}
              </p>
              <div className="pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{briefing.sections.ifKaspWereFounder.summaryBullet}</span>
              </div>
            </div>

          </div>

          {/* Collapsible Full Continuous Spoken Transcript */}
          {showFullTranscript && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-bold text-amber-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>متن کامل گفتاری مشاور ارشد KASP (Podcast Script):</span>
                </span>
                <button
                  onClick={handleCopyTranscript}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1 transition-all"
                >
                  {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTranscript ? 'کپی شد' : 'کپی متن'}</span>
                </button>
              </div>
              <p className="whitespace-pre-line text-slate-200">
                {briefing.fullTranscript}
              </p>
            </div>
          )}
        </div>
      )}

      {/* CONVERSATIONAL VOICE ARCHITECTURE (User Speaks -> STT -> BusinessState -> Response -> TTS) */}
      <div className="pt-6 border-t border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">
              معماری تعاملی گفتگوی صوتی با مشاور (KASP Voice Interaction)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            پرسش صوتی مستقیم از هوش تجاری
          </span>
        </div>

        {/* Live Conversation Stream */}
        {conversationHistory.length > 0 && (
          <div className="space-y-2.5 max-h-48 overflow-y-auto p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs">
            {conversationHistory.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl ${
                  item.sender === 'user' 
                    ? 'bg-indigo-950/40 border border-indigo-900/50 text-indigo-200 mr-8' 
                    : 'bg-slate-900 border border-slate-800 text-slate-200 ml-8'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 mb-1">
                  {item.sender === 'user' ? '🗣️ سوال صوتی شما:' : '🎙️ پاسخ مشاور KASP:'}
                </div>
                <p className="leading-relaxed">{item.text}</p>
                {item.bullet && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[11px] text-emerald-400 font-medium">
                    🎯 {item.bullet}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Input Bar with Mic button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={voiceQueryText}
              onChange={(e) => setVoiceQueryText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendVoiceQuery();
              }}
              placeholder="یک سوال استراتژیک بپرسید یا میکروفون را بزنید..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all pr-10"
            />
            <button
              onClick={toggleSpeechRecognition}
              title={isListening ? 'در حال شنیدن...' : 'فعال‌سازی میکروفون'}
              className={`absolute right-2 top-2 p-1.5 rounded-lg transition-all ${
                isListening 
                  ? 'bg-rose-500 text-white animate-ping' 
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleSendVoiceQuery()}
            disabled={isAnsweringVoice || !voiceQueryText.trim()}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            {isAnsweringVoice ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>مشاور در حال پاسخ...</span>
              </>
            ) : (
              <span>ارسال به مشاور</span>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
