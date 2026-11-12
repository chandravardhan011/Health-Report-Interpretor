import { createWorker } from 'tesseract.js'
import { extractTextFromPDF } from './pdf'

export async function extractTextFromFile(
  file: File,
  onProgress?: (message: string) => void
): Promise<string> {
  if (file.type === 'application/pdf') {
    return extractTextFromPDF(file, onProgress)
  }

  return extractTextFromImage(file, onProgress)
}

export async function extractTextFromImage(
  file: File,
  onProgress?: (message: string) => void
): Promise<string> {
  onProgress?.('Starting image text recognition...')
  const worker = await createWorker('eng')

  try {
    const { data } = await worker.recognize(file)
    const text = data.text.trim()
    if (text.length < 20) {
      throw new Error('No readable text was found. Try a clearer, well-lit image.')
    }

    return text
  } finally {
    await worker.terminate()
  }
}
