import { motion } from 'framer-motion'
import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function RiskScore({ score, totalMentions }) {
  // Ensure score is between 0-100
  const normalizedScore = Math.min(100, Math.max(0, score || 0))
  
  // Determine risk level
  const getRiskLevel = (score) => {
    if (score < 25) return { label: 'Low Risk', color: '#10b981', icon: Shield, trend: TrendingDown }
    if (score < 50) return { label: 'Moderate Risk', color: '#f59e0b', icon: Minus, trend: Minus }
    if (score < 75) return { label: 'High Risk', color: '#ef4444', icon: TrendingUp, trend: TrendingUp }
    return { label: 'Critical Risk', color: '#7f1d1d', icon: Shield, trend: TrendingUp }
  }

  const riskLevel = getRiskLevel(normalizedScore)
  const Icon = riskLevel.icon
  const TrendIcon = riskLevel.trend

  const chartData = {
    labels: ['Risk Score', 'Safe'],
    datasets: [
      {
        data: [normalizedScore, 100 - normalizedScore],
        backgroundColor: [riskLevel.color, 'rgba(255, 255, 255, 0.05)'],
        borderColor: [riskLevel.color, 'rgba(255, 255, 255, 0.1)'],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '75%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-3xl p-8 mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Chart */}
        <div className="relative">
          <div className="w-64 h-64 mx-auto relative">
            <Doughnut data={chartData} options={chartOptions} />
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="text-center"
              >
                <div className="text-5xl font-bold mb-2" style={{ color: riskLevel.color }}>
                  {normalizedScore}
                </div>
                <div className="text-sm text-gray-400">Risk Score</div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-3 rounded-xl"
                style={{ 
                  backgroundColor: `${riskLevel.color}20`,
                  borderColor: `${riskLevel.color}40`,
                  borderWidth: '1px'
                }}
              >
                <Icon className="w-6 h-6" style={{ color: riskLevel.color }} />
              </div>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: riskLevel.color }}>
                  {riskLevel.label}
                </h3>
                <p className="text-gray-400 text-sm">Based on {totalMentions} mentions</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="glass p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Sentiment Analysis</span>
                  <TrendIcon className="w-4 h-4" style={{ color: riskLevel.color }} />
                </div>
                <p className="text-sm text-gray-300">
                  {normalizedScore < 25 && "Most mentions are positive or neutral. Your online reputation appears healthy."}
                  {normalizedScore >= 25 && normalizedScore < 50 && "Some negative mentions detected. Monitor your reputation regularly."}
                  {normalizedScore >= 50 && normalizedScore < 75 && "Multiple negative mentions found. Consider addressing these issues."}
                  {normalizedScore >= 75 && "Critical: Hostile mentions detected. Immediate attention recommended."}
                </p>
              </div>

              <div className="glass p-4 rounded-xl">
                <div className="text-sm text-gray-400 mb-2">Recommendation</div>
                <p className="text-sm text-gray-300">
                  {normalizedScore < 25 && "Keep monitoring periodically. No immediate action needed."}
                  {normalizedScore >= 25 && normalizedScore < 50 && "Review negative mentions and consider responses where appropriate."}
                  {normalizedScore >= 50 && normalizedScore < 75 && "Actively manage your online presence. Address false claims."}
                  {normalizedScore >= 75 && "Take immediate action. Consider legal advice for defamatory content."}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-purple-400">{totalMentions}</div>
              <div className="text-xs text-gray-400 mt-1">Total Mentions</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-400">
                {totalMentions > 0 ? Math.round((1 - normalizedScore / 100) * 100) : 100}%
              </div>
              <div className="text-xs text-gray-400 mt-1">Safe Score</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
