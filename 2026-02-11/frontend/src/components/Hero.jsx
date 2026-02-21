import { motion } from 'framer-motion'
import { Shield, Sparkles, Zap } from 'lucide-react'

export default function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'relative',
        zIndex: 1,
        padding: '80px 24px 60px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
          borderRadius: '20px',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          marginBottom: '32px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Shield size={40} strokeWidth={1.5} color="#8b5cf6" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        style={{
          fontSize: 'clamp(48px, 8vw, 72px)',
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Find vulnerabilities
        <br />
        before attackers do
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{
          fontSize: '20px',
          lineHeight: 1.6,
          color: '#888',
          maxWidth: '600px',
          margin: '0 auto 40px',
          fontWeight: 400,
        }}
      >
        AI-powered dependency scanning that analyzes your package files
        for known vulnerabilities and security risks in seconds.
      </motion.p>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <FeaturePill icon={<Sparkles size={16} />} text="AI Analysis" />
        <FeaturePill icon={<Zap size={16} />} text="Real-time Scanning" />
        <FeaturePill icon={<Shield size={16} />} text="CVE Database" />
      </motion.div>
    </motion.div>
  )
}

function FeaturePill({ icon, text }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '100px',
      fontSize: '14px',
      color: '#aaa',
      backdropFilter: 'blur(10px)',
    }}>
      <span style={{ display: 'flex', color: '#8b5cf6' }}>{icon}</span>
      {text}
    </div>
  )
}
