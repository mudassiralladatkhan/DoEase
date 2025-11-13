import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const SignInScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await api.signIn(email, password);
      if (error) {
        throw error;
      }
      toast.success('Signed in successfully!');
      // The AuthProvider will handle navigation
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg p-8 rounded-lg shadow-xl animate-slide-in border border-white/20">
        <div className="text-center mb-8">
          <img src="https://i.ibb.co/d6rTzJc/doease-logo.jpg" alt="DoEase Logo" className="w-16 h-16 mx-auto rounded-lg mb-4" />
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-white/80">Sign in to continue your journey.</p>
        </div>
        <form onSubmit={handleSignIn}>
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
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary bg-white text-primary hover:bg-gray-200" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-6 text-center text-white/80">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-white hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInScreen;
