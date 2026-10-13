import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Volume2,
  VolumeX,
  Clock,
  AlertCircle,
  HelpCircle,
  Keyboard,
} from 'lucide-react';
import { speechService } from '../services/speechService';

interface VoiceInputControlsProps {
  onTranscriptUpdate: (text: string) => void;
  onRecordingComplete: (text: string, durationSeconds: number) => void;
  disabled?: boolean;
  isProcessing?: boolean;
  placeholder?: string;
  defaultTimerLimit?: 30 | 60 | 120;
}

export const VoiceInputControls: React.FC<VoiceInputControlsProps> = ({
  onTranscriptUpdate,
  onRecordingComplete,
  disabled = false,
  isProcessing = false,
  placeholder = 'Type your answer or click the microphone to speak...',
  defaultTimerLimit = 60,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState<30 | 60 | 120>(defaultTimerLimit);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(defaultTimerLimit);
  const [interimText, setInterimText] = useState('');
  const [textMode, setTextMode] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    setIsSpeechSupported(speechService.isSpeechRecognitionSupported());
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      speechService.stopListening();
    };
  }, []);

  const handleStartRecording = () => {
    setErrorMessage(null);
    setInterimText('');
    setSecondsRemaining(selectedLimit);
    startTimeRef.current = Date.now();

    const started = speechService.startListening(
      (text) => {
        setInterimText(text);
        onTranscriptUpdate(text);
      },
      (err) => {
        setErrorMessage(err);
        handleStopRecording(false);
      },
      () => {
        // onEnd
        if (isRecording) {
          handleStopRecording(true);
        }
      }
    );

    if (started) {
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleStopRecording(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleStopRecording = (shouldSubmit: boolean = true) => {
    speechService.stopListening();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);

    const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    if (shouldSubmit && interimText.trim()) {
      onRecordingComplete(interimText.trim(), elapsed);
      setInterimText('');
    }
  };

  const handleSendTyped = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedText.trim() || disabled || isProcessing) return;

    onRecordingComplete(typedText.trim(), 30);
    setTypedText('');
  };

  return (
    <div className="w-full space-y-3">
      {/* Active Recording State Banner */}
      {isRecording && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-300 dark:border-teal-700/80 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs sm:text-sm font-semibold text-teal-900 dark:text-teal-200">
              Microphone Active — Speak freely in English...
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Waveform indicator */}
            <div className="hidden sm:flex items-center gap-1 h-6">
              <span className="w-1 bg-teal-500 rounded-full animate-wave-1" />
              <span className="w-1 bg-teal-600 rounded-full animate-wave-2" />
              <span className="w-1 bg-teal-400 rounded-full animate-wave-3" />
              <span className="w-1 bg-teal-500 rounded-full animate-wave-4" />
              <span className="w-1 bg-teal-600 rounded-full animate-wave-5" />
            </div>

            <div className="flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
              <Clock className="w-3.5 h-3.5" />
              <span>{secondsRemaining}s</span>
            </div>

            <button
              type="button"
              onClick={() => handleStopRecording(true)}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
            >
              <Square className="w-3 h-3 fill-white" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 text-xs rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-medium">{errorMessage}</span>
            <button
              onClick={() => {
                setTextMode(true);
                setErrorMessage(null);
              }}
              className="ml-2 font-semibold underline hover:text-amber-900 dark:hover:text-amber-100"
            >
              Switch to typing mode
            </button>
          </div>
        </div>
      )}

      {/* Controls Bar: Time Duration Selector + Mode Toggle */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>Speaking duration:</span>
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
            {[30, 60, 120].map((duration) => (
              <button
                key={duration}
                type="button"
                disabled={isRecording}
                onClick={() => {
                  setSelectedLimit(duration as 30 | 60 | 120);
                  setSecondsRemaining(duration);
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  selectedLimit === duration
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {duration === 120 ? '2 min' : `${duration}s`}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTextMode(!textMode)}
          className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>{textMode ? 'Prefer voice practice' : 'Prefer typing'}</span>
        </button>
      </div>

      {/* Primary Input Container */}
      {textMode || !isSpeechSupported ? (
        <form onSubmit={handleSendTyped} className="relative">
          <textarea
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            disabled={disabled || isProcessing}
            placeholder={placeholder}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendTyped();
              }
            }}
            className="w-full px-4 py-3 pb-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-400 resize-none shadow-xs"
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              Press Enter ↵ to submit
            </span>
            <button
              type="submit"
              disabled={!typedText.trim() || disabled || isProcessing}
              className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50"
            >
              {isProcessing ? 'Analyzing...' : 'Submit'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 rounded-2xl border border-dashed border-teal-300 dark:border-teal-800/80 bg-teal-50/40 dark:bg-teal-950/20 flex flex-col items-center justify-center text-center space-y-3">
          {interimText ? (
            <div className="w-full text-left p-3 rounded-xl bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-850 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              <span className="font-semibold text-teal-600 dark:text-teal-400 block text-[11px] mb-1">
                Live Speech Transcription:
              </span>
              <p className="italic">"{interimText}"</p>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {!isRecording ? (
              <button
                type="button"
                onClick={handleStartRecording}
                disabled={disabled || isProcessing}
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold text-sm shadow-md shadow-teal-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Mic className="w-5 h-5 text-white animate-bounce" />
                <span>Tap to Speak ({selectedLimit}s limit)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleStopRecording(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md transition-all mic-recording-pulse"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop & Evaluate Speech</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setTextMode(true)}
              className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2"
            >
              Or type answer manually
            </button>
          </div>

          {/* Assessment boundary note */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 max-w-md text-center">
            <HelpCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>
              Live transcription evaluates grammar, vocabulary, sentence cohesion, and WPM pace.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
