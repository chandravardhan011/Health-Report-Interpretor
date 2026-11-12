import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'

export const runtime = 'nodejs'

interface ReportPayload {
  fileName: string
  extractedText: string
  summary: string
  details: string
  findings: unknown[]
}

function isReportPayload(value: unknown): value is ReportPayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const report = value as Record<string, unknown>
  return (
    typeof report.fileName === 'string' &&
    report.fileName.trim().length > 0 &&
    typeof report.extractedText === 'string' &&
    report.extractedText.trim().length > 0 &&
    typeof report.summary === 'string' &&
    typeof report.details === 'string' &&
    Array.isArray(report.findings)
  )
}

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const requestedLimit = Number(request.nextUrl.searchParams.get('limit') || 100)
  const reportLimit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 100)
    : 100

  try {
    const snapshot = await getAdminFirestore()
      .collection('reports')
      .where('userId', '==', userId)
      .get()
    const reports = snapshot.docs
      .map(document => {
        const data = document.data()
        return {
          id: document.id,
          ...data,
          uploadDate: typeof data.uploadDate === 'string' ? data.uploadDate : '',
        }
      })
      .sort((a, b) => {
        return b.uploadDate.localeCompare(a.uploadDate)
      })
      .slice(0, reportLimit)

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Error fetching authenticated reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  if (!isReportPayload(body)) {
    return NextResponse.json({ error: 'Invalid report data.' }, { status: 400 })
  }

  if (
    body.fileName.length > 255 ||
    body.extractedText.length > 200_000 ||
    body.summary.length > 20_000 ||
    body.details.length > 100_000 ||
    body.findings.length > 200
  ) {
    return NextResponse.json({ error: 'Report data exceeds the allowed size.' }, { status: 413 })
  }

  try {
    const document = await getAdminFirestore().collection('reports').add({
      userId,
      fileName: body.fileName.trim(),
      extractedText: body.extractedText,
      summary: body.summary,
      details: body.details,
      findings: body.findings,
      uploadDate: new Date().toISOString(),
    })

    return NextResponse.json({ id: document.id }, { status: 201 })
  } catch (error) {
    console.error('Error saving authenticated report:', error)
    return NextResponse.json({ error: 'Failed to save report.' }, { status: 500 })
  }
}
