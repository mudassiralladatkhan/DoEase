import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart2, Settings, LogOut, Menu, X, Flame, LayoutDashboard } from 'lucide-react';
import { NavLink, Route, Routes } from 'react-router-dom';
import TaskManager from '../components/TaskManager';
import SettingsScreen from './SettingsScreen';
import AnalyticsScreen from './AnalyticsScreen';

const Sidebar: React.FC<{ isOpen: boolean; toggle: () => void }> = ({ isOpen, toggle }) => {
  const { currentUser, signOut } = useAuth();

  const navLinkClasses = "flex items-center gap-3 px-4 py-3 rounded-md transition-colors duration-200";
  const activeClass = "bg-primary/20 text-primary font-semibold";
  const inactiveClass = "text-text-secondary hover:bg-glass-bg hover:text-text-primary";

  const userInitial = currentUser?.username?.charAt(0).toUpperCase() || currentUser?.email?.charAt(0).toUpperCase() || 'U';
  const userName = currentUser?.username || currentUser?.email || 'User';
  const userEmail = currentUser?.email || '';

  return (
    <>
      <aside className={`bg-bg-secondary text-text-primary w-64 fixed top-0 left-0 h-full z-40 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 border-r border-border-color`}>
        <div className="flex items-center justify-between p-4 border-b border-border-color h-16">
          <div className="flex items-center gap-2">
            <img src="https://i.ibb.co/d6rTzJc/doease-logo.jpg" alt="DoEase Logo" className="w-8 h-8 rounded-md" />
            <span className="text-xl font-bold text-white">DoEase</span>
          </div>
          <button onClick={toggle} className="lg:hidden icon-btn"><X size={20} /></button>
        </div>
        <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
          <nav className="p-4 space-y-2">
            <NavLink to="/dashboard" end className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClass : inactiveClass}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/dashboard/analytics" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClass : inactiveClass}`}>
              <BarChart2 size={20} />
              <span>Analytics</span>
            </NavLink>
            <NavLink to="/dashboard/settings" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeClass : inactiveClass}`}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </nav>
          <div className="p-4 border-t border-border-color">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-white">
                {userInitial}
              </div>
              <div>
                <p className="font-semibold text-white">{userName}</p>
                {userEmail && <p className="text-xs text-text-secondary">{userEmail}</p>}
              </div>
            </div>
            <button onClick={signOut} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-white transition-colors">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
      {isOpen && <div onClick={toggle} className="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>}
    </>
  );
};

const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  const { currentUser } = useAuth();
  return (
    <header className="bg-bg-secondary/50 backdrop-blur-md h-16 flex items-center justify-between lg:justify-end px-6 border-b border-border-color sticky top-0 z-20">
      <button onClick={toggleSidebar} className="icon-btn lg:hidden">
        <Menu size={24} />
      </button>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-orange-400">
          <Flame size={20} />
          <span className="font-bold text-lg">{currentUser?.current_streak || 0}</span>
          <span className="text-sm text-text-secondary">day streak</span>
        </div>
      </div>
    </header>
  );
};

const DashboardScreen: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const { currentUser, loading } = useAuth();

  // Show loading if we're still fetching user data
  if (loading) {
    return (
      <div className="flex h-screen bg-bg-primary items-center justify-center">
        <div className="w-9 h-9 border-4 border-gray-200 border-l-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-primary">
      <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Routes>
            <Route path="/" element={<TaskManager />} />
            <Route path="/analytics" element={<AnalyticsScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardScreen;
