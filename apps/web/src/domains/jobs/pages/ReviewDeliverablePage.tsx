import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetMyJobs } from '../../../system/api/jobsApi';
import { useWebSocket } from '../../../system/hooks/useWebSocket';
import { JobDTO } from '../../../system/api/jobsApi';
import { showToast } from '../../../system/components/Toast';
import { apiClient } from '../../../system/api/apiClient';

export function ReviewDeliverablePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: jobs } = useGetMyJobs('posted');
  const { subscribeToJob } = useWebSocket();

  const [job, setJob] = useState<JobDTO | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (jobs && id) {
      const foundJob = jobs.find((j) => j.id === parseInt(id));
      if (foundJob) {
        setJob(foundJob);
      }
    }
  }, [jobs, id]);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = subscribeToJob(parseInt(id), (update) => {
      if (update.job) {
        setJob(update.job);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [id, subscribeToJob]);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const response = await apiClient.post(`/api/jobs/${id}/complete`);
      setJob(response.data.data);
      setConfetti(true);
      showToast('Job approved! Payment released.', 'success');
      setTimeout(() => navigate('/my-jobs'), 2000);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to approve job';
      showToast(message, 'error');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!feedback.trim()) {
      showToast('Please provide feedback', 'error');
      return;
    }

    setIsRequesting(true);
    try {
      const response = await apiClient.post(`/api/jobs/${id}/request-changes`, {
        feedback,
      });
      setJob(response.data.data);
      setFeedback('');
      setShowRequestModal(false);
      showToast('Revision request sent to freelancer', 'success');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to request changes';
      showToast(message, 'error');
    } finally {
      setIsRequesting(false);
    }
  };

  if (!job) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-gray-400"
        >
          Loading deliverables...
        </motion.div>
      </div>
    );
  }

  const isCompleted = job.status === 'completed';
  const isPendingReview = job.status === 'pending_review';

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {confetti && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="fixed inset-0 pointer-events-none"
        >
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
                opacity: 1,
              }}
              animate={{
                y: window.innerHeight,
                opacity: 0,
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: Math.random() * 0.5,
              }}
              className="fixed w-2 h-2 bg-cyan-400 rounded-full"
            />
          ))}
        </motion.div>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/my-jobs')}
        className="mb-6 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
      >
        ← Back to My Jobs
      </motion.button>

      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg backdrop-blur-xl p-6"
          style={{
            backgroundColor: 'rgba(26, 26, 46, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
              <p className="text-gray-400">Freelancer ID: {job.claimedBy}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-cyan-400">${job.budgetMax}</p>
              <p className="text-sm text-gray-400">Budget</p>
            </div>
          </div>

          <p className="text-gray-300 mb-6">{job.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Duration</p>
              <p className="text-lg font-semibold text-white">{job.estimatedDuration} minutes</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p className={`text-lg font-semibold ${isPendingReview ? 'text-yellow-400' : 'text-green-400'}`}>
                {isPendingReview ? 'Pending Review' : 'Completed'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg backdrop-blur-xl p-6"
          style={{
            backgroundColor: 'rgba(26, 26, 46, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Deliverables</h2>

          {job.deliverables && Array.isArray(job.deliverables) && job.deliverables.length > 0 ? (
            <div className="space-y-3">
              {job.deliverables.map((deliverable: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <svg className="w-5 h-5 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">{deliverable.filename}</p>
                      <p className="text-xs text-gray-500">{(deliverable.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={`/storage/${deliverable.path}`}
                    download
                    className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 transition-colors"
                  >
                    Download
                  </motion.a>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No deliverables submitted yet</p>
          )}
        </motion.div>

        {isPendingReview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg backdrop-blur-xl p-6"
            style={{
              backgroundColor: 'rgba(26, 26, 46, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2 className="text-xl font-bold text-white mb-4">Review & Approve</h2>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApprove}
                disabled={isApproving}
                className="flex-1 px-6 py-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 font-semibold hover:bg-green-500/30 disabled:opacity-50 transition-colors"
              >
                {isApproving ? 'Approving...' : '✓ Approve & Pay'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRequestModal(true)}
                className="flex-1 px-6 py-3 rounded-lg bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 font-semibold hover:bg-yellow-500/30 transition-colors"
              >
                Request Changes
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 font-semibold hover:bg-red-500/30 transition-colors"
              >
                Dispute
              </motion.button>
            </div>
          </motion.div>
        )}

        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg backdrop-blur-xl p-6"
            style={{
              backgroundColor: 'rgba(26, 26, 46, 0.5)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-lg font-bold text-green-400">Completed - Payment Released</p>
              </div>
            </div>
          </motion.div>
        )}

        {showRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-lg backdrop-blur-xl p-6 max-w-md w-full"
              style={{
                backgroundColor: 'rgba(26, 26, 46, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h3 className="text-xl font-bold text-white mb-4">Request Changes</h3>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe what changes you'd like..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none mb-4"
                rows={4}
              />

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRequestChanges}
                  disabled={isRequesting}
                  className="flex-1 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-semibold hover:bg-cyan-500/30 disabled:opacity-50 transition-colors"
                >
                  {isRequesting ? 'Sending...' : 'Send Request'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowRequestModal(false);
                    setFeedback('');
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
