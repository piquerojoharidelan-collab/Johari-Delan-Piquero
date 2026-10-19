/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { WellnessProvider, useWellness } from './context/WellnessContext';
import { Navigation } from './components/Navigation';
import { AuthModal } from './components/AuthModal';
import { OnboardingAssessment } from './components/OnboardingAssessment';
import { SessionCompletionModal } from './components/SessionCompletionModal';
import { DashboardView } from './components/DashboardView';
import { ExerciseTrackerView } from './components/ExerciseTrackerView';
import { BreathworkView } from './components/BreathworkView';
import { AIChatView } from './components/AIChatView';
import { ActivityHistoryView } from './components/ActivityHistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { RemindersView } from './components/RemindersView';
import { ActivityLibraryView } from './components/ActivityLibraryView';
import { MentalWellnessView } from './components/MentalWellnessView';
import { PhysicalWellnessView } from './components/PhysicalWellnessView';
import { ProfileSettingsView } from './components/ProfileSettingsView';

const CareNovaApp: React.FC = () => {
  const { currentUser, isAuthenticated, activeTab, loadDemoUser } = useWellness();

  // Support ?autostart=1 query parameter to skip straight to main view (per testing guidelines)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1' && !currentUser) {
        loadDemoUser();
      }
    }
  }, [currentUser, loadDemoUser]);

  // 1. Unauthenticated -> Show Welcome & Auth Flow
  if (!isAuthenticated || !currentUser) {
    return <AuthModal />;
  }

  // 2. Authenticated but onboarding not completed -> Show Onboarding Assessment
  if (!currentUser.onboardingCompleted) {
    return <OnboardingAssessment />;
  }

  // 3. Main App Layout
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'ai_chat':
        return <AIChatView />;
      case 'physical_wellness':
        return <PhysicalWellnessView />;
      case 'exercise_tracker':
        return <ExerciseTrackerView />;
      case 'breathwork':
        return <BreathworkView />;
      case 'activity_history':
        return <ActivityHistoryView />;
      case 'mental_wellness':
        return <MentalWellnessView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'reminders':
        return <RemindersView />;
      case 'activity_library':
        return <ActivityLibraryView />;
      case 'profile_settings':
        return <ProfileSettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9fc] text-slate-900 flex flex-col lg:flex-row">
      {/* Navigation: Desktop Sidebar + Mobile Topbar/Drawer */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-12">
        {renderCurrentView()}
      </main>

      {/* Global Session Completion Celebration Screen & Sound Chime */}
      <SessionCompletionModal />
    </div>
  );
};

export default function App() {
  return (
    <WellnessProvider>
      <CareNovaApp />
    </WellnessProvider>
  );
}
