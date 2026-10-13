import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  MessageCircle,
  Flag,
  Target,
  BarChart3,
} from 'lucide-react';
import { UserProfile, RoleplayScenario, RoleplayEvaluation } from '../types';
import { ROLEPLAY_SCENARIOS } from '../data/mockData';
import { VoiceInputControls } from './VoiceInputControls';
import { speechService } from '../services/speechService';
import { storageService } from '../services/storageService';

interface RolePlayProps {
  userProfile: UserProfile;
  onSessionComplete?: () => void;
}

export const RolePlay: React.FC<RolePlayProps> = ({
  userProfile,
  onSessionComplete,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario>(
    ROLEPLAY_SCENARIOS[0]
  );
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    userProfile.englishLevel || 'Intermediate'
  );
  const [inSession, setInSession] = useState(false);
  const [dialogue, setDialogue] = useState<
    Array<{
      sender: 'character' | 'user';
      text: string;
      coachTip?: string;
      timestamp: string;
    }>
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [evaluation, setEvaluation] = useState<RoleplayEvaluation | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogue, isProcessing]);

  const startScenario = (scenario: RoleplayScenario) => {
    setSelectedScenario(scenario);
    setDialogue([
      {
        sender: 'character',
        text: scenario.initialPrompt,
        coachTip:
          'Acknowledge politely first. State your core question or stance directly within your first 2 sentences.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setEvaluation(null);
    setInSession(true);
    setSessionStartTime(Date.now());

    // Spoken initial prompt
    speechService.speak(scenario.initialPrompt);
  };

  const handleSendMessage = async (text: string, isFinal: boolean = false) => {
    if (!text.trim() || isProcessing) return;

    const userTurn = {
      sender: 'user' as const,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedDialogue = [...dialogue, userTurn];
    setDialogue(updatedDialogue);
    setIsProcessing(true);

    try {
      const historyPayload = updatedDialogue.map((d) => ({
        role: d.sender === 'character' ? 'assistant' : 'user',
        content: d.text,
      }));

      const res = await fetch('/api/roleplay/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          scenarioTitle: selectedScenario.title,
          characterName: selectedScenario.characterName,
          characterRole: selectedScenario.characterRole,
          difficulty,
          userMessage: text,
          history: historyPayload,
          isFinalTurn: isFinal,
          userProfile,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const charReply = data.data.characterReply;
        const tip = data.data.coachTip;
        const evalReport: RoleplayEvaluation | null = data.data.finalEvaluation;

        setDialogue((prev) => [
          ...prev,
          {
            sender: 'character',
            text: charReply,
            coachTip: tip,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        speechService.speak(charReply);

        if (evalReport) {
          setEvaluation(evalReport);
          const duration = Math.round((Date.now() - sessionStartTime) / 1000);

          storageService.addSession({
            id: 'roleplay-' + Date.now(),
            type: 'roleplay',
            topic: selectedScenario.title,
            date: new Date().toISOString(),
            durationSeconds: Math.max(45, duration),
            metrics: {
              clarity: evalReport.metrics.clarity,
              fluency: evalReport.metrics.confidence,
              grammar: 8,
              vocabulary: evalReport.metrics.professionalTone,
            },
            turnsCount: updatedDialogue.length + 1,
            transcriptSummary: text.slice(0, 100),
          });

          onSessionComplete?.();
        }
      }
    } catch (e) {
      console.error(e);
      // Fallback response
      setDialogue((prev) => [
        ...prev,
        {
          sender: 'character',
          text: `I appreciate your perspective. Could you give me an example or expand on how that worked out in practice?`,
          coachTip: `Give a brief, concrete real-world example to ground your answer.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConclude = () => {
    handleSendMessage('Thank you for this discussion, I would like to wrap up our conversation now.', true);
  };

  const filteredScenarios = ROLEPLAY_SCENARIOS.filter((s) => {
    if (filterCategory === 'all') return true;
    return s.category === filterCategory;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* View 1: Scenario Selector */}
      {!inSession ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                    🎭
                  </span>
                  Real-Life Role-Play Simulator
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Step into high-stakes campus & placement interactions. The AI plays the role realistically while providing whisper coaching tips.
                </p>
              </div>

              {/* Difficulty selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Difficulty:
                </span>
                <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        difficulty === lvl
                          ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Situations' },
                { id: 'academic', label: 'Academic & Professors' },
                { id: 'career', label: 'Job Interviews & HR' },
                { id: 'discussion', label: 'Group Discussion (GD)' },
                { id: 'campus', label: 'Campus & Networking' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilterCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    filterCategory === c.id
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-teal-400 dark:hover:border-teal-600 transition-all flex flex-col justify-between shadow-xs group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                      {scenario.characterAvatar}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {scenario.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {scenario.title}
                  </h3>

                  <div className="text-xs font-medium text-teal-600 dark:text-teal-400 mt-0.5">
                    Role: {scenario.characterName} ({scenario.characterRole})
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3">
                    {scenario.description}
                  </p>

                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Learning Objectives:
                    </span>
                    {scenario.learningObjectives.map((obj, i) => (
                      <div key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-teal-500" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => startScenario(scenario)}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-teal-600 text-slate-800 dark:text-slate-200 group-hover:text-white font-semibold text-xs transition-all"
                >
                  <span>Start Role-Play</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* View 2: Active Roleplay Conversation */
        <div className="space-y-4">
          {/* Active Scenario Header Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedScenario.characterAvatar}</span>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedScenario.title}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Speaking with <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedScenario.characterName}</span> ({selectedScenario.characterRole}) • Level: {difficulty}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConclude}
                disabled={isProcessing || Boolean(evaluation)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Flag className="w-3.5 h-3.5 text-amber-600" />
                <span>End & Get Report</span>
              </button>

              <button
                type="button"
                onClick={() => setInSession(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Change Scenario"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dialogue turns */}
          <div className="space-y-4 min-h-[360px]">
            {dialogue.map((turn, idx) => (
              <div key={idx} className="space-y-2">
                <div
                  className={`flex items-start gap-3 ${
                    turn.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {turn.sender === 'character' && (
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg shrink-0">
                      {selectedScenario.characterAvatar}
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-5 py-3.5 shadow-xs transition-all ${
                      turn.sender === 'user'
                        ? 'bg-teal-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span
                        className={`text-[11px] font-bold ${
                          turn.sender === 'user'
                            ? 'text-teal-100'
                            : 'text-teal-600 dark:text-teal-400'
                        }`}
                      >
                        {turn.sender === 'user' ? 'You' : selectedScenario.characterName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] ${
                            turn.sender === 'user'
                              ? 'text-teal-200'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {turn.timestamp}
                        </span>
                        {turn.sender === 'character' && (
                          <button
                            onClick={() => speechService.speak(turn.text)}
                            className="text-slate-400 hover:text-teal-600 dark:hover:text-teal-400"
                            title="Play spoken audio"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{turn.text}</p>
                  </div>

                  {turn.sender === 'user' && (
                    <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Whisper Coach Tip */}
                {turn.coachTip && !evaluation && (
                  <div className="ml-12 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-2 text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-800 dark:text-amber-200">
                        Coach Whisper Tip:{' '}
                      </span>
                      <span className="text-amber-900/80 dark:text-amber-300">
                        {turn.coachTip}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-2">
                <Sparkles className="w-4 h-4 animate-spin text-teal-600" />
                <span>{selectedScenario.characterName} is replying in character...</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* End-of-Session Comprehensive Feedback Report Modal/Card */}
          {evaluation && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-teal-500 shadow-xl space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Role-Play Performance Report
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 font-extrabold text-sm border border-teal-200 dark:border-teal-800">
                  Score: {evaluation.overallScore}/100
                </div>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300">
                {evaluation.summary}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-400 text-[10px]">Confidence</div>
                  <div className="text-base font-bold text-teal-600 dark:text-teal-400">
                    {evaluation.metrics.confidence}/10
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-400 text-[10px]">Relevance</div>
                  <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                    {evaluation.metrics.relevance}/10
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-400 text-[10px]">Professional Tone</div>
                  <div className="text-base font-bold text-purple-600 dark:text-purple-400">
                    {evaluation.metrics.professionalTone}/10
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-400 text-[10px]">Clarity</div>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {evaluation.metrics.clarity}/10
                  </div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Communication Strengths</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    {evaluation.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                  <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Areas to Polish</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    {evaluation.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended phrases */}
              {evaluation.suggestedPhrases && evaluation.suggestedPhrases.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block mb-2">
                    High-Impact Phrases to Memorize for this Situation:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.suggestedPhrases.map((phrase, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-medium"
                      >
                        “{phrase}”
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInSession(false)}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20"
                >
                  Choose Next Scenario
                </button>
              </div>
            </div>
          )}

          {/* Voice Input Controls */}
          {!evaluation && (
            <div className="sticky bottom-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <VoiceInputControls
                onTranscriptUpdate={() => {}}
                onRecordingComplete={(text) => handleSendMessage(text, false)}
                disabled={isProcessing}
                isProcessing={isProcessing}
                placeholder={`Respond to ${selectedScenario.characterName}...`}
                defaultTimerLimit={60}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
