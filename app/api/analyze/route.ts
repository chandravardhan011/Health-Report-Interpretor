import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

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
    const { reportText } = await request.json()

    if (!reportText) {
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Gemini API error:', error)
      return NextResponse.json(
        { error: 'Failed to analyze report' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.candidates[0].content.parts[0].text

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
