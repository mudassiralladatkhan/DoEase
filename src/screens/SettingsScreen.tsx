import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import ToggleSwitch from '../components/ToggleSwitch';

const SettingsScreen: React.FC = () => {
  const { currentUser, refreshUserProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      setEmailNotifications(currentUser.email_notifications_enabled);
    }
  }, [currentUser]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);

    try {
      const { error } = await api.updateUser(currentUser.id, {
        username: username,
        email_notifications_enabled: emailNotifications,
      });

      if (error) throw error;

      await refreshUserProfile();
      toast.success('Settings updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center p-10 glass-pane">
        <Loader2 size={32} className="animate-spin text-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Settings</h1>

      <form onSubmit={handleSaveChanges}>
        <div className="glass-pane p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Profile Information</h2>
          <div className="space-y-6">
            <div className="form-group mb-0">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="form-group mb-0">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-input bg-bg-secondary cursor-not-allowed"
                value={currentUser.email || ''}
                disabled
              />
               <p className="text-xs text-text-secondary mt-2">Email address cannot be changed.</p>
            </div>
          </div>
        </div>

        <div className="glass-pane p-6 sm:p-8 mt-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Notifications</h2>
          <ToggleSwitch
            id="email-notifications"
            label="Enable Email Notifications"
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
           <p className="text-xs text-text-secondary mt-2">
            Receive reminders for tasks and updates on your streaks via email.
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsScreen;
