import { createServerComponentClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "./supabase";

// サーバーコンポーネント用
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};
