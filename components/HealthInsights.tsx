'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity, Heart, Droplet, Brain } from 'lucide-react'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface HealthInsightsProps {
  userId?: string
  refresh: number
}

interface RiskPrediction {
  category: string
  risk: 'low' | 'medium' | 'high'
  percentage: number
  trend: 'improving' | 'stable' | 'worsening'
  description: string
  recommendations: string[]
  icon: React.ReactNode
  color: string
}

export default function HealthInsights({ userId, refresh }: HealthInsightsProps) {
  const [predictions, setPredictions] = useState<RiskPrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [reportCount, setReportCount] = useState(0)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const analyzeHealthRisks = async () => {
      setLoading(true)
      try {
        const q = query(
          collection(db, 'reports'),
          where('userId', '==', userId),
          orderBy('uploadDate', 'desc')
        )
        const snapshot = await getDocs(q)
        const reports = snapshot.docs.map(doc => doc.data())
        setReportCount(reports.length)

        if (reports.length === 0) {
          setLoading(false)
          return
        }

        // Analyze reports and generate predictions
        const risks = await generateRiskPredictions(reports)
        setPredictions(risks)
      } catch (error) {
        console.error('Error analyzing health risks:', error)
        // Fallback: try without orderBy
        try {
          const q = query(
            collection(db, 'reports'),
            where('userId', '==', userId)
          )
          const snapshot = await getDocs(q)
          const reports = snapshot.docs.map(doc => doc.data())
          reports.sort((a: any, b: any) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
          setReportCount(reports.length)
          
          if (reports.length > 0) {
            const risks = await generateRiskPredictions(reports)
            setPredictions(risks)
          }
        } catch (err2) {
          console.error('Fallback error:', err2)
        }
      } finally {
        setLoading(false)
      }
    }

    analyzeHealthRisks()
  }, [userId, refresh])

  const generateRiskPredictions = async (reports: any[]): Promise<RiskPrediction[]> => {
    // Analyze report summaries for health patterns
    const allText = reports.map(r => r.summary + ' ' + r.details).join(' ').toLowerCase()
    
    const predictions: RiskPrediction[] = []

    // Cardiovascular Risk
    if (allText.includes('cholesterol') || allText.includes('blood pressure') || allText.includes('heart')) {
      const hasHighCholesterol = allText.includes('high cholesterol') || allText.includes('elevated cholesterol')
      const hasHighBP = allText.includes('high blood pressure') || allText.includes('hypertension')
      
      let risk: 'low' | 'medium' | 'high' = 'low'
      let percentage = 15
      let trend: 'improving' | 'stable' | 'worsening' = 'stable'
      
      if (hasHighCholesterol && hasHighBP) {
        risk = 'high'
        percentage = 65
        trend = 'worsening'
      } else if (hasHighCholesterol || hasHighBP) {
        risk = 'medium'
        percentage = 40
        trend = 'stable'
      }

      predictions.push({
        category: 'Cardiovascular Health',
        risk,
        percentage,
        trend,
        description: risk === 'high' 
          ? 'Multiple risk factors detected. Immediate attention recommended.'
          : risk === 'medium'
          ? 'Some risk factors present. Monitor closely and make lifestyle changes.'
          : 'Low risk. Continue healthy habits.',
        recommendations: [
          'Regular cardio exercise (30 min/day)',
          'Reduce sodium intake (<2300mg/day)',
          'Increase omega-3 fatty acids',
          'Schedule cardiology check-up'
        ],
        icon: <Heart className="w-5 h-5" />,
        color: risk === 'high' ? 'red' : risk === 'medium' ? 'yellow' : 'green'
      })
    }

    // Diabetes Risk
    if (allText.includes('glucose') || allText.includes('sugar') || allText.includes('diabetes') || allText.includes('hba1c')) {
      const hasHighGlucose = allText.includes('high glucose') || allText.includes('elevated sugar') || allText.includes('prediabetes')
      const hasDiabetes = allText.includes('diabetes') || allText.includes('diabetic')
      
      let risk: 'low' | 'medium' | 'high' = 'low'
      let percentage = 10
      let trend: 'improving' | 'stable' | 'worsening' = 'stable'
      
      if (hasDiabetes) {
        risk = 'high'
        percentage = 75
        trend = 'worsening'
      } else if (hasHighGlucose) {
        risk = 'medium'
        percentage = 45
        trend = 'worsening'
      }

      predictions.push({
        category: 'Diabetes Risk',
        risk,
        percentage,
        trend,
        description: risk === 'high'
          ? 'Diabetes management required. Consult endocrinologist.'
          : risk === 'medium'
          ? 'Pre-diabetic indicators found. Lifestyle intervention crucial.'
          : 'Blood sugar levels normal. Maintain healthy diet.',
        recommendations: [
          'Limit refined carbohydrates',
          'Regular blood sugar monitoring',
          'Increase fiber intake (25-30g/day)',
          'Maintain healthy weight (BMI 18.5-24.9)'
        ],
        icon: <Droplet className="w-5 h-5" />,
        color: risk === 'high' ? 'red' : risk === 'medium' ? 'yellow' : 'green'
      })
    }

    // Anemia Risk
    if (allText.includes('hemoglobin') || allText.includes('anemia') || allText.includes('iron') || allText.includes('rbc')) {
      const hasLowHemoglobin = allText.includes('low hemoglobin') || allText.includes('anemia') || allText.includes('low red blood')
      
      let risk: 'low' | 'medium' | 'high' = 'low'
      let percentage = 20
      let trend: 'improving' | 'stable' | 'worsening' = 'stable'
      
      if (hasLowHemoglobin) {
        risk = 'medium'
        percentage = 55
        trend = 'worsening'
      }

      predictions.push({
        category: 'Anemia Risk',
        risk,
        percentage,
        trend,
        description: risk === 'medium'
          ? 'Low hemoglobin detected. Iron supplementation may be needed.'
          : 'Hemoglobin levels adequate. Continue balanced diet.',
        recommendations: [
          'Increase iron-rich foods (spinach, red meat)',
          'Take vitamin C with iron for better absorption',
          'Consider iron supplements (consult doctor)',
          'Avoid tea/coffee with meals'
        ],
        icon: <Activity className="w-5 h-5" />,
        color: risk === 'medium' ? 'yellow' : 'green'
      })
    }

    // General Health Score
    if (predictions.length > 0) {
      const avgRisk = predictions.reduce((sum, p) => sum + p.percentage, 0) / predictions.length
      const overallRisk = avgRisk > 50 ? 'medium' : 'low'
      
      predictions.push({
        category: 'Overall Health Score',
        risk: overallRisk,
        percentage: Math.round(100 - avgRisk),
        trend: 'stable',
        description: `Based on ${reports.length} reports analyzed. ${overallRisk === 'medium' ? 'Some areas need attention.' : 'Generally healthy.'}`,
        recommendations: [
          'Maintain regular health check-ups',
          'Stay hydrated (8 glasses/day)',
          'Get 7-8 hours of sleep',
          'Manage stress through meditation'
        ],
        icon: <Brain className="w-5 h-5" />,
        color: overallRisk === 'medium' ? 'yellow' : 'green'
      })
    }

    return predictions
  }

  if (!userId) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Health Insights</h2>
        <p className="text-gray-600 dark:text-gray-400">Sign in to see AI-powered health predictions</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Health Insights</h2>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Analyzing your health data...</p>
        </div>
      </div>
    )
  }

  if (reportCount === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Health Insights</h2>
        <div className="text-center py-8">
          <Brain className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Upload medical reports to get AI-powered health predictions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold dark:text-white">AI Health Risk Predictor</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Based on {reportCount} report{reportCount > 1 ? 's' : ''} analyzed
          </p>
        </div>
        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold">
          AI Powered
        </div>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">{predictions.map((prediction, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
              prediction.color === 'red'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : prediction.color === 'yellow'
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  prediction.color === 'red'
                    ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                    : prediction.color === 'yellow'
                    ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400'
                    : 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                }`}>
                  {prediction.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{prediction.category}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{prediction.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {prediction.trend === 'improving' ? (
                  <TrendingDown className="w-4 h-4 text-green-500" />
                ) : prediction.trend === 'worsening' ? (
                  <TrendingUp className="w-4 h-4 text-red-500" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                )}
              </div>
            </div>

            {/* Risk Percentage Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {prediction.category === 'Overall Health Score' ? 'Health Score' : 'Risk Level'}
                </span>
                <span className={`text-sm font-bold ${
                  prediction.color === 'red'
                    ? 'text-red-600 dark:text-red-400'
                    : prediction.color === 'yellow'
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {prediction.percentage}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    prediction.color === 'red'
                      ? 'bg-red-500'
                      : prediction.color === 'yellow'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${prediction.percentage}%` }}
                />
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Recommendations:</p>
              <ul className="space-y-1">
                {prediction.recommendations.slice(0, 2).map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className={`mt-1 ${
                      prediction.color === 'red' ? 'text-red-500' : prediction.color === 'yellow' ? 'text-yellow-500' : 'text-green-500'
                    }`}>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 dark:text-gray-400">
            These predictions are AI-generated based on your reports and should not replace professional medical advice. Always consult healthcare professionals for diagnosis and treatment.
          </p>
        </div>
      </div>
    </div>
  )
}
