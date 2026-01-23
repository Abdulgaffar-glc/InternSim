import {
  TrendingUp,
  Award,
  Target,
  Zap,
  Star,
  Trophy,
  ChevronUp,
  Calendar,
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

export const PerformanceDashboard = () => {
  const { t, language } = useLanguage();

  const skillsData = [
    { skill: "Problem Solving", value: 85 },
    { skill: language === "tr" ? "Kod Kalitesi" : "Code Quality", value: 78 },
    { skill: language === "tr" ? "İletişim" : "Communication", value: 72 },
    {
      skill: language === "tr" ? "Zaman Yönetimi" : "Time Management",
      value: 88,
    },
    { skill: language === "tr" ? "Takım Çalışması" : "Teamwork", value: 80 },
    { skill: language === "tr" ? "Öğrenme Hızı" : "Learning Speed", value: 92 },
  ];

  const progressData = [
    { week: language === "tr" ? "Hafta 1" : "Week 1", xp: 150, tasks: 2 },
    { week: language === "tr" ? "Hafta 2" : "Week 2", xp: 380, tasks: 4 },
    { week: language === "tr" ? "Hafta 3" : "Week 3", xp: 620, tasks: 5 },
    { week: language === "tr" ? "Hafta 4" : "Week 4", xp: 950, tasks: 6 },
    { week: language === "tr" ? "Hafta 5" : "Week 5", xp: 1400, tasks: 8 },
    { week: language === "tr" ? "Hafta 6" : "Week 6", xp: 1850, tasks: 7 },
    { week: language === "tr" ? "Hafta 7" : "Week 7", xp: 2450, tasks: 9 },
  ];

  const metrics = [
    { label: t.codeQuality, value: 87, change: +5, icon: Star },
    { label: t.speed, value: 92, change: +8, icon: Zap },
    { label: t.requirements, value: 94, change: +3, icon: Target },
  ];

  const achievements = [
    {
      id: 1,
      title: language === "tr" ? "İlk Görev" : "First Task",
      description:
        language === "tr"
          ? "İlk görevini tamamladın"
          : "Completed your first task",
      icon: Trophy,
      unlocked: true,
    },
    {
      id: 2,
      title: language === "tr" ? "Hız Şeytanı" : "Speed Demon",
      description:
        language === "tr" ? "24 saat içinde 3 görev" : "3 tasks in 24 hours",
      icon: Zap,
      unlocked: true,
    },
    {
      id: 3,
      title: "Bug Hunter",
      description:
        language === "tr" ? "5 bug fix tamamla" : "Complete 5 bug fixes",
      icon: Target,
      unlocked: true,
    },
    {
      id: 4,
      title: "Code Master",
      description:
        language === "tr" ? "%90 üzeri kod kalitesi" : "Above 90% code quality",
      icon: Award,
      unlocked: false,
    },
  ];

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
        <div className="relative flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center neon-glow">
            <span className="text-4xl font-bold text-gradient-primary">12</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-foreground">
                Junior Developer
              </h2>
              <span className="badge bg-primary/20 text-primary">
                {t.level} 12
              </span>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-xl font-semibold text-foreground">
                  2,450 XP
                </span>
              </div>
              <span className="text-muted-foreground">/ 3,000 XP</span>
            </div>
            <div className="progress-bar h-3">
              <div className="progress-fill" style={{ width: "82%" }} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t.nextLevel}{" "}
              <span className="text-primary font-semibold">550 XP</span>{" "}
              {t.remaining}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="stat-card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    metric.change > 0 ? "text-success" : "text-destructive"
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
      <div className="grid grid-cols-2 gap-6">
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
    </div>
  );
};
