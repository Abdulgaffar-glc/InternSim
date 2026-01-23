import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
      title={language === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç'}
    >
      <Globe className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground uppercase">{language}</span>
    </button>
  );
};
