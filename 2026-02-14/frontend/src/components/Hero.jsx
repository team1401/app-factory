import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Link as LinkIcon, FileText, Sparkles } from 'lucide-react'

const GPT52_PAPER_URL = 'https://arxiv.org/abs/2501.12345' // Example arXiv URL

export default function Hero({ onAnalyze, error }) {
  const [activeTab, setActiveTab] = useState('url')
  const [urlInput, setUrlInput] = useState('')
  const [textInput, setTextInput] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (activeTab === 'url' && urlInput.trim()) {
      onAnalyze(urlInput.trim(), 'url')
    } else if (activeTab === 'text' && textInput.trim()) {
      onAnalyze(textInput.trim(), 'text')
    }
  }

  const handleFileUpload = (file) => {
    if (file && file.type === 'application/pdf') {
      onAnalyze(file, 'file')
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleTryExample = () => {
    setActiveTab('url')
    setUrlInput(GPT52_PAPER_URL)
    onAnalyze(GPT52_PAPER_URL, 'url')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6"
    >
      {/* Example button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleTryExample}
        className="w-full glass-hover p-6 rounded-2xl group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center justify-center gap-3">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <span className="text-lg font-medium gradient-text">
            Try the viral GPT-5.2 physics paper
          </span>
        </div>
      </motion.button>

      {/* Input card */}
      <div className="glass p-8 rounded-3xl">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 glass rounded-xl">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'url'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4 inline mr-2" />
            URL
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'text'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Paste
          </button>
        </div>

        {/* URL input */}
        {activeTab === 'url' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste arXiv URL (e.g., https://arxiv.org/abs/2501.12345)"
              className="w-full px-6 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!urlInput.trim()}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all"
            >
              Explain Paper
            </button>
          </form>
        )}

        {/* File upload */}
        {activeTab === 'upload' && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? 'border-violet-500 bg-violet-500/10'
                : 'border-slate-700 hover:border-slate-600'
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-lg mb-2 text-slate-300">Drop PDF here or click to browse</p>
            <p className="text-sm text-slate-500">Maximum file size: 10MB</p>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleFileUpload(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block mt-4 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
            >
              Choose File
            </label>
          </div>
        )}

        {/* Text input */}
        {activeTab === 'text' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste the paper text here..."
              rows={8}
              className="w-full px-6 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder-slate-500 resize-none"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-all"
            >
              Explain Paper
            </button>
          </form>
        )}
      </div>

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-4 rounded-xl border-l-4 border-red-500"
        >
          <p className="text-red-400">{error}</p>
        </motion.div>
      )}
    </motion.div>
  )
}
