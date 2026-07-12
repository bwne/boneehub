import { NextRequest, NextResponse } from "next/server";
import { deleteScript } from "@/lib/store";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteScript(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/scripts/:id] failed to delete script:", err);
    return NextResponse.json({ error: "Could not delete the script" }, { status: 500 });
  }
}
