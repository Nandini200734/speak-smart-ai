import React from 'react';
import {
  Sparkles,
  Flame,
  Clock,
  ArrowRight,
  MessageSquare,
  Users,
  BookOpen,
  BookA,
  Mic,
  TrendingUp,
  Target,
  Award,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types';
import { badgeService } from '../services/badgeService';
import { storageService } from '../services/storageService';

interface DashboardProps {
  userProfile: UserProfile;
  stats: {
    streak: number;
    totalMinutes: number;
    totalSessions: number;
    practicedToday: boolean;
    averageMetrics: {
      clarity: number;
      fluency: number;
      grammar: number;
      vocabulary: number;
      overall: number;
    };
  };
  onNavigateTo: (tab: string) => void;
  onOpenDailyPlan: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProfile,
  stats,
  onNavigateTo,
  onOpenDailyPlan,
}) => {
  // Personalized greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Today's dynamic challenge
  const todaysChallenge = {
    title: '60-Second Impromptu Speech: “Will AI Replace Junior Software Engineers?”',
    category: 'Public Speaking & GD',
    timeEst: '2 Mins',
    route: 'public_speaking',
    desc: 'Speak for one continuous minute. Focus on opening with a clear stance and connecting your arguments without filler words.',
  };

  const featureCards = [
    {
      id: 'coach',
      title: 'AI Speaking Coach',
      desc: 'One-on-one conversational practice with live speech input, grammar corrections, and natural phrasing tips.',
      icon: MessageSquare,
      badge: 'Interactive',
      gradient: 'from-teal-500/10 to-blue-500/10',
      iconColor: 'text-teal-600 dark:text-teal-400',
      borderColor: 'border-teal-200/80 dark:border-teal-800/80',
    },
    {
      id: 'roleplay',
      title: 'Real-Life Role-Play',
      desc: 'Practice office hours with professors, campus seniors, HR interviews, and competitive placement GDs.',
      icon: Users,
      badge: '7 Scenarios',
      gradient: 'from-blue-500/10 to-indigo-500/10',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200/80 dark:border-blue-800/80',
    },
    {
      id: 'public_speaking',
      title: 'Public Speaking & GD',
      desc: 'Just-A-Minute (JAM) impromptu speaking, 15s prep timers, debate frameworks, and WPM pace evaluation.',
      icon: Mic,
      badge: 'JAM & GD',
      gradient: 'from-amber-500/10 to-orange-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-200/80 dark:border-amber-800/80',
    },
    {
      id: 'grammar',
      title: 'Grammar Coach',
      desc: 'Learn through real student mistakes: tenses, articles, prepositions, and eliminating mother tongue translation traps.',
      icon: BookOpen,
      badge: 'Targeted Drills',
      gradient: 'from-emerald-500/10 to-teal-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200/80 dark:border-emerald-800/80',
    },
    {
      id: 'vocabulary',
      title: 'Vocabulary Builder',
      desc: '5 curated campus & career words with audio pronunciation and interactive sentence validation sandbox.',
      icon: BookA,
      badge: 'Placement Vocab',
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200/80 dark:border-purple-800/80',
    },
    {
      id: 'progress',
      title: 'Progress & Analytics',
      desc: 'Review past session transcripts, fluency trajectory, recurring habits, and download practice records.',
      icon: Award,
      badge: 'Skill Insights',
      gradient: 'from-cyan-500/10 to-blue-500/10',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      borderColor: 'border-cyan-200/80 dark:border-cyan-800/80',
    },
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI English Communication Trainer</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {getGreeting()}, <span className="text-teal-400">{userProfile.name}</span>!
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            “Small conversations. Stronger confidence. Better communication.”
            <br className="hidden sm:inline" /> Ready for your {userProfile.dailyMinutes}-minute daily speaking booster?
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenDailyPlan}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-slate-950 font-extrabold text-sm shadow-lg shadow-teal-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Start Today’s Routine</span>
            </button>

            <button
              onClick={() => onNavigateTo('coach')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm border border-white/15 transition-all"
            >
              <span>Quick Speaking Practice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Daily Streak</div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}
            </div>
            <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
              {stats.practicedToday ? 'Streak active today' : 'Needs practice today'}
            </div>
          </div>
        </div>

        {/* Practice Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Practice Time</div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalMinutes} Mins
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Goal: {userProfile.dailyMinutes}m/day
            </div>
          </div>
        </div>

        {/* Completed Sessions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Total Sessions</div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalSessions}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Interactive coach turns</div>
          </div>
        </div>

        {/* Target 30-Day Goal */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-500 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-400">Level & Goal</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
              {userProfile.englishLevel}
            </div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium truncate">
              {userProfile.goal}
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Badges Strip */}
      {(() => {
        const sessions = storageService.getSessions();
        const savedVocab = storageService.getSavedVocab();
        const { badges } = badgeService.calculateBadges({
          sessions,
          streak: stats.streak,
          totalMinutes: stats.totalMinutes,
          savedVocabCount: savedVocab.length,
        });
        const unlockedBadges = badges.filter((b) => b.unlocked);
        const nextBadge = badges.find((b) => !b.unlocked);

        return (
          <div className="bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-indigo-500/10 border border-teal-200/80 dark:border-teal-850 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300 dark:border-amber-700/80 flex items-center justify-center text-xl shrink-0">
                🏆
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Achievement Badges: {unlockedBadges.length} of {badges.length} Unlocked
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                    {Math.round((unlockedBadges.length / badges.length) * 100)}%
                  </span>
                </div>
                {nextBadge ? (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Next up: <span className="font-semibold text-teal-700 dark:text-teal-300">{nextBadge.name}</span> ({nextBadge.progress.current}/{nextBadge.progress.target}) — {nextBadge.description}
                  </p>
                ) : (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">
                    Incredible! You have unlocked all communication badges!
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => onNavigateTo('progress')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-xs shadow-xs shrink-0 self-start sm:self-auto transition-all"
            >
              <span>View All Badges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })()}

      {/* Today's Featured Challenge & Weekly Streak Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Challenge (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                <span>Today's Speaking Challenge</span>
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {todaysChallenge.timeEst}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {todaysChallenge.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {todaysChallenge.desc}
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Module: {todaysChallenge.category}
            </span>
            <button
              onClick={() => onNavigateTo(todaysChallenge.route)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20 transition-all hover:translate-x-0.5"
            >
              <span>Accept Challenge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Skills Being Developed & Weekly Activity (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span>Skills Being Developed</span>
            </h3>
            <span className="text-[10px] text-slate-400">AI Estimate</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Spoken Fluency', score: stats.averageMetrics.fluency, color: 'bg-teal-500' },
              { label: 'Grammar Accuracy', score: stats.averageMetrics.grammar, color: 'bg-blue-500' },
              { label: 'Speech Clarity', score: stats.averageMetrics.clarity, color: 'bg-emerald-500' },
              { label: 'College & Tech Vocab', score: stats.averageMetrics.vocabulary, color: 'bg-purple-500' },
            ].map((skill, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">{skill.label}</span>
                  <span className="text-slate-900 dark:text-white font-bold">{skill.score}/10</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`${skill.color} h-1.5 rounded-full transition-all duration-300`}
                    style={{ width: `${skill.score * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Weekly consistency dots */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Weekly Practice Rhythm:
            </span>
            <div className="flex items-center justify-between">
              {daysOfWeek.map((day, idx) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400">{day}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      idx === 2 || (idx === 1 && stats.practicedToday)
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    ✓
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Practice Workspaces Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Explore Practice Workspaces
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose a focused skill area to train today
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigateTo(card.id)}
                className={`group bg-white dark:bg-slate-900 border ${card.borderColor} rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 ${card.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
