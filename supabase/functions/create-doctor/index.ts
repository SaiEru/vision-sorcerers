import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
    } = await callerClient.auth.getUser();
    if (!caller) throw new Error("Unauthorized");

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: callerAdminRole } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!callerAdminRole) throw new Error("Only admins can create doctors");

    const { email, password, full_name, specialization, phone, license_number } = await req.json();

    if (!email || !password || !full_name) {
      throw new Error("Email, password, and full name are required");
    }

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "doctor" },
    });

    if (error) throw error;

    const doctorId = data.user.id;

    const { error: roleError } = await adminClient
      .from("user_roles")
      .upsert({ user_id: doctorId, role: "doctor" }, { onConflict: "user_id,role" });
    if (roleError) throw roleError;

    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: doctorId,
          email,
          full_name,
          specialization: specialization || "",
          phone: phone || "",
          license_number: license_number || "",
        },
        { onConflict: "id" },
      );

    if (profileError) throw profileError;

    return new Response(JSON.stringify({ message: "Doctor created", userId: doctorId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
