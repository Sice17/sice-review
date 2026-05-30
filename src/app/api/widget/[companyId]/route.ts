import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface WidgetFeedback {
  rating: number;
  comment: string | null;
  created_at: string;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const supabase = await createServiceClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_name")
    .eq("id", companyId)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Company not found" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  const companyProfile = profile as { company_name: string | null };

  const { data: feedbackRows } = await supabase
    .from("feedback")
    .select("rating, comment, created_at, transactions!inner(contractor_id)")
    .eq("transactions.contractor_id", companyId)
    .gte("rating", 4)
    .not("comment", "is", null)
    .order("created_at", { ascending: false })
    .limit(10);

  const feedback = (feedbackRows ?? []) as unknown as WidgetFeedback[];

  const reviews = feedback
    .filter((f) => f.comment && f.comment.trim().length > 0)
    .slice(0, 3)
    .map((f) => ({
      rating: f.rating,
      comment: f.comment as string,
      date: new Date(f.created_at).toLocaleDateString("sv-SE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }));

  return NextResponse.json(
    {
      companyName: companyProfile.company_name ?? "",
      reviews,
    },
    { headers: CORS_HEADERS }
  );
}
