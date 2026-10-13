import { UserProfile, PracticeSession, VocabWord } from '../types';

const PROFILE_KEY = 'speaksmart_user_profile';
const SESSIONS_KEY = 'speaksmart_practice_sessions';
const SAVED_VOCAB_KEY = 'speaksmart_saved_vocab';
const RECURRING_MISTAKES_KEY = 'speaksmart_recurring_mistakes';
const THEME_KEY = 'speaksmart_theme_mode';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Student',
  englishLevel: 'Intermediate',
  nativeLanguage: 'Hindi',
  difficultSituations: ['Group discussions', 'Explaining tech projects', 'Asking professors'],
  dailyMinutes: 15,
  goal: 'Speak fluently in campus placements and interviews without hesitation',
  onboardingCompleted: false,
  createdAt: new Date().toISOString(),
};

export const storageService = {
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    }
    return DEFAULT_PROFILE;
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  getSessions(): PracticeSession[] {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load sessions', e);
    }
    return [];
  },

  addSession(session: PracticeSession): void {
    try {
      const current = this.getSessions();
      current.unshift(session);
      // Keep up to 100 sessions
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(current.slice(0, 100)));
    } catch (e) {
      console.error('Failed to add session', e);
    }
  },

  getStats() {
    const sessions = this.getSessions();
    const totalMinutes = sessions.reduce((acc, s) => acc + Math.round((s.durationSeconds || 60) / 60), 0);
    const totalSessions = sessions.length;

    // Calculate streak
    let streak = 0;
    const dates = new Set(
      sessions.map((s) => new Date(s.date).toISOString().split('T')[0])
    );

    const today = new Date();
    let checkDate = new Date(today);

    // If practiced today, start streak from today, else check if practiced yesterday
    const todayStr = checkDate.toISOString().split('T')[0];
    const practicedToday = dates.has(todayStr);

    if (!practicedToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (dates.has(checkDate.toISOString().split('T')[0])) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Average metrics
    let claritySum = 0;
    let fluencySum = 0;
    let grammarSum = 0;
    let vocabSum = 0;
    let count = 0;

    sessions.forEach((s) => {
      if (s.metrics) {
        claritySum += s.metrics.clarity || 7;
        fluencySum += s.metrics.fluency || 7;
        grammarSum += s.metrics.grammar || 7;
        vocabSum += s.metrics.vocabulary || 7;
        count++;
      }
    });

    const averageMetrics = {
      clarity: count ? +(claritySum / count).toFixed(1) : 7.2,
      fluency: count ? +(fluencySum / count).toFixed(1) : 6.8,
      grammar: count ? +(grammarSum / count).toFixed(1) : 7.4,
      vocabulary: count ? +(vocabSum / count).toFixed(1) : 7.1,
      overall: count ? +((claritySum + fluencySum + grammarSum + vocabSum) / (count * 4) * 10).toFixed(0) : 71,
    };

    return {
      totalMinutes,
      totalSessions,
      streak: Math.max(streak, practicedToday ? 1 : 0),
      practicedToday,
      averageMetrics,
    };
  },

  getSavedVocab(): string[] {
    try {
      const data = localStorage.getItem(SAVED_VOCAB_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  toggleSaveVocab(wordId: string): boolean {
    const list = this.getSavedVocab();
    const exists = list.includes(wordId);
    const updated = exists ? list.filter((id) => id !== wordId) : [...list, wordId];
    try {
      localStorage.setItem(SAVED_VOCAB_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return !exists;
  },

  getRecurringMistakes(): string[] {
    try {
      const data = localStorage.getItem(RECURRING_MISTAKES_KEY);
      return data ? JSON.parse(data) : [
        'Overusing "discuss about" instead of "discuss"',
        'Mixing past simple with present continuous',
        'Subject-verb agreement with collective groups',
      ];
    } catch {
      return [];
    }
  },

  addRecurringMistake(mistake: string): void {
    const list = this.getRecurringMistakes();
    if (!list.includes(mistake)) {
      list.unshift(mistake);
      localStorage.setItem(RECURRING_MISTAKES_KEY, JSON.stringify(list.slice(0, 15)));
    }
  },

  getDarkMode(): boolean {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  },

  setDarkMode(isDark: boolean): void {
    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    } catch (e) {
      console.error(e);
    }
  },

  clearAllData(): void {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(SESSIONS_KEY);
    localStorage.removeItem(SAVED_VOCAB_KEY);
    localStorage.removeItem(RECURRING_MISTAKES_KEY);
  },
};
