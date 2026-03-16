import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      data: null,
      error: {
        message,
        details: details ?? null
      }
    },
    { status }
  );
}

export async function parseJson<T>(request: Request, schema: ZodSchema<T>) {
  const body = await request.json();
  return schema.parse(body);
}
