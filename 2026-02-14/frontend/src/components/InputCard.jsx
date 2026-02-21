import { useState } from 'react';
import { motion } from 'framer-motion';

export default function InputCard({ onSubmit }) {
  const [arxivUrl, setArxivUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (arxivUrl.trim()) {
      onSubmit({ arxivUrl: arxivUrl.trim() });
    }
  };

  const loadExample = () => {
    const exampleUrl = 'https://arxiv.org/abs/2501.18505';
    setArxivUrl(exampleUrl);
    onSubmit({ arxivUrl: exampleUrl });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* arXiv URL Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            arXiv URL or ID
          </label>
          <input
            type="text"
            value={arxivUrl}
            onChange={(e) => setArxivUrl(e.target.value)}
            placeholder="https://arxiv.org/abs/2402.12345 or 2402.12345"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-white/50"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!arxivUrl.trim()}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Explain Paper
        </button>
      </form>

      {/* Example Button */}
      <div className="mt-6 text-center">
        <p className="text-sm text-white/60 mb-3">Try a viral paper:</p>
        <button
          onClick={loadExample}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-purple-400/50 rounded-lg transition-all text-sm"
        >
          🔥 GPT-5.2 Physics Breakthrough
        </button>
      </div>

      {/* Note */}
      <div className="mt-6 text-xs text-white/40 text-center">
        <p>Supports arXiv papers. PDF upload coming soon.</p>
      </div>
    </motion.div>
  );
}
