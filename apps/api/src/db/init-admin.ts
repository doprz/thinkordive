import { auth } from "@lib/auth";

auth.api.createUser({
  body: {
    email: "admin@thinkordive.com",
    password: "notagoodpassword",
    name: "Admin",
    role: "admin",
  },
});
