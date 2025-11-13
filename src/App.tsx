import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardScreen from './screens/DashboardScreen';
import LandingScreen from './screens/LandingScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';

const GlobalLoader: React.FC = () => (
  <div className="fixed top-0 left-0 w-full h-full bg-bg-primary/70 backdrop-blur-sm flex justify-center items-center z-[9999]">
    <div className="w-9 h-9 border-4 border-gray-200 border-l-primary rounded-full animate-spin"></div>
  </div>
);

const ConfigurationError: React.FC<{ error: string | null }> = ({ error }) => (
  <div className="flex items-center justify-center min-h-screen p-8 bg-gradient-to-br from-indigo-400 to-purple-500">
    <div className="bg-white p-10 rounded-lg shadow-xl max-w-2xl w-full">
      <h2 className="text-2xl font-bold text-danger mb-4">Configuration Error</h2>
      <p className="mb-6">There seems to be an issue with the application's configuration.</p>
      <div className="bg-danger-bg border-l-4 border-danger text-danger-text p-4 rounded-sm mb-6 break-words">
        <p><strong>Error:</strong> {error}</p>
      </div>
      <h4 className="text-lg font-semibold mb-4 text-text-primary">Next Steps:</h4>
      <ol className="list-decimal list-inside text-text-secondary space-y-3">
        <li>Ensure you have a <code>.env</code> file in the project root.</li>
        <li>Verify that <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> are correct.</li>
        <li>If you connected the Supabase integration, these should be set automatically. Try refreshing the page.</li>
      </ol>
    </div>
  </div>
);

function App() {
  const { currentUser, loading, isConfigured, configurationError } = useAuth();

  if (!isConfigured) {
    return <ConfigurationError error={configurationError} />;
  }

  if (loading) {
    return <GlobalLoader />;
  }

  return (
    <Routes>
      {currentUser ? (
        <>
          <Route path="/dashboard/*" element={<DashboardScreen />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <>
          <Route path="/signin" element={<SignInScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/" element={<LandingScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;
