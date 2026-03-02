import { supabase } from "../../lib/supabase";

export type LotEvent = {
  id: string;
  lot_id: string;
  user_id: string;
  kind: string;
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  created_at: string;
};

export async function listLotEvents(lotId: string) {
  const { data, error } = await supabase
    .from("lot_events")
    .select("*")
    .eq("lot_id", lotId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as LotEvent[];
}

export async function addLotNote(lotId: string, note: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data, error } = await supabase
    .from("lot_events")
    .insert({ lot_id: lotId, user_id: user.id, kind: "note", note })
    .select("*")
    .single();

  if (error) throw error;
  return data as LotEvent;
}
