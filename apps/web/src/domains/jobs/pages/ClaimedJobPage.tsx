import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGetDiscoveryFeed } from '../../../system/api/jobsApi';
import { useWebSocket } from '../../../system/hooks/useWebSocket';
import { JobDTO } from '../../../system/api/jobsApi';
import { showToast } from '../../../system/components/Toast';

export function ClaimedJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data } = useGetDiscoveryFeed();
  const { subscribeToJob } = useWebSocket();

  const [job, setJob] = useState<JobDTO | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(2 * 60 * 60);
  const [deliverables, setDeliverables] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data?.data && id) {
      const foundJob = data.data.find((j) => j.id === parseInt(id));
      if (foundJob) {
        setJob(foundJob);
      }
    }
  }, [data, id]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const isUrgent = timeRemaining < 30 * 60;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (deliverables.length + newFiles.length > 5) {
        showToast('Maximum 5 files allowed', 'error');
        return;
      }
      setDeliverables((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setDeliverables((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (deliverables.length === 0 && !notes.trim()) {
      showToast('Please add deliverables or notes', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      deliverables.forEach((file) => {
        formData.append('files[]', file);
      });
      formData.append('notes', notes);

      showToast('Deliverables submitted!', 'success');
      setDeliverables([]);
      setNotes('');
    } catch (err) {
      showToast('Failed to submit deliverables', 'error');
    } finally {
      setIsSubmitting(false);
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
          Loading job details...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/discovery')}
        className="mb-6 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
      >
        ← Back to Discovery
      </motion.button>

      <div className="max-w-2xl mx-auto space-y-6">
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
              <p className="text-gray-400">Client {job.clientId}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-cyan-400">${job.budgetMax}</p>
              <p className="text-sm text-gray-400">Budget</p>
            </div>
          </div>

          <p className="text-gray-300 mb-6">{job.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Duration</p>
              <p className="text-lg font-semibold text-white">{job.estimatedDuration} minutes</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p className="text-lg font-semibold text-cyan-400">In Progress</p>
            </div>
          </div>

          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg backdrop-blur-xl p-6"
          style={{
            backgroundColor: 'rgba(26, 26, 46, 0.5)',
            border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Time Remaining</h2>
            {isUrgent && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-300 text-sm font-semibold"
              >
                Urgent
              </motion.div>
            )}
          </div>
          <p className={`text-4xl font-bold ${isUrgent ? 'text-red-400' : 'text-cyan-400'}`}>
            {formatTime(timeRemaining)}
          </p>
          <div className="mt-4 w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${(timeRemaining / (2 * 60 * 60)) * 100}%` }}
              className={`h-full ${isUrgent ? 'bg-red-500' : 'bg-cyan-500'}`}
            />
          </div>
        </motion.div>

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
          <h2 className="text-xl font-bold text-white mb-4">Submit Deliverables</h2>

          <div className="mb-6 p-6 border-2 border-dashed border-cyan-500/50 rounded-lg hover:border-cyan-500 transition-colors cursor-pointer bg-cyan-500/5">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
              accept="image/*,.pdf,.doc,.docx,.zip"
            />
            <label htmlFor="file-input" className="cursor-pointer block text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="text-white font-semibold">Drop files here or click to upload</p>
              <p className="text-sm text-gray-400">Max 5 files, 10MB each</p>
            </label>
          </div>

          {deliverables.length > 0 && (
            <div className="mb-6 space-y-2">
              {deliverables.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                    <span className="text-sm text-white truncate">{file.name}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your deliverables..."
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-semibold hover:bg-cyan-500/30 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Deliverables'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 font-semibold hover:bg-red-500/30 transition-colors"
            >
              Cancel Job
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
