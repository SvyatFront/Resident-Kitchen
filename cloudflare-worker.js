/**
 * Resident Kitchen — Cloudflare Worker (AI Proxy)
 *
 * Поддерживает два провайдера с автоматическим fallback:
 *   1. Gemini 2.5 Flash (Google) — основной
 *   2. Groq / Llama 3.3 70B     — резервный при лимите Gemini (429)
 *
 * Переменные окружения (Settings → Variables and Secrets):
 *   GEMINI_API_KEY  — Secret — ключ Google AI Studio (aistudio.google.com/app/apikey)
 *   GROQ_API_KEY    — Secret — ключ Groq (console.groq.com) [опционально, но рекомендуется]
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
  'Cache-Control':                'no-store',
};

export default {
  async fetch(request, env) {

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return respond({ error: 'Only POST allowed' }, 405);
    }

    let payload;
    try { payload = await request.json(); }
    catch (_) { return respond({ error: 'Bad Request: invalid JSON' }, 400); }

    const { model: _m, ...body } = payload;

    /* ── Попытка 1: Gemini ── */
    if (env.GEMINI_API_KEY) {
      const res = await callGemini(body, env.GEMINI_API_KEY);

      if (res.status !== 429) {
        const text = await res.text();
        return new Response(text, { status: res.status, headers: CORS_HEADERS });
      }
      /* 429 от Gemini → пробуем Groq */
    }

    /* ── Попытка 2: Groq (fallback) ── */
    if (env.GROQ_API_KEY) {
      const res = await callGroq(body, env.GROQ_API_KEY);
      const text = await res.text();

      /* Groq отдаёт OpenAI-формат — конвертируем в Gemini-формат для виджета */
      try {
        const groqData  = JSON.parse(text);
        const content   = groqData?.choices?.[0]?.message?.content || '';
        const geminiLike = {
          candidates: [{ content: { parts: [{ text: content }] } }],
          _provider: 'groq',
        };
        return respond(geminiLike, res.status);
      } catch (_) {
        return new Response(text, { status: res.status, headers: CORS_HEADERS });
      }
    }

    return respond({ error: 'Ни GEMINI_API_KEY, ни GROQ_API_KEY не заданы в переменных воркера' }, 500);
  },
};

/* ─── Gemini ──────────────────────────────────────────────── */
async function callGemini(body, apiKey) {
  const model = 'gemini-2.5-flash';
  return fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/'
      + model + ':generateContent?key=' + apiKey,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
}

/* ─── Groq (OpenAI-совместимый API) ─────────────────────── */
async function callGroq(geminiBody, apiKey) {
  /* Конвертируем формат Gemini → OpenAI */
  const messages = [];

  if (geminiBody.system_instruction?.parts?.[0]?.text) {
    messages.push({ role: 'system', content: geminiBody.system_instruction.parts[0].text });
  }

  for (const turn of (geminiBody.contents || [])) {
    messages.push({
      role:    turn.role === 'model' ? 'assistant' : 'user',
      content: turn.parts?.[0]?.text || '',
    });
  }

  const cfg = geminiBody.generationConfig || {};
  const openAiBody = {
    model:       'llama-3.3-70b-versatile',
    messages:    messages,
    max_tokens:  cfg.maxOutputTokens || 440,
    temperature: cfg.temperature     || 0.72,
  };

  return fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: JSON.stringify(openAiBody),
  });
}

/* ─── Утилита ────────────────────────────────────────────── */
function respond(data, status) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}
