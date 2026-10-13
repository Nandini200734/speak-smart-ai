/**
 * Speech Recognition and Text-To-Speech Service
 * Provides browser Web Speech API integration with fallbacks and honest evaluation bounds
 */

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

class SpeechService {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public isSpeechSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.isSpeechRecognitionSupported()) {
      onError('Speech recognition is not supported in this browser. Please use text input.');
      return false;
    }

    try {
      const SpeechRecognitionConstructor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      this.recognition = new SpeechRecognitionConstructor();
      if (!this.recognition) return false;

      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        onResult(text, Boolean(finalTranscript));
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          onError('Microphone access was denied. Please check browser permissions or use text input.');
        } else if (event.error === 'no-speech') {
          // Normal silence, don't crash
        } else {
          onError(`Speech recognition error: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e: any) {
      console.error('Failed to start speech recognition', e);
      onError(e.message || 'Unable to access microphone.');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Error stopping recognition', e);
      }
      this.isListening = false;
    }
  }

  public speak(
    text: string,
    options: { rate?: number; pitch?: number; voiceName?: string; onEnd?: () => void } = {}
  ): void {
    if (!this.isSpeechSynthesisSupported()) return;

    window.speechSynthesis.cancel(); // cancel any active speech

    // Clean text of markdown asterisks or code symbols for smooth TTS
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/`+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options.rate || 0.95; // Slightly measured pace for student comprehension
    utterance.pitch = options.pitch || 1.0;

    // Pick pleasant English voice
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const preferredVoice = this.voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel') ||
          v.name.includes('Karen'))
    ) || this.voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  public calculatePacing(transcript: string, durationSeconds: number) {
    const words = transcript.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(0.1, durationSeconds / 60);
    const wpm = Math.round(words / minutes);

    let assessment = 'Moderate pacing';
    if (wpm < 100) assessment = 'Slower, deliberate pacing (try connecting ideas with transitions)';
    else if (wpm > 165) assessment = 'Fast pacing (pause between key thoughts to aid listener digestion)';
    else assessment = 'Ideal conversational & presentation pacing (120–150 WPM)';

    return { words, wpm, assessment };
  }
}

export const speechService = new SpeechService();
