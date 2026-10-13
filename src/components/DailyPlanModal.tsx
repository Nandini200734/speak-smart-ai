import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Volume2,
  RotateCcw,
  BookOpen,
  Mic,
  MessageSquare,
  Award,
  X,
} from 'lucide-react';
import { UserProfile } from '../types';
import { speechService } from '../services/speechService';
import { storageService } from '../services/storageService';

interface DailyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onNavigateTo: (tab: string) => void;
  onCompletePlan: () => void;
}

export const DailyPlanModal: React.FC<DailyPlanModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onNavigateTo,
  onCompletePlan,
}) => {
  const [isExpressMode, setIsExpressMode] = useState(userProfile.dailyMinutes <= 5);
  const [currentStep, setCurrentStep] = useState(0);
  const [warmupRecorded, setWarmupRecorded] = useState(false);
  const [warmupText, setWarmupText] = useState('');

  if (!isOpen) return null;

  const routineSteps = isExpressMode
    ? [
        {
          title: 'Step 1: 1-Minute Vocal Warm-up',
          time: '1 Min',
          type: 'warmup',
          desc: 'Read this tongue twister aloud three times cleanly to activate vocal articulation:',
          content: '“Red lorry, yellow lorry, unique New York. She sells sea shells by the seashore.”',
        },
        {
          title: 'Step 2: 3-Minute Rapid Fire Speaking Practice',
          time: '3 Mins',
          type: 'coach',
          desc: 'Answer one high-yield campus prompt in SpeakSmart Speaking Coach with immediate grammar feedback.',
          content: 'Prompt: Describe one software tool or app that significantly improves your daily student productivity.',
        },
        {
          title: 'Step 3: 1-Minute Micro Vocabulary',
          time: '1 Min',
          type: 'vocab',
          desc: 'Review today’s key word: "Articulate" — to express ideas clearly and effectively in speech.',
          content: 'Challenge: Use "articulate" in your head or in conversation today at campus.',
        },
      ]
    : [
        {
          title: 'Step 1: 2-Minute Articulation Warm-up',
          time: '2 Mins',
          type: 'warmup',
          desc: 'Read aloud with clear consonant pronunciation and steady rhythm:',
          content:
            '“Clear communication is not about speaking quickly; it is about articulating each thought with clarity and intention.”',
        },
        {
          title: 'Step 2: 8-Minute Interactive Speaking Practice',
          time: '8 Mins',
          type: 'coach',
          desc: 'Complete 3 multi-turn exchanges with your AI Speaking Coach on today’s curated topic: "Tech, AI & Future Careers".',
          content: 'Focus: Eliminate filler words (like "um", "basically") and use structured transition phrases.',
        },
        {
          title: 'Step 3: 5-Minute Targeted Grammar & Vocab Drill',
          time: '5 Mins',
          type: 'grammar',
          desc: 'Solve 3 questions on overcoming mother tongue translation traps and master 2 new placement words.',
          content: 'Focus: Avoid saying "I am having doubt" or "discuss about". Use "I have a question" and "discuss".',
        },
        {
          title: 'Step 4: 5-Minute Real-World Simulation Challenge',
          time: '5 Mins',
          type: 'roleplay',
          desc: 'Complete one full role-play: "Asking a Professor for Clarification during Office Hours".',
          content: 'Goal: Achieve at least 80/100 communication score in your final performance report.',
        },
      ];

  const handleNextStep = () => {
    if (currentStep < routineSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark routine complete
      storageService.addSession({
        id: 'routine-' + Date.now(),
        type: 'daily_plan',
        topic: isExpressMode ? '5-Min Express Plan' : 'Standard Daily Routine',
        date: new Date().toISOString(),
        durationSeconds: isExpressMode ? 300 : 900,
        metrics: {
          clarity: 9,
          fluency: 8,
          grammar: 8,
          vocabulary: 8,
        },
        turnsCount: routineSteps.length,
      });
      onCompletePlan();
      onClose();
    }
  };

  const handleLaunchAssociatedModule = (type: string) => {
    onClose();
    if (type === 'coach') onNavigateTo('coach');
    else if (type === 'grammar') onNavigateTo('grammar');
    else if (type === 'vocab') onNavigateTo('vocabulary');
    else if (type === 'roleplay') onNavigateTo('roleplay');
  };

  const currentRoutine = routineSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Today’s Personalized Daily Practice Routine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tailored for {userProfile.name} • Level: {userProfile.englishLevel}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch: Standard 15-20 Min vs 5 Min Express */}
        <div className="px-6 pt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Select Routine Duration:
          </span>
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => {
                setIsExpressMode(false);
                setCurrentStep(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                !isExpressMode
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Standard (15–20 Mins)
            </button>
            <button
              onClick={() => {
                setIsExpressMode(true);
                setCurrentStep(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                isExpressMode
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              5-Min Express (Busy Day)
            </button>
          </div>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>
              Step {currentStep + 1} of {routineSteps.length}
            </span>
            <span className="font-semibold text-teal-600 dark:text-teal-400">
              {currentRoutine.time}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-teal-500 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / routineSteps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 flex-1">
          <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40">
            <h4 className="font-bold text-sm text-teal-900 dark:text-teal-200">
              {currentRoutine.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {currentRoutine.desc}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Exercise Prompt:
              </span>
              <button
                onClick={() => speechService.speak(currentRoutine.content)}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Prompt</span>
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white italic">
              {currentRoutine.content}
            </p>
          </div>

          {currentRoutine.type !== 'warmup' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                Ready to do this in the interactive workspace?
              </span>
              <button
                onClick={() => handleLaunchAssociatedModule(currentRoutine.type)}
                className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>Open Dedicated Workspace</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30"
          >
            Previous
          </button>

          <button
            onClick={handleNextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20"
          >
            <span>
              {currentStep < routineSteps.length - 1
                ? 'Mark Step Done & Next'
                : 'Complete Today’s Routine! 🎉'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
