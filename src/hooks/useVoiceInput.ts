import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseVoiceInputOptions {
  onResult?: (text: string) => void;
  lang?: string;
}

export function useVoiceInput({ onResult, lang = 'fa-IR' }: UseVoiceInputOptions = {}) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript.trim() && onResultRef.current) {
          onResultRef.current(transcript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setError('دسترسی به میکروفون توسط کاربر یا مرورگر مسدود شده است.');
        } else if (event.error === 'no-speech') {
          // Ignore no-speech error gracefully
        } else if (event.error === 'audio-capture') {
          setError('میکروفونی جهت ضبط صدا یافت نشد.');
        } else {
          setError('خطا در تشخیص صدا: ' + (event.error || 'ناشناخته'));
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      setIsSupported(false);
    }
  }, [lang]);

  const startRecording = useCallback(async () => {
    setError(null);
    if (!isSupported || !recognitionRef.current) {
      setError('امکان تشخیص صدا در مرورگر شما پشتیبانی نمی‌شود.');
      return;
    }

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (err: any) {
      setError('دسترسی به میکروفون رد شد یا میکروفونی یافت نشد.');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err: any) {
      setError('خطا در شروع ضبط صدا.');
    }
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  }, [isRecording]);

  const toggleRecording = useCallback(() => {
    if (!isSupported) {
      setError('امکان تشخیص صدا در مرورگر شما پشتیبانی نمی‌شود.');
      return;
    }
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isSupported, isRecording, startRecording, stopRecording]);

  return {
    isSupported,
    isRecording,
    error,
    setError,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
