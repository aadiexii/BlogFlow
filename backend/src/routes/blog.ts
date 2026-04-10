import { Hono } from "hono";
import { verify } from "hono/jwt";
import { prismaForUrl } from "../db";
import { createPostInput, updatePostInput } from "../validation";

export const bookRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

bookRouter.use(async (c, next) => {
  const header = c.req.header("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return c.json({ error: "unauthorized" }, 401);
  }

  let payload: { id?: string };
  try {
    payload = (await verify(token, c.env.JWT_SECRET)) as { id?: string };
  } catch {
    return c.json({ error: "unauthorized" }, 401);
  }

  const id = payload.id;
  if (!id || typeof id !== "string") {
    return c.json({ error: "unauthorized" }, 401);
  }

  c.set("userId", id);
  await next();
});

bookRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const prisma = prismaForUrl(c.env.DATABASE_URL);

  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    orderBy: { id: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      published: true,
      authorId: true,
    },
  });

  return c.json({ posts });
});

bookRouter.post("/", async (c) => {
  const userId = c.get("userId");
  const raw = await c.req.json().catch(() => null);
  const parsed = createPostInput.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const prisma = prismaForUrl(c.env.DATABASE_URL);
  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      authorId: userId,
    },
  });

  return c.json({ id: post.id });
});

bookRouter.put("/", async (c) => {
  const userId = c.get("userId");
  const raw = await c.req.json().catch(() => null);
  const parsed = updatePostInput.safeParse(raw);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const prisma = prismaForUrl(c.env.DATABASE_URL);
  const { id, title, content } = parsed.data;

  const owned = await prisma.post.findFirst({
    where: { id, authorId: userId },
  });
  if (!owned) {
    return c.json({ error: "not found" }, 404);
  }

  await prisma.post.update({
    where: { id },
    data: { title, content },
  });

  return c.json({ ok: true });
});

bookRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = prismaForUrl(c.env.DATABASE_URL);

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    return c.json({ error: "not found" }, 404);
  }

  return c.json(post);
});
