import { Navigate, BrowserRouter, Route, Routes } from "react-router-dom";
import { getToken } from "./lib/auth";
import { Blog } from "./pages/Blog";
import { Posts } from "./pages/Posts";
import { Signin } from "./pages/Signin";
import { Signup } from "./pages/Signup";

function Home() {
  return <Navigate to={getToken() ? "/posts" : "/signin"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
