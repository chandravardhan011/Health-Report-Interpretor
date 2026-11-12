export async function analyzeReport(reportText: string) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reportText }),
  })

  if (!response.ok) {
    throw new Error('Failed to analyze report')
  }

  return response.json()
}
