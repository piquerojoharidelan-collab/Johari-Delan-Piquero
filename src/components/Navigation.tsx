import React, { useState } from 'react';
import {
  LayoutDashboard,
  Bot,
  Dumbbell,
  Timer,
  Wind,
  History,
  HeartHandshake,
  TrendingUp,
  Bell,
  BookOpen,
  UserCheck,
  Volume2,
  VolumeX,
  Menu,
  X,
  Sparkles,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import { playWellnessChime } from '../utils/sound';

export const Navigation: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    logout,
    soundSettings,
    updateSoundSettings,
    stats,
  } = useWellness();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai_chat', label: 'AI Assistant', icon: Bot, badge: 'Gemini' },
    { id: 'physical_wellness', label: 'Physical Wellness', icon: Dumbbell },
    { id: 'exercise_tracker', label: 'Exercise Tracker', icon: Timer },
    { id: 'breathwork', label: 'Breathwork Guide', icon: Wind },
    { id: 'activity_history', label: 'Activity History', icon: History, count: stats.totalCompletedSessions + stats.totalPartialSessions },
    { id: 'mental_wellness', label: 'Mental Wellness', icon: HeartHandshake },
    { id: 'analytics', label: 'My Progress', icon: TrendingUp },
    { id: 'reminders', label: 'Reminders & Plan', icon: Bell },
    { id: 'activity_library', label: 'Activity Library', icon: BookOpen },
    { id: 'profile_settings', label: 'Profile & Settings', icon: UserCheck },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const toggleSound = async () => {
    const nextState = !soundSettings.enabled;
    updateSoundSettings({ enabled: nextState });
    if (nextState) {
      await playWellnessChime(soundSettings.volume);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xs">
        <button
          onClick={() => handleTabClick('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading font-bold text-lg text-slate-900 tracking-tight">CareNova</span>
            <span className="block text-[10px] text-violet-600 font-medium -mt-1">Wellness Assistant</span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            aria-label={soundSettings.enabled ? 'Mute completion sound' : 'Enable completion sound'}
            className={`p-2 rounded-lg transition-colors ${
              soundSettings.enabled ? 'text-violet-600 bg-violet-50 hover:bg-violet-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
            }`}
            title={soundSettings.enabled ? 'Completion Sound: ON' : 'Completion Sound: OFF'}
          >
            {soundSettings.enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[85%] bg-white h-full flex flex-col shadow-2xl p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-purple-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-heading font-bold text-base text-slate-900">CareNova</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User chip */}
            {currentUser && (
              <div className="my-3 p-3 bg-violet-50/70 rounded-xl border border-violet-100">
                <p className="text-xs font-semibold text-violet-950 truncate">{currentUser.name}</p>
                <p className="text-[11px] text-violet-700 truncate">{currentUser.email}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-violet-800">
                  <span className="bg-violet-200/60 px-1.5 py-0.5 rounded-sm font-medium">BMI {currentUser.bmi || '--'}</span>
                  <span>{currentUser.primaryGoal}</span>
                </div>
              </div>
            )}

            {/* Nav links */}
            <nav className="flex-1 space-y-1 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-violet-600 text-white shadow-xs shadow-violet-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 h-screen sticky top-0 shrink-0 select-none">
        {/* Brand header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl text-slate-900 tracking-tight block">CareNova</span>
              <span className="text-[11px] font-medium text-violet-600 uppercase tracking-wider block -mt-0.5">Wellness AI</span>
            </div>
          </div>

          <button
            onClick={toggleSound}
            aria-label={soundSettings.enabled ? 'Mute session completion chime' : 'Enable session completion chime'}
            className={`p-2 rounded-lg transition-all ${
              soundSettings.enabled
                ? 'text-violet-600 bg-violet-50 hover:bg-violet-100'
                : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
            }`}
            title={soundSettings.enabled ? `Sound Chime: ON (${Math.round(soundSettings.volume * 100)}%)` : 'Sound Chime: OFF'}
          >
            {soundSettings.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* User Card */}
        {currentUser && (
          <div className="mx-4 mt-4 p-3 bg-linear-to-br from-violet-50/90 to-purple-50/50 rounded-2xl border border-violet-100/80">
            <div className="flex items-center justify-between">
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
              </div>
              <span className="shrink-0 text-[10px] font-semibold bg-violet-200/70 text-violet-800 px-2 py-0.5 rounded-full">
                BMI {currentUser.bmi || '--'}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-violet-100/60 flex items-center justify-between text-[11px] text-slate-600">
              <span className="truncate">{currentUser.primaryGoal}</span>
              <span className="font-medium text-violet-700 shrink-0">{currentUser.activityLevel.split(' ')[0]}</span>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-linear-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-violet-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-violet-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-violet-100'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="mb-3 px-2 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/60 flex items-start gap-2 text-[11px] text-amber-800">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-tight">Wellness coach, not medical care. Consult a physician for health concerns.</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => handleTabClick('profile_settings')}
              className="hover:text-violet-700 font-medium transition-colors"
            >
              Settings
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
