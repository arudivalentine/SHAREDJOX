import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGetMyJobs } from '../../../system/api/jobsApi';
import { useWebSocket } from '../../../system/hooks/useWebSocket';
import { JobDTO } from '../../../system/api/jobsApi';

export function MyJobsPage() {
  const [tab, setTab] = useState<'posted' | 'claimed'>('posted');
  const { data: jobs, isLoading } = useGetMyJobs(tab);
  const { subscribeToUser } = useWebSocket();
  const [jobUpdates, setJobUpdates] = useState<Map<number, Partial<JobDTO>>>(new Map());

  useEffect(() => {
    const unsubscribe = subscribeToUser(1, (update) => {
      if (update.job) {
        setJobUpdates((prev) => new Map(prev).set(update.job.id, update.job));
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [subscribeToUser]);

  const displayJobs = jobs?.map((job) => ({
    ...job,
    ...jobUpdates.get(job.id),
  })) || [];

  const getStatusBadge = (job: JobDTO) => {
    switch (job.status) {
      case 'active':
        return (
          <div className="flex items-center gap-2">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm text-green-400">Looking for talent</span>
          </div>
        );
      case 'claimed':
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full" />
            <span className="text-sm text-cyan-400">In progress</span>
          </div>
        );
      case 'pending_review':
        return (
          <div className="flex items-center gap-2">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span className="text-sm text-yellow-400">Awaiting review</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-violet-500 rounded-full" />
            <span className="text-sm text-violet-400">Completed</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">My Jobs</h1>

        <div className="flex gap-4 mb-8 border-b border-white/10">
          {(['posted', 'claimed'] as const).map((t) => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 font-semibold transition-colors ${
                tab === t ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'posted' ? 'Posted' : 'Claimed'}
            </motion.button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                className="h-24 rounded-lg bg-white/5 border border-white/10"
              />
            ))}
          </div>
        ) : displayJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No {tab} jobs yet</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-semibold hover:bg-cyan-500/30 transition-colors"
            >
              {tab === 'posted' ? 'Post a Job' : 'Browse Jobs'}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {displayJobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg backdrop-blur-xl p-6 border border-white/10 hover:border-white/20 transition-colors"
                style={{
                  backgroundColor: 'rgba(26, 26, 46, 0.5)',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
                    <p className="text-sm text-gray-400">{job.description.substring(0, 100)}...</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyan-400">${job.budgetMax}</p>
                    <p className="text-xs text-gray-500">{job.estimatedDuration} min</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>{getStatusBadge(job)}</div>
                  {job.status === 'claimed' && tab === 'posted' && (
                    <div className="text-sm text-gray-400">Claimed by freelancer</div>
                  )}
                  {job.status === 'pending_review' && tab === 'posted' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.href = `/review/${job.id}`}
                      className="px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-sm font-semibold hover:bg-yellow-500/30 transition-colors"
                    >
                      Review Deliverable
                    </motion.button>
                  )}
                  {job.status === 'claimed' && tab === 'claimed' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 transition-colors"
                    >
                      View Details
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
