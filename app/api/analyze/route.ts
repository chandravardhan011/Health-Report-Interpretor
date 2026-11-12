import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
export const maxDuration = 60
const GEMINI_REQUEST_TIMEOUT_MS = 20_000
const GEMINI_RETRY_DELAY_MS = 1_000
const MAX_GEMINI_ATTEMPTS = 2

function parseTextResponse(content: string) {
  const sections = {
    summary: '',
    details: '',
    keyFindings: [] as any[],
    questionsForDoctor: [] as string[],
  }

  // Extract summary
  const summaryMatch = content.match(/SUMMARY:?\s*\n([\s\S]*?)(?=\n\n|DETAILED|$)/i)
  if (summaryMatch) {
    sections.summary = summaryMatch[1].trim()
  }

  // Extract detailed explanation
  const detailsMatch = content.match(/DETAILED EXPLANATION:?\s*\n([\s\S]*?)(?=\n\nKEY FINDINGS|$)/i)
  if (detailsMatch) {
    sections.details = detailsMatch[1].trim()
  }

  // Extract key findings
  const findingsMatch = content.match(/KEY FINDINGS:?\s*\n([\s\S]*?)(?=\n\nQUESTIONS|$)/i)
  if (findingsMatch) {
    const findings = findingsMatch[1].trim().split('\n')
    findings.forEach(line => {
      const match = line.match(/[-•]\s*(.+?):\s*(.+?)\s*-\s*(Normal|Abnormal|Borderline)\s*-\s*(.+)/i)
      if (match) {
        sections.keyFindings.push({
          parameter: match[1].trim(),
          explanation: match[4].trim(),
          status: match[3].toLowerCase(),
        })
      }
    })
  }

  // Extract questions
  const questionsMatch = content.match(/QUESTIONS FOR YOUR DOCTOR:?\s*\n([\s\S]*?)$/i)
  if (questionsMatch) {
    const questions = questionsMatch[1].trim().split('\n')
    questions.forEach(line => {
      const match = line.match(/\d+\.\s*(.+)/)
      if (match) {
        sections.questionsForDoctor.push(match[1].trim())
      }
    })
  }

  // Fallback if parsing fails
  if (!sections.summary && !sections.details) {
    sections.summary = 'Analysis completed'
    sections.details = content
  }

  return sections
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const reportText = body?.reportText

    if (typeof reportText !== 'string' || reportText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No report text provided' },
        { status: 400 }
      )
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    const prompt = `You are a medical report interpreter helping patients understand their health reports. Analyze the following medical report and provide a clear, easy-to-understand explanation.

Medical Report:
${reportText}

Please provide your response in this EXACT format (do NOT use JSON, just plain text):

SUMMARY:
[Write 2-3 sentences summarizing the key findings in simple language]

DETAILED EXPLANATION:
[Explain each finding in detail, what it means, and why it matters. Use paragraphs and bullet points for clarity]

KEY FINDINGS:
[List each test result with its status]
- [Test name]: [Result] - [Normal/Abnormal/Borderline] - [Simple explanation]

QUESTIONS FOR YOUR DOCTOR:
[List 3-5 specific questions the patient should ask]
1. [Question 1]
2. [Question 2]

Important: Use simple, non-technical language. Be empathetic and clear. Do NOT use JSON format.`

    let response: Response | undefined
    for (let attempt = 1; attempt <= MAX_GEMINI_ATTEMPTS; attempt++) {
      const controller = new AbortController()
      const timeout = setTimeout(
        () => controller.abort(),
        GEMINI_REQUEST_TIMEOUT_MS
      )

      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2000,
              },
            }),
            signal: controller.signal,
          }
        )
      } catch (error) {
        if (attempt === MAX_GEMINI_ATTEMPTS) {
          const timedOut =
            error instanceof Error && error.name === 'AbortError'
          console.error('Gemini request failed:', error)
          return NextResponse.json(
            {
              error: timedOut
                ? 'AI analysis timed out. Please try again with a shorter or clearer report.'
                : 'Could not reach the AI service. Please try again shortly.',
            },
            { status: timedOut ? 504 : 502 }
          )
        }

        console.warn(`Gemini request failed on attempt ${attempt}; retrying.`)
        await new Promise(resolve => setTimeout(resolve, GEMINI_RETRY_DELAY_MS))
        continue
      } finally {
        clearTimeout(timeout)
      }

      if (response?.ok) break

      if (response && [502, 503, 504].includes(response.status)) {
        const error = await response.text()
        console.warn(
          `Gemini returned HTTP ${response.status} on attempt ${attempt}:`,
          error
        )
        if (attempt < MAX_GEMINI_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, GEMINI_RETRY_DELAY_MS))
          continue
        }

        return NextResponse.json(
          { error: 'The AI service is temporarily busy. Please try again shortly.' },
          { status: response.status }
        )
      }

      if (response && !response.ok) {
        const error = await response.text()
        console.error('Gemini API error:', error)
        const message = response.status === 404
          ? 'The configured Gemini model is unavailable for this API key. Check that the key is active and has access to Gemini 3.6 Flash.'
          : response.status === 429
            ? 'The AI service rate limit has been reached. Please wait a minute and try again.'
            : `AI analysis service returned HTTP ${response.status}.`
        return NextResponse.json(
          { error: message },
          { status: 502 }
        )
      }
    }

    if (!response?.ok) {
      return NextResponse.json(
        { error: 'The AI service did not return a response. Please try again.' },
        { status: 502 }
      )
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || '')
      .join('\n')
      .trim()

    if (!content) {
      console.error('Gemini returned no analysis text:', data.promptFeedback)
      return NextResponse.json(
        { error: 'The AI service returned no analysis. Try another report or retry shortly.' },
        { status: 502 }
      )
    }

    // Parse the structured text response
    const analysis = parseTextResponse(content)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
