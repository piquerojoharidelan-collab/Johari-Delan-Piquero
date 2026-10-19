import React, { useState } from 'react';
import {
  Bell,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  AlertCircle,
  BellRing,
  ShieldCheck,
  X,
  Droplet,
  Heart,
  Dumbbell,
  Wind,
  Moon,
  Pill,
  User,
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import { ReminderCategory, ReminderRepeat, ReminderItem } from '../types/wellness';

export const RemindersView: React.FC = () => {
  const { reminders, addReminder, toggleReminder, updateReminder, deleteReminder } = useWellness();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'completed'>('upcoming');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('Hydration');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueTime, setDueTime] = useState('10:00');
  const [repeat, setRepeat] = useState<ReminderRepeat>('Daily');

  // Browser Notification state
  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const requestNotificationAccess = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          new Notification('CareNova Wellness Reminders Active', {
            body: 'You will receive gentle wellness anchors right on time.',
            icon: '/favicon.ico',
          });
        }
      } catch (err) {
        console.warn('Notification permission request error:', err);
      }
    }
  };

  const handleOpenAdd = () => {
    setTitle('');
    setDescription('');
    setCategory('Hydration');
    setDueDate(new Date().toISOString().slice(0, 10));
    setDueTime('10:00');
    setRepeat('Daily');
    setEditingReminder(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (rem: ReminderItem) => {
    setEditingReminder(rem);
    setTitle(rem.title);
    setDescription(rem.description || '');
    setCategory(rem.category);
    setDueDate(rem.dueDate);
    setDueTime(rem.dueTime);
    setRepeat(rem.repeat);
    setShowAddModal(true);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingReminder) {
      updateReminder(editingReminder.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        dueDate,
        dueTime,
        repeat,
      });
    } else {
      addReminder({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        dueDate,
        dueTime,
        repeat,
        isCompleted: false,
      });
    }

    setShowAddModal(false);
  };

  // Group reminders by status
  const nowStr = new Date().toISOString().slice(0, 10);
  const nowTimeStr = new Date().toTimeString().slice(0, 5);

  const completedReminders = reminders.filter((r) => r.isCompleted);
  const uncompleted = reminders.filter((r) => !r.isCompleted);

  const overdueReminders = uncompleted.filter((r) => {
    if (r.dueDate < nowStr) return true;
    if (r.dueDate === nowStr && r.dueTime < nowTimeStr) return true;
    return false;
  });

  const upcomingReminders = uncompleted.filter((r) => {
    if (r.dueDate > nowStr) return true;
    if (r.dueDate === nowStr && r.dueTime >= nowTimeStr) return true;
    return false;
  });

  const displayList =
    activeTab === 'upcoming'
      ? upcomingReminders
      : activeTab === 'overdue'
      ? overdueReminders
      : completedReminders;

  const categories: ReminderCategory[] = [
    'Physical Health',
    'Mental Wellness',
    'Exercise',
    'Breathwork',
    'Hydration',
    'Sleep',
    'Medication',
    'Personal',
  ];

  const getCategoryIcon = (cat: ReminderCategory) => {
    switch (cat) {
      case 'Hydration':
        return <Droplet className="w-4 h-4 text-blue-500" />;
      case 'Breathwork':
        return <Wind className="w-4 h-4 text-violet-500" />;
      case 'Exercise':
        return <Dumbbell className="w-4 h-4 text-amber-500" />;
      case 'Mental Wellness':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'Sleep':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      case 'Medication':
        return <Pill className="w-4 h-4 text-emerald-500" />;
      default:
        return <User className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold mb-1.5">
            <Bell className="w-3.5 h-3.5 text-violet-600" />
            <span>Habit Planner & Reminders</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Reminders & Daily Planner
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build sustainable daily wellness rituals with punctual in-app and browser notifications
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-violet-200 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Reminder</span>
        </button>
      </div>

      {/* Browser Notification Status Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            notificationPermission === 'granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}>
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Browser Push Notifications: {notificationPermission === 'granted' ? 'Enabled' : notificationPermission === 'denied' ? 'Blocked in Browser' : 'Not Enabled Yet'}
            </span>
            <p className="text-[11px] text-slate-500">
              {notificationPermission === 'granted'
                ? 'CareNova will send gentle notification alerts to your browser when a reminder is due.'
                : 'Enable notifications to receive timely audio and visual prompts outside this tab.'}
            </p>
          </div>
        </div>

        {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
          <button
            onClick={requestNotificationAccess}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            Allow Notifications
          </button>
        )}
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'upcoming' ? 'bg-white text-violet-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upcoming ({upcomingReminders.length})
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overdue' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Overdue</span>
          {overdueReminders.length > 0 && (
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full text-[10px]">
              {overdueReminders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'completed' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Completed ({completedReminders.length})
        </button>
      </div>

      {/* Reminders List */}
      {displayList.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-slate-700">
            No {activeTab} reminders
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'upcoming'
              ? 'You are all caught up! Create a new hydration, breathwork, or workout reminder to stay on track.'
              : activeTab === 'overdue'
              ? 'Excellent! You have zero overdue tasks.'
              : 'Complete upcoming daily habits to review them here.'}
          </p>
          <div className="mt-4">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Add Reminder
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((rem) => (
            <div
              key={rem.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex items-start justify-between gap-3 ${
                rem.isCompleted
                  ? 'border-slate-200/60 bg-slate-50/50 opacity-80'
                  : 'border-slate-200/80 hover:border-violet-300 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleReminder(rem.id)}
                  aria-label={`Mark reminder complete: ${rem.title}`}
                  className="mt-0.5 text-slate-400 hover:text-violet-600 transition-colors cursor-pointer shrink-0"
                >
                  {rem.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-violet-500" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {getCategoryIcon(rem.category)}
                      <span>{rem.category}</span>
                    </span>
                    <span className="text-[10px] text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md font-semibold">
                      {rem.repeat}
                    </span>
                  </div>

                  <h4 className={`text-sm font-bold mt-1.5 truncate ${rem.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {rem.title}
                  </h4>

                  {rem.description && (
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {rem.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{rem.dueDate}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{rem.dueTime}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(rem)}
                  className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
                  title="Edit reminder"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteReminder(rem.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-heading font-bold text-base text-slate-900">
                {editingReminder ? 'Edit Reminder' : 'Create Wellness Reminder'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="rtitle">
                  Reminder Title
                </label>
                <input
                  id="rtitle"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Afternoon 3-min Box Breathing"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-violet-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="rdesc">
                  Description <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  id="rdesc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes or instructions..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-violet-500 outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ReminderCategory)}
                    aria-label="Select category"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Repeat</label>
                  <select
                    value={repeat}
                    onChange={(e) => setRepeat(e.target.value as ReminderRepeat)}
                    aria-label="Select repeat frequency"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    {(['Once', 'Daily', 'Weekdays', 'Weekly'] as ReminderRepeat[]).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="rdate">Date</label>
                  <input
                    id="rdate"
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="rtime">Time</label>
                  <input
                    id="rtime"
                    type="time"
                    required
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingReminder ? 'Save Changes' : 'Create Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
