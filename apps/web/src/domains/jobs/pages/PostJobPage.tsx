import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePostJob } from '../../../system/api/jobsApi';
import { showToast } from '../../../system/components/Toast';

export function PostJobPage() {
  const navigate = useNavigate();
  const postJobMutation = usePostJob();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget_min: 10,
    budget_max: 100,
    estimated_duration: 30,
    required_skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('budget') || name === 'estimated_duration' ? parseInt(value) : value,
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.required_skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        required_skills: [...prev.required_skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      await postJobMutation.mutateAsync(formData);
      showToast('Job posted successfully!', 'success');
      navigate('/my-jobs?tab=posted');
    } catch (err) {
      showToast('Failed to post job', 'error');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/discovery')}
        className="mb-6 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
      >
        ← Back
      </motion.button>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Post a Job</h1>
          <p className="text-gray-400">Step {step} of 3</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg backdrop-blur-xl p-8"
          style={{
            backgroundColor: 'rgba(26, 26, 46, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Build React component"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what you need..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Budget Min ($)</label>
                  <input
                    type="number"
                    name="budget_min"
                    value={formData.budget_min}
                    onChange={handleInputChange}
                    min="10"
                    max="500"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Budget Max ($)</label>
                  <input
                    type="number"
                    name="budget_max"
                    value={formData.budget_max}
                    onChange={handleInputChange}
                    min="10"
                    max="500"
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  name="estimated_duration"
                  value={formData.estimated_duration}
                  onChange={handleInputChange}
                  min="15"
                  max="120"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Required Skills</label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Add a skill..."
                    className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddSkill}
                    className="px-4 py-3 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-semibold hover:bg-cyan-500/30 transition-colors"
                  >
                    Add
                  </motion.button>
                </div>

                {formData.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.required_skills.map((skill) => (
                      <motion.div
                        key={skill}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          ✕
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <p className="text-sm text-cyan-300">
                  <strong>Preview:</strong> Your job will reach approximately 50 freelancers with matching skills.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h3 className="font-semibold text-white mb-3">Review Your Job</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>
                    <strong>Title:</strong> {formData.title}
                  </p>
                  <p>
                    <strong>Budget:</strong> ${formData.budget_min} - ${formData.budget_max}
                  </p>
                  <p>
                    <strong>Duration:</strong> {formData.estimated_duration} minutes
                  </p>
                  <p>
                    <strong>Skills:</strong> {formData.required_skills.join(', ') || 'None specified'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <p className="text-sm text-cyan-300">
                  <strong>Total Cost:</strong> ${formData.budget_max} + 10% fee = ${Math.round(formData.budget_max * 1.1)}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Back
              </motion.button>
            )}
            {step < 3 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(step + 1)}
                className="flex-1 px-6 py-3 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-semibold hover:bg-cyan-500/30 transition-colors"
              >
                Next
              </motion.button>
            )}
            {step === 3 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={postJobMutation.isPending}
                className="flex-1 px-6 py-3 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-semibold hover:bg-cyan-500/30 disabled:opacity-50 transition-colors"
              >
                {postJobMutation.isPending ? 'Posting...' : 'Post Job'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
