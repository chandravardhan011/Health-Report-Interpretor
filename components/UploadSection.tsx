'use client'

import { useState, useRef } from 'react'
import { Upload, Camera, Loader2, FileText } from 'lucide-react'
import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { extractTextFromFile } from '@/lib/ocr'
import { analyzeReport } from '@/lib/ai'

interface UploadSectionProps {
  onAnalysisComplete: (result: any) => void
  userId?: string
}

export default function UploadSection({ onAnalysisComplete, userId }: UploadSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    const isImage = file.type.startsWith('image/')
    const isPDF = file.type === 'application/pdf'
    
    if (!isImage && !isPDF) {
      alert('Please upload an image or PDF file')
      return
    }

    setIsProcessing(true)
    setProgress(isPDF ? 'Extracting text from PDF...' : 'Extracting text from image...')

    try {
      // Step 1: Extract text
      const extractedText = await extractTextFromFile(file)
      
      if (!extractedText || extractedText.trim().length < 20) {
        alert('Could not extract enough text. Please try a clearer image.')
        setIsProcessing(false)
        return
      }

      setProgress('Analyzing with medical history context...')

      // Step 2: Get previous reports for context
      let previousContext = ''
      if (userId) {
        try {
          const q = query(
            collection(db, 'reports'),
            where('userId', '==', userId),
            orderBy('uploadDate', 'desc'),
            limit(3)
          )
          const snapshot = await getDocs(q)
          const previousReports = snapshot.docs.map(doc => doc.data())
          
          if (previousReports.length > 0) {
            previousContext = '\n\nPREVIOUS MEDICAL HISTORY:\n' + 
              previousReports.map((r: any, i: number) => 
                `Report ${i + 1} (${new Date(r.uploadDate).toLocaleDateString()}):\n${r.summary}`
              ).join('\n\n')
          }
        } catch (error) {
          console.error('Error fetching history:', error)
        }
      }

      // Step 3: AI Analysis with context
      const analysis = await analyzeReport(extractedText + previousContext)
      
      const result = {
        originalText: extractedText,
        analysis,
        fileName: file.name,
      }

      // Step 4: Save to Firebase
      if (userId) {
        try {
          await addDoc(collection(db, 'reports'), {
            userId,
            fileName: file.name,
            extractedText,
            summary: analysis.summary,
            details: analysis.details,
            findings: analysis.keyFindings || [],
            uploadDate: new Date().toISOString(),
          })
        } catch (error) {
          console.error('Error saving report:', error)
        }
      }

      onAnalysisComplete(result)

      setProgress('')
    } catch (error) {
      console.error('Error processing report:', error)
      alert('Failed to process report. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Upload Your Medical Report</h2>
      
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            <p className="text-lg text-gray-600">{progress}</p>
          </div>
        ) : (
          <>
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-700 mb-2">
              Drop your medical report here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Supports: Blood tests, X-rays, prescriptions, lab reports
            </p>
            <p className="text-xs text-gray-400">
              Accepted formats: Images (JPG, PNG) or PDF documents
            </p>
            <div className="mt-6 flex gap-4 justify-center flex-wrap">
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Camera className="w-5 h-5" />
                Take Photo
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                <FileText className="w-5 h-5" />
                Upload PDF
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                <Upload className="w-5 h-5" />
                Upload Image
              </button>
            </div>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
}
