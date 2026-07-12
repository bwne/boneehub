import { NextRequest, NextResponse } from "next/server";
import { addScript, listScripts } from "@/lib/store";

export async function GET() {
  const scripts = await listScripts();
  return NextResponse.json(scripts);
}

export async function POST(req: NextRequest) {
  let body: {
    title?: string;
    description?: string;
    imageUrl?: string;
    code?: string;
    tags?: string[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { title, description, imageUrl, code, tags } = body;

  if (!title?.trim() || !description?.trim() || !code?.trim()) {
    return NextResponse.json(
      { error: "Title, description, and code are required" },
      { status: 400 }
    );
  }

  try {
    const entry = await addScript({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl?.trim() || "",
      code,
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    console.error("[api/scripts] failed to save script:", err);
    return NextResponse.json(
      {
        error:
          "The server couldn't save the script. If you're on Vercel without Upstash Redis connected, storage may not be writable — see the README's deployment section.",
      },
      { status: 500 }
    );
  }
}
