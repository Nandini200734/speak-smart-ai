import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Mic,
  GraduationCap,
  Target,
  Clock,
  Globe,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, EnglishLevel } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile, baselineAnswer?: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(0);
  const [name, setName] = useState('College Scholar');
  const [englishLevel, setEnglishLevel] = useState<EnglishLevel>('Intermediate');
  const [nativeLanguage, setNativeLanguage] = useState('Hindi');
  const [selectedSituations, setSelectedSituations] = useState<string[]>([
    'Group discussions (GD)',
    'Explaining technical code/projects',
  ]);
  const [dailyMinutes, setDailyMinutes] = useState<number>(15);
  const [goal, setGoal] = useState('Speak fluently without translating in my head');
  const [baselineResponse, setBaselineResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const situationsList = [
    'Group discussions (GD)',
    'Campus placements & HR interviews',
    'Explaining technical code/projects',
    'Answering professors in class',
    'Giving seminar presentations',
    'Casual canteen small talk & networking',
  ];

  const goalsList = [
    'Speak fluently without translating in my head',
    'Eliminate grammar and preposition mistakes',
    'Crack technical campus placement interviews',
    'Overcome fear of speaking up in front of groups',
    'Sound natural, professional, and confident',
  ];

  const toggleSituation = (item: string) => {
    if (selectedSituations.includes(item)) {
      setSelectedSituations(selectedSituations.filter((s) => s !== item));
    } else {
      setSelectedSituations([...selectedSituations, item]);
    }
  };

  const handleFinish = () => {
    setIsSubmitting(true);
    const profile: UserProfile = {
      name: name.trim() || 'Student',
      englishLevel,
      nativeLanguage,
      difficultSituations: selectedSituations,
      dailyMinutes,
      goal,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    };
    setTimeout(() => {
      onComplete(profile, baselineResponse);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Progress Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              Step {step + 1} of 6
            </span>
            <span>{Math.round(((step + 1) / 6) * 100)}% completed</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 0 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800/60 mx-auto flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  SpeakSmart AI
                </h2>
                <p className="text-base font-medium text-teal-700 dark:text-teal-300 mt-1">
                  “Small conversations. Stronger confidence. Better communication.”
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
                  A personalized trainer built for college students to build English fluency, eliminate grammar doubts, and excel in interviews and group discussions.
                </p>
              </div>

              <div className="pt-2 text-left max-w-sm mx-auto">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya or Alex"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Private & supportive practice environment. No judgment.</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  What is your current English speaking comfort level?
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Be honest! We adapt our feedback and speaking pace to support you.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  {
                    level: 'Beginner' as EnglishLevel,
                    title: 'Beginner — Hesitant & Translating',
                    desc: 'I understand English well, but I pause a lot, search for words, and translate from my mother tongue in my head.',
                  },
                  {
                    level: 'Intermediate' as EnglishLevel,
                    title: 'Intermediate — Conversational but Inconsistent',
                    desc: 'I can speak casually with friends, but I get nervous during presentations, GDs, and formal technical interviews.',
                  },
                  {
                    level: 'Advanced' as EnglishLevel,
                    title: 'Advanced — Polishing for Leadership',
                    desc: 'I speak comfortably, but want to elevate my vocabulary, persuasive structure, and professional executive presence.',
                  },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setEnglishLevel(item.level)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      englishLevel === item.level
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/50 text-slate-900 dark:text-white ring-2 ring-teal-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-sm">
                      <span>{item.title}</span>
                      {englishLevel === item.level && (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  What is your primary native language?
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Knowing your background helps SpeakSmart detect Mother Tongue Influence (MTI) and provide helpful translation hints.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {[
                  'Hindi',
                  'Telugu',
                  'Tamil',
                  'Kannada',
                  'Marathi',
                  'Bengali',
                  'Gujarati',
                  'Malayalam',
                  'Punjabi',
                  'Spanish',
                  'French',
                  'Mandarin',
                  'Arabic',
                  'German',
                  'Other',
                ].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setNativeLanguage(lang)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all text-center ${
                      nativeLanguage === lang
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Where do you feel the most hesitation while speaking?
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select all that apply to help us prioritize role-plays and exercises.
              </p>

              <div className="space-y-2 pt-2">
                {situationsList.map((sit) => {
                  const isChecked = selectedSituations.includes(sit);
                  return (
                    <button
                      key={sit}
                      type="button"
                      onClick={() => toggleSituation(sit)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 text-slate-900 dark:text-white font-medium'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{sit}</span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isChecked
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Daily commitment & 30-day primary goal
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Daily Practice Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { mins: 5, label: '5 Mins', tag: 'Express' },
                    { mins: 15, label: '15 Mins', tag: 'Recommended' },
                    { mins: 25, label: '25 Mins', tag: 'Deep Dive' },
                  ].map((item) => (
                    <button
                      key={item.mins}
                      type="button"
                      onClick={() => setDailyMinutes(item.mins)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        dailyMinutes === item.mins
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      <div className="text-sm font-bold">{item.label}</div>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400">{item.tag}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  What is your primary 30-day target?
                </label>
                <div className="space-y-2">
                  {goalsList.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGoal(g)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all ${
                        goal === g
                          ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/50 font-semibold text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Baseline Speaking Assessment
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                To calibrate your coach, answer this simple question in 2–3 sentences. Type or use voice.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="text-xs font-semibold uppercase text-teal-600 dark:text-teal-400 mb-1">
                  Coach Assessment Prompt:
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  “Tell me about a college project or a hobby you genuinely enjoy doing, and why it interests you.”
                </p>
              </div>

              <div>
                <textarea
                  value={baselineResponse}
                  onChange={(e) => setBaselineResponse(e.target.value)}
                  placeholder="e.g. I am really passionate about machine learning because it solves real campus problems like automated attendance. Recently, my team built a computer vision prototype..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400"
                />
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Don’t worry about grammar or perfection! SpeakSmart will use this to generate your tailored starting roadmap.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 transition-all hover:translate-x-0.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Calibrating...' : 'Start Practising'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
