import React, { useState } from 'react';
import {
  Settings,
  X,
  User,
  GraduationCap,
  Globe,
  Clock,
  Target,
  Volume2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile, EnglishLevel } from '../types';
import { storageService } from '../services/storageService';
import { speechService } from '../services/speechService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  darkMode,
  onToggleDarkMode,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [level, setLevel] = useState<EnglishLevel>(userProfile.englishLevel);
  const [nativeLang, setNativeLang] = useState(userProfile.nativeLanguage);
  const [dailyMinutes, setDailyMinutes] = useState(userProfile.dailyMinutes);
  const [goal, setGoal] = useState(userProfile.goal);
  const [speechRate, setSpeechRate] = useState(0.95);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: UserProfile = {
      ...userProfile,
      name: name.trim() || 'Student',
      englishLevel: level,
      nativeLanguage: nativeLang,
      dailyMinutes,
      goal,
    };
    storageService.saveUserProfile(updated);
    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleTestVoice = () => {
    speechService.speak('Hello! This is SpeakSmart AI speaking at your selected pace.', {
      rate: speechRate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Coach Settings & Preferences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Name / Nickname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Level */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              English Proficiency Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`p-2.5 rounded-xl border font-semibold transition-all ${
                    level === lvl
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Native Language */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Native Language (for Mother Tongue translation assistance)
            </label>
            <select
              value={nativeLang}
              onChange={(e) => setNativeLang(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
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
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Daily Minutes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Daily Target Commitment
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 15, 25].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDailyMinutes(mins)}
                  className={`p-2.5 rounded-xl border font-semibold transition-all ${
                    dailyMinutes === mins
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
          </div>

          {/* Primary Goal */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              30-Day Primary Speaking Goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Spoken Voice Rate Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Coach Spoken Voice Pace: {speechRate}x
              </label>
              <button
                type="button"
                onClick={handleTestVoice}
                className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Volume2 className="w-3 h-3" />
                <span>Test Voice</span>
              </button>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              All settings are stored locally. Gemini API keys are secured strictly on the backend.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
