import { createClient } from "@/app/lib/supabase/server";
import { notFound } from "next/navigation";

export async function getPoll(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select(
      `
      *,
      options (*),
      votes (*)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching poll:", error);
    notFound();
  }

  return data;
}