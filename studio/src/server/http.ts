import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

export function json<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

/** Wrap a route handler: maps HttpError / ZodError to JSON responses. */
export function route<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message, code: e.code }, e.status);
      if (e instanceof ZodError) {
        const i = e.issues[0];
        const field = i?.path.join(".") || "request";
        let msg = i?.message ?? "Invalid request";
        if (i?.code === "too_big" && "maximum" in i) msg = `is too long (max ${i.maximum} characters)`;
        if (i?.code === "too_small" && "minimum" in i) msg = `is too short (min ${i.minimum})`;
        return json({ error: `Invalid ${field}: ${msg}`, issues: e.issues.slice(0, 10) }, 400);
      }
      console.error(e);
      return json({ error: "Internal server error" }, 500);
    }
  };
}
