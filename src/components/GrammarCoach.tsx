import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  HelpCircle,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { UserProfile, GrammarModule } from '../types';
import { GRAMMAR_MODULES } from '../data/mockData';
import { storageService } from '../services/storageService';

interface GrammarCoachProps {
  userProfile: UserProfile;
  onSessionComplete?: () => void;
}

export const GrammarCoach: React.FC<GrammarCoachProps> = ({
  userProfile,
  onSessionComplete,
}) => {
  const [activeModule, setActiveModule] = useState<GrammarModule>(GRAMMAR_MODULES[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [recurringMistakes, setRecurringMistakes] = useState<string[]>(
    storageService.getRecurringMistakes()
  );

  const currentQ = activeModule.questions[currentQuestionIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswerSubmitted(true);
    if (selectedAnswer === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeModule.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsFinished(true);
      // Record completed session
      storageService.addSession({
        id: 'grammar-' + Date.now(),
        type: 'grammar',
        topic: activeModule.title,
        date: new Date().toISOString(),
        durationSeconds: 180,
        metrics: {
          clarity: 8,
          fluency: 7,
          grammar: Math.round(((score + (selectedAnswer === currentQ?.correctIndex ? 1 : 0)) / activeModule.questions.length) * 10),
          vocabulary: 8,
        },
        turnsCount: activeModule.questions.length,
      });
      onSessionComplete?.();
    }
  };

  const handleRestart = (module: GrammarModule) => {
    setActiveModule(module);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  const handleGenerateCustomModule = async () => {
    if (!customTopic.trim() || isGeneratingCustom) return;
    setIsGeneratingCustom(true);

    try {
      const res = await fetch('/api/grammar/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: customTopic.trim(),
          userLevel: userProfile.englishLevel,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const generated: GrammarModule = {
          id: 'custom-' + Date.now(),
          title: data.data.ruleTitle || customTopic,
          tag: 'Custom Generated Lesson',
          ruleExplanation: data.data.ruleExplanation || 'Key grammar rules and proper usage.',
          commonPitfall: data.data.commonPitfall || 'Careless word placement or improper verb agreement.',
          questions: data.data.questions || [],
        };
        handleRestart(generated);
        setCustomTopic('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                ✍️
              </span>
              Targeted Grammar Coach
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Master English rules through actual student mistakes and high-yield, bite-sized practice. No dense textbook jargon.
            </p>
          </div>

          {/* Quick AI Lesson Generator */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Reported Speech, Conditionals"
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={handleGenerateCustomModule}
              disabled={!customTopic.trim() || isGeneratingCustom}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingCustom ? 'Creating...' : 'Generate Drill'}</span>
            </button>
          </div>
        </div>

        {/* Module Selection Pills */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {GRAMMAR_MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => handleRestart(mod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeModule.id === mod.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {mod.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout: Rule Card + Interactive Exercise */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Bite-Sized Rule Explanation & Pitfall Alert */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                {activeModule.tag}
              </span>
              <span className="text-xs font-bold text-slate-400">
                Rule Card
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {activeModule.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeModule.ruleExplanation}
            </p>

            {/* Common Pitfall Box */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Common Student Pitfall:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 italic">
                {activeModule.commonPitfall}
              </p>
            </div>
          </div>

          {/* Student Recurring Mistakes Tracker */}
          {recurringMistakes.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Lightbulb className="w-3.5 h-3.5 text-teal-600" />
                <span>Identified Speaking Tendencies:</span>
              </div>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                {recurringMistakes.slice(0, 3).map((m, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-teal-500 font-bold">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right column: Interactive Quiz */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs min-h-[380px] flex flex-col justify-between">
            {!isFinished && currentQ ? (
              <div className="space-y-5">
                {/* Progress bar */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    Question {currentQuestionIndex + 1} of {activeModule.questions.length}
                  </span>
                  <span>Score: {score}</span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-500 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${((currentQuestionIndex + 1) / activeModule.questions.length) * 100}%`,
                    }}
                  />
                </div>

                {/* Question Prompt */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 block mb-1">
                    Complete the Sentence:
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {currentQ.prompt}
                  </p>
                </div>

                {/* Multiple choice options */}
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === currentQ.correctIndex;

                    let optionStyle =
                      'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600';

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        optionStyle =
                          'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20';
                      } else if (isSelected && !isCorrect) {
                        optionStyle =
                          'border-red-500 bg-red-50/80 dark:bg-red-950/50 text-red-900 dark:text-red-100';
                      }
                    } else if (isSelected) {
                      optionStyle =
                        'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-100 ring-2 ring-teal-500/20';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isAnswerSubmitted && (
                          <div>
                            {isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            )}
                            {isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box upon submit */}
                {isAnswerSubmitted && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs space-y-1 animate-fadeIn ${
                      selectedAnswer === currentQ.correctIndex
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {selectedAnswer === currentQ.correctIndex ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Correct!</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Not quite:</span>
                        </>
                      )}
                    </div>
                    <p className="leading-relaxed">{currentQ.explanation}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Finished State */
              <div className="text-center py-8 space-y-4 my-auto">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 mx-auto flex items-center justify-center text-teal-600 dark:text-teal-400 text-2xl font-bold">
                  🎉
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Module Complete!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    You scored {score} out of {activeModule.questions.length} on “{activeModule.title}”.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestart(activeModule)}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20"
                >
                  Try Again / Practice Another
                </button>
              </div>
            )}

            {/* Bottom Actions */}
            {!isFinished && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                {!isAnswerSubmitted ? (
                  <button
                    type="button"
                    disabled={selectedAnswer === null}
                    onClick={handleCheckAnswer}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs transition-all"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-all"
                  >
                    <span>
                      {currentQuestionIndex < activeModule.questions.length - 1
                        ? 'Next Question'
                        : 'View Results'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
