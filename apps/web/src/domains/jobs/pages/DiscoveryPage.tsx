import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetDiscoveryFeed, useClaimJob, JobDTO } from '../../../system/api/jobsApi';
import { useWebSocket } from '../../../system/hooks/useWebSocket';
import { CardStack } from '../components/CardStack';
import { showToast } from '../../../system/components/Toast';

export function DiscoveryPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetDiscoveryFeed();
  const claimMutation = useClaimJob();
  const { subscribeToDiscovery } = useWebSocket();

  const [jobs, setJobs] = useState<JobDTO[]>([]);
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (data?.data) {
      setJobs(data.data);
    }
  }, [data]);

  useEffect(() => {
    const unsubscribe = subscribeToDiscovery((newJobData) => {
      const newJob = newJobData.job as JobDTO;
      setJobs((prev) => [...prev, newJob]);
      showToast(`New job: ${newJob.title}`, 'success', 2000);
    });

    return () => {
      unsubscribe?.();
    };
  }, [subscribeToDiscovery]);

  const handleClaim = useCallback(
    async (jobId: number) => {
      const job = jobs.find((j) => j.id === jobId);
      if (!job) return;

      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      showToast(`Claimed! $${job.budgetMax}`, 'success');

      try {
        await claimMutation.mutateAsync({ jobId });
        navigate(`/claimed/${jobId}`);
      } catch (err) {
        setJobs((prev) => [job, ...prev]);
        showToast('Failed to claim job', 'error');
      }
    },
    [jobs, claimMutation, navigate]
  );

  const handleSkip = useCallback((jobId: number) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setSkipped((prev) => new Set([...prev, jobId]));
  }, []);

  const handleSave = useCallback((jobId: number) => {
    setSaved((prev) => new Set([...prev, jobId]));
    showToast('Job saved', 'success', 2000);
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Sharedjox</h1>
          <p className="text-xs text-gray-400">Discovery</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors relative"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full" />
        </motion.button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md h-full relative">
          <CardStack
            jobs={jobs}
            onClaim={handleClaim}
            onSkip={handleSkip}
            onSave={handleSave}
            isLoading={isLoading}
          />
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-4 bg-red-500/10 border border-red-500/50 rounded-lg mx-6 mb-6"
        >
          <p className="text-red-300 text-sm">Failed to load jobs. Please try again.</p>
        </motion.div>
      )}

      <div className="px-6 py-4 text-center text-xs text-gray-500">
        {jobs.length > 0 && <p>{jobs.length} jobs available</p>}
        {saved.size > 0 && <p className="mt-1">{saved.size} jobs saved</p>}
      </div>
    </div>
  );
}
