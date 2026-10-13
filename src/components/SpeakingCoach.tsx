import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  TrendingUp,
  Languages,
  ChevronDown,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { UserProfile, ChatMessage, CoachFeedback } from '../types';
import { VoiceInputControls } from './VoiceInputControls';
import { speechService } from '../services/speechService';
import { storageService } from '../services/storageService';

interface SpeakingCoachProps {
  userProfile: UserProfile;
  onSessionComplete?: () => void;
}

export const SpeakingCoach: React.FC<SpeakingCoachProps> = ({
  userProfile,
  onSessionComplete,
}) => {
  const [selectedTopic, setSelectedTopic] = useState('Campus Life & Engineering');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [showNativeHintId, setShowNativeHintId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const topicsList = [
    { title: 'Campus Life & Engineering', icon: '🎓' },
    { title: 'Tech, AI & Future Careers', icon: '🤖' },
    { title: 'Hobbies, Travel & Weekend Passions', icon: '🎨' },
    { title: 'College Club Leadership & Projects', icon: '🚀' },
    { title: 'Job Placement & HR Behavioral Scenarios', icon: '💼' },
  ];

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Start new session on topic change
  useEffect(() => {
    initiateTopic(selectedTopic);
  }, [selectedTopic]);

  const initiateTopic = async (topic: string) => {
    setIsProcessing(true);
    setErrorNotice(null);
    setSessionStartTime(Date.now());

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          userLevel: userProfile.englishLevel,
          nativeLanguage: userProfile.nativeLanguage,
          history: [],
          userResponse: '',
          mode: 'speaking_coach',
        }),
      });

      const res = await response.json();
      if (res.success && res.data) {
        const openingQuestion =
          res.data.nextCoachQuestion ||
          `Hello ${userProfile.name}! Let's practice speaking on "${topic}". What has been one of the most exciting experiences you've had in college so far?`;

        setMessages([
          {
            id: 'msg-init-' + Date.now(),
            role: 'coach',
            content: openingQuestion,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorNotice('Network error connecting to AI coach. Using supportive offline mode.');
      setMessages([
        {
          id: 'msg-init-' + Date.now(),
          role: 'coach',
          content: `Welcome ${userProfile.name}! Let's practice speaking about "${topic}". To start, could you tell me a little bit about what you enjoy most about it?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUserAnswer = async (text: string, durationSeconds: number) => {
    if (!text.trim() || isProcessing) return;

    setErrorNotice(null);
    const userMsgId = 'user-' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      audioDuration: durationSeconds,
    };

    const updatedHistory = [...messages, newUserMsg];
    setMessages(updatedHistory);
    setIsProcessing(true);

    try {
      // Build lightweight conversation history for model
      const formattedHistory = messages.map((m) => ({
        role: m.role === 'coach' ? 'coach' : 'user',
        content: m.content,
      }));

      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedTopic,
          userLevel: userProfile.englishLevel,
          nativeLanguage: userProfile.nativeLanguage,
          history: formattedHistory,
          userResponse: text,
          mode: 'speaking_coach',
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const feedback: CoachFeedback = data.data.feedback;
        const nextQuestion = data.data.nextCoachQuestion;

        const coachReplyId = 'coach-' + Date.now();
        const newCoachMsg: ChatMessage = {
          id: coachReplyId,
          role: 'coach',
          content: nextQuestion,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          feedback: feedback,
        };

        setMessages((prev) => [...prev, newCoachMsg]);

        // Auto read next question if user likes spoken responses
        speechService.speak(nextQuestion, {
          onEnd: () => setSpeakingMessageId(null),
        });
        setSpeakingMessageId(coachReplyId);

        // Record practice session metrics
        if (feedback?.estimatedMetrics) {
          const totalDuration = Math.round((Date.now() - sessionStartTime) / 1000);
          storageService.addSession({
            id: 'session-' + Date.now(),
            type: 'speaking_coach',
            topic: selectedTopic,
            date: new Date().toISOString(),
            durationSeconds: Math.max(30, totalDuration),
            metrics: feedback.estimatedMetrics,
            turnsCount: messages.length + 2,
            transcriptSummary: text.slice(0, 100),
          });

          if (feedback.recurringPattern) {
            storageService.addRecurringMistake(feedback.recurringPattern);
          }

          onSessionComplete?.();
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorNotice('Trouble reaching server. Displaying standard coach feedback.');
      // Local fallback
      const coachReplyId = 'coach-' + Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: coachReplyId,
          role: 'coach',
          content: 'That is a great perspective. How do you see yourself continuing to develop this in your next semester?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          feedback: {
            original: text,
            corrected: text,
            naturalAlternative: `To expand on that, ${text.toLowerCase()}`,
            explanations: [
              {
                point: 'Expressing Opinions with Nuance',
                why: 'Use phrases like "From my standpoint" or "In my experience" to sound grounded and professional.',
                example: 'Say: "From my standpoint, collaboration accelerates progress."',
              },
            ],
            praise: 'Good expressive flow and direct answer to the prompt!',
            estimatedMetrics: {
              clarity: 8,
              fluency: 7,
              grammar: 8,
              vocabulary: 7,
              structure: 8,
            },
          },
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSpeak = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      speechService.stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      speechService.speak(text, {
        onEnd: () => setSpeakingMessageId(null),
      });
      setSpeakingMessageId(msgId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Topic Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                💬
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Interactive Speaking Coach
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              One question at a time. Speak or type your authentic thoughts—get immediate grammar, fluency, and natural phrasing feedback.
            </p>
          </div>

          {/* Topic Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Topic:
            </span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {topicsList.map((t) => (
                <option key={t.title} value={t.title}>
                  {t.icon} {t.title}
                </option>
              ))}
            </select>

            <button
              onClick={() => initiateTopic(selectedTopic)}
              title="Restart Conversation on this topic"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {errorNotice && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Conversation Thread */}
      <div className="space-y-4 min-h-[380px]">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-3">
            {/* Message Bubble */}
            <div
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'coach' && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-5 py-3.5 shadow-xs transition-all ${
                  msg.role === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span
                    className={`text-[11px] font-bold ${
                      msg.role === 'user'
                        ? 'text-teal-100'
                        : 'text-teal-600 dark:text-teal-400'
                    }`}
                  >
                    {msg.role === 'user' ? 'Your Answer' : 'SpeakSmart Coach'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] ${
                        msg.role === 'user'
                          ? 'text-teal-200'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                    {msg.role === 'coach' && (
                      <button
                        onClick={() => toggleSpeak(msg.id, msg.content)}
                        className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        title="Listen to spoken audio"
                      >
                        {speakingMessageId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* In-depth AI Analysis Card (Attached to Coach reply following user's turn) */}
            {msg.feedback && (
              <div className="ml-12 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-850 border border-slate-200/80 dark:border-slate-750 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Speech Analysis & Correction Breakdown
                    </span>
                  </div>
                  {msg.feedback.praise && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      ★ {msg.feedback.praise}
                    </span>
                  )}
                </div>

                {/* 1. Original vs Corrected vs Natural */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40">
                    <span className="font-bold text-red-700 dark:text-red-400 block mb-1">
                      Your Original:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 italic">
                      "{msg.feedback.original}"
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                      Grammatically Corrected:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      "{msg.feedback.corrected}"
                    </p>
                  </div>
                </div>

                {/* 2. More Natural Professional Way */}
                {msg.feedback.naturalAlternative && (
                  <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-teal-800 dark:text-teal-300">
                        Fluent & Natural Campus/Work Phrasing:
                      </span>
                      <button
                        onClick={() =>
                          speechService.speak(msg.feedback!.naturalAlternative)
                        }
                        className="text-xs text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold">
                      "{msg.feedback.naturalAlternative}"
                    </p>
                  </div>
                )}

                {/* 3. Explanations (Up to 3 high-yield pointers) */}
                {msg.feedback.explanations && msg.feedback.explanations.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Why this matters:
                    </span>
                    <div className="space-y-2">
                      {msg.feedback.explanations.map((exp, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs p-2.5 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-150 dark:border-slate-700/60"
                        >
                          <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold flex items-center justify-center shrink-0 text-[10px]">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {exp.point}:{' '}
                            </span>
                            <span className="text-slate-600 dark:text-slate-300">
                              {exp.why}
                            </span>
                            {exp.example && (
                              <div className="mt-1 text-[11px] text-teal-700 dark:text-teal-300 font-mono bg-slate-50 dark:bg-slate-900/60 p-1 rounded">
                                Example: {exp.example}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Estimated Skill Ratings Bar */}
                {msg.feedback.estimatedMetrics && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                      <span className="font-semibold">Turn Skill Estimates:</span>
                      <span className="text-[10px] italic">AI-calibrated estimate (1–10)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Clarity</div>
                        <div className="text-sm font-bold text-teal-600 dark:text-teal-400">
                          {msg.feedback.estimatedMetrics.clarity}/10
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Fluency</div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {msg.feedback.estimatedMetrics.fluency}/10
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Grammar</div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {msg.feedback.estimatedMetrics.grammar}/10
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Vocabulary</div>
                        <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {msg.feedback.estimatedMetrics.vocabulary}/10
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs py-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin text-teal-600" />
            </div>
            <span>Analyzing response grammar, syntax, and drafting next prompt...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice / Text Controls at bottom */}
      <div className="sticky bottom-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
        <VoiceInputControls
          onTranscriptUpdate={() => {}}
          onRecordingComplete={(text, duration) => handleUserAnswer(text, duration)}
          disabled={isProcessing}
          isProcessing={isProcessing}
          placeholder="Speak or type your answer to the coach's question..."
          defaultTimerLimit={60}
        />
      </div>
    </div>
  );
};
