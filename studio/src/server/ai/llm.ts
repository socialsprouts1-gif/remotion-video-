/**
 * Claude (Anthropic) integration for reasoning tasks: AI Director plans, editing
 * assistant command plans, motion-graphics layer generation, script-to-video.
 * The key stays on the server (ANTHROPIC_API_KEY).
 */
import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { HttpError } from "../http";

export const LLM_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

let client: Anthropic | null = null;
export function llmConfigured() {
  return !!process.env.ANTHROPIC_API_KEY;
}
function getClient() {
  if (!llmConfigured()) throw new HttpError(412, "Claude is not connected. Add ANTHROPIC_API_KEY to the server environment.", "integration_required");
  client ??= new Anthropic();
  return client;
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.search(/[[{]/);
  const end = Math.max(raw.lastIndexOf("}"), raw.lastIndexOf("]"));
  if (start < 0 || end < start) throw new Error("No JSON object found in model response");
  return JSON.parse(raw.slice(start, end + 1));
}

/**
 * Ask Claude for JSON matching `schema`. On a validation failure the error is fed
 * back once so the model can correct itself.
 */
export async function llmJson<T>(opts: { system: string; user: string; schema: z.ZodType<T, z.ZodTypeDef, unknown>; effort?: "low" | "medium" | "high"; maxTokens?: number }): Promise<T> {
  const c = getClient();
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: opts.user }];
  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Anthropic.Message;
    try {
      response = await c.messages
        .stream({
          model: LLM_MODEL,
          max_tokens: opts.maxTokens ?? 32000,
          system: [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }],
          output_config: { effort: opts.effort ?? "medium" },
          messages,
        })
        .finalMessage();
    } catch (e) {
      if (e instanceof Anthropic.AuthenticationError) throw new HttpError(502, "Claude rejected the API key (check ANTHROPIC_API_KEY).");
      if (e instanceof Anthropic.RateLimitError) throw new HttpError(429, "Claude is rate limited right now. Try again in a moment.");
      if (e instanceof Anthropic.APIError) throw new HttpError(502, `Claude API error ${e.status}: ${e.message.slice(0, 200)}`);
      throw new HttpError(502, `Could not reach Claude: ${(e as Error).message}`);
    }
    if (response.stop_reason === "refusal") throw new HttpError(422, "Claude declined this request. Try rephrasing it.");
    const text = response.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    try {
      return opts.schema.parse(extractJson(text));
    } catch (e) {
      lastError = (e as Error).message.slice(0, 1500);
      messages.push({ role: "assistant", content: response.content.filter((b) => b.type === "text") });
      messages.push({ role: "user", content: `Your JSON did not validate: ${lastError}\nReturn only the corrected JSON.` });
    }
  }
  throw new HttpError(502, `Claude returned an invalid plan: ${lastError.slice(0, 300)}`);
}
