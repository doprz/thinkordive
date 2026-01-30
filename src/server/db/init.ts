import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "@/server/db/auth-schema";
import * as apiSchema from "@/server/db/schema";

const schema = {
  ...apiSchema,
  ...authSchema,
};

export const db = drizzle(process.env.DATABASE_URL!, { schema });
