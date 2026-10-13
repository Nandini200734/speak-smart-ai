import { Badge, PracticeSession } from '../types';

const UNLOCKED_BADGES_KEY = 'speaksmart_unlocked_badges_v1';

interface UnlockedRecord {
  [badgeId: string]: string; // ISO date string
}

export const BADGE_DEFINITIONS: Array<{
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  category: 'streak' | 'speaking' | 'vocabulary' | 'grammar' | 'roleplay' | 'special';
  target: number;
  evaluate: (context: {
    sessions: PracticeSession[];
    streak: number;
    totalMinutes: number;
    savedVocabCount: number;
  }) => { progress: number; unlocked: boolean };
}> = [
  {
    id: 'first-breakthrough',
    name: 'First Breakthrough',
    description: 'Completed your very first English practice session with SpeakSmart AI.',
    icon: '🚀',
    rarity: 'Bronze',
    category: 'speaking',
    target: 1,
    evaluate: ({ sessions }) => ({
      progress: Math.min(sessions.length, 1),
      unlocked: sessions.length >= 1,
    }),
  },
  {
    id: 'consistency-king',
    name: 'Consistency King',
    description: 'Built a 3-day continuous practice streak without skipping a day.',
    icon: '👑',
    rarity: 'Silver',
    category: 'streak',
    target: 3,
    evaluate: ({ streak }) => ({
      progress: Math.min(streak, 3),
      unlocked: streak >= 3,
    }),
  },
  {
    id: 'streak-legend',
    name: 'Streak Legend',
    description: 'Maintained a flawless 7-day practice streak of daily English training.',
    icon: '⚡',
    rarity: 'Gold',
    category: 'streak',
    target: 7,
    evaluate: ({ streak }) => ({
      progress: Math.min(streak, 7),
      unlocked: streak >= 7,
    }),
  },
  {
    id: 'vocabulary-pro',
    name: 'Vocabulary Pro',
    description: 'Saved at least 5 high-impact campus & career words to your notebook.',
    icon: '📚',
    rarity: 'Silver',
    category: 'vocabulary',
    target: 5,
    evaluate: ({ savedVocabCount }) => ({
      progress: Math.min(savedVocabCount, 5),
      unlocked: savedVocabCount >= 5,
    }),
  },
  {
    id: 'word-master',
    name: 'Word Master',
    description: 'Curated 10+ advanced words in your personal vocabulary repository.',
    icon: '🧠',
    rarity: 'Gold',
    category: 'vocabulary',
    target: 10,
    evaluate: ({ savedVocabCount }) => ({
      progress: Math.min(savedVocabCount, 10),
      unlocked: savedVocabCount >= 10,
    }),
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Woke up your voice and practiced English before 9:00 AM.',
    icon: '🌅',
    rarity: 'Silver',
    category: 'special',
    target: 1,
    evaluate: ({ sessions }) => {
      const hasEarlySession = sessions.some((s) => {
        const date = new Date(s.date);
        const hour = date.getHours();
        return hour >= 5 && hour < 9;
      });
      return {
        progress: hasEarlySession ? 1 : 0,
        unlocked: hasEarlySession,
      };
    },
  },
  {
    id: 'night-owl-scholar',
    name: 'Night Owl Scholar',
    description: 'Committed to excellence with a focused practice session after 9:00 PM.',
    icon: '🦉',
    rarity: 'Bronze',
    category: 'special',
    target: 1,
    evaluate: ({ sessions }) => {
      const hasNightSession = sessions.some((s) => {
        const hour = new Date(s.date).getHours();
        return hour >= 21 || hour < 4;
      });
      return {
        progress: hasNightSession ? 1 : 0,
        unlocked: hasNightSession,
      };
    },
  },
  {
    id: 'grammar-guru',
    name: 'Grammar Guru',
    description: 'Completed 3 targeted grammar drills conquering common student pitfalls.',
    icon: '🎯',
    rarity: 'Silver',
    category: 'grammar',
    target: 3,
    evaluate: ({ sessions }) => {
      const count = sessions.filter((s) => s.type === 'grammar').length;
      return {
        progress: Math.min(count, 3),
        unlocked: count >= 3,
      };
    },
  },
  {
    id: 'roleplay-maestro',
    name: 'Role-Play Maestro',
    description: 'Stepped into 3 real-world campus or placement interview simulations.',
    icon: '🎭',
    rarity: 'Gold',
    category: 'roleplay',
    target: 3,
    evaluate: ({ sessions }) => {
      const count = sessions.filter((s) => s.type === 'roleplay').length;
      return {
        progress: Math.min(count, 3),
        unlocked: count >= 3,
      };
    },
  },
  {
    id: 'jam-champion',
    name: 'JAM Champion',
    description: 'Completed an impromptu 60-second speech under the Just-A-Minute pressure.',
    icon: '⏱️',
    rarity: 'Silver',
    category: 'speaking',
    target: 1,
    evaluate: ({ sessions }) => {
      const count = sessions.filter((s) => s.type === 'public_speaking').length;
      return {
        progress: Math.min(count, 1),
        unlocked: count >= 1,
      };
    },
  },
  {
    id: 'fluent-orator',
    name: 'Fluent Orator',
    description: 'Accumulated over 30 total minutes of active English speaking practice.',
    icon: '🎙️',
    rarity: 'Gold',
    category: 'speaking',
    target: 30,
    evaluate: ({ totalMinutes }) => ({
      progress: Math.min(totalMinutes, 30),
      unlocked: totalMinutes >= 30,
    }),
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Achieved mastery by completing 10 full practice sessions.',
    icon: '💎',
    rarity: 'Diamond',
    category: 'special',
    target: 10,
    evaluate: ({ sessions }) => ({
      progress: Math.min(sessions.length, 10),
      unlocked: sessions.length >= 10,
    }),
  },
];

export const badgeService = {
  getUnlockedRecords(): UnlockedRecord {
    try {
      const raw = localStorage.getItem(UNLOCKED_BADGES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveUnlockedRecords(records: UnlockedRecord): void {
    try {
      localStorage.setItem(UNLOCKED_BADGES_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save unlocked badge records', e);
    }
  },

  calculateBadges(context: {
    sessions: PracticeSession[];
    streak: number;
    totalMinutes: number;
    savedVocabCount: number;
  }): { badges: Badge[]; newlyUnlocked: Badge[] } {
    const existingRecords = this.getUnlockedRecords();
    const updatedRecords = { ...existingRecords };
    const newlyUnlocked: Badge[] = [];

    const badges: Badge[] = BADGE_DEFINITIONS.map((def) => {
      const { progress, unlocked } = def.evaluate(context);
      let unlockedAt = updatedRecords[def.id];

      if (unlocked && !unlockedAt) {
        unlockedAt = new Date().toISOString();
        updatedRecords[def.id] = unlockedAt;
      }

      const badgeObj: Badge = {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        rarity: def.rarity,
        category: def.category,
        unlocked,
        unlockedAt,
        progress: {
          current: progress,
          target: def.target,
        },
      };

      if (unlocked && !existingRecords[def.id]) {
        newlyUnlocked.push(badgeObj);
      }

      return badgeObj;
    });

    if (newlyUnlocked.length > 0) {
      this.saveUnlockedRecords(updatedRecords);
    }

    return { badges, newlyUnlocked };
  },
};
