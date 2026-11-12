'use client'

import { useEffect, useState } from 'react'
import { FileText, Calendar, TrendingUp } from 'lucide-react'
import ReportDetailModal from './ReportDetailModal'

interface Report {
  id: string
  fileName: string
  summary: string
  details: string
  extractedText: string
  uploadDate: string
  findings: any[]
}

export default function MedicalHistory({ userId, refresh }: { userId?: string; refresh: number }) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleReportClick = (report: Report) => {
    setSelectedReport(report)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setTimeout(() => setSelectedReport(null), 300)
  }

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchReports = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch('/api/reports')
        const result = await response.json()
        if (!response.ok) {
          throw new Error(result.error || `Failed to fetch reports (HTTP ${response.status}).`)
        }
        setReports(result.reports as Report[])
      } catch (error) {
        console.error('Error fetching reports:', error)
        setError(error instanceof Error ? error.message : 'Failed to load reports.')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [userId, refresh])

  if (!userId) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Medical History</h2>
        <p className="text-gray-600 dark:text-gray-400">Sign in to track your medical history</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-bold dark:text-white">Medical History</h2>
      </div>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      ) : error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : reports.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 dark:text-gray-400">No reports yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Upload your first medical report to start tracking
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => handleReportClick(report)}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {report.fileName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                    {report.summary}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(report.uploadDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reports.length > 0 && (
        <div className="mt-4 pt-4 border-t dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">{reports.length}</span> reports tracked
          </p>
        </div>
      )}

      {/* Report Detail Modal */}
      <ReportDetailModal 
        isOpen={showModal}
        onClose={handleCloseModal}
        report={selectedReport}
      />
    </div>
  )
}
