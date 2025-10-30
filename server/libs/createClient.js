import { createClient } from "@supabase/supabase-js";
configDotenv({
  path: "../.env",
  quiet: true,
});
import { configDotenv } from "dotenv";
const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_CLIENT_KEY
);
export default sb;
