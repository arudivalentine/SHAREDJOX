import { motion, AnimatePresence } from 'framer-motion';
import { JobDTO } from '../../../system/api/jobsApi';
import { JobCard } from './JobCard';

interface CardStackProps {
  jobs: JobDTO[];
  onClaim: (jobId: number) => void;
  onSkip: (jobId: number) => void;
  onSave: (jobId: number) => void;
  isLoading?: boolean;
}

export function CardStack({ jobs, onClaim, onSkip, onSave, isLoading }: CardStackProps) {
  const handleDragEnd = (index: number, info: any) => {
    const swipeThreshold = 100;
    const swipeVelocityThreshold = 500;

    const swipe = Math.abs(info.offset.x) > swipeThreshold || Math.abs(info.velocity.x) > swipeVelocityThreshold;

    if (!swipe) {
      return;
    }

    const job = jobs[index];

    if (info.offset.x > swipeThreshold) {
      onClaim(job.id);
    } else if (info.offset.x < -swipeThreshold) {
      onSkip(job.id);
    } else if (info.offset.y < -swipeThreshold) {
      onSave(job.id);
    }
  };

  if (isLoading && jobs.length === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
              className="w-96 h-96 rounded-lg"
              style={{
                backgroundColor: 'rgba(26, 26, 46, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-2xl font-bold text-white mb-2">No jobs right now</h3>
          <p className="text-gray-400 mb-6">Check back at 9am for new opportunities</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-semibold hover:bg-cyan-500/30 transition-colors"
          >
            Pull to refresh
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="popLayout">
        {jobs.slice(0, 3).map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{
              scale: 1 - index * 0.05,
              opacity: 1 - index * 0.2,
              y: index * 12,
              zIndex: 100 - index,
            }}
            exit={{
              scale: 0.8,
              opacity: 0,
              transition: { duration: 0.2 },
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0"
          >
            <JobCard
              job={job}
              onDragEnd={(info) => handleDragEnd(index, info)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="absolute -bottom-20 left-0 right-0 flex justify-center gap-8 text-xs font-semibold text-gray-500">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-red-500/50 flex items-center justify-center">←</div>
          <span>Skip</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500/50 flex items-center justify-center">→</div>
          <span>Claim</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500/50 flex items-center justify-center">↑</div>
          <span>Save</span>
        </div>
      </div>
    </div>
  );
}
