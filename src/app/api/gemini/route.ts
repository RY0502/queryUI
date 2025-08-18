export const runtime = 'edge';

const API_TIMEOUT_MS = 20000;

export async function POST(req: Request) {
  const { prompt } = await req.json().catch(() => ({} as any));
  if (!prompt || typeof prompt !== 'string') {
    return new Response(
      JSON.stringify({ source: 'Gemini', status: 'failed', error: 'Missing prompt.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ source: 'Gemini', status: 'failed', error: 'GEMINI_API_KEY is not set.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': GEMINI_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          source: 'Gemini',
          status: 'failed',
          error: `HTTP error! status: ${response.status}`,
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();

    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!textResponse) {
      return new Response(
        JSON.stringify({
          source: 'Gemini',
          status: 'failed',
          error: 'Failed to parse Gemini response.',
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Provide both raw text and a simple HTML-wrapped version for your UI
    const escaped = textResponse
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');
    const html = `<div>${escaped}</div>`;

    return new Response(
      JSON.stringify({ source: 'Gemini', status: 'succeeded', response: textResponse, html }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    clearTimeout(timeoutId);
    const message = error?.name === 'AbortError' ? 'Request timed out.' : error?.message || 'Unknown error';
    return new Response(
      JSON.stringify({ source: 'Gemini', status: 'failed', error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
