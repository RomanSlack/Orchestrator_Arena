import { NextResponse } from "next/server";
import { validateRepositoryUrl } from "@/lib/github/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { valid: false, error: "URL is required" },
        { status: 400 }
      );
    }

    const result = await validateRepositoryUrl(url);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error validating repository:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to validate repository" },
      { status: 500 }
    );
  }
}
