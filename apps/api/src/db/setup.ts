import "dotenv/config";
import * as authSchema from "@db/auth-schema";
import * as apiSchema from "@db/schema";
import { drizzle } from "drizzle-orm/node-postgres";

const schema = {
  ...apiSchema,
  ...authSchema,
};

export const db = drizzle(process.env.DATABASE_URL!, { schema });
