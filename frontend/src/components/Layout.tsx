import { Link, useNavigate } from "react-router-dom";
import { clearSession, getToken } from "../lib/auth";

type Props = { children: React.ReactNode };

export function Layout({ children }: Props) {
  const navigate = useNavigate();
  const signedIn = !!getToken();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-lg font-semibold tracking-tight text-white">
            BlogFlow
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            {signedIn ? (
              <>
                <Link to="/posts" className="text-slate-300 hover:text-white">
                  My posts
                </Link>
                <button
                  type="button"
                  className="rounded-md border border-slate-600 px-3 py-1 text-slate-300 hover:border-slate-500 hover:text-white"
                  onClick={() => {
                    clearSession();
                    navigate("/signin");
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="text-slate-300 hover:text-white">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md bg-indigo-600 px-3 py-1 font-medium text-white hover:bg-indigo-500"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
