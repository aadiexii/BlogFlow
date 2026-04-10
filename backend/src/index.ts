import { Hono } from "hono";
import { cors } from "hono/cors";
import { bookRouter } from "./routes/blog";
import { userRouter } from "./routes/user";

export const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
    maxAge: 86400,
  })
);

app.get("/health", (c) => c.json({ ok: true }));

app.route("/api/v1/user", userRouter);
app.route("/api/v1/book", bookRouter);

export default app;
