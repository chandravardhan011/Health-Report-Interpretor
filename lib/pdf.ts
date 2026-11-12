import * as pdfjs from 'pdfjs-dist/legacy/build/pdf'
import { createWorker } from 'tesseract.js'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.js',
  import.meta.url
).toString()

const MIN_TEXT_LENGTH = 20

export async function extractTextFromPDF(
  file: File,
  onProgress?: (message: string) => void
): Promise<string> {
  const document = await pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  }).promise
  let ocrWorker: Awaited<ReturnType<typeof createWorker>> | undefined

  try {
    const pages: string[] = []

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      onProgress?.(`Reading PDF page ${pageNumber} of ${document.numPages}...`)
      const page = await document.getPage(pageNumber)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map(item => ('str' in item ? item.str : ''))
        .join(' ')
        .trim()

      if (pageText.length >= MIN_TEXT_LENGTH) {
        pages.push(pageText)
        continue
      }

      onProgress?.(`Recognizing text on scanned PDF page ${pageNumber}...`)
      ocrWorker ??= await createWorker('eng')

      const viewport = page.getViewport({ scale: 2.5 })
      const canvas = window.document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('Could not prepare scanned PDF page for text recognition.')
      }

      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      await page.render({ canvasContext: context, viewport }).promise
      const { data } = await ocrWorker.recognize(canvas)
      pages.push(data.text.trim())
      canvas.width = 0
      canvas.height = 0
    }

    const extractedText = pages.filter(Boolean).join('\n\n').trim()
    if (extractedText.length < MIN_TEXT_LENGTH) {
      throw new Error('No readable text was found. Try a clearer PDF or image.')
    }

    return extractedText
  } finally {
    await ocrWorker?.terminate()
    await document.destroy()
  }
}
