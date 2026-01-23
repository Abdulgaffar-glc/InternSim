import { createContext, useContext, useState, ReactNode } from "react";

type Language = "tr" | "en";

type TranslationKeys = {
  // Common
  appName: string;
  virtualInternship: string;
  login: string;
  register: string;
  logout: string;
  next: string;
  back: string;
  start: string;
  close: string;
  save: string;
  cancel: string;
  or: string;

  // Auth
  email: string;
  password: string;
  fullName: string;
  forgotPassword: string;
  noAccount: string;
  hasAccount: string;
  startInternship: string;
  createAccount: string;
  enterName: string;
  enterEmail: string;

  // Onboarding
  selectField: string;
  selectFieldDesc: string;
  selectLevel: string;
  selectLevelDesc: string;
  frontend: string;
  backend: string;
  ai: string;
  cybersecurity: string;
  frontendDesc: string;
  backendDesc: string;
  aiDesc: string;
  cybersecurityDesc: string;
  junior: string;
  mid: string;
  senior: string;
  juniorDesc: string;
  midDesc: string;
  seniorDesc: string;

  // Sidebar
  modules: string;
  taskPanel: string;
  aiMentor: string;
  performance: string;
  projectSubmission: string;
  level: string;

  // Task Panel
  taskPanelTitle: string;
  taskPanelDesc: string;
  all: string;
  todo: string;
  inProgress: string;
  done: string;
  pending: string;
  ongoing: string;
  completed: string;
  startTask: string;
  markAsDone: string;
  description: string;
  difficulty: string;
  status: string;
  earnXp: string;
  dueIn: string;

  // Chat
  conversations: string;
  online: string;
  askQuestion: string;
  newLineHint: string;
  today: string;
  yesterday: string;
  daysAgo: string;
  weekAgo: string;

  // Performance
  performanceTitle: string;
  performanceDesc: string;
  lastWeeks: string;
  codeQuality: string;
  speed: string;
  requirements: string;
  skillDistribution: string;
  xpProgress: string;
  achievements: string;
  unlocked: string;
  nextLevel: string;
  remaining: string;
  weeklyStats: string;

  // Submission
  submissionTitle: string;
  submissionDesc: string;
  uploadFile: string;
  analyzeSubmit: string;
  analyzing: string;
  requirementsList: string;
  aiSuggestions: string;
  analysisResult: string;
  analysisSuccess: string;
  analysisWarning: string;
  required: string;

  // Tasks by field
  frontendTask1: string;
  frontendTask1Desc: string;
  frontendTask2: string;
  frontendTask2Desc: string;
  frontendTask3: string;
  frontendTask3Desc: string;
  backendTask1: string;
  backendTask1Desc: string;
  backendTask2: string;
  backendTask2Desc: string;
  backendTask3: string;
  backendTask3Desc: string;
  aiTask1: string;
  aiTask1Desc: string;
  aiTask2: string;
  aiTask2Desc: string;
  aiTask3: string;
  aiTask3Desc: string;
  cyberTask1: string;
  cyberTask1Desc: string;
  cyberTask2: string;
  cyberTask2Desc: string;
  cyberTask3: string;
  cyberTask3Desc: string;

  // Landing page
  getStarted: string;
  learnMore: string;
  landingBadge: string;
  landingHeroTitle: string;
  landingHeroHighlight: string;
  landingHeroDesc: string;
  landingStat1: string;
  landingStat2: string;
  landingStat3: string;
  landingStat4: string;
  landingFieldsTitle: string;
  landingFieldsDesc: string;
  landingFeaturesTitle: string;
  landingFeaturesDesc: string;
  landingFeature1Title: string;
  landingFeature1Desc: string;
  landingFeature2Title: string;
  landingFeature2Desc: string;
  landingFeature3Title: string;
  landingFeature3Desc: string;
  landingFeature4Title: string;
  landingFeature4Desc: string;
  landingBenefitsTitle: string;
  landingBenefitsDesc: string;
  landingBenefit1: string;
  landingBenefit2: string;
  landingBenefit3: string;
  landingBenefit4: string;
  landingBenefit5: string;
  landingTargetTitle: string;
  landingTargetDesc: string;
  landingTarget1: string;
  landingTarget2: string;
  landingTarget3: string;
  landingCtaTitle: string;
  landingCtaDesc: string;
  landingFooter: string;
};

const translations: Record<Language, TranslationKeys> = {
  tr: {
    // Common
    appName: "InternSim",
    virtualInternship: "Sanal Staj",
    login: "Giriş Yap",
    register: "Kayıt Ol",
    logout: "Çıkış Yap",
    next: "İleri",
    back: "Geri",
    start: "Başla",
    close: "Kapat",
    save: "Kaydet",
    cancel: "İptal",
    or: "veya",

    // Auth
    email: "E-posta",
    password: "Şifre",
    fullName: "Ad Soyad",
    forgotPassword: "Şifremi Unuttum",
    noAccount: "Hesabın yok mu?",
    hasAccount: "Zaten hesabın var mı?",
    startInternship: "Staja Başla",
    createAccount: "Hesap Oluştur",
    enterName: "Adınızı girin",
    enterEmail: "ornek@email.com",

    // Onboarding
    selectField: "Staj Alanını Seç",
    selectFieldDesc: "Hangi alanda staj yapmak istiyorsun?",
    selectLevel: "Seviyeni Seç",
    selectLevelDesc: "Mevcut tecrübe seviyeni belirle",
    frontend: "Frontend",
    backend: "Backend",
    ai: "Yapay Zeka",
    cybersecurity: "Siber Güvenlik",
    frontendDesc: "React, Vue, CSS ve kullanıcı arayüzü geliştirme",
    backendDesc: "API, veritabanı ve sunucu tarafı geliştirme",
    aiDesc: "Makine öğrenmesi, derin öğrenme ve veri bilimi",
    cybersecurityDesc: "Güvenlik analizi, penetrasyon testi ve ağ güvenliği",
    junior: "Junior",
    mid: "Mid-Level",
    senior: "Senior",
    juniorDesc: "0-1 yıl tecrübe, temel bilgiler",
    midDesc: "1-3 yıl tecrübe, proje deneyimi var",
    seniorDesc: "3+ yıl tecrübe, ileri seviye",

    // Sidebar
    modules: "Modüller",
    taskPanel: "Görev Paneli",
    aiMentor: "AI Mentor",
    performance: "Performans",
    projectSubmission: "Proje Teslim",
    level: "Seviye",

    // Task Panel
    taskPanelTitle: "Görev Paneli",
    taskPanelDesc: "Staj görevlerini yönet ve takip et",
    all: "Tümü",
    todo: "Yapılacak",
    inProgress: "Devam Ediyor",
    done: "Tamamlandı",
    pending: "Bekleyen",
    ongoing: "Devam Eden",
    completed: "Tamamlanan",
    startTask: "Göreve Başla",
    markAsDone: "Tamamlandı Olarak İşaretle",
    description: "Açıklama",
    difficulty: "Zorluk",
    status: "Durum",
    earnXp: "Kazanılacak XP",
    dueIn: "Süre",

    // Chat
    conversations: "Konuşmalar",
    online: "Çevrimiçi",
    askQuestion: "Bir soru sor veya kod paylaş...",
    newLineHint: "Shift + Enter ile yeni satır ekleyebilirsin",
    today: "Bugün",
    yesterday: "Dün",
    daysAgo: "gün önce",
    weekAgo: "1 hafta önce",

    // Performance
    performanceTitle: "Performans Dashboard",
    performanceDesc: "Staj gelişimini takip et",
    lastWeeks: "Son 7 Hafta",
    codeQuality: "Kod Kalitesi",
    speed: "Hız",
    requirements: "İsterlere Uygunluk",
    skillDistribution: "Yetenek Dağılımı",
    xpProgress: "XP Gelişimi",
    achievements: "Başarımlar",
    unlocked: "açıldı",
    nextLevel: "Sonraki seviyeye",
    remaining: "kaldı",
    weeklyStats: "Haftalık Görev İstatistikleri",

    // Submission
    submissionTitle: "Proje Teslim",
    submissionDesc: "Kodunu yapıştır ve analiz et",
    uploadFile: "Dosya Yükle",
    analyzeSubmit: "Analiz Et & Gönder",
    analyzing: "Analiz Ediliyor...",
    requirementsList: "Gereksinimler",
    aiSuggestions: "AI Önerileri",
    analysisResult: "Analiz Sonucu",
    analysisSuccess: "Kod analizi başarılı! Teslime hazır.",
    analysisWarning:
      "Bazı gereksinimler eksik. Lütfen kontrol listesini tamamlayın.",
    required: "Zorunlu",

    // Tasks
    frontendTask1: "Component Refactoring",
    frontendTask1Desc:
      "UserProfile componentini atomic design prensiplerine göre yeniden yapılandır. Reusable alt componentler oluştur.",
    frontendTask2: "Responsive Layout Düzenleme",
    frontendTask2Desc:
      "Dashboard sayfasının mobil görünümünü optimize et. Breakpoint'leri düzenle ve flexbox kullan.",
    frontendTask3: "State Management Entegrasyonu",
    frontendTask3Desc:
      "Redux veya Zustand ile global state yönetimi ekle. User ve theme state'lerini yönet.",
    backendTask1: "REST API Geliştirme",
    backendTask1Desc:
      "User CRUD operasyonları için RESTful API endpoint'leri oluştur. JWT authentication ekle.",
    backendTask2: "Database Optimizasyonu",
    backendTask2Desc:
      "Yavaş çalışan sorgular için index ekle. Query performance'ını %50 artır.",
    backendTask3: "Microservice Mimarisi",
    backendTask3Desc:
      "Monolitik uygulamayı microservice'lere böl. Docker container'ları hazırla.",
    aiTask1: "Model Eğitimi",
    aiTask1Desc:
      "Sentiment analizi için BERT modelini fine-tune et. Accuracy %85 üzeri hedefle.",
    aiTask2: "Data Pipeline Oluşturma",
    aiTask2Desc:
      "ETL pipeline kur. Raw datayı temizle, normalize et ve feature engineering yap.",
    aiTask3: "Model Deployment",
    aiTask3Desc:
      "Eğitilmiş modeli FastAPI ile serve et. Docker ile containerize et ve deploy et.",
    cyberTask1: "Vulnerability Assessment",
    cyberTask1Desc:
      "Web uygulamasında güvenlik açıklarını tespit et. OWASP Top 10 kontrol listesini uygula.",
    cyberTask2: "Penetration Testing",
    cyberTask2Desc:
      "Simüle edilmiş saldırı senaryoları hazırla. SQL injection ve XSS testleri yap.",
    cyberTask3: "Security Hardening",
    cyberTask3Desc:
      "Sunucu güvenliğini artır. Firewall kuralları, SSL/TLS yapılandırması ve access control ayarla.",

    // Landing page
    getStarted: "Başla",
    learnMore: "Daha Fazla",
    landingBadge: "AI Destekli Staj Platformu",
    landingHeroTitle: "Gerçek Dünya Deneyimi,",
    landingHeroHighlight: "Sanal Ortamda",
    landingHeroDesc:
      "Bilgisayar mühendisliği öğrencileri için yapay zeka destekli staj simülasyonu. Gerçek projeler, AI mentor desteği ve kapsamlı değerlendirme sistemi.",
    landingStat1: "Staj Alanı",
    landingStat2: "Seviye",
    landingStat3: "Mentor",
    landingStat4: "Görev",
    landingFieldsTitle: "Staj Alanlarını Keşfet",
    landingFieldsDesc:
      "İlgi alanına uygun staj programını seç ve kariyerine yön ver.",
    landingFeaturesTitle: "Platform Özellikleri",
    landingFeaturesDesc:
      "InternSim ile gerçek bir staj deneyiminin tüm avantajlarından yararlan.",
    landingFeature1Title: "Gerçekçi Görevler",
    landingFeature1Desc:
      "Sektörden alınan gerçek senaryolara dayalı projeler ve görevlerle pratik deneyim kazan.",
    landingFeature2Title: "AI Mentor Desteği",
    landingFeature2Desc:
      "Yapay zeka destekli mentorluk sistemi ile 7/24 teknik destek ve rehberlik al.",
    landingFeature3Title: "Performans Takibi",
    landingFeature3Desc:
      "Detaylı analitikler ve görselleştirmelerle gelişimini takip et.",
    landingFeature4Title: "Sertifika Sistemi",
    landingFeature4Desc:
      "Stajını tamamla ve özgeçmişine ekleyebileceğin sertifikalar kazan.",
    landingBenefitsTitle: "Neden InternSim?",
    landingBenefitsDesc:
      "Geleneksel staj süreçlerinin aksine, InternSim ile kendi hızında, esnek bir şekilde öğren.",
    landingBenefit1:
      "Esnek çalışma saatleri - istediğin zaman, istediğin yerden",
    landingBenefit2: "Sektör standardında araçlar ve teknolojilerle çalış",
    landingBenefit3: "Yapay zeka ile anında geri bildirim al",
    landingBenefit4: "Portföyüne ekleyebileceğin projeler geliştir",
    landingBenefit5: "Seviyene uygun zorlukta görevlerle ilerle",
    landingTargetTitle: "Kimler İçin?",
    landingTargetDesc: "InternSim şu kişiler için idealdir:",
    landingTarget1: "Bilgisayar Mühendisliği Öğrencileri",
    landingTarget2: "Yazılım Geliştirmeye İlgi Duyanlar",
    landingTarget3: "Kariyer Değişikliği Yapmak İsteyenler",
    landingCtaTitle: "Stajına Bugün Başla",
    landingCtaDesc:
      "Ücretsiz hesap oluştur ve AI destekli staj deneyimini keşfet.",
    landingFooter: "Tüm hakları saklıdır.",
  },
  en: {
    // Common
    appName: "InternSim",
    virtualInternship: "Virtual Internship",
    login: "Login",
    register: "Register",
    logout: "Logout",
    next: "Next",
    back: "Back",
    start: "Start",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    or: "or",

    // Auth
    email: "Email",
    password: "Password",
    fullName: "Full Name",
    forgotPassword: "Forgot Password",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    startInternship: "Start Internship",
    createAccount: "Create Account",
    enterName: "Enter your name",
    enterEmail: "example@email.com",

    // Onboarding
    selectField: "Select Internship Field",
    selectFieldDesc: "Which field do you want to intern in?",
    selectLevel: "Select Your Level",
    selectLevelDesc: "Determine your current experience level",
    frontend: "Frontend",
    backend: "Backend",
    ai: "Artificial Intelligence",
    cybersecurity: "Cyber Security",
    frontendDesc: "React, Vue, CSS and user interface development",
    backendDesc: "API, database and server-side development",
    aiDesc: "Machine learning, deep learning and data science",
    cybersecurityDesc:
      "Security analysis, penetration testing and network security",
    junior: "Junior",
    mid: "Mid-Level",
    senior: "Senior",
    juniorDesc: "0-1 years experience, basic knowledge",
    midDesc: "1-3 years experience, project experience",
    seniorDesc: "3+ years experience, advanced level",

    // Sidebar
    modules: "Modules",
    taskPanel: "Task Panel",
    aiMentor: "AI Mentor",
    performance: "Performance",
    projectSubmission: "Project Submission",
    level: "Level",

    // Task Panel
    taskPanelTitle: "Task Panel",
    taskPanelDesc: "Manage and track your internship tasks",
    all: "All",
    todo: "To Do",
    inProgress: "In Progress",
    done: "Done",
    pending: "Pending",
    ongoing: "Ongoing",
    completed: "Completed",
    startTask: "Start Task",
    markAsDone: "Mark as Done",
    description: "Description",
    difficulty: "Difficulty",
    status: "Status",
    earnXp: "XP to Earn",
    dueIn: "Due",

    // Chat
    conversations: "Conversations",
    online: "Online",
    askQuestion: "Ask a question or share code...",
    newLineHint: "Press Shift + Enter for a new line",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "days ago",
    weekAgo: "1 week ago",

    // Performance
    performanceTitle: "Performance Dashboard",
    performanceDesc: "Track your internship progress",
    lastWeeks: "Last 7 Weeks",
    codeQuality: "Code Quality",
    speed: "Speed",
    requirements: "Requirements Compliance",
    skillDistribution: "Skill Distribution",
    xpProgress: "XP Progress",
    achievements: "Achievements",
    unlocked: "unlocked",
    nextLevel: "Next level in",
    remaining: "remaining",
    weeklyStats: "Weekly Task Statistics",

    // Submission
    submissionTitle: "Project Submission",
    submissionDesc: "Paste your code and analyze",
    uploadFile: "Upload File",
    analyzeSubmit: "Analyze & Submit",
    analyzing: "Analyzing...",
    requirementsList: "Requirements",
    aiSuggestions: "AI Suggestions",
    analysisResult: "Analysis Result",
    analysisSuccess: "Code analysis successful! Ready for submission.",
    analysisWarning:
      "Some requirements are missing. Please complete the checklist.",
    required: "Required",

    // Tasks
    frontendTask1: "Component Refactoring",
    frontendTask1Desc:
      "Restructure UserProfile component following atomic design principles. Create reusable sub-components.",
    frontendTask2: "Responsive Layout Fix",
    frontendTask2Desc:
      "Optimize dashboard page for mobile view. Adjust breakpoints and use flexbox.",
    frontendTask3: "State Management Integration",
    frontendTask3Desc:
      "Add global state management with Redux or Zustand. Manage user and theme states.",
    backendTask1: "REST API Development",
    backendTask1Desc:
      "Create RESTful API endpoints for User CRUD operations. Add JWT authentication.",
    backendTask2: "Database Optimization",
    backendTask2Desc:
      "Add indexes for slow queries. Improve query performance by 50%.",
    backendTask3: "Microservice Architecture",
    backendTask3Desc:
      "Split monolithic application into microservices. Prepare Docker containers.",
    aiTask1: "Model Training",
    aiTask1Desc:
      "Fine-tune BERT model for sentiment analysis. Target accuracy above 85%.",
    aiTask2: "Data Pipeline Creation",
    aiTask2Desc:
      "Set up ETL pipeline. Clean raw data, normalize and perform feature engineering.",
    aiTask3: "Model Deployment",
    aiTask3Desc:
      "Serve trained model with FastAPI. Containerize with Docker and deploy.",
    cyberTask1: "Vulnerability Assessment",
    cyberTask1Desc:
      "Identify security vulnerabilities in web application. Apply OWASP Top 10 checklist.",
    cyberTask2: "Penetration Testing",
    cyberTask2Desc:
      "Prepare simulated attack scenarios. Perform SQL injection and XSS tests.",
    cyberTask3: "Security Hardening",
    cyberTask3Desc:
      "Enhance server security. Configure firewall rules, SSL/TLS and access control.",

    // Landing page
    getStarted: "Get Started",
    learnMore: "Learn More",
    landingBadge: "AI-Powered Internship Platform",
    landingHeroTitle: "Real World Experience,",
    landingHeroHighlight: "Virtual Environment",
    landingHeroDesc:
      "AI-powered internship simulation for computer engineering students. Real projects, AI mentor support, and comprehensive evaluation system.",
    landingStat1: "Internship Fields",
    landingStat2: "Levels",
    landingStat3: "Mentor",
    landingStat4: "Tasks",
    landingFieldsTitle: "Explore Internship Fields",
    landingFieldsDesc:
      "Choose the internship program that suits your interests and shape your career.",
    landingFeaturesTitle: "Platform Features",
    landingFeaturesDesc:
      "Take advantage of all the benefits of a real internship experience with InternSim.",
    landingFeature1Title: "Realistic Tasks",
    landingFeature1Desc:
      "Gain practical experience with projects and tasks based on real industry scenarios.",
    landingFeature2Title: "AI Mentor Support",
    landingFeature2Desc:
      "Get 24/7 technical support and guidance with our AI-powered mentorship system.",
    landingFeature3Title: "Performance Tracking",
    landingFeature3Desc:
      "Track your progress with detailed analytics and visualizations.",
    landingFeature4Title: "Certificate System",
    landingFeature4Desc:
      "Complete your internship and earn certificates to add to your resume.",
    landingBenefitsTitle: "Why InternSim?",
    landingBenefitsDesc:
      "Unlike traditional internship processes, learn at your own pace with InternSim.",
    landingBenefit1: "Flexible working hours - anytime, anywhere",
    landingBenefit2: "Work with industry-standard tools and technologies",
    landingBenefit3: "Get instant feedback with AI",
    landingBenefit4: "Develop projects you can add to your portfolio",
    landingBenefit5: "Progress with tasks at your level",
    landingTargetTitle: "Who Is It For?",
    landingTargetDesc: "InternSim is ideal for:",
    landingTarget1: "Computer Engineering Students",
    landingTarget2: "Those Interested in Software Development",
    landingTarget3: "Career Changers",
    landingCtaTitle: "Start Your Internship Today",
    landingCtaDesc:
      "Create a free account and discover the AI-powered internship experience.",
    landingFooter: "All rights reserved.",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("tr");

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translations[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
