'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, Info, Download, Eye, EyeOff } from 'lucide-react'

const riskCategoryBiomarkers = {
  cardio: { label: 'Cardiovascular', ids: ['LDL_CHOLESTEROL', 'TOTAL_CHOLESTEROL', 'HDL_CHOLESTEROL', 'TRIGLYCERIDES', 'CHOL_HDL_RATIO'] },
  metabolic: { label: 'Blood sugar', ids: ['HBA1C', 'FASTING_GLUCOSE', 'TRIGLYCERIDES'] },
  kidney: { label: 'Kidney', ids: ['EGFR', 'SERUM_CREATININE', 'BUN', 'URIC_ACID'] },
  liver: { label: 'Liver', ids: ['ALT', 'AST', 'TOTAL_BILIRUBIN', 'ALKALINE_PHOSPHATASE', 'ALBUMIN'] },
  anemia: { label: 'Blood count and iron', ids: ['HEMOGLOBIN', 'MCV', 'SERUM_FERRITIN', 'WBC_COUNT', 'PLATELET_COUNT'] },
}

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
  const detectedBiomarkers = analysis.detectedBiomarkers || []
  const availableRisks = analysis.riskAssessment
    ? Object.entries(riskCategoryBiomarkers).filter(([, category]) =>
        detectedBiomarkers.some((biomarker: { id: string }) =>
          category.ids.includes(biomarker.id)
        )
      )
    : []

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

      {detectedBiomarkers.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Detected Lab Results</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3">Test</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Range used</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {detectedBiomarkers.map((biomarker: {
                  id: string
                  name: string
                  value: number
                  unit: string
                  optimalRange: number[]
                  status: string
                }) => (
                  <tr key={biomarker.id} className="border-t border-gray-200">
                    <td className="px-4 py-3 font-medium">{biomarker.name}</td>
                    <td className="px-4 py-3">{biomarker.value} {biomarker.unit}</td>
                    <td className="px-4 py-3">
                      {biomarker.optimalRange?.join(' - ')} {biomarker.unit}
                    </td>
                    <td className="px-4 py-3">{biomarker.status.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {analysis.riskAssessment && detectedBiomarkers.length > 0 && (
        <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-xl font-semibold text-amber-950">Rule-Based Screening</h3>
          <p className="mt-2 text-sm text-amber-900">
            Informational scores based only on detected lab values and preset thresholds. They are
            not diagnoses or probabilities of developing a disease; review results with a clinician.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableRisks.map(([key, category]) => {
              const risk = analysis.riskAssessment.risks[key]
              return (
                <div key={key} className="rounded-lg border border-amber-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-semibold text-gray-900">{category.label}</h4>
                    <span className="font-bold text-gray-900">{risk.score}/100</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    {risk.factors.length > 0
                      ? risk.factors.join('. ')
                      : 'No flagged thresholds among the detected values.'}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}

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
