import { NextResponse } from "next/server";
import { demoOpenApiSpec } from "@/lib/demo-openapi";

function isDemoMode() {
  return process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export async function GET() {
  if (!isDemoMode()) {
    return NextResponse.json({ message: "OpenAPI spec is only available in demo mode." }, { status: 404 });
  }

  return NextResponse.json(demoOpenApiSpec);
}
