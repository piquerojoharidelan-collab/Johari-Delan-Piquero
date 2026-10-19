import React, { useState, useMemo } from 'react';
import {
  History,
  Flame,
  Wind,
  Filter,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Star,
  ArrowRight,
} from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import { ActivityRecord, ExerciseSession, BreathworkSession } from '../types/wellness';
import { formatDuration } from '../utils/analytics';

export const ActivityHistoryView: React.FC = () => {
  const { activities, deleteActivity, updateActivity, setActiveTab } = useWellness();

  const [activeTypeTab, setActiveTypeTab] = useState<'all' | 'exercise' | 'breathwork'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'partial'>('all');

  // Modal states
  const [selectedRecord, setSelectedRecord] = useState<ActivityRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editEffort, setEditEffort] = useState<number>(3);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // Filtered activities
  const filteredActivities = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 3600 * 1000;
    const todayStr = new Date().toISOString().slice(0, 10);

    return activities.filter((act) => {
      // Type filter
      if (activeTypeTab !== 'all' && act.type !== activeTypeTab) return false;

      // Completion filter
      if (completionFilter === 'completed' && !act.isCompleted) return false;
      if (completionFilter === 'partial' && act.isCompleted) return false;

      // Date filter
      const actTime = new Date(act.startedAt).getTime();
      const actDateStr = act.startedAt.slice(0, 10);

      if (dateFilter === 'today' && actDateStr !== todayStr) return false;
      if (dateFilter === '7days' && actTime < now - 7 * oneDay) return false;
      if (dateFilter === '30days' && actTime < now - 30 * oneDay) return false;

      return true;
    });
  }, [activities, activeTypeTab, dateFilter, completionFilter]);

  const handleOpenDetail = (act: ActivityRecord) => {
    setSelectedRecord(act);
    setEditNotes(act.notes || '');
    if (act.type === 'exercise') {
      setEditEffort((act as ExerciseSession).effortRating || 3);
    }
    setIsEditing(false);
  };

  const handleSaveEdits = () => {
    if (!selectedRecord) return;
    const updates: any = { notes: editNotes.trim() };
    if (selectedRecord.type === 'exercise') {
      updates.effortRating = editEffort;
    }
    updateActivity(selectedRecord.id, updates);
    setSelectedRecord({ ...selectedRecord, ...updates });
    setIsEditing(false);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      deleteActivity(recordToDelete);
      if (selectedRecord?.id === recordToDelete) {
        setSelectedRecord(null);
      }
      setRecordToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold mb-1.5">
            <History className="w-3.5 h-3.5 text-violet-600" />
            <span>Activity History & Audit</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Activity History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review, edit, and audit your verified exercise workouts and breathwork sessions
          </p>
        </div>

        <span className="text-xs font-bold bg-violet-50 text-violet-700 px-3 py-1.5 rounded-xl border border-violet-100 self-start sm:self-auto">
          {activities.length} total saved session{activities.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Tabs & Filters Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main 3 Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTypeTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTypeTab === 'all' ? 'bg-white text-violet-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Activities ({activities.length})
            </button>
            <button
              onClick={() => setActiveTypeTab('exercise')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTypeTab === 'exercise' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Exercise</span>
            </button>
            <button
              onClick={() => setActiveTypeTab('breathwork')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTypeTab === 'breathwork' ? 'bg-white text-violet-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-violet-500" />
              <span>Breathwork</span>
            </button>
          </div>

          {/* Sub Filters: Date range & Completion */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                aria-label="Filter by date range"
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-hidden"
              >
                <option value="all">All Dates</option>
                <option value="today">Today Only</option>
                <option value="7days">Past 7 Days</option>
                <option value="30days">Past 30 Days</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={completionFilter}
                onChange={(e) => setCompletionFilter(e.target.value as any)}
                aria-label="Filter by session status"
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed Only</option>
                <option value="partial">Partial / Interrupted</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200 shadow-xs">
          <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-slate-700">No session records match filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activities.length === 0
              ? 'You have not recorded any workouts or breathwork sessions yet. Completed sessions will automatically show here.'
              : 'Try adjusting your filters above to view other dates or session types.'}
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('exercise_tracker')}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Start Workout Tracker
            </button>
            <button
              onClick={() => setActiveTab('breathwork')}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
            >
              Start Guided Breathwork
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((act) => {
            const isEx = act.type === 'exercise';
            const ex = isEx ? (act as ExerciseSession) : null;
            const bw = !isEx ? (act as BreathworkSession) : null;

            return (
              <div
                key={act.id}
                onClick={() => handleOpenDetail(act)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-violet-300 shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left info */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isEx ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {isEx ? <Flame className="w-5 h-5" /> : <Wind className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-heading font-bold text-sm sm:text-base text-slate-900 group-hover:text-violet-700 transition-colors">
                        {isEx ? ex?.activityName : bw?.technique}
                      </h4>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        act.isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {act.isCompleted ? 'Completed' : 'Partial'}
                      </span>

                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {isEx ? ex?.category : 'Breathwork'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{new Date(act.startedAt).toLocaleDateString()} at {new Date(act.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {ex?.distanceKm && <span>• {ex.distanceKm} km</span>}
                      {ex?.sets && <span>• {ex.sets} sets</span>}
                      {bw && <span>• {bw.cyclesCompleted} cycles</span>}
                    </div>

                    {act.notes && (
                      <p className="text-xs text-slate-600 mt-1.5 italic line-clamp-1">
                        "{act.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right duration & actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="font-heading font-extrabold text-base text-violet-900 block">
                      {formatDuration(act.durationSeconds)}
                    </span>
                    <span className="text-[10px] text-slate-400">Duration</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecordToDelete(act.id);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Details / Edit Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  selectedRecord.type === 'exercise' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {selectedRecord.type === 'exercise' ? <Flame className="w-4 h-4" /> : <Wind className="w-4 h-4" />}
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  {selectedRecord.type === 'exercise' ? (selectedRecord as ExerciseSession).activityName : (selectedRecord as BreathworkSession).technique}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Record Metrics Table */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Session Type:</span>
                <span className="font-bold text-slate-800 capitalize">{selectedRecord.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recorded Duration:</span>
                <span className="font-extrabold text-violet-700">{formatDuration(selectedRecord.durationSeconds)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className={`font-bold ${selectedRecord.isCompleted ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {selectedRecord.isCompleted ? 'Successfully Completed' : 'Partial / Interrupted'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Started At:</span>
                <span className="font-medium text-slate-700">{new Date(selectedRecord.startedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Finished At:</span>
                <span className="font-medium text-slate-700">{new Date(selectedRecord.finishedAt).toLocaleString()}</span>
              </div>
              {selectedRecord.type === 'breathwork' && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Completed Breath Cycles:</span>
                  <span className="font-bold text-slate-800">{(selectedRecord as BreathworkSession).cyclesCompleted}</span>
                </div>
              )}
            </div>

            {/* Editable Notes & Effort */}
            <div className="space-y-3 pt-2">
              {selectedRecord.type === 'exercise' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Effort Rating (1 to 5):</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setEditEffort(star);
                          setIsEditing(true);
                        }}
                        className="p-1 text-amber-400 hover:text-amber-500"
                      >
                        <Star className={`w-4 h-4 ${star <= editEffort ? 'fill-current' : 'text-slate-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Notes:</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => {
                    setEditNotes(e.target.value);
                    setIsEditing(true);
                  }}
                  placeholder="Add reflections, muscle sensations, or notes..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:border-violet-500 outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRecordToDelete(selectedRecord.id)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Session</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleSaveEdits}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-base text-slate-900">Confirm Deletion</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete this activity session from your history?
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRecordToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
