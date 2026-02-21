import { motion } from 'framer-motion';
import { useState } from 'react';

function Section({ title, children, icon }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = typeof children === 'string' ? children : children.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 relative group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-all opacity-0 group-hover:opacity-100"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      <div className="text-white/80 leading-relaxed">
        {Array.isArray(children) ? (
          <ul className="space-y-2">
            {children.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>{children}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function ResultsCard({ results, onReset }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{results.title}</h2>
            {results.authors && (
              <p className="text-white/60">{results.authors}</p>
            )}
          </div>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            New Paper
          </button>
        </div>
      </motion.div>

      {/* TL;DR */}
      {results.tldr && (
        <Section title="TL;DR" icon="⚡">
          {results.tldr}
        </Section>
      )}

      {/* Key Findings */}
      {results.keyFindings && (
        <Section title="Key Findings" icon="🔑">
          {results.keyFindings}
        </Section>
      )}

      {/* Methodology */}
      {results.methodology && (
        <Section title="Methodology" icon="🔬">
          {results.methodology}
        </Section>
      )}

      {/* Implications */}
      {results.implications && (
        <Section title="Implications" icon="💡">
          {results.implications}
        </Section>
      )}

      {/* ELI5 */}
      {results.eli5 && (
        <Section title="Explain Like I'm 5" icon="👶">
          {results.eli5}
        </Section>
      )}

      {/* Related Work */}
      {results.relatedWork && (
        <Section title="Related Work" icon="📚">
          {results.relatedWork}
        </Section>
      )}
    </div>
  );
}
