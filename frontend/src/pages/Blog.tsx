import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { apiFetch } from "../lib/api";
import { getToken, getUserId } from "../lib/auth";
import { createPostInput } from "../lib/schemas";

type Post = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
};

export function Blog() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = getToken();
  const userId = getUserId();

  const [post, setPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }
    if (!id) {
      navigate("/posts", { replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/v1/book/${id}`, { token });
        const data = (await res.json()) as Post & { error?: string };
        if (!res.ok) {
          if (!cancelled) setError(data.error ?? "Could not load post");
          return;
        }
        if (!cancelled) {
          setPost(data);
          setEditTitle(data.title);
          setEditContent(data.content);
        }
      } catch {
        if (!cancelled) setError("Network error — is the API running?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, token, navigate]);

  const isOwner = post && userId && post.authorId === userId;

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!post || !token || !id) return;
    setError(null);

    const parsed = createPostInput.safeParse({ title: editTitle, content: editContent });
    if (!parsed.success) {
      setError("Title and content are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch("/api/v1/book", {
        method: "PUT",
        body: JSON.stringify({ id, ...parsed.data }),
        token,
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Could not save");
        return;
      }
      setPost((p) =>
        p ? { ...p, title: parsed.data.title, content: parsed.data.content } : p
      );
      setEditing(false);
    } catch {
      setError("Network error — is the API running?");
    } finally {
      setSaving(false);
    }
  }

  if (!token) {
    return null;
  }

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/posts" className="text-sm text-indigo-400 hover:text-indigo-300">
          ← Back to posts
        </Link>
      </div>

      {loading && <p className="text-slate-500">Loading…</p>}
      {error && !loading && (
        <p className="rounded-md border border-red-900/60 bg-red-950/50 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {post && !loading && (
        <>
          {isOwner && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mb-4 rounded-md border border-slate-600 px-3 py-1 text-sm text-slate-200 hover:border-slate-500"
            >
              Edit
            </button>
          )}

          {editing && isOwner ? (
            <form onSubmit={onSave} className="space-y-4">
              <div>
                <label htmlFor="etitle" className="block text-sm font-medium text-slate-300">
                  Title
                </label>
                <input
                  id="etitle"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none ring-indigo-500 focus:ring-2"
                />
              </div>
              <div>
                <label htmlFor="econtent" className="block text-sm font-medium text-slate-300">
                  Content
                </label>
                <textarea
                  id="econtent"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={10}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none ring-indigo-500 focus:ring-2"
                />
              </div>
              {error && (
                <p className="rounded-md border border-red-900/60 bg-red-950/50 px-3 py-2 text-sm text-red-200">
                  {error}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setEditTitle(post.title);
                    setEditContent(post.content);
                    setError(null);
                  }}
                  className="rounded-md border border-slate-600 px-4 py-2 text-slate-200 hover:border-slate-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <article>
              <h1 className="text-3xl font-semibold text-white">{post.title}</h1>
              <div className="prose prose-invert mt-6 max-w-none whitespace-pre-wrap text-slate-300">
                {post.content}
              </div>
            </article>
          )}
        </>
      )}
    </Layout>
  );
}
