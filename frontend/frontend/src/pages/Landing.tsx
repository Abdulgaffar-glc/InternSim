import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  Code2,
  Brain,
  Shield,
  Server,
  Rocket,
  Target,
  Award,
  Users,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const Landing = () => {
  const { t, language } = useLanguage();

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('token');

  const fields = [
    { icon: Code2, title: t.frontend, color: "from-blue-500 to-cyan-500" },
    { icon: Server, title: t.backend, color: "from-green-500 to-emerald-500" },
    { icon: Brain, title: t.ai, color: "from-purple-500 to-pink-500" },
    {
      icon: Shield,
      title: t.cybersecurity,
      color: "from-red-500 to-orange-500",
    },
  ];

  const features = [
    {
      icon: Target,
      title: t.landingFeature1Title,
      desc: t.landingFeature1Desc,
    },
    { icon: Brain, title: t.landingFeature2Title, desc: t.landingFeature2Desc },
    { icon: Award, title: t.landingFeature3Title, desc: t.landingFeature3Desc },
    {
      icon: Rocket,
      title: t.landingFeature4Title,
      desc: t.landingFeature4Desc,
    },
  ];

  const benefits = [
    t.landingBenefit1,
    t.landingBenefit2,
    t.landingBenefit3,
    t.landingBenefit4,
    t.landingBenefit5,
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {t.appName}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {t.virtualInternship}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              {isLoggedIn ? (
                <Link to="/dashboard">
                  <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    {language === 'tr' ? 'Panele Git' : 'Go to Dashboard'}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline">
                      {t.login}
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      {t.getStarted}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-4">
              <LanguageSwitcher />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col gap-6 mt-8">
                    {isLoggedIn ? (
                       <Link to="/dashboard">
                        <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          {language === 'tr' ? 'Panele Git' : 'Go to Dashboard'}
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Link to="/auth">
                          <Button variant="outline" className="w-full justify-start">
                            {t.login}
                          </Button>
                        </Link>
                        <Link to="/auth">
                          <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 justify-start">
                            {t.getStarted}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="cyber-grid" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                {t.landingBadge}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {t.landingHeroTitle}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                {" "}
                {t.landingHeroHighlight}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t.landingHeroDesc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isLoggedIn ? (
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8"
                  >
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    {language === 'tr' ? 'Panele Git' : 'Go to Dashboard'}
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8"
                  >
                    {t.startInternship}
                    <Rocket className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
              <Button size="lg" variant="outline" className="text-lg px-8">
                {t.learnMore}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { value: "4+", label: t.landingStat1 },
              { value: "3", label: t.landingStat2 },
              { value: "AI", label: t.landingStat3 },
              { value: "∞", label: t.landingStat4 },
            ].map((stat, index) => (
              <div
                key={index}
                className="glass-card p-6 rounded-2xl text-center hover-lift"
              >
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fields Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t.landingFieldsTitle}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.landingFieldsDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fields.map((field, index) => (
              <div
                key={index}
                className="glass-card p-6 rounded-2xl hover-lift group cursor-pointer"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${field.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <field.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {field.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {index === 0 && t.frontendDesc}
                  {index === 1 && t.backendDesc}
                  {index === 2 && t.aiDesc}
                  {index === 3 && t.cybersecurityDesc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t.landingFeaturesTitle}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.landingFeaturesDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-8 rounded-2xl hover-lift flex gap-6"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                {t.landingBenefitsTitle}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t.landingBenefitsDesc}
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-8 rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {t.landingTargetTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t.landingTargetDesc}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {[t.landingTarget1, t.landingTarget2, t.landingTarget3].map(
                  (target, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-foreground">{target}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {t.landingCtaTitle}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                {t.landingCtaDesc}
              </p>
              {isLoggedIn ? (
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-10"
                  >
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                    {language === 'tr' ? 'Panele Git' : 'Go to Dashboard'}
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-10"
                  >
                    {t.createAccount}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">{t.appName}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 InternSim. {t.landingFooter}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
