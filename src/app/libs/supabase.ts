import { createClient } from "@supabase/supabase-js";

const dburl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

const supaauth = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabaseClient = createClient( dburl,supaauth);