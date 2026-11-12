export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Use FileReader to read PDF as text
    // This is a simple approach that works for text-based PDFs
    const text = await file.text()
    
    // Basic PDF text extraction (works for simple PDFs)
    // Remove PDF headers and binary data
    const cleanText = text
      .replace(/%PDF-[\d.]+/g, '')
      .replace(/%%EOF/g, '')
      .replace(/stream[\s\S]*?endstream/g, '')
      .replace(/\/[A-Z][a-zA-Z0-9]*/g, '')
      .replace(/[<>()[\]{}]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    if (cleanText.length < 50) {
      throw new Error('Could not extract enough text from PDF. Please try converting to image first.')
    }
    
    return cleanText
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF. Please try uploading as an image instead.')
  }
}
