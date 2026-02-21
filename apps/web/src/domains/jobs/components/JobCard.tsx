import { motion } from 'framer-motion';
import { JobDTO } from '../../../system/api/jobsApi';

interface JobCardProps {
  job: JobDTO;
  onDragEnd: (info: any) => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

export function JobCard({ job, onDragEnd, onHoverStart, onHoverEnd }: JobCardProps) {
  const isNewJob = job.createdAt && new Date(job.createdAt).getTime() > Date.now() - 5 * 60 * 1000;
  const matchScore = job.matchScore ?? 0;
  const isHighMatch = matchScore >= 80;

  return (
    <motion.div
      drag
      dragElastic={0.2}
      dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
      onDragEnd={onDragEnd}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      whileDrag={{ scale: 1.05 }}
      className="absolute w-full h-full cursor-grab active:cursor-grabbing"
      style={{
        backgroundColor: 'rgba(26, 26, 46, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {isHighMatch && (
              <div className="px-2 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50">
                <span className="text-xs font-semibold text-cyan-300">{matchScore}% Match</span>
              </div>
            )}
            {!isHighMatch && matchScore > 0 && (
              <div className="px-2 py-1 rounded-full bg-gray-500/20 border border-gray-500/50">
                <span className="text-xs font-semibold text-gray-300">{matchScore}% Match</span>
              </div>
            )}
            {isNewJob && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-2 py-1 rounded-full bg-violet-500/20 border border-violet-500/50"
              >
                <span className="text-xs font-semibold text-violet-300">NEW</span>
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex-1 mb-4">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{job.title}</h3>
          <p className="text-sm text-gray-300 line-clamp-3">{job.description}</p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-cyan-400">${job.budgetMax}</span>
            {job.estimatedDuration && (
              <span className="text-sm text-gray-400">{job.estimatedDuration} min</span>
            )}
          </div>

          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-gray-300"
                >
                  {skill}
                </span>
              ))}
              {job.requiredSkills.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-400">+{job.requiredSkills.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <p className="text-xs text-gray-500">Client</p>
            <p className="text-sm font-semibold text-white">Client {job.clientId}</p>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-yellow-400/30" />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none rounded-lg opacity-0 hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-violet-500/10" />
      </div>
    </motion.div>
  );
}
