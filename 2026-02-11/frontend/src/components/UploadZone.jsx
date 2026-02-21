import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, FileCode, X, AlertCircle } from 'lucide-react'

export default function UploadZone({ onScan, error }) {
  const [mode, setMode] = useState('upload') // 'upload' or 'paste'
  const [pastedContent, setPastedContent] = useState('')
  const [filename, setFilename] = useState('pasted-file.json')

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      const reader = new FileReader()
      
      reader.onload = (e) => {
        onScan(e.target.result, file.name)
      }
      
      reader.readAsText(file)
    }
  }, [onScan])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/plain': ['.txt', '.lock'],
      'application/toml': ['.toml'],
      'text/xml': ['.xml']
    },
    multiple: false
  })

  const handlePasteSubmit = () => {
    if (pastedContent.trim()) {
      onScan(pastedContent, filename)
    }
  }

  const detectFileType = (content) => {
    if (content.includes('"dependencies"') && content.includes('"version"')) {
      return 'package.json'
    } else if (content.match(/^[a-zA-Z0-9_-]+==[\d.]+/m)) {
      return 'requirements.txt'
    } else if (content.includes('module ') && content.includes('require (')) {
      return 'go.mod'
    } else if (content.includes('[dependencies]')) {
      return 'Cargo.toml'
    }
    return 'dependency-file.txt'
  }

  const handleContentChange = (e) => {
    const content = e.target.value
    setPastedContent(content)
    
    if (content.trim()) {
      const detected = detectFileType(content)
      setFilename(detected)
    }
  }

  return (
    <div style={{
      position: 'relative',
      zIndex: 1,
      maxWidth: '800px',
      margin: '0 auto',
      padding: '0 24px 80px',
    }}>
      {/* Mode toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          justifyContent: 'center',
        }}
      >
        <ModeButton
          active={mode === 'upload'}
          onClick={() => setMode('upload')}
          icon={<Upload size={16} />}
          text="Upload File"
        />
        <ModeButton
          active={mode === 'paste'}
          onClick={() => setMode('paste')}
          icon={<FileCode size={16} />}
          text="Paste Code"
        />
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            color: '#ef4444',
          }}
        >
          <AlertCircle size={20} />
          <div style={{ flex: 1, fontSize: '14px' }}>{error}</div>
        </motion.div>
      )}

      {/* Content area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
      >
        {mode === 'upload' ? (
          <div
            {...getRootProps()}
            style={{
              background: isDragActive 
                ? 'rgba(139, 92, 246, 0.05)' 
                : 'rgba(255, 255, 255, 0.03)',
              border: isDragActive
                ? '2px dashed rgba(139, 92, 246, 0.5)'
                : '2px dashed rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '80px 40px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={{
                y: isDragActive ? -10 : 0,
                scale: isDragActive ? 1.05 : 1,
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 24px',
                background: 'rgba(139, 92, 246, 0.1)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Upload size={32} color="#8b5cf6" strokeWidth={1.5} />
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '12px',
                color: '#fff',
              }}>
                {isDragActive ? 'Drop it here' : 'Drop your dependency file'}
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#888',
                marginBottom: '20px',
              }}>
                or click to browse
              </p>
              <p style={{
                fontSize: '13px',
                color: '#666',
              }}>
                Supports package.json, requirements.txt, go.mod, Cargo.toml, and more
              </p>
            </motion.div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
          }}>
            {/* Editor header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                color: '#888',
              }}>
                <FileCode size={16} />
                <span>{filename}</span>
              </div>
              {pastedContent && (
                <button
                  onClick={() => {
                    setPastedContent('')
                    setFilename('pasted-file.json')
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Editor */}
            <textarea
              value={pastedContent}
              onChange={handleContentChange}
              placeholder="Paste your package.json, requirements.txt, or any dependency file here..."
              style={{
                width: '100%',
                height: '300px',
                padding: '20px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                fontFamily: "'Monaco', 'Menlo', monospace",
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
              }}
            />

            {/* Submit button */}
            <div style={{ padding: '20px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePasteSubmit}
                disabled={!pastedContent.trim()}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: pastedContent.trim() 
                    ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' 
                    : '#222',
                  border: 'none',
                  borderRadius: '12px',
                  color: pastedContent.trim() ? '#fff' : '#666',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: pastedContent.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                }}
              >
                Scan for Vulnerabilities
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function ModeButton({ active, onClick, icon, text }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        padding: '12px 24px',
        background: active 
          ? 'rgba(139, 92, 246, 0.15)' 
          : 'rgba(255, 255, 255, 0.03)',
        border: active
          ? '1px solid rgba(139, 92, 246, 0.5)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        color: active ? '#8b5cf6' : '#888',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
      }}
    >
      {icon}
      {text}
    </motion.button>
  )
}
