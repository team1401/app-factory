import { motion } from 'framer-motion'
import { Shield, Search, Brain, CheckCircle2 } from 'lucide-react'

const steps = [
  { icon: Search, label: 'Analyzing dependencies', duration: 1.5 },
  { icon: Shield, label: 'Checking CVE database', duration: 2 },
  { icon: Brain, label: 'AI security analysis', duration: 2.5 },
  { icon: CheckCircle2, label: 'Generating report', duration: 1 },
]

export default function ScanProgress() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Animated shield */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 40px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}
        >
          <Shield size={48} color="#8b5cf6" strokeWidth={1.5} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '16px',
          }}
        >
          Scanning for vulnerabilities
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: '16px',
            color: '#888',
            marginBottom: '60px',
          }}
        >
          This usually takes 5-10 seconds
        </motion.p>

        {/* Progress steps */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          alignItems: 'flex-start',
        }}>
          {steps.map((step, index) => (
            <ProgressStep 
              key={index} 
              step={step} 
              index={index} 
            />
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: '60px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: 7,
              ease: "easeInOut",
            }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}

function ProgressStep({ step, index }) {
  const Icon = step.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.5, duration: 0.5 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        width: '100%',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.5 + 0.2, type: "spring" }}
        style={{
          width: '40px',
          height: '40px',
          background: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color="#8b5cf6" strokeWidth={2} />
      </motion.div>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{
          delay: index * 0.5 + 0.4,
          duration: step.duration,
        }}
        style={{
          flex: 1,
          textAlign: 'left',
        }}
      >
        <div style={{
          fontSize: '15px',
          color: '#fff',
          fontWeight: 500,
        }}>
          {step.label}
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: index * 0.5 + step.duration + 0.4,
        }}
      >
        <CheckCircle2 size={20} color="#10b981" strokeWidth={2} />
      </motion.div>
    </motion.div>
  )
}
