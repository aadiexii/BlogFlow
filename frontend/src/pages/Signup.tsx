import { signupInput } from "../lib/schemas";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { apiFetch } from "../lib/api";
import { setSession } from "../lib/auth";

export function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = signupInput.safeParse({ email, password, name: name || undefined });
    if (!parsed.success) {
      setError("Please enter a valid email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/user/signup", {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as { jwt?: string; userId?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not sign up");
        return;
      }
      if (!data.jwt || !data.userId) {
        setError("Unexpected response from server");
        return;
      }
      setSession(data.jwt, data.userId);
      navigate("/posts");
    } catch {
      setError("Network error — is the API running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold text-white">Create an account</h1>
        <p className="mt-1 text-sm text-slate-400">
          Already have one?{" "}
          <Link to="/signin" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300">
              Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none ring-indigo-500 focus:ring-2"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none ring-indigo-500 focus:ring-2"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none ring-indigo-500 focus:ring-2"
              autoComplete="new-password"
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
            className="w-full rounded-md bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Sign up"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
