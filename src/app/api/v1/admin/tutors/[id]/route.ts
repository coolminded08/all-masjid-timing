import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { updateQuranTutor, deleteQuranTutor, setQuranTutorStatus } from "@/lib/store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthed = await isAuthenticatedAdmin();
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  if (body.status) {
    const updated = setQuranTutorStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Tutor not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  }

  const updated = updateQuranTutor(id, body);
  if (!updated) {
    return NextResponse.json({ success: false, error: "Tutor not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthed = await isAuthenticatedAdmin();
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = deleteQuranTutor(id);
  if (!deleted) {
    return NextResponse.json({ success: false, error: "Tutor not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Tutor deleted successfully" });
}
