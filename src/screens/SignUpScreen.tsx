import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const SignUpScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { error } = await api.signUp({ username, email, password, timezone });
      if (error) {
        throw error;
      }
      toast.success('Account created! Please check your email to verify.');
      // The AuthProvider will handle navigation after verification (or immediately if disabled)
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg p-8 rounded-lg shadow-xl animate-slide-in border border-white/20">
        <div className="text-center mb-8">
          <img src="https://i.ibb.co/d6rTzJc/doease-logo.jpg" alt="DoEase Logo" className="w-16 h-16 mx-auto rounded-lg mb-4" />
          <h2 className="text-3xl font-bold text-white">Create Your Account</h2>
          <p className="text-white/80">Start your productivity journey today.</p>
        </div>
        <form onSubmit={handleSignUp}>
          <div className="form-group">
            <label className="form-label text-white/80" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-input bg-white/20 text-white placeholder-white/50 border-white/30 focus:bg-white/30"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your Name"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label text-white/80" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input bg-white/20 text-white placeholder-white/50 border-white/30 focus:bg-white/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label text-white/80" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input bg-white/20 text-white placeholder-white/50 border-white/30 focus:bg-white/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="min. 6 characters"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary bg-white text-primary hover:bg-gray-200" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-white/80">
          Already have an account?{' '}
          <Link to="/signin" className="font-semibold text-white hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpScreen;
