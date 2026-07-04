# AI-Powered App Template

Read `.claude/templates/_foundations.md` first — this file only covers what's specific to an LLM-integrated feature or product. This workspace already has one live example worth reading before building a new one: the AI sales chatbot in `src/lib/chat/` (`knowledge.ts` + `buildSystemPrompt.ts`), covered in `apex-site/docs/07-payments-ai-notifications.md`.

## Recommended architecture

- Treat the LLM call as a server-side operation, always — API keys for any LLM provider must never reach the client. Route all model calls through `src/app/api/` handlers or server actions.
- Separate **prompt construction** (deterministic, testable, versioned in code — e.g. `buildSystemPrompt.ts`) from **the model call itself** — don't inline prompt strings at the call site; a change to tone/instructions should be a one-file diff.
- Stream responses to the client (SSE or the provider SDK's streaming mode) for anything conversational — a multi-second blocking request for a chat reply is a UX regression, not an acceptable trade-off.
- Rate-limit and cost-bound every AI endpoint — LLM calls cost real money per request and are the one part of this stack where an abusive client can directly drive infrastructure spend.

## Folder structure

```
src/lib/ai/ (or chat/, matching this project's existing chat/ naming)
├── knowledge.ts            static/retrieved context injected into prompts
├── buildSystemPrompt.ts     prompt construction, versioned, no inline strings elsewhere
├── client.ts                the provider SDK client, instantiated once, server-only
src/app/api/
├── chat/                    streaming completion endpoint
├── [ai-feature]/            any other AI-backed endpoint (summarize, classify, generate)
```

## Tech stack additions

- An LLM provider SDK (e.g., the Anthropic SDK) — server-only dependency, never imported into a client component.
- If retrieval-augmented generation is needed: a vector store (Postgres `pgvector` via Supabase is the natural default here over adding a separate vector DB, given the existing Postgres backend).

## Database design

- `ai_conversations`/`ai_messages` (if conversations persist) — scoped by `customer_id`/`user_id`, same RLS pattern as any other user-owned data.
- `ai_usage_events` — one row per model call: user, endpoint, token counts (input/output), cost estimate, timestamp. This is the table that makes cost/abuse monitoring possible after the fact — don't skip it because "the provider dashboard has usage data"; you need it joined to your own users.
- If RAG: an `embeddings` table (`pgvector` column) with an index appropriate to the similarity metric in use, and RLS scoping matching the source content's own authorization.

## Authentication

Per foundations. Additionally: authenticate *before* the request reaches the model call, and check any usage quota/plan entitlement at the same gate — an unauthenticated or over-quota request should never reach the LLM provider (it's the expensive part).

## API structure

- `POST /api/chat` — accepts conversation history + new message, streams the completion back, persists both sides of the exchange if conversations are stored.
- Rate limiting: per-user and/or per-IP request caps, enforced server-side before the model call — not just a client-side debounce.
- Timeout and graceful degradation: define what the UI shows if the provider is slow or errors (never a silent hang) — surface a clear retry affordance.
- Input validation: cap input length/size before it reaches the model (both for cost and for prompt-injection surface area).

Design with `/api` and `/backend`; pair with `/security` given the cost and prompt-injection exposure.

## UI components

- Chat/streaming interface: incremental token rendering, a visible "thinking"/loading state, and a stop/cancel control for long generations.
- Clear distinction between AI-generated content and human/system content in the UI (labeling), especially in any shared/multi-user context.
- Error and rate-limit states with actionable messaging ("try again in a moment" vs. a generic failure).
- If the feature has cost/quota limits visible to the user (e.g., "X messages remaining"), surface that proactively, not just as a failure after the limit is hit.

## Security checklist

Per foundations, plus:
- [ ] No LLM provider API key is ever sent to or readable from the client.
- [ ] User input is treated as untrusted even when it becomes part of a prompt — validate length/content before use; be deliberate about what system-level instructions could be overridden by adversarial user input (prompt injection).
- [ ] Rate limiting is enforced server-side, per user and/or IP, before the model call.
- [ ] Any retrieved/injected context (RAG, tool results) is scoped by the same authorization as its source data — don't let the model surface another user's private data because it was in a shared vector index without RLS-equivalent filtering.
- [ ] Run `/security` before shipping a new AI endpoint or a change to what context gets included in prompts.

## Performance checklist

Per foundations, plus:
- [ ] Responses stream rather than block for the full generation.
- [ ] Retrieval (if RAG) is indexed appropriately (`pgvector` index type matches the similarity metric and data volume) rather than a full scan per query.
- [ ] `ai_usage_events` writes don't block the response path (fire-and-forget or async, not a blocking insert before streaming starts).
- [ ] Run `/performance` if latency-to-first-token becomes a concern at real usage volume.

## Deployment checklist

Run `/deploy`, plus confirm:
- [ ] LLM provider API key is set for the target environment and scoped appropriately (not a shared dev/prod key without separate spend limits).
- [ ] Provider-side rate/spend limits are configured as a backstop behind the application-level rate limiting.
- [ ] `ai_usage_events` (or equivalent) is actually being written in production — confirm with a real request, not just code review.

## Development phases

1. **Core call**: server-side endpoint, prompt construction module, non-streaming happy path against the provider. → `/api`, `/backend`
2. **Streaming UX**: convert to streaming responses, build the chat/loading UI. → `/frontend`
3. **Persistence & context**: conversation storage (if needed), knowledge/context injection, RAG (if needed).
4. **Guardrails**: rate limiting, usage tracking, cost monitoring, input validation against prompt injection.
5. **Hardening**: `/security` (prompt injection, key exposure, cross-user context leakage), `/performance` (streaming latency, retrieval indexing), `/deploy`.

## Best practices

- Version and centralize prompt construction — never scatter inline prompt strings across call sites.
- Log every model call's cost-relevant data (tokens, latency, user) from day one; retrofitting usage tracking after a cost surprise is much more painful than building it in from phase 1.
- Treat every LLM endpoint as a cost-bearing, abuse-prone surface: rate limit and validate input before the request reaches the provider, not after.
- Stream by default for anything conversational; only fall back to blocking requests for genuinely short, non-interactive completions.
