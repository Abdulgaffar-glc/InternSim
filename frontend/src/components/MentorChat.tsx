import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code, Sparkles, Clock, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  isCode?: boolean;
}

interface Conversation {
  id: number;
  title: string;
  lastMessage: string;
  dateKey: string;
  unread: boolean;
}

const conversationsData: Conversation[] = [
  { id: 1, title: 'API Entegrasyon Yardımı', lastMessage: 'Axios interceptor kullanabilirsin...', dateKey: 'today', unread: true },
  { id: 2, title: 'React Best Practices', lastMessage: 'Custom hooks oluşturarak...', dateKey: 'yesterday', unread: false },
  { id: 3, title: 'Git Workflow Sorusu', lastMessage: 'Feature branch stratejisi...', dateKey: '3days', unread: false },
  { id: 4, title: 'Database Tasarımı', lastMessage: 'Normalizasyon kurallarını...', dateKey: 'week', unread: false },
];

const initialMessages: Message[] = [
  {
    id: 1,
    sender: 'ai',
    content: 'Merhaba! Ben senin AI Mentorınım. 🤖 Staj sürecinde karşılaştığın teknik sorularda, kod review\'lerinde veya kariyer tavsiyeleri konusunda sana yardımcı olabilirim. Nasıl yardımcı olabilirim?',
    timestamp: '10:00',
  },
  {
    id: 2,
    sender: 'user',
    content: 'Merhaba! API entegrasyonu yaparken authentication hatası alıyorum. Header\'da token gönderiyorum ama 401 dönüyor.',
    timestamp: '10:02',
  },
  {
    id: 3,
    sender: 'ai',
    content: 'Bu yaygın bir sorun! Birkaç şeyi kontrol edelim:\n\n1. Token\'ın başına "Bearer " prefix\'i eklediğinden emin ol\n2. Token\'ın expire olup olmadığını kontrol et\n3. Backend\'de CORS ayarlarını gözden geçir\n\nŞu şekilde bir axios interceptor kurabilirsin:',
    timestamp: '10:03',
  },
  {
    id: 4,
    sender: 'ai',
    content: '```javascript\naxios.interceptors.request.use(\n  (config) => {\n    const token = localStorage.getItem("token");\n    if (token) {\n      config.headers.Authorization = `Bearer ${token}`;\n    }\n    return config;\n  },\n  (error) => Promise.reject(error)\n);\n```',
    timestamp: '10:03',
    isCode: true,
  },
];

export const MentorChat = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [activeConversation, setActiveConversation] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getDateText = (dateKey: string): string => {
    switch (dateKey) {
      case 'today': return t.today;
      case 'yesterday': return t.yesterday;
      case '3days': return `3 ${t.daysAgo}`;
      case 'week': return t.weekAgo;
      default: return dateKey;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        sender: 'ai',
        content: 'Harika bir soru! Bu konuda sana yardımcı olabilirim. Detaylı bir açıklama hazırlıyorum... 💡\n\nBu yaklaşımı kullanarak problemini çözebilirsin. Daha fazla sorum varsa sormaktan çekinme!',
        timestamp: new Date().toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex gap-6">
      {/* Conversations Sidebar */}
      <div className="w-80 flex-shrink-0 glass-card p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{t.conversations}</h2>
          <button className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
            <Sparkles className="w-4 h-4 text-primary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-cyber space-y-2">
          {conversationsData.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                activeConversation === conv.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'bg-secondary/50 hover:bg-secondary border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <h4 className={`font-medium text-sm truncate ${
                  activeConversation === conv.id ? 'text-primary' : 'text-foreground'
                }`}>
                  {conv.title}
                </h4>
                {conv.unread && (
                  <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{getDateText(conv.dateKey)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-card flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t.aiMentor}</h3>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                {t.online}
              </p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-cyber p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user'
                  ? 'bg-accent/20'
                  : 'bg-primary/20'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 text-accent" />
                ) : (
                  <Bot className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className={`chat-bubble ${
                message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
              } ${message.isCode ? 'font-mono text-sm bg-[hsl(240,10%,6%)] border-primary/30' : ''}`}>
                {message.isCode ? (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                    <Code className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">JavaScript</span>
                  </div>
                ) : null}
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  <Clock className="w-3 h-3 inline mr-1" />
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="chat-bubble chat-bubble-ai">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.askQuestion}
                className="input-cyber resize-none pr-12 min-h-[56px] max-h-32"
                rows={1}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <Code className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <button
              onClick={handleSend}
              className="btn-primary px-5 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {t.newLineHint}
          </p>
        </div>
      </div>
    </div>
  );
};
