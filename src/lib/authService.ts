import { supabase } from "./supabaseClient";

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Returns true only if the current signed-in user has a row in `admins`.
// Relies on the "admin read admins" RLS policy: a non-admin's query simply
// returns no row (not an error), so this doubles as the authorization check.
export async function checkIsAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  const { data, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();
  return !error && !!data;
}