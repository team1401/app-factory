import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Shield,
  ChevronDown,
  Download,
  RotateCcw,
  ExternalLink,
  CheckCircle2
} from 'lucide-react'

const severityConfig = {
  critical: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    icon: AlertCircle,
    label: 'Critical'
  },
  high: {
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.1)',
    border: 'rgba(249, 115, 22, 0.3)',
    icon: AlertTriangle,
    label: 'High'
  },
  medium: {
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.1)',
    border: 'rgba(234, 179, 8, 0.3)',
    icon: AlertTriangle,
    label: 'Medium'
  },
  low: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    icon: Info,
    label: 'Low'
  },
}

export default function Results({ data, onReset }) {
  const [expandedCard, setExpandedCard] = useState(null)

  const vulnerabilities = data.vulnerabilities || []
  const summary = data.summary || {}

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vulnscout-scan-${data.scanId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        padding: '80px 24px',
      }}
    >
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: 'center',
            marginBottom: '60px',
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              background: vulnerabilities.length === 0
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(139, 92, 246, 0.15)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${vulnerabilities.length === 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
            }}
          >
            {vulnerabilities.length === 0 ? (
              <CheckCircle2 size={40} color="#10b981" strokeWidth={1.5} />
            ) : (
              <Shield size={40} color="#8b5cf6" strokeWidth={1.5} />
            )}
          </motion.div>

          <h1 style={{
            fontSize: '42px',
            fontWeight: 700,
            marginBottom: '16px',
          }}>
            {vulnerabilities.length === 0 
              ? 'No vulnerabilities found' 
              : `Found ${vulnerabilities.length} ${vulnerabilities.length === 1 ? 'vulnerability' : 'vulnerabilities'}`
            }
          </h1>

          <p style={{
            fontSize: '18px',
            color: '#888',
            marginBottom: '32px',
          }}>
            {data.fileName || 'Dependency file'} • Scanned {new Date(data.createdAt || Date.now()).toLocaleString()}
          </p>

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <ActionButton
              icon={<Download size={18} />}
              text="Export JSON"
              onClick={handleExport}
            />
            <ActionButton
              icon={<RotateCcw size={18} />}
              text="New Scan"
              onClick={onReset}
              variant="secondary"
            />
          </div>
        </motion.div>

        {/* Summary cards */}
        {vulnerabilities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '40px',
            }}
          >
            {Object.entries(summary).map(([severity, count]) => {
              const config = severityConfig[severity.toLowerCase()]
              if (!config || count === 0) return null
              
              return (
                <SummaryCard
                  key={severity}
                  severity={severity}
                  count={count}
                  config={config}
                />
              )
            })}
          </motion.div>
        )}

        {/* Vulnerability cards */}
        {vulnerabilities.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {vulnerabilities.map((vuln, index) => (
              <VulnerabilityCard
                key={index}
                vuln={vuln}
                index={index}
                expanded={expandedCard === index}
                onToggle={() => setExpandedCard(expandedCard === index ? null : index)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '20px',
              padding: '60px 40px',
              textAlign: 'center',
            }}
          >
            <div style={{
              fontSize: '18px',
              color: '#10b981',
              marginBottom: '12px',
              fontWeight: 500,
            }}>
              ✨ All clear!
            </div>
            <div style={{
              fontSize: '15px',
              color: '#888',
              lineHeight: 1.6,
            }}>
              Your dependencies look good. No known vulnerabilities were found.
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function SummaryCard({ severity, count, config }) {
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: '16px',
        padding: '20px',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
      }}>
        <Icon size={20} color={config.color} strokeWidth={2} />
        <span style={{
          fontSize: '14px',
          fontWeight: 600,
          color: config.color,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {config.label}
        </span>
      </div>
      <div style={{
        fontSize: '36px',
        fontWeight: 700,
        color: config.color,
      }}>
        {count}
      </div>
    </motion.div>
  )
}

function VulnerabilityCard({ vuln, index, expanded, onToggle }) {
  const config = severityConfig[vuln.severity?.toLowerCase()] || severityConfig.medium
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Card header - clickable */}
      <motion.div
        onClick={onToggle}
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        style={{
          padding: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
        }}
      >
        {/* Severity indicator */}
        <div style={{
          width: '44px',
          height: '44px',
          background: config.bg,
          border: `1px solid ${config.border}`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={22} color={config.color} strokeWidth={2} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: config.color,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {config.label}
            </span>
            <span style={{
              fontSize: '13px',
              color: '#666',
            }}>
              •
            </span>
            <span style={{
              fontSize: '13px',
              color: '#888',
              fontFamily: 'monospace',
            }}>
              {vuln.package}
            </span>
          </div>

          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '8px',
            color: '#fff',
          }}>
            {vuln.title || vuln.vulnerability || 'Security vulnerability detected'}
          </h3>

          <p style={{
            fontSize: '14px',
            color: '#999',
            lineHeight: 1.6,
          }}>
            {vuln.summary || vuln.description || 'No description available'}
          </p>
        </div>

        {/* Expand icon */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            color: '#666',
            flexShrink: 0,
          }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 24px 24px 84px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              paddingTop: '24px',
            }}>
              {/* Details */}
              {vuln.details && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#aaa',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Details
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: '#ccc',
                    lineHeight: 1.7,
                  }}>
                    {vuln.details}
                  </p>
                </div>
              )}

              {/* Remediation */}
              {vuln.fix && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#aaa',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Remediation
                  </h4>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                    color: '#10b981',
                    fontFamily: 'monospace',
                  }}>
                    {vuln.fix}
                  </div>
                </div>
              )}

              {/* CVE Links */}
              {vuln.cve && (
                <div>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#aaa',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    References
                  </h4>
                  <a
                    href={`https://nvd.nist.gov/vuln/detail/${vuln.cve}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#3b82f6',
                      fontSize: '13px',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'
                    }}
                  >
                    {vuln.cve}
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ActionButton({ icon, text, onClick, variant = 'primary' }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        padding: '12px 24px',
        background: variant === 'primary' 
          ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
          : 'rgba(255, 255, 255, 0.05)',
        border: variant === 'primary' 
          ? 'none'
          : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
      }}
    >
      {icon}
      {text}
    </motion.button>
  )
}
