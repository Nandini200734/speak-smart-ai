export type EnglishLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface UserProfile {
  name: string;
  englishLevel: EnglishLevel;
  nativeLanguage: string;
  difficultSituations: string[];
  dailyMinutes: number; // 5, 15, or 25
  goal: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface EstimatedMetrics {
  clarity: number; // 1-10
  fluency: number; // 1-10
  grammar: number; // 1-10
  vocabulary: number; // 1-10
  structure?: number; // 1-10
  confidence?: number;
}

export interface GrammarExplanation {
  point: string;
  why: string;
  example?: string;
}

export interface CoachFeedback {
  original: string;
  corrected: string;
  naturalAlternative: string;
  explanations: GrammarExplanation[];
  praise: string;
  nativeLanguageHint?: string;
  recurringPattern?: string;
  estimatedMetrics: EstimatedMetrics;
}

export interface ChatMessage {
  id: string;
  role: 'coach' | 'user' | 'assistant';
  content: string;
  timestamp: string;
  feedback?: CoachFeedback | null;
  audioDuration?: number;
}

export interface RoleplayScenario {
  id: string;
  title: string;
  category: 'academic' | 'campus' | 'career' | 'discussion';
  description: string;
  characterName: string;
  characterRole: string;
  characterAvatar: string;
  initialPrompt: string;
  learningObjectives: string[];
}

export interface RoleplayEvaluation {
  summary: string;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  suggestedPhrases: string[];
  metrics: {
    confidence: number;
    relevance: number;
    professionalTone: number;
    clarity: number;
  };
}

export interface VocabWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  collegeContextExample: string;
  collocations: string[];
  level: EnglishLevel;
  category: string;
  isSaved?: boolean;
}

export interface PracticeSession {
  id: string;
  type: 'speaking_coach' | 'roleplay' | 'public_speaking' | 'grammar' | 'vocab' | 'daily_plan';
  topic: string;
  date: string;
  durationSeconds: number;
  metrics: EstimatedMetrics;
  turnsCount: number;
  transcriptSummary?: string;
}

export interface GrammarQuizQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GrammarModule {
  id: string;
  title: string;
  tag: string;
  ruleExplanation: string;
  commonPitfall: string;
  questions: GrammarQuizQuestion[];
}

export interface SpeechEvaluationResult {
  pacingFeedback: string;
  estimatedWpm: number;
  wordCount: number;
  durationSeconds: number;
  overallScore: number;
  metrics: {
    organization: number;
    clarity: number;
    relevance: number;
    fluency: number;
    vocabulary: number;
  };
  structureAnalysis: {
    introduction: string;
    bodyPoints: string;
    conclusion: string;
  };
  strengths: string[];
  actionableTips: string[];
  modelSpeechSnippet: string;
}

export type BadgeRarity = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
export type BadgeCategory = 'streak' | 'speaking' | 'vocabulary' | 'grammar' | 'roleplay' | 'special';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  unlocked: boolean;
  unlockedAt?: string;
  progress: {
    current: number;
    target: number;
  };
}
