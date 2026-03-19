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

    if (!callerAdminRole) throw new Error("Only admins can update doctors");

    const { doctor_id, email, password, full_name, specialization, phone, license_number, date_of_birth, address, qualification, experience_years, department, bio } = await req.json();

    if (!doctor_id) throw new Error("doctor_id is required");

    const authUpdate: Record<string, unknown> = {};
    if (email) authUpdate.email = email;
    if (password) authUpdate.password = password;

    if (Object.keys(authUpdate).length > 0) {
      const { error } = await adminClient.auth.admin.updateUserById(doctor_id, authUpdate);
      if (error) throw error;
    }

    const profileUpdate: Record<string, unknown> = {};
    if (full_name !== undefined) profileUpdate.full_name = full_name;
    if (email !== undefined) profileUpdate.email = email;
    if (specialization !== undefined) profileUpdate.specialization = specialization;
    if (phone !== undefined) profileUpdate.phone = phone;
    if (license_number !== undefined) profileUpdate.license_number = license_number;
    if (date_of_birth !== undefined) profileUpdate.date_of_birth = date_of_birth;
    if (address !== undefined) profileUpdate.address = address;
    if (qualification !== undefined) profileUpdate.qualification = qualification;
    if (experience_years !== undefined) profileUpdate.experience_years = experience_years;
    if (department !== undefined) profileUpdate.department = department;
    if (bio !== undefined) profileUpdate.bio = bio;

    if (Object.keys(profileUpdate).length > 0) {
      const { error } = await adminClient.from("profiles").update(profileUpdate).eq("id", doctor_id);
      if (error) throw error;
    }

    return new Response(JSON.stringify({ message: "Doctor updated" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
