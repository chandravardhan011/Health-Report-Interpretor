export async function analyzeReport(reportText: string) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportText }),
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(
      data?.error || `AI analysis failed (HTTP ${response.status}). Check the Gemini key and quota.`
    )
  }

  return data
}
