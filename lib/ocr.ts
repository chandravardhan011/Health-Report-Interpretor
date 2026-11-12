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
  onProgress?.('Enhancing image for text recognition...')
  const image = await createImageBitmap(file)
  const scale = Math.min(
    3,
    3000 / Math.max(image.width, image.height)
  )
  const canvas = window.document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) {
    image.close()
    throw new Error('Could not prepare image for text recognition.')
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  image.close()

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
  for (let index = 0; index < pixels.data.length; index += 4) {
    const gray =
      pixels.data[index] * 0.299 +
      pixels.data[index + 1] * 0.587 +
      pixels.data[index + 2] * 0.114
    const contrastAdjusted = Math.max(
      0,
      Math.min(255, (gray - 128) * 1.35 + 128)
    )
    pixels.data[index] = contrastAdjusted
    pixels.data[index + 1] = contrastAdjusted
    pixels.data[index + 2] = contrastAdjusted
  }
  context.putImageData(pixels, 0, 0)

  onProgress?.('Recognizing text in enhanced image...')
  let worker: Awaited<ReturnType<typeof createWorker>> | undefined
  try {
    worker = await createWorker('eng')
    const { data } = await worker.recognize(canvas)
    const text = data.text.trim()
    if (text.length < 20) {
      throw new Error(
        'Little readable text was found. Try a higher-resolution, well-lit image with the page flat and fully in frame.'
      )
    }

    return text
  } finally {
    await worker?.terminate()
    canvas.width = 0
    canvas.height = 0
  }
}
