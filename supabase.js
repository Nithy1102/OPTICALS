/* ============================================================
   supabase.js  —  Shared Supabase client for Rajesh Opticals
   ============================================================
   Replace the two values below with your actual project values:
   Supabase Dashboard → Settings → API
   ============================================================ */

const SUPABASE_URL  = "https://rqjfilznegvjixrimxwz.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxamZpbHpuZWd2aml4cmlteHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTQ5MjUsImV4cCI6MjA4ODg3MDkyNX0.iIXp3zJ-vouXV27B4s3TkIe-5Myn0Q0B-OMnENryXuw";

const { createClient } = supabase; // from CDN
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ── Auth helpers ───────────────────────────────────────── */

async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { window.location.href = "login.html"; return null; }
  return session;
}

async function getCurrentUser() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;
  const { data: profile } = await sb
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();
  return profile ? { ...session.user, ...profile } : session.user;
}

async function doLogout() {
  const user = await getCurrentUser();
  if (user) {
    await sb.from("activity_log").insert({
      user_id: user.id,
      user_name: user.name || user.email,
      user_role: user.role || "staff",
      status: `${user.name || user.email} Logged Out`,
      action: "Logout"
    });
  }
  await sb.auth.signOut();
  window.location.href = "login.html";
}

async function logActivity(user, status, action) {
  await sb.from("activity_log").insert({
    user_id:   user.id,
    user_name: user.name || user.email,
    user_role: user.role || "staff",
    status,
    action
  });
}

async function addNotification(title, message, icon = "bell") {
  await sb.from("notifications").insert({ title, message, icon });
}
