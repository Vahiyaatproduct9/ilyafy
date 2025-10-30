import { createClient } from "@supabase/supabase-js";
configDotenv({
  path: "../.env",
  quiet: true,
});
import { configDotenv } from "dotenv";
const sbs = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
export default sbs;
