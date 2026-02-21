import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavItem {
  path: string;
  icon: ReactNode;
  label: string;
  badge?: number;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      path: '/discovery',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m0 0h4m-4 0v4m0-4h4m0 0h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m0 0v-4m0 4h-4" />
        </svg>
      ),
      label: 'Discovery',
    },
    {
      path: '/post',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      label: 'Post',
    },
    {
      path: '/my-jobs',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
      label: 'Jobs',
    },
    {
      path: '/wallet',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Wallet',
    },
    {
      path: '/profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Profile',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <motion.div
        initial={{ x: -64 }}
        animate={{ x: 0 }}
        className="hidden md:flex flex-col w-16 bg-white/5 border-r border-white/10 backdrop-blur-xl"
      >
        <div className="flex-1 flex flex-col items-center gap-4 py-6">
          {navItems.map((item) => (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className={`relative p-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-cyan-500/20 border-l-2 border-cyan-500 text-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title={item.label}
            >
              {item.icon}
              {item.badge && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
                >
                  {item.badge}
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all mb-4"
          title="Logout"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </motion.button>
      </motion.div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.div
          initial={{ y: -64 }}
          animate={{ y: 0 }}
          className="md:hidden flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10 backdrop-blur-xl"
        >
          <h1 className="text-lg font-bold text-white">Sharedjox</h1>
          <div className="flex gap-2">
            {navItems.slice(0, 3).map((item) => (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
                className={`p-2 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.icon}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="flex-1 overflow-auto">{children}</div>

        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          className="md:hidden flex items-center justify-around px-4 py-3 bg-white/5 border-t border-white/10 backdrop-blur-xl"
        >
          {navItems.map((item) => (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
