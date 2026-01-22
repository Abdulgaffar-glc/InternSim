import { useState } from 'react';
import { Code2, Server, Brain, Shield, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export type InternshipField = 'frontend' | 'backend' | 'ai' | 'cybersecurity';
export type InternshipLevel = 'junior' | 'mid' | 'senior';

interface OnboardingFlowProps {
  onComplete: (field: InternshipField, level: InternshipLevel) => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedField, setSelectedField] = useState<InternshipField | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<InternshipLevel | null>(null);

  const fields = [
    { id: 'frontend' as const, label: t.frontend, desc: t.frontendDesc, icon: Code2, color: 'text-blue-400' },
    { id: 'backend' as const, label: t.backend, desc: t.backendDesc, icon: Server, color: 'text-green-400' },
    { id: 'ai' as const, label: t.ai, desc: t.aiDesc, icon: Brain, color: 'text-purple-400' },
    { id: 'cybersecurity' as const, label: t.cybersecurity, desc: t.cybersecurityDesc, icon: Shield, color: 'text-red-400' },
  ];

  const levels = [
    { id: 'junior' as const, label: t.junior, desc: t.juniorDesc },
    { id: 'mid' as const, label: t.mid, desc: t.midDesc },
    { id: 'senior' as const, label: t.senior, desc: t.seniorDesc },
  ];

  const handleNext = () => {
    if (step === 1 && selectedField) {
      setStep(2);
    } else if (step === 2 && selectedField && selectedLevel) {
      onComplete(selectedField, selectedLevel);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-slide-up">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
            step >= 1 ? 'bg-primary text-primary-foreground neon-glow' : 'bg-muted text-muted-foreground'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 rounded-full transition-all ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
            step >= 2 ? 'bg-primary text-primary-foreground neon-glow' : 'bg-muted text-muted-foreground'
          }`}>
            2
          </div>
        </div>

        <div className="glass-card p-8 neon-border">
          {step === 1 ? (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4 neon-glow">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">{t.selectField}</h1>
                <p className="text-muted-foreground mt-2">{t.selectFieldDesc}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {fields.map((field) => {
                  const Icon = field.icon;
                  const isSelected = selectedField === field.id;
                  return (
                    <button
                      key={field.id}
                      onClick={() => setSelectedField(field.id)}
                      className={`p-6 rounded-xl border-2 text-left transition-all duration-300 group ${
                        isSelected
                          ? 'bg-primary/10 border-primary neon-glow'
                          : 'bg-secondary/50 border-transparent hover:border-primary/50 hover:bg-secondary'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'
                      }`}>
                        <Icon className={`w-6 h-6 ${isSelected ? field.color : 'text-muted-foreground group-hover:' + field.color}`} />
                      </div>
                      <h3 className={`font-semibold mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {field.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{field.desc}</p>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-4">
                  {fields.find(f => f.id === selectedField)?.icon && (
                    <div className={fields.find(f => f.id === selectedField)?.color}>
                      {(() => {
                        const Icon = fields.find(f => f.id === selectedField)?.icon!;
                        return <Icon className="w-8 h-8" />;
                      })()}
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-foreground">{t.selectLevel}</h1>
                <p className="text-muted-foreground mt-2">{t.selectLevelDesc}</p>
              </div>

              <div className="space-y-3 mb-8">
                {levels.map((level) => {
                  const isSelected = selectedLevel === level.id;
                  return (
                    <button
                      key={level.id}
                      onClick={() => setSelectedLevel(level.id)}
                      className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-300 flex items-center gap-4 ${
                        isSelected
                          ? 'bg-primary/10 border-primary neon-glow'
                          : 'bg-secondary/50 border-transparent hover:border-primary/50 hover:bg-secondary'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {level.id === 'junior' ? 'J' : level.id === 'mid' ? 'M' : 'S'}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {level.label}
                        </h3>
                        <p className="text-sm text-muted-foreground">{level.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {step === 2 && (
              <button onClick={handleBack} className="btn-secondary flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                {t.back}
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={step === 1 ? !selectedField : !selectedLevel}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 1 ? t.next : t.start}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
