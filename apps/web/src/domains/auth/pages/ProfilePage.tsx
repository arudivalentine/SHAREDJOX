import { motion } from 'framer-motion';
import { useAuthStore } from '../../../system/stores/authStore';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg backdrop-blur-xl p-8"
          style={{
            backgroundColor: 'rgba(26, 26, 46, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{user?.name?.[0] || 'U'}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.name || 'User'}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-left"
                >
                  Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-left"
                >
                  Change Password
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-left"
                >
                  Notification Settings
                </motion.button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-sm">React</span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-sm">TypeScript</span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-sm">Node.js</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="w-full px-6 py-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 font-semibold hover:bg-red-500/30 transition-colors"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
