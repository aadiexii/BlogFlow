import { Hono } from "hono";
import { sign } from "hono/jwt";
import { prismaForUrl } from "../db";
import { signinInput, signupInput } from "../validation";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const raw = await c.req.json().catch(() => null);
  const parsed = signupInput.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const prisma = prismaForUrl(c.env.DATABASE_URL);

  try {
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.name,
      },
    });

    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt: token, userId: user.id });
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e ? (e as { code: string }).code : "";
    if (code === "P2002") {
      return c.json({ error: "Email already registered" }, 409);
    }
    throw e;
  }
});

userRouter.post("/signin", async (c) => {
  const raw = await c.req.json().catch(() => null);
  const parsed = signinInput.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const prisma = prismaForUrl(c.env.DATABASE_URL);
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.password !== password) {
    return c.json({ error: "Invalid email or password" }, 403);
  }

  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
  return c.json({ jwt, userId: user.id });
});
