import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Dumbbell,
  HeartHandshake,
  AlertTriangle,
  Play,
  RotateCcw,
  Shield,
  Wind,
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'exercise' | 'breathwork';
    title: string;
    payload: any;
  };
}

export const AIChatView: React.FC = () => {
  const {
    currentUser,
    stats,
    activities,
    moodLogs,
    startExercise,
    startBreathwork,
    setActiveTab,
  } = useWellness();

  const [role, setRole] = useState<'general_assistant' | 'physical_coach' | 'mental_companion'>('general_assistant');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Initial welcome message with user context
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello ${currentUser?.name || 'there'}! I am **CareNova**, your AI Physical & Mental Wellness Assistant. 

I'm directly connected to your saved wellness records, so you can ask me:
• *"How many minutes did I exercise this week?"*
• *"How many breathwork sessions have I completed?"*
• *"Recommend a beginner workout routine"*
• *"Help me reset my stress with a guided breathing plan"*

How can I support your vitality and peace of mind today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      // Gather live user context from real state
      const userContext = {
        profile: currentUser,
        stats: {
          totalExerciseSessions: stats.totalExerciseSessions,
          totalExerciseMinutes: stats.totalExerciseMinutes,
          totalBreathworkSessions: stats.totalBreathworkSessions,
          totalBreathworkMinutes: stats.totalBreathworkMinutes,
          weeklyExerciseMinutes: stats.weeklyExerciseMinutes,
          weeklyBreathworkMinutes: stats.weeklyBreathworkMinutes,
          streakDays: stats.streakDays,
          recentExercises: stats.recentExercises,
          recentBreathwork: stats.recentBreathwork,
        },
        latestMood: moodLogs.length > 0 ? moodLogs[0].mood : undefined,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory,
          role,
          userContext,
        }),
      });

      const data = await res.json();

      let action: ChatMessage['suggestedAction'] | undefined;
      const lower = query.toLowerCase();
      if (lower.includes('workout') || lower.includes('exercise')) {
        action = {
          type: 'exercise',
          title: 'Start 15-Min Foundational Flow',
          payload: { name: 'Foundational Movement Flow', category: 'Stretching', targetSeconds: 900 },
        };
      } else if (lower.includes('breath') || lower.includes('stress') || lower.includes('calm')) {
        action = {
          type: 'breathwork',
          title: 'Start 3-Min Box Breathing Guide',
          payload: { technique: 'Box breathing', targetMinutes: 3 },
        };
      }

      const botMsg: ChatMessage = {
        id: `msg_b_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "I'm here to support you. Let me know what you'd like to work on next.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: action,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      // Resilient local answer with actual stats
      let fallbackText = `I am here with you. `;
      if (query.toLowerCase().includes('exercise') || query.toLowerCase().includes('minutes')) {
        fallbackText += `According to your saved activity history, you have logged **${stats.totalExerciseSessions} exercise session${stats.totalExerciseSessions === 1 ? '' : 's'}** for a total of **${stats.totalExerciseMinutes} minute${stats.totalExerciseMinutes === 1 ? '' : 's'}**.`;
      } else if (query.toLowerCase().includes('breath')) {
        fallbackText += `According to your saved activity history, you have completed **${stats.totalBreathworkSessions} breathwork session${stats.totalBreathworkSessions === 1 ? '' : 's'}** for a total of **${stats.totalBreathworkMinutes} minute${stats.totalBreathworkMinutes === 1 ? '' : 's'}**.`;
      } else {
        fallbackText += `Let's focus on one achievable step for your health today. Would you like to start a gentle workout or practice a calming breathing session?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const promptSuggestions = [
    'How many minutes did I exercise this week?',
    'How many breathwork sessions have I completed?',
    'Create a beginner workout routine',
    'Help me reduce everyday stress',
    'Recommend a suitable workout based on my history',
    'Help me schedule a daily breathing break',
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4 animate-fade-in flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Header & Role Selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-200">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-lg text-slate-900">CareNova Conversational AI</h1>
              <span className="text-[10px] font-bold bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-500">Live access to your verified activity history</p>
          </div>
        </div>

        {/* Role Mode Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('general_assistant')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              role === 'general_assistant' ? 'bg-white text-violet-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All-in-One
          </button>
          <button
            type="button"
            onClick={() => setRole('physical_coach')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              role === 'physical_coach' ? 'bg-white text-violet-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
            <span>Physical Coach</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('mental_companion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              role === 'mental_companion' ? 'bg-white text-violet-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-purple-500" />
            <span>Mental Companion</span>
          </button>
        </div>
      </div>

      {/* Messages Chat Area */}
      <div className="flex-1 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-linear-to-tr from-violet-100 to-purple-100 text-violet-800'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-2">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-linear-to-r from-violet-600 to-indigo-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">
                    {msg.text}
                  </div>
                </div>

                {/* Suggested Activity Action Card */}
                {msg.suggestedAction && (
                  <div className="p-3 bg-violet-50/80 border border-violet-100 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-violet-900 truncate">
                      {msg.suggestedAction.title}
                    </span>
                    <button
                      onClick={() => {
                        if (msg.suggestedAction?.type === 'exercise') {
                          startExercise(
                            msg.suggestedAction.payload.name,
                            msg.suggestedAction.payload.category,
                            msg.suggestedAction.payload.targetSeconds
                          );
                        } else if (msg.suggestedAction?.type === 'breathwork') {
                          startBreathwork(
                            msg.suggestedAction.payload.technique,
                            msg.suggestedAction.payload.targetMinutes
                          );
                        }
                      }}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Launch</span>
                    </button>
                  </div>
                )}

                <span className={`block text-[10px] text-slate-400 ${isUser ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-md">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse delay-150" />
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse delay-300" />
              <span className="text-xs text-slate-500 ml-1">CareNova is reviewing your records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 shrink-0 scrollbar-none">
        {promptSuggestions.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-violet-50 border border-slate-200 text-[11px] font-medium text-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          placeholder={`Ask CareNova about workouts, breathwork, sleep, or your saved statistics...`}
          className="flex-1 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-hidden bg-transparent"
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputMessage.trim() || loading}
          aria-label="Send message to AI assistant"
          className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold transition-all shadow-xs cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Medical Safety Disclaimer Footer */}
      <div className="text-center text-[10px] text-slate-400 pb-1 flex items-center justify-center gap-1.5">
        <Shield className="w-3 h-3 text-slate-400" />
        <span>General wellness and fitness education only. Not medical diagnosis, clinical treatment, or prescription advice.</span>
      </div>
    </div>
  );
};
