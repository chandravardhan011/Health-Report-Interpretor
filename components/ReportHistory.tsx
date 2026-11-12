'use client'

import { FileText, Calendar } from 'lucide-react'

interface ReportHistoryProps {
  reports: any[]
}

export default function ReportHistory({ reports }: ReportHistoryProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Report History</h2>
      
      <div className="space-y-4">
        {reports.map((report, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{report.fileName}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {report.analysis.summary}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(report.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
