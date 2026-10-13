import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Sparkles,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Shuffle,
  Volume2,
  HelpCircle,
  BarChart2,
  Layers,
  Flame,
} from 'lucide-react';
import { UserProfile, SpeechEvaluationResult } from '../types';
import { PUBLIC_SPEAKING_TOPICS } from '../data/mockData';
import { VoiceInputControls } from './VoiceInputControls';
import { speechService } from '../services/speechService';
import { storageService } from '../services/storageService';

interface PublicSpeakingGDProps {
  userProfile: UserProfile;
  onSessionComplete?: () => void;
}

export const PublicSpeakingGD: React.FC<PublicSpeakingGDProps> = ({
  userProfile,
  onSessionComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'jam' | 'presentation' | 'gd' | 'debate'>('jam');
  const [currentTopic, setCurrentTopic] = useState(PUBLIC_SPEAKING_TOPICS.jam[0]);
  const [isPrepCounting, setIsPrepCounting] = useState(false);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(15);
  const [isProcessing, setIsProcessing] = useState(false);
  const [evaluation, setEvaluation] = useState<SpeechEvaluationResult | null>(null);
  const [recordedTranscript, setRecordedTranscript] = useState('');

  const prepTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    };
  }, []);

  const handleStartPrep = () => {
    setIsPrepCounting(true);
    setPrepSecondsLeft(15);
    setEvaluation(null);

    prepTimerRef.current = setInterval(() => {
      setPrepSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current!);
          setIsPrepCounting(false);
          // Play a friendly beep or cue
          speechService.speak('Time is up. Start speaking now!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePickRandomTopic = () => {
    const list = PUBLIC_SPEAKING_TOPICS.jam;
    const random = list[Math.floor(Math.random() * list.length)];
    setCurrentTopic(random);
    setEvaluation(null);
    setIsPrepCounting(false);
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
  };

  const handleSpeechComplete = async (transcript: string, durationSeconds: number) => {
    if (!transcript.trim()) return;

    setRecordedTranscript(transcript);
    setIsProcessing(true);
    setEvaluation(null);

    try {
      const res = await fetch('/api/speech/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: activeTab,
          topic: currentTopic.title,
          durationSeconds,
          transcript,
          targetSeconds: 60,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const evalData: SpeechEvaluationResult = data.data;
        setEvaluation(evalData);

        // Record session
        storageService.addSession({
          id: 'speech-' + Date.now(),
          type: 'public_speaking',
          topic: currentTopic.title,
          date: new Date().toISOString(),
          durationSeconds: Math.max(30, durationSeconds),
          metrics: {
            clarity: evalData.metrics.clarity,
            fluency: evalData.metrics.fluency,
            grammar: 8,
            vocabulary: evalData.metrics.vocabulary,
            structure: evalData.metrics.organization,
          },
          turnsCount: 1,
          transcriptSummary: transcript.slice(0, 100),
        });

        onSessionComplete?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Modes */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                🎙️
              </span>
              Public Speaking & Group Discussion (GD) Lab
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Impromptu JAM speeches, structured presentation rehearsals, debate frameworks, and placement GD simulations.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
            {[
              { id: 'jam' as const, label: 'JAM (1-Min Speech)' },
              { id: 'presentation' as const, label: 'Presentation Rehearsal' },
              { id: 'gd' as const, label: 'GD Simulator' },
              { id: 'debate' as const, label: 'Debate Framework' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setEvaluation(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Challenge Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
              {activeTab === 'jam'
                ? 'Impromptu Speaking (JAM)'
                : activeTab === 'presentation'
                ? 'Pitch Structure'
                : activeTab === 'gd'
                ? 'Placement GD'
                : 'Debate Argumentation'}
            </span>
            <span className="text-xs text-slate-400">Target: 60 Seconds</span>
          </div>

          {activeTab === 'jam' && (
            <button
              onClick={handlePickRandomTopic}
              className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold"
            >
              <Shuffle className="w-3 h-3" />
              <span>Random Topic</span>
            </button>
          )}
        </div>

        {/* Current Topic Display */}
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            “{currentTopic.title}”
          </h3>
          <p className="text-xs text-teal-700 dark:text-teal-300 font-medium mt-1">
            Prompt Guidance: {currentTopic.hookPrompt || 'Structure: Hook -> Supporting points -> Conclusion'}
          </p>
        </div>

        {/* 15-Second Prep Countdown Box (For Impromptu Mode) */}
        {activeTab === 'jam' && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                15-Second Rapid Brainstorming Phase
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Take 15 seconds to organize 2 key arguments before you begin speaking.
              </p>
            </div>

            {isPrepCounting ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-sm shadow-xs animate-pulse">
                <Clock className="w-4 h-4" />
                <span>Prep Time: {prepSecondsLeft}s</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartPrep}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
              >
                Start 15s Brainstorming Timer
              </button>
            )}
          </div>
        )}

        {/* Framework & Blueprint Guidelines Box */}
        <div className="p-4 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 space-y-2 text-xs">
          <div className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-teal-600" />
            <span>Winning Speech Blueprint:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 dark:text-slate-300">
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="font-bold text-teal-700 dark:text-teal-300 block mb-0.5">
                1. The Hook (0-15s)
              </span>
              Start with a striking fact, question, or clear stance. Never start with "Today I will speak about...".
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="font-bold text-blue-700 dark:text-blue-300 block mb-0.5">
                2. Body & Evidence (15-45s)
              </span>
              Offer two distinct points backed by a personal story or campus observation.
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <span className="font-bold text-purple-700 dark:text-purple-300 block mb-0.5">
                3. The Call to Action (45-60s)
              </span>
              Finish with a memorable punchline or decisive recommendation.
            </div>
          </div>
        </div>

        {/* Voice Input Controls */}
        <div className="pt-2">
          <VoiceInputControls
            onTranscriptUpdate={() => {}}
            onRecordingComplete={(text, duration) => handleSpeechComplete(text, duration)}
            disabled={isProcessing}
            isProcessing={isProcessing}
            placeholder="Deliver your 60-second speech here or click the microphone to speak..."
            defaultTimerLimit={60}
          />
        </div>
      </div>

      {/* AI Speech Evaluation Report */}
      {evaluation && (
        <div className="bg-white dark:bg-slate-900 border-2 border-teal-500 rounded-2xl p-6 shadow-xl space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Speech & Structure Analysis
              </h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 font-extrabold text-sm border border-teal-200 dark:border-teal-800">
              Score: {evaluation.overallScore}/100
            </div>
          </div>

          {/* Pacing & WPM feedback banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                Pacing & Word Count Analysis
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                {evaluation.pacingFeedback}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                <div className="text-[10px] text-slate-400">Words</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {evaluation.wordCount}
                </div>
              </div>
              <div className="text-center px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                <div className="text-[10px] text-slate-400">Pace</div>
                <div className="font-bold text-teal-600 dark:text-teal-400">
                  {evaluation.estimatedWpm} WPM
                </div>
              </div>
            </div>
          </div>

          {/* Metrics breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="text-[10px] text-slate-400">Organization</div>
              <div className="font-bold text-teal-600 dark:text-teal-400 text-sm">
                {evaluation.metrics.organization}/10
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="text-[10px] text-slate-400">Clarity</div>
              <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                {evaluation.metrics.clarity}/10
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="text-[10px] text-slate-400">Relevance</div>
              <div className="font-bold text-purple-600 dark:text-purple-400 text-sm">
                {evaluation.metrics.relevance}/10
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="text-[10px] text-slate-400">Fluency</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {evaluation.metrics.fluency}/10
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="text-[10px] text-slate-400">Vocabulary</div>
              <div className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                {evaluation.metrics.vocabulary}/10
              </div>
            </div>
          </div>

          {/* Structural Flow Analysis */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
              Three-Part Speech Structure Feedback:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-teal-600 dark:text-teal-400 block mb-1">
                  Introduction / Hook:
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  {evaluation.structureAnalysis.introduction}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                  Body Arguments:
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  {evaluation.structureAnalysis.bodyPoints}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">
                  Closing Conclusion:
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  {evaluation.structureAnalysis.conclusion}
                </p>
              </div>
            </div>
          </div>

          {/* Model Speech Snippet */}
          {evaluation.modelSpeechSnippet && (
            <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-teal-900 dark:text-teal-200">
                <span>Model High-Scoring Delivery Example:</span>
                <button
                  type="button"
                  onClick={() => speechService.speak(evaluation.modelSpeechSnippet)}
                  className="flex items-center gap-1 text-teal-700 dark:text-teal-400 hover:underline"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen</span>
                </button>
              </div>
              <p className="text-slate-800 dark:text-slate-200 italic font-medium">
                “{evaluation.modelSpeechSnippet}”
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
