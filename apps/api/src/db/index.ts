import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as apiSchema from "../db/schema";
import * as authSchema from "../../auth-schema"

const schema = {
  ...apiSchema,
  ...authSchema
}

export const db = drizzle(process.env.DATABASE_URL!, { schema });

