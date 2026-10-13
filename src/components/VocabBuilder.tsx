import React, { useState } from 'react';
import {
  BookA,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  PenTool,
  RotateCcw,
  Search,
} from 'lucide-react';
import { UserProfile, VocabWord, EnglishLevel } from '../types';
import { VOCABULARY_LIST } from '../data/mockData';
import { speechService } from '../services/speechService';
import { storageService } from '../services/storageService';

interface VocabBuilderProps {
  userProfile: UserProfile;
  onSessionComplete?: () => void;
}

export const VocabBuilder: React.FC<VocabBuilderProps> = ({
  userProfile,
  onSessionComplete,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<EnglishLevel | 'All'>('Intermediate');
  const [activeWord, setActiveWord] = useState<VocabWord>(VOCABULARY_LIST[0]);
  const [savedWords, setSavedWords] = useState<string[]>(storageService.getSavedVocab());
  const [userSentence, setUserSentence] = useState('');
  const [sentenceEvaluation, setSentenceEvaluation] = useState<{
    isCorrect: boolean;
    feedback: string;
    improvedVersion: string;
    rating: number;
  } | null>(null);
  const [isCheckingSentence, setIsCheckingSentence] = useState(false);
  const [viewMode, setViewMode] = useState<'study' | 'saved' | 'quiz'>('study');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedQuizChoice, setSelectedQuizChoice] = useState<string | null>(null);

  const filteredWords = VOCABULARY_LIST.filter((w) => {
    if (viewMode === 'saved') return savedWords.includes(w.id);
    if (selectedLevel === 'All') return true;
    return w.level === selectedLevel;
  });

  const toggleSave = (wordId: string) => {
    const isNowSaved = storageService.toggleSaveVocab(wordId);
    setSavedWords(storageService.getSavedVocab());
  };

  const handleSpeak = (text: string) => {
    speechService.speak(text);
  };

  const handleCheckSentence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSentence.trim() || isCheckingSentence) return;

    setIsCheckingSentence(true);
    setSentenceEvaluation(null);

    try {
      const res = await fetch('/api/vocabulary/check-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: activeWord.word,
          sentence: userSentence.trim(),
          definition: activeWord.meaning,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setSentenceEvaluation(data.data);

        // Record practice session
        storageService.addSession({
          id: 'vocab-' + Date.now(),
          type: 'vocab',
          topic: `Word Practice: ${activeWord.word}`,
          date: new Date().toISOString(),
          durationSeconds: 120,
          metrics: {
            clarity: 8,
            fluency: 8,
            grammar: data.data.isCorrect ? 9 : 7,
            vocabulary: 9,
          },
          turnsCount: 1,
        });

        onSessionComplete?.();
      }
    } catch (e) {
      console.error(e);
      setSentenceEvaluation({
        isCorrect: userSentence.toLowerCase().includes(activeWord.word.toLowerCase()),
        feedback: 'Good attempt incorporating the word! Continue applying it in speech.',
        improvedVersion: userSentence,
        rating: 4,
      });
    } finally {
      setIsCheckingSentence(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                📚
              </span>
              Campus & Career Vocabulary Builder
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Learn 5 high-impact words per session with college context, audio pronunciation, and interactive sentence checks.
            </p>
          </div>

          {/* View Modes */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('study')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'study'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Study Words
            </button>
            <button
              onClick={() => setViewMode('saved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'saved'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              <span>Saved ({savedWords.length})</span>
            </button>
          </div>
        </div>

        {/* Level Filters */}
        {viewMode === 'study' && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Level:</span>
            {(['Beginner', 'Intermediate', 'Advanced', 'All'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedLevel === lvl
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Study Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Word List Column */}
        <div className="lg:col-span-5 space-y-2">
          {filteredWords.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No saved vocabulary words found yet. Bookmark words during your practice to review them here!
            </div>
          ) : (
            filteredWords.map((word) => {
              const isSelected = activeWord.id === word.id;
              const isBookmarked = savedWords.includes(word.id);
              return (
                <div
                  key={word.id}
                  onClick={() => {
                    setActiveWord(word);
                    setUserSentence('');
                    setSentenceEvaluation(null);
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/50 shadow-xs ring-1 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {word.word}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {word.phonetic}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {word.meaning}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(word.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark word'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Word Details & Sentence Sandbox */}
        <div className="lg:col-span-7">
          {activeWord && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
              {/* Word Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {activeWord.word}
                    </h3>
                    <button
                      onClick={() => handleSpeak(activeWord.word)}
                      className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 hover:scale-105 transition-all"
                      title="Listen to pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-teal-600 dark:text-teal-400">
                      {activeWord.phonetic}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs italic text-slate-500 dark:text-slate-400">
                      {activeWord.partOfSpeech}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {activeWord.level}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSave(activeWord.id)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    savedWords.includes(activeWord.id)
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{savedWords.includes(activeWord.id) ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              {/* Definition */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Meaning:
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {activeWord.meaning}
                </p>
              </div>

              {/* College Context Example */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  In a College / Placement Context:
                </span>
                <p className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 text-slate-800 dark:text-slate-200 italic">
                  “{activeWord.collegeContextExample}”
                </p>
              </div>

              {/* Collocations */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Natural Collocations (Words that go together):
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeWord.collocations.map((col, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive Sentence Building Sandbox */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <PenTool className="w-3.5 h-3.5 text-teal-600" />
                  <span>Practice: Write Your Own Sentence Using "{activeWord.word}"</span>
                </div>

                <form onSubmit={handleCheckSentence} className="space-y-2">
                  <textarea
                    value={userSentence}
                    onChange={(e) => setUserSentence(e.target.value)}
                    placeholder={`e.g. Try writing a sentence describing a campus seminar or tech project using "${activeWord.word}"...`}
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400 resize-none"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!userSentence.trim() || isCheckingSentence}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isCheckingSentence ? 'Analyzing...' : 'Check My Sentence'}</span>
                    </button>
                  </div>
                </form>

                {/* Sentence Evaluation Feedback */}
                {sentenceEvaluation && (
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-2 animate-fadeIn ${
                      sentenceEvaluation.isCorrect
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                        : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5">
                        {sentenceEvaluation.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <HelpCircle className="w-4 h-4 text-amber-600" />
                        )}
                        <span>
                          {sentenceEvaluation.isCorrect
                            ? 'Excellent Usage!'
                            : 'Good Attempt — Refinement Suggested'}
                        </span>
                      </div>
                      <span>★ {sentenceEvaluation.rating}/5</span>
                    </div>

                    <p className="leading-relaxed">{sentenceEvaluation.feedback}</p>

                    {sentenceEvaluation.improvedVersion && (
                      <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60">
                        <span className="font-bold text-[10px] uppercase text-teal-700 dark:text-teal-400 block mb-0.5">
                          Polished Version:
                        </span>
                        <p className="italic">"{sentenceEvaluation.improvedVersion}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
