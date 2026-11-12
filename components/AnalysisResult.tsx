'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Info, Download, Eye, EyeOff } from 'lucide-react'

interface AnalysisResultProps {
  result: {
    originalText: string
    analysis: any
    fileName: string
  }
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const { analysis, originalText } = result
  const [showExtractedText, setShowExtractedText] = useState(false)

  const handleDownload = () => {
    const content = `HealthLens AI Analysis Report
    
File: ${result.fileName}
Date: ${new Date().toLocaleDateString()}

${analysis.summary}

${analysis.details}

---
Disclaimer: This analysis is for educational purposes only. Consult healthcare professionals for medical advice.
`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `healthlens-analysis-${Date.now()}.txt`
    a.click()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold">Analysis Results</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExtractedText(!showExtractedText)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showExtractedText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showExtractedText ? 'Hide' : 'Show'} Extracted Text
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Extracted Text Section */}
      {showExtractedText && originalText && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-600" />
            Extracted Text from Document
          </h3>
          <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-white p-4 rounded border border-gray-200 max-h-60 overflow-y-auto">
            {originalText}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Quick Summary</h3>
            <p className="text-blue-800">{analysis.summary}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Detailed Explanation</h3>
        <div className="prose max-w-none text-gray-700">
          <p className="whitespace-pre-line leading-relaxed">{analysis.details}</p>
        </div>
      </div>

      {/* Key Findings */}
      {analysis.keyFindings && analysis.keyFindings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Key Findings</h3>
          <div className="space-y-3">
            {analysis.keyFindings.map((finding: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  finding.status === 'normal'
                    ? 'bg-green-50 border-green-200'
                    : finding.status === 'abnormal'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {finding.status === 'normal' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold">{finding.parameter}</p>
                    <p className="text-sm mt-1">{finding.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions to Ask Doctor */}
      {analysis.questionsForDoctor && analysis.questionsForDoctor.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-xl font-semibold mb-4 text-purple-900">
            Questions to Ask Your Doctor
          </h3>
          <ul className="space-y-2">
            {analysis.questionsForDoctor.map((question: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-purple-800">
                <span className="text-purple-600 font-bold">•</span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
