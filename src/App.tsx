import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SpeakingCoach } from './components/SpeakingCoach';
import { RolePlay } from './components/RolePlay';
import { GrammarCoach } from './components/GrammarCoach';
import { VocabBuilder } from './components/VocabBuilder';
import { PublicSpeakingGD } from './components/PublicSpeakingGD';
import { ProgressTracker } from './components/ProgressTracker';
import { OnboardingModal } from './components/OnboardingModal';
import { DailyPlanModal } from './components/DailyPlanModal';
import { SettingsModal } from './components/SettingsModal';
import { Sparkles, Shield, Heart } from 'lucide-react';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    storageService.getUserProfile()
  );
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() =>
    !userProfile.onboardingCompleted
  );
  const [showDailyPlan, setShowDailyPlan] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() =>
    storageService.getDarkMode()
  );
  const [stats, setStats] = useState(() => storageService.getStats());

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    storageService.setDarkMode(nextDark);
  };

  const handleRefreshStats = () => {
    setStats(storageService.getStats());
  };

  const handleOnboardingComplete = (profile: UserProfile, baselineAnswer?: string) => {
    setUserProfile(profile);
    storageService.saveUserProfile(profile);
    setShowOnboarding(false);
    handleRefreshStats();

    // If student gave a baseline answer, take them directly into Speaking Coach
    if (baselineAnswer?.trim()) {
      setCurrentTab('coach');
    }
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    storageService.saveUserProfile(updated);
    handleRefreshStats();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-teal-500/30 selection:text-teal-900 dark:selection:text-teal-200">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userProfile={userProfile}
        stats={stats}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            userProfile={userProfile}
            stats={stats}
            onNavigateTo={setCurrentTab}
            onOpenDailyPlan={() => setShowDailyPlan(true)}
          />
        )}

        {currentTab === 'coach' && (
          <SpeakingCoach
            userProfile={userProfile}
            onSessionComplete={handleRefreshStats}
          />
        )}

        {currentTab === 'roleplay' && (
          <RolePlay
            userProfile={userProfile}
            onSessionComplete={handleRefreshStats}
          />
        )}

        {currentTab === 'grammar' && (
          <GrammarCoach
            userProfile={userProfile}
            onSessionComplete={handleRefreshStats}
          />
        )}

        {currentTab === 'vocabulary' && (
          <VocabBuilder
            userProfile={userProfile}
            onSessionComplete={handleRefreshStats}
          />
        )}

        {currentTab === 'public_speaking' && (
          <PublicSpeakingGD
            userProfile={userProfile}
            onSessionComplete={handleRefreshStats}
          />
        )}

        {currentTab === 'progress' && (
          <ProgressTracker
            userProfile={userProfile}
            onRefreshData={handleRefreshStats}
            onNavigateToTab={setCurrentTab}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              SpeakSmart AI
            </span>
            <span>—</span>
            <span>Your Personal Communication Coach for College & Career Fluency</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setShowSettings(true)}
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              Privacy & Settings
            </button>
            <span>•</span>
            <span className="text-slate-400">
              Powered by Google AI Studio & Gemini 3.8 Flash
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      <DailyPlanModal
        isOpen={showDailyPlan}
        onClose={() => setShowDailyPlan(false)}
        userProfile={userProfile}
        onNavigateTo={setCurrentTab}
        onCompletePlan={handleRefreshStats}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
    </div>
  );
}
