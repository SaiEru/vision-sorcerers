// Helper to bypass strict typing for tables not yet in auto-generated types
import { supabase } from "@/integrations/supabase/client";

export const db = supabase as any;
