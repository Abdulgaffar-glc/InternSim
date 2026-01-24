import { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  Target,
  Zap,
  Star,
  Trophy,
  ChevronUp,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { API_URL } from "@/config";



interface UserStats {
  user: {
    name: string;
    email: string;
    internship_field: string;
    internship_level: string;
  };
  level: number;
  current_xp: number;
  next_level_xp: number;
  xp_progress: number;
  xp_needed: number;
  metrics: {
    code_quality: number;
    code_quality_change: number;
    speed: number;
    speed_change: number;
    requirements_match: number;
    requirements_match_change: number;
  };
  skills: {
    problem_solving: number;
    code_quality: number;
    communication: number;
    time_management: number;
    teamwork: number;
    learning_speed: number;
  };
  weekly_progress: Array<{
    week: number;
    xp: number;
    tasks: number;
    cumulative_xp: number;
  }>;
  task_stats: {
    completed: number;
    in_progress: number;
    pending: number;
    average_score: number;
  };
}

export const PerformanceDashboard = () => {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/me/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Transform skills data for radar chart
  const skillsData = stats ? [
    { skill: "Problem Solving", value: stats.skills.problem_solving },
    { skill: language === "tr" ? "Kod Kalitesi" : "Code Quality", value: stats.skills.code_quality },
    { skill: language === "tr" ? "İletişim" : "Communication", value: stats.skills.communication },
    { skill: language === "tr" ? "Zaman Yönetimi" : "Time Management", value: stats.skills.time_management },
    { skill: language === "tr" ? "Takım Çalışması" : "Teamwork", value: stats.skills.teamwork },
    { skill: language === "tr" ? "Öğrenme Hızı" : "Learning Speed", value: stats.skills.learning_speed },
  ] : [];

  // Transform weekly progress for charts
  const progressData = stats?.weekly_progress.map((wp) => ({
    week: language === "tr" ? `Hafta ${wp.week}` : `Week ${wp.week}`,
    xp: wp.cumulative_xp,
    tasks: wp.tasks,
  })) || [];

  // Build metrics from API data
  const metrics = stats ? [
    {
      label: t.codeQuality,
      value: stats.metrics.code_quality,
      change: stats.metrics.code_quality_change,
      icon: Star
    },
    {
      label: t.speed,
      value: stats.metrics.speed,
      change: stats.metrics.speed_change,
      icon: Zap
    },
    {
      label: t.requirements,
      value: stats.metrics.requirements_match,
      change: stats.metrics.requirements_match_change,
      icon: Target
    },
  ] : [];

  // Level title based on level number
  const getLevelTitle = (level: number): string => {
    if (level <= 3) return language === "tr" ? "Başlangıç Stajyer" : "Beginner Intern";
    if (level <= 6) return language === "tr" ? "Junior Geliştirici" : "Junior Developer";
    if (level <= 10) return language === "tr" ? "Orta Seviye Geliştirici" : "Mid-Level Developer";
    if (level <= 15) return language === "tr" ? "Kıdemli Geliştirici" : "Senior Developer";
    return language === "tr" ? "Uzman Geliştirici" : "Expert Developer";
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{error || 'No data available'}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {language === "tr"
              ? "Görev tamamlayarak ilerlemenizi görün"
              : "Complete tasks to see your progress"}
          </p>
        </div>
      </div>
    );
  }

  const xpPercentage = Math.round((stats.xp_progress / stats.xp_needed) * 100);

  return (
    <div className="h-full overflow-y-auto scrollbar-cyber space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t.performanceTitle}
          </h1>
          <p className="text-muted-foreground mt-1">{t.performanceDesc}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-foreground">{t.lastWeeks}</span>
        </div>
      </div>

      {/* Level Card */}
      <div className="glass-card p-6 neon-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        <div className="relative flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center neon-glow">
            <span className="text-4xl font-bold text-gradient-primary">{stats.level}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-foreground">
                {getLevelTitle(stats.level)}
              </h2>
              <span className="badge bg-primary/20 text-primary">
                {t.level} {stats.level}
              </span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-xl font-semibold text-foreground">
                  {stats.current_xp.toLocaleString()} XP
                </span>
              </div>
              <span className="text-muted-foreground">/ {stats.next_level_xp.toLocaleString()} XP</span>
            </div>
            <div className="progress-bar h-3">
              <div className="progress-fill transition-all duration-500" style={{ width: `${xpPercentage}%` }} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t.nextLevel}{" "}
              <span className="text-primary font-semibold">
                {(stats.xp_needed - stats.xp_progress).toLocaleString()} XP
              </span>{" "}
              {t.remaining}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="stat-card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${metric.change > 0 ? "text-success" : "text-destructive"
                    }`}
                >
                  <ChevronUp className="w-4 h-4" />
                  {metric.change}%
                </div>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-foreground">
                  {metric.value}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <div className="mt-3 progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Radar */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t.skillDistribution}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={skillsData}>
              <PolarGrid stroke="hsl(240, 10%, 20%)" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 10 }}
              />
              <Radar
                name="Skills"
                dataKey="value"
                stroke="hsl(262, 83%, 58%)"
                fill="hsl(262, 83%, 58%)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Line Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t.xpProgress}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(262, 83%, 58%)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(262, 83%, 58%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(240, 10%, 16%)"
              />
              <XAxis
                dataKey="week"
                tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }}
                axisLine={{ stroke: "hsl(240, 10%, 16%)" }}
              />
              <YAxis
                tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }}
                axisLine={{ stroke: "hsl(240, 10%, 16%)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(240, 10%, 8%)",
                  border: "1px solid hsl(240, 10%, 16%)",
                  borderRadius: "8px",
                  color: "hsl(220, 20%, 90%)",
                }}
              />
              <Area
                type="monotone"
                dataKey="xp"
                stroke="hsl(262, 83%, 58%)"
                fill="url(#xpGradient)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task History */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {t.weeklyStats}
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 16%)" />
            <XAxis
              dataKey="week"
              tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }}
              axisLine={{ stroke: "hsl(240, 10%, 16%)" }}
            />
            <YAxis
              tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }}
              axisLine={{ stroke: "hsl(240, 10%, 16%)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(240, 10%, 8%)",
                border: "1px solid hsl(240, 10%, 16%)",
                borderRadius: "8px",
                color: "hsl(220, 20%, 90%)",
              }}
            />
            <Line
              type="monotone"
              dataKey="tasks"
              stroke="hsl(187, 94%, 43%)"
              strokeWidth={3}
              dot={{ fill: "hsl(187, 94%, 43%)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "hsl(187, 94%, 43%)", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Task Summary */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {language === "tr" ? "Görev Özeti" : "Task Summary"}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-success/10 rounded-lg">
            <p className="text-3xl font-bold text-success">{stats.task_stats.completed}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "tr" ? "Tamamlandı" : "Completed"}
            </p>
          </div>
          <div className="text-center p-4 bg-warning/10 rounded-lg">
            <p className="text-3xl font-bold text-warning">{stats.task_stats.in_progress}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "tr" ? "Devam Ediyor" : "In Progress"}
            </p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-3xl font-bold text-foreground">{stats.task_stats.pending}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "tr" ? "Bekliyor" : "Pending"}
            </p>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="text-3xl font-bold text-primary">{stats.task_stats.average_score}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "tr" ? "Ort. Puan" : "Avg. Score"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
