import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { apiFetch } from "../lib/api";
import { getToken } from "../lib/auth";
import { createPostInput } from "../lib/schemas";

type Post = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
};

export function Posts() {
  const navigate = useNavigate();
  const token = getToken();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setListLoading(true);
    try {
      const res = await apiFetch("/api/v1/book", { headers: {}, token });
      const data = (await res.json()) as { posts?: Post[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not load posts");
        return;
      }
      setPosts(data.posts ?? []);
    } catch {
      setError("Network error — is the API running?");
    } finally {
      setListLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }
    void load();
  }, [token, navigate, load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = createPostInput.safeParse({ title, content });
    if (!parsed.success) {
      setError("Title and content are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/book", {
        method: "POST",
        body: JSON.stringify(parsed.data),
        token,
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not create post");
        return;
      }
      setTitle("");
      setContent("");
      await load();
    } catch {
      setError("Network error — is the API running?");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return null;
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-white">My posts</h1>
      <p className="mt-1 text-sm text-slate-400">Create a post and open it to read or edit.</p>

      <form onSubmit={onCreate} className="mt-8 space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <h2 className="text-lg font-medium text-slate-200">New post</h2>
        <div>
          <label htmlFor="ptitle" className="block text-sm font-medium text-slate-300">
            Title
          </label>
          <input
            id="ptitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none ring-indigo-500 focus:ring-2"
            placeholder="Post title"
          />
        </div>
        <div>
          <label htmlFor="pcontent" className="block text-sm font-medium text-slate-300">
            Content
          </label>
          <textarea
            id="pcontent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none ring-indigo-500 focus:ring-2"
            placeholder="Write something…"
          />
        </div>
        {error && (
          <p className="rounded-md border border-red-900/60 bg-red-950/50 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Publishing…" : "Publish"}
        </button>
      </form>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-slate-200">Your posts</h2>
        {listLoading ? (
          <p className="mt-4 text-slate-500">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="mt-4 text-slate-500">No posts yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {posts.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/blog/${p.id}`}
                  className="block rounded-md border border-slate-800 bg-slate-900/40 px-4 py-3 hover:border-slate-600"
                >
                  <span className="font-medium text-white">{p.title}</span>
                  <span className="mt-1 block line-clamp-2 text-sm text-slate-400">{p.content}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}
