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
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const adminEmail = "erukullasai0@gmail.com";
    const adminPassword = "123456";

    const { data: existingUsersData } = await supabase.auth.admin.listUsers();
    const existingAdmin = existingUsersData?.users?.find((u: any) => u.email === adminEmail);

    if (existingAdmin) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: existingAdmin.id,
          email: adminEmail,
          full_name: (existingAdmin.user_metadata?.full_name as string) || "Admin",
        },
        { onConflict: "id" },
      );
      if (profileError) throw profileError;

      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: existingAdmin.id, role: "admin" }, { onConflict: "user_id,role" });
      if (roleError) throw roleError;

      return new Response(JSON.stringify({ message: "Admin already exists", userId: existingAdmin.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: "Admin", role: "admin" },
    });

    if (error) throw error;

    const adminId = data.user.id;

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: adminId,
        email: adminEmail,
        full_name: "Admin",
      },
      { onConflict: "id" },
    );
    if (profileError) throw profileError;

    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({ user_id: adminId, role: "admin" }, { onConflict: "user_id,role" });
    if (roleError) throw roleError;

    return new Response(JSON.stringify({ message: "Admin created", userId: adminId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
