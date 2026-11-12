import { createWorker } from 'tesseract.js'
import { extractTextFromPDF } from './pdf'

export async function extractTextFromFile(file: File): Promise<string> {
  // Check if it's a PDF
  if (file.type === 'application/pdf') {
    return await extractTextFromPDF(file)
  }
  
  // Otherwise, treat as image and use OCR
  return await extractTextFromImage(file)
}

export async function extractTextFromImage(file: File): Promise<string> {
  const worker = await createWorker('eng')
  
  try {
    const imageUrl = URL.createObjectURL(file)
    const { data: { text } } = await worker.recognize(imageUrl)
    URL.revokeObjectURL(imageUrl)
    
    return text.trim()
  } finally {
    await worker.terminate()
  }
}
