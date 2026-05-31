import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await createServiceClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: transactions } = await admin
    .from("transactions")
    .select("*")
    .eq("contractor_id", user.id)
    .order("created_at", { ascending: false });

  const transactionIds = (transactions ?? []).map(
    (tx: { id: string }) => tx.id
  );

  let feedback: unknown[] = [];
  if (transactionIds.length > 0) {
    const { data: fb } = await admin
      .from("feedback")
      .select("*")
      .in("transaction_id", transactionIds);
    feedback = fb ?? [];
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    profile: profile ?? null,
    transactions: transactions ?? [],
    feedback,
  };

  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="sice-review-export-${date}.json"`,
    },
  });
}
