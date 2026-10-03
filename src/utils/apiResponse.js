export async function fetchApiJson(url, options, serviceName, unavailableHint) {
  let response
  try {
    response = await fetch(url, options)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`${serviceName} is unreachable. ${unavailableHint}`, { cause: error })
    }
    throw error
  }

  const responseText = await response.text()
  if (!responseText.trim()) {
    throw new Error(`${serviceName} returned an empty response (HTTP ${response.status}). ${unavailableHint}`)
  }

  let result
  try {
    result = JSON.parse(responseText)
  } catch {
    throw new Error(`${serviceName} returned an unexpected response (HTTP ${response.status}). ${unavailableHint}`)
  }

  if (!response.ok) {
    throw new Error(result.error ?? `${serviceName} request failed (HTTP ${response.status}).`)
  }
  return result
}
