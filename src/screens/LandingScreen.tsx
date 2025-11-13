import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const LandingScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <header className="p-4 sm:p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="https://i.ibb.co/d6rTzJc/doease-logo.jpg" alt="DoEase Logo" className="w-8 h-8 rounded-md" />
          <span className="text-xl font-bold text-text-primary">DoEase</span>
        </div>
        <button
          onClick={() => navigate('/signin')}
          className="btn btn-secondary btn-small"
        >
          Sign In
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="text-center max-w-3xl animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-4">
            Beat Procrastination, One Task at a Time.
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary mb-8">
            DoEase is your smart companion to build discipline, manage tasks, and maintain streaks.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="btn btn-primary btn-large"
          >
            Get Started for Free
          </button>

          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-text-secondary">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-secondary" />
              <span>Smart Task Management</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-secondary" />
              <span>Streak Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-secondary" />
              <span>AI-Powered Insights</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-text-secondary text-sm">
        &copy; {new Date().getFullYear()} DoEase. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingScreen;
