import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import {
  updateJummahSermon,
  setJummahSermonStatus,
  deleteJummahSermon,
  getJummahSermonBySlugOrId,
} from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAuthed = await isAuthenticatedAdmin();
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sermon = getJummahSermonBySlugOrId(id);
  if (!sermon) {
    return NextResponse.json({ success: false, error: "Sermon not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: sermon });
}

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

  if (body.action === "set_status" && body.status) {
    const updated = setJummahSermonStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Sermon not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data: updated,
      message: `Sermon status updated to ${body.status}.`,
    });
  }

  const updated = updateJummahSermon(id, body);
  if (!updated) {
    return NextResponse.json({ success: false, error: "Sermon not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: updated,
    message: "Sermon successfully updated.",
  });
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
  const deleted = deleteJummahSermon(id);
  if (!deleted) {
    return NextResponse.json({ success: false, error: "Sermon not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: "Jummah sermon successfully deleted.",
  });
}
