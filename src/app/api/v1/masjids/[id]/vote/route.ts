import { NextRequest, NextResponse } from "next/server";
import { recordVote } from "@/lib/store";
import { VoteSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const parsed = VoteSchema.safeParse({ ...body, masjidId: id });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = recordVote(parsed.data);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
