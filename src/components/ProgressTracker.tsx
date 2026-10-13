import React, { useState, useMemo } from 'react';
import {
  Award,
  TrendingUp,
  Clock,
  Flame,
  BookOpen,
  Calendar,
  CheckCircle2,
  Trash2,
  AlertCircle,
  HelpCircle,
  Download,
  ShieldCheck,
  Lock,
  Sparkles,
  Zap,
  Star,
  ChevronRight,
  X,
  ArrowRight,
  Filter,
  BarChart2,
  Target,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import { UserProfile, PracticeSession, Badge, BadgeRarity, BadgeCategory } from '../types';
import { storageService } from '../services/storageService';
import { badgeService } from '../services/badgeService';

interface ProgressTrackerProps {
  userProfile: UserProfile;
  onRefreshData?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  userProfile,
  onRefreshData,
  onNavigateToTab,
}) => {
  const [sessions, setSessions] = useState<PracticeSession[]>(storageService.getSessions());
  const stats = storageService.getStats();
  const savedVocab = storageService.getSavedVocab();
  const recurringMistakes = storageService.getRecurringMistakes();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [chartView, setChartView] = useState<'bar' | 'area'>('bar');

  // Compute 7-day trend data for weekly visualization
  const weeklyTrendData = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Find sessions on this date
      const matchingSessions = sessions.filter((s) => {
        const sessionDate = new Date(s.date).toISOString().split('T')[0];
        return sessionDate === dateStr;
      });

      const dayMinutes = matchingSessions.reduce(
        (acc, s) => acc + Math.round((s.durationSeconds || 60) / 60),
        0
      );

      days.push({
        day: dayName,
        date: formattedDate,
        dateFull: dateStr,
        minutes: dayMinutes,
        sessionsCount: matchingSessions.length,
        goal: userProfile.dailyMinutes,
        metGoal: dayMinutes >= userProfile.dailyMinutes,
      });
    }

    return days;
  }, [sessions, userProfile.dailyMinutes]);

  const weeklyTotalMinutes = weeklyTrendData.reduce((acc, d) => acc + d.minutes, 0);
  const weeklyAvgMinutes = Math.round(weeklyTotalMinutes / 7);
  const daysGoalMet = weeklyTrendData.filter((d) => d.metGoal).length;
  const maxDayMinutes = Math.max(...weeklyTrendData.map((d) => d.minutes), 0);

  // Compute all badges and newly unlocked badges
  const { badges, newlyUnlocked } = useMemo(() => {
    return badgeService.calculateBadges({
      sessions,
      streak: stats.streak,
      totalMinutes: stats.totalMinutes,
      savedVocabCount: savedVocab.length,
    });
  }, [sessions, stats.streak, stats.totalMinutes, savedVocab.length]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalBadges = badges.length;
  const badgeCompletionPercent = Math.round((unlockedCount / totalBadges) * 100);

  // Filtered badges
  const filteredBadges = badges.filter((b) => {
    if (selectedBadgeCategory === 'all') return true;
    if (selectedBadgeCategory === 'unlocked') return b.unlocked;
    if (selectedBadgeCategory === 'in-progress') return !b.unlocked;
    return b.category === selectedBadgeCategory;
  });

  const handleClearHistory = () => {
    storageService.clearAllData();
    setSessions([]);
    setShowClearConfirm(false);
    onRefreshData?.();
  };

  const handleExportData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            userProfile,
            sessions,
            stats,
            savedVocab,
            recurringMistakes,
            badges: badges.filter((b) => b.unlocked),
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `speaksmart_progress_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getRarityBadgeStyle = (rarity: BadgeRarity) => {
    switch (rarity) {
      case 'Bronze':
        return 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Silver':
        return 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
      case 'Gold':
        return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold border-amber-300 shadow-xs';
      case 'Diamond':
        return 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-extrabold border-cyan-300 shadow-xs shadow-cyan-500/20';
    }
  };

  const getBadgeActionRoute = (category: BadgeCategory): string => {
    switch (category) {
      case 'speaking':
        return 'coach';
      case 'roleplay':
        return 'roleplay';
      case 'grammar':
        return 'grammar';
      case 'vocabulary':
        return 'vocabulary';
      case 'streak':
      case 'special':
      default:
        return 'coach';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
              📊
            </span>
            Communication Progress & Badges
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track your speaking milestones, earned badges, fluency trajectory, and daily habits over time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Clearing History */}
      {showClearConfirm && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <span className="font-bold">Are you sure you want to clear your local practice history?</span>
              <p className="text-[11px] text-red-800/80 dark:text-red-300 mt-0.5">
                This will delete your sessions, streak records, and badge timestamps on this device.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleClearHistory}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold shadow-xs"
            >
              Yes, Clear All
            </button>
          </div>
        </div>
      )}

      {/* High-Level Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Practice Streak</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.streak} <span className="text-xs font-medium text-slate-400">{stats.streak === 1 ? 'day' : 'days'}</span>
          </div>
          <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-1">
            {stats.practicedToday ? 'Practiced today! 🔥' : 'Practice today to maintain'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Practice Time</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalMinutes} <span className="text-xs font-medium text-slate-400">mins</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Total spoken English time</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Badges Unlocked</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {unlockedCount} / {totalBadges}
          </div>
          <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-1">
            {badgeCompletionPercent}% milestones achieved
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
            <BookOpen className="w-4 h-4 text-purple-500" />
            <span>Vocab Notebook</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {savedVocab.length} <span className="text-xs font-medium text-slate-400">words</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Bookmarked for revision</p>
        </div>
      </div>

      {/* FEATURE: WEEKLY TREND VISUALIZATION (RECHARTS) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                📈
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Weekly Practice Consistency & Daily Time Trend
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Daily minutes practiced over the past 7 days against your {userProfile.dailyMinutes}-minute daily target.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setChartView('bar')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  chartView === 'bar'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Bar Chart
              </button>
              <button
                type="button"
                onClick={() => setChartView('area')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  chartView === 'area'
                    ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Area Trend
              </button>
            </div>
          </div>
        </div>

        {/* 7-Day Performance Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] block font-medium">7-Day Total Time</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{weeklyTotalMinutes} mins</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] block font-medium">Daily Average</span>
            <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{weeklyAvgMinutes} m/day</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] block font-medium">Daily Goal Hit</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{daysGoalMet} of 7 days</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] block font-medium">Peak Day Time</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{maxDayMinutes} mins</span>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'bar' ? (
              <BarChart
                data={weeklyTrendData}
                margin={{ top: 15, right: 12, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.15} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  unit="m"
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white border border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1">
                          <div className="font-bold text-teal-300">
                            {data.day} ({data.date})
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400">Practice Time:</span>
                            <span className="font-bold text-white">{data.minutes} mins</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400">Sessions Done:</span>
                            <span className="font-bold text-white">{data.sessionsCount}</span>
                          </div>
                          <div className="pt-1 border-t border-slate-800 text-[11px]">
                            {data.metGoal ? (
                              <span className="text-emerald-400 font-semibold">
                                ✓ Reached daily {data.goal}m target!
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                Target: {data.goal}m ({Math.max(0, data.goal - data.minutes)}m left)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={userProfile.dailyMinutes}
                  stroke="#14b8a6"
                  strokeDasharray="4 4"
                  label={{
                    value: `Target: ${userProfile.dailyMinutes}m`,
                    fill: '#14b8a6',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                  {weeklyTrendData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.metGoal ? '#0d9488' : entry.minutes > 0 ? '#38bdf8' : '#e2e8f0'}
                      className="transition-colors hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart
                data={weeklyTrendData}
                margin={{ top: 15, right: 12, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="practiceMinutesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.15} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  unit="m"
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white border border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1">
                          <div className="font-bold text-teal-300">
                            {data.day} ({data.date})
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400">Practice Time:</span>
                            <span className="font-bold text-white">{data.minutes} mins</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400">Sessions Done:</span>
                            <span className="font-bold text-white">{data.sessionsCount}</span>
                          </div>
                          <div className="pt-1 border-t border-slate-800 text-[11px]">
                            {data.metGoal ? (
                              <span className="text-emerald-400 font-semibold">
                                ✓ Reached daily {data.goal}m target!
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                Target: {data.goal}m ({Math.max(0, data.goal - data.minutes)}m left)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={userProfile.dailyMinutes}
                  stroke="#14b8a6"
                  strokeDasharray="4 4"
                  label={{
                    value: `Target: ${userProfile.dailyMinutes}m`,
                    fill: '#14b8a6',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#practiceMinutesGradient)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-600" />
              <span>Goal Met ({userProfile.dailyMinutes}m+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-400" />
              <span>Practice Active</span>
            </div>
          </div>
          <span>Dashed line indicates your personal daily target</span>
        </div>
      </div>

      {/* FEATURE: VIRTUAL BADGE SYSTEM & MOTIVATION SHOWCASE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
        {/* Banner with Progress Bar & Motivation */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-indigo-500/10 border border-teal-200/60 dark:border-teal-800/60 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Achievement Badges & Milestones
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Unlock badges as you build consistency, expand vocabulary, conquer role-plays, and speak with confidence!
              </p>
            </div>

            <div className="text-right sm:shrink-0">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overall Progress</span>
              <div className="text-lg font-extrabold text-teal-600 dark:text-teal-400">
                {unlockedCount} of {totalBadges} Badges ({badgeCompletionPercent}%)
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 w-full bg-slate-200/80 dark:bg-slate-700/80 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-blue-600 h-2 rounded-full transition-all duration-700"
              style={{ width: `${badgeCompletionPercent}%` }}
            />
          </div>
        </div>

        {/* Badge Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Badges' },
            { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
            { id: 'in-progress', label: `In Progress (${totalBadges - unlockedCount})` },
            { id: 'streak', label: 'Streaks' },
            { id: 'speaking', label: 'Speaking & JAM' },
            { id: 'vocabulary', label: 'Vocabulary' },
            { id: 'grammar', label: 'Grammar' },
            { id: 'roleplay', label: 'Role-Play' },
            { id: 'special', label: 'Special' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedBadgeCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedBadgeCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Badge Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {filteredBadges.map((badge) => {
            const isUnlocked = badge.unlocked;
            const progressPercent = Math.min(
              100,
              Math.round((badge.progress.current / badge.progress.target) * 100)
            );

            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between group ${
                  isUnlocked
                    ? 'bg-white dark:bg-slate-850 border-teal-200 dark:border-teal-800/80 hover:shadow-md hover:border-teal-400 dark:hover:border-teal-500'
                    : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    {/* Badge Icon Emblem */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-105 ${
                        isUnlocked
                          ? 'bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grayscale contrast-75'
                      }`}
                    >
                      <span>{badge.icon}</span>
                    </div>

                    {/* Rarity Tag */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRarityBadgeStyle(
                          badge.rarity
                        )}`}
                      >
                        {badge.rarity}
                      </span>
                    </div>
                  </div>

                  {/* Badge Name & Description */}
                  <h4
                    className={`font-bold text-sm tracking-tight transition-colors ${
                      isUnlocked
                        ? 'text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {badge.name}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                {/* Progress & Status Indicator */}
                <div className="mt-4 pt-3 border-t border-slate-150 dark:border-slate-800/80">
                  {isUnlocked ? (
                    <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Achieved!</span>
                      </div>
                      <span className="text-slate-400 text-[10px]">
                        {badge.unlockedAt
                          ? new Date(badge.unlockedAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Unlocked'}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Progress</span>
                        </div>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">
                          {badge.progress.current} / {badge.progress.target}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 text-center space-y-5">
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedBadge(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-500/20 to-blue-500/20 border-2 border-teal-400 dark:border-teal-600 mx-auto flex items-center justify-center text-4xl shadow-inner">
              <span>{selectedBadge.icon}</span>
            </div>

            <div>
              <div className="inline-block mb-1.5">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getRarityBadgeStyle(
                    selectedBadge.rarity
                  )}`}
                >
                  {selectedBadge.rarity} Badge
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {selectedBadge.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-xs mx-auto">
                {selectedBadge.description}
              </p>
            </div>

            {/* Status box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                <span
                  className={
                    selectedBadge.unlocked
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-amber-600 dark:text-amber-400 font-bold'
                  }
                >
                  {selectedBadge.unlocked ? 'Unlocked & Awarded' : 'Locked (In Progress)'}
                </span>
              </div>

              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Milestone Target:</span>
                <span className="text-slate-900 dark:text-white">
                  {selectedBadge.progress.current} / {selectedBadge.progress.target}
                </span>
              </div>

              {selectedBadge.unlockedAt && (
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Awarded On:</span>
                  <span>{new Date(selectedBadge.unlockedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Action button */}
            <div className="pt-2">
              {!selectedBadge.unlocked && onNavigateToTab ? (
                <button
                  type="button"
                  onClick={() => {
                    const route = getBadgeActionRoute(selectedBadge.category);
                    setSelectedBadge(null);
                    onNavigateToTab(route);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all"
                >
                  <span>Practice to Unlock This Badge</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedBadge(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Estimated Competency Ratings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Estimated Skill Competencies
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 italic">
            *AI-generated estimates based on practice interactions, not standardized exam scores.
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {[
            {
              skill: 'Speech Clarity & Pronunciation Structure',
              score: stats.averageMetrics.clarity,
              color: 'bg-teal-500',
              desc: 'How easily listeners understand your thoughts and sentence boundaries.',
            },
            {
              skill: 'Fluency & Pacing (Continuous Speech)',
              score: stats.averageMetrics.fluency,
              color: 'bg-blue-500',
              desc: 'Ability to express ideas without long hesitation or pausing to translate.',
            },
            {
              skill: 'Grammar & Preposition Precision',
              score: stats.averageMetrics.grammar,
              color: 'bg-emerald-500',
              desc: 'Proper tense consistency, subject-verb agreement, and articles.',
            },
            {
              skill: 'Vocabulary & Campus Register',
              score: stats.averageMetrics.vocabulary,
              color: 'bg-purple-500',
              desc: 'Range of professional collocations, idioms, and precise phrasing.',
            },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800 dark:text-slate-200">{item.skill}</span>
                <span className="text-slate-900 dark:text-white font-bold">{item.score}/10</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`${item.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${item.score * 10}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Identified Recurring Grammar Pitfalls & Growth Areas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-500" />
          Recurring Speaking Habits Being Polished
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          We identify these patterns across your sessions so you can actively avoid them in interviews and presentations:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          {recurringMistakes.slice(0, 3).map((mistake, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-slate-800 dark:text-slate-300"
            >
              <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">
                Pattern #{i + 1}
              </span>
              <p>{mistake}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            Session History Log
          </h3>
          <span className="text-xs text-slate-400">{sessions.length} recorded</span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No completed sessions recorded yet. Start practicing with the Speaking Coach or Role-Play to see your history log!
          </div>
        ) : (
          <div className="space-y-2 overflow-x-auto">
            {sessions.slice(0, 10).map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 flex items-center justify-between text-xs gap-3"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {s.topic}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span className="capitalize">{s.type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{new Date(s.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{Math.round((s.durationSeconds || 60) / 60)} min</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="font-extrabold text-teal-600 dark:text-teal-400 text-sm">
                      {s.metrics?.clarity ? `${s.metrics.clarity}/10` : 'Completed'}
                    </div>
                    <div className="text-[9px] text-slate-400">Clarity</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
        <span>
          Privacy & Storage: All your speech transcripts, streak records, and unlocked virtual badges are preserved securely in your browser's local storage.
        </span>
      </div>
    </div>
  );
};
