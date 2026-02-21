import { motion } from 'framer-motion'
import { Copy, Check, RefreshCw } from 'lucide-react'
import { useState } from 'react'

const sections = [
  { key: 'tldr', label: 'TL;DR', icon: '⚡' },
  { key: 'keyFindings', label: 'Key Findings', icon: '🔬' },
  { key: 'methodology', label: 'Methodology', icon: '🧪' },
  { key: 'implications', label: 'Implications', icon: '💡' },
  { key: 'eli5', label: 'ELI5', icon: '🎈' },
  { key: 'relatedWork', label: 'Related Work', icon: '📚' },
]

export default function Results({ results, onReset }) {
  const [copiedSection, setCopiedSection] = useState(null)

  const handleCopy = async (text, sectionKey) => {
    await navigator.clipboard.writeText(text)
    setCopiedSection(sectionKey)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header with reset button */}
      <motion.div variants={item} className="flex justify-between items-center">
        <h2 className="text-3xl font-bold gradient-text">Analysis Complete</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 glass-hover rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span>New Paper</span>
        </motion.button>
      </motion.div>

      {/* Results grid */}
      <div className="grid gap-6">
        {sections.map((section) => {
          const content = results[section.key]
          if (!content) return null

          const isArray = Array.isArray(content)
          const displayContent = isArray ? content : [content]

          return (
            <motion.div
              key={section.key}
              variants={item}
              className="glass p-6 rounded-2xl group hover:bg-slate-800/60 transition-all"
            >
              {/* Section header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{section.icon}</span>
                  <h3 className="text-2xl font-bold text-slate-100">
                    {section.label}
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCopy(
                    isArray ? content.join('\n') : content,
                    section.key
                  )}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  {copiedSection === section.key ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-400" />
                  )}
                </motion.button>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {displayContent.map((text, idx) => (
                  <div key={idx} className="text-slate-300 leading-relaxed">
                    {isArray && displayContent.length > 1 ? (
                      <div className="flex gap-3">
                        <span className="text-violet-400 font-semibold">•</span>
                        <p className="flex-1">{text}</p>
                      </div>
                    ) : (
                      <p className="text-lg">{text}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Export options */}
      <motion.div variants={item} className="glass p-6 rounded-2xl">
        <h3 className="text-xl font-semibold mb-4">Export & Share</h3>
        <div className="flex gap-3 flex-wrap">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
            Download Markdown
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
            Copy All
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
            Share Link
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
