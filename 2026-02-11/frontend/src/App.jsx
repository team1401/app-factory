import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from './components/Hero'
import UploadZone from './components/UploadZone'
import ScanProgress from './components/ScanProgress'
import Results from './components/Results'
import Background from './components/Background'

const API_URL = import.meta.env.VITE_API_URL || ''

function App() {
  const [scanId, setScanId] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const handleScan = async (fileContent, filename) => {
    setScanning(true)
    setError(null)
    setResults(null)
    
    try {
      const response = await fetch(`${API_URL}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileContent: fileContent,
          fileName: filename
        })
      })

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`)
      }

      const data = await response.json()
      setScanId(data.scanId)
      
      // Poll for results
      pollResults(data.scanId)
    } catch (err) {
      setError(err.message)
      setScanning(false)
    }
  }

  const pollResults = async (id) => {
    const maxAttempts = 60
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`${API_URL}/api/scan/${id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch results')
        }

        const data = await response.json()
        
        if (data.status === 'completed') {
          setResults(data)
          setScanning(false)
        } else if (data.status === 'failed') {
          throw new Error(data.error || 'Scan failed')
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 1000)
        } else {
          throw new Error('Scan timeout')
        }
      } catch (err) {
        setError(err.message)
        setScanning(false)
      }
    }

    poll()
  }

  const handleReset = () => {
    setScanId(null)
    setScanning(false)
    setResults(null)
    setError(null)
  }

  return (
    <div className="app">
      <Background />
      
      <AnimatePresence mode="wait">
        {!scanning && !results && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Hero />
            <UploadZone onScan={handleScan} error={error} />
          </motion.div>
        )}

        {scanning && (
          <ScanProgress key="scanning" />
        )}

        {results && (
          <Results 
            key="results" 
            data={results} 
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
