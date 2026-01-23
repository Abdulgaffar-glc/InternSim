import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code, Sparkles, Clock, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
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
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getToken = () => localStorage.getItem('token');

export const MentorChat = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Load messages when session changes
  useEffect(() => {
    if (activeSessionId) {
      fetchSessionMessages(activeSessionId);
    }
  }, [activeSessionId]);

  const fetchConversations = async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/ai-mentor/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.map((s: any) => ({
          id: s.id,
          title: s.title,
          lastMessage: s.last_message,
          updatedAt: s.updated_at
        })));
        // Auto-select first conversation if exists
        if (data.length > 0 && !activeSessionId) {
          setActiveSessionId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessionMessages = async (sessionId: number) => {
    const token = getToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/ai-mentor/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages.map((m: any, index: number) => ({
          id: m.id || index,
          sender: m.role === 'user' ? 'user' : 'ai',
          content: m.content,
          timestamp: new Date(m.created_at).toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
          isCode: m.content.includes('```')
        })));
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t.today;
    if (diffDays === 1) return t.yesterday;
    if (diffDays <= 7) return `${diffDays} ${t.daysAgo}`;
    return t.weekAgo;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startNewConversation = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const deleteConversation = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = getToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/ai-mentor/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== sessionId));
        if (activeSessionId === sessionId) {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const token = getToken();
    if (!token) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/ai-mentor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: input,
          session_id: activeSessionId
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      // Update session ID if new conversation
      if (!activeSessionId && data.session_id) {
        setActiveSessionId(data.session_id);
        fetchConversations(); // Refresh conversation list
      }

      const aiResponse: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        content: data.response,
        timestamp: new Date().toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        isCode: data.response.includes('```')
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorResponse: Message = {
        id: Date.now() + 1,
        sender: 'ai',
        content: language === 'tr'
          ? 'Üzgünüm, şu an bağlantı kuramıyorum. Lütfen backend sunucusunun çalıştığından emin olun.'
          : 'Sorry, I cannot connect right now. Please ensure backend server is running.',
        timestamp: new Date().toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
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
          <button
            onClick={startNewConversation}
            className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
            title={language === 'tr' ? 'Yeni Sohbet' : 'New Chat'}
          >
            <Plus className="w-4 h-4 text-primary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-cyber space-y-2">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-4">
              {language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              {language === 'tr' ? 'Henüz sohbet yok. Yeni bir sohbet başlatın!' : 'No conversations yet. Start a new chat!'}
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveSessionId(conv.id)}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 group ${activeSessionId === conv.id
                  ? 'bg-primary/10 border border-primary/30'
                  : 'bg-secondary/50 hover:bg-secondary border border-transparent'
                  }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className={`font-medium text-sm truncate flex-1 ${activeSessionId === conv.id ? 'text-primary' : 'text-foreground'
                    }`}>
                    {conv.title}
                  </h4>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
                    title={language === 'tr' ? 'Sil' : 'Delete'}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{formatDate(conv.updatedAt)}</p>
              </button>
            ))
          )}
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
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="w-16 h-16 text-primary/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {language === 'tr' ? 'AI Mentörünle Tanış!' : 'Meet Your AI Mentor!'}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {language === 'tr'
                  ? 'Kod incelemeleri, teknik sorular veya kariyer tavsiyeleri için buradayım. Bir şeyler sor!'
                  : 'I\'m here to help with code reviews, technical questions, or career advice. Ask me something!'}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user'
                  ? 'bg-accent/20'
                  : 'bg-primary/20'
                  }`}>
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 text-accent" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className={`chat-bubble ${message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
                  } ${message.isCode ? 'font-mono text-sm bg-[hsl(240,10%,6%)] border-primary/30' : ''}`}>
                  {message.isCode ? (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                      <Code className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Code</span>
                    </div>
                  ) : null}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))
          )}

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
              disabled={isTyping || !input.trim()}
              className="btn-primary px-5 flex items-center gap-2 disabled:opacity-50"
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
