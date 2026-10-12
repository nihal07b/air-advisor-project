import { useState } from 'react';
import './App.css';

import OnboardingForm from './OnboardingForm';
import TodayView from './TodayView';
import ReportView from './ReportView';

export default function App() {
  // Load saved profile from localStorage
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('profile') || 'null');
    } catch {
      return null;
    }
  });

  // Track the active tab
  const [tab, setTab] = useState('today');

  // Reset profile and return to onboarding
  const resetProfile = () => {
    localStorage.removeItem('profile');
    setProfile(null);
    setTab('today');
  };

  // Show onboarding when no profile exists
  if (!profile) {
    return (
      <div className="page">
        <header>
          <h1>Air Advisor</h1>
          <p>Your daily guide to healthier travel decisions.</p>
        </header>

        <OnboardingForm onDone={setProfile} />

        <p className="note">
          Air quality estimates are for general guidance only.
          Follow official local advisories.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Application header */}
      <header>
        <h1>Air Advisor</h1>
        <p>Your daily guide to healthier travel decisions.</p>
      </header>

      {/* Saved travel profile */}
      <div className="card">
        <h2>Your Travel Profile</h2>

        <p>
          <strong>Home:</strong> {profile.home?.name || 'Not specified'}
        </p>

        <p>
          <strong>Destination:</strong>{' '}
          {profile.dest?.name || 'Not specified'}
        </p>

        <p>
          <strong>Travel mode:</strong> {profile.mode || 'Not specified'}
        </p>

        <button type="button" onClick={resetProfile}>
          Edit Travel Profile
        </button>

        <button
          type="button"
          onClick={resetProfile}
          className="reset-button"
        >
          Reset Profile
        </button>
      </div>

      {/* Navigation tabs */}
      <nav className="tabs" aria-label="Main navigation">
        <button
          type="button"
          className={tab === 'today' ? 'active' : ''}
          aria-pressed={tab === 'today'}
          onClick={() => setTab('today')}
        >
          Today
        </button>

        <button
          type="button"
          className={tab === 'report' ? 'active' : ''}
          aria-pressed={tab === 'report'}
          onClick={() => setTab('report')}
        >
          Report
        </button>
      </nav>

      {/* Main content */}
      <main>
        {tab === 'today' && <TodayView profile={profile} />}

        {tab === 'report' && <ReportView profile={profile} />}
      </main>

      {/* General disclaimer */}
      <footer className="note">
        <p>
          Air quality estimates are for general guidance only.
          They are not medical advice. Follow official local advisories.
        </p>
      </footer>
    </div>
  );
}