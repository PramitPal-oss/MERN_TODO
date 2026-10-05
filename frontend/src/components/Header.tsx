import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export function Header() {
  const auth = useAuth(); const navigate = useNavigate();
  const signOut = async () => { try { await auth.logout(); navigate("/"); } catch { /* Auth state remains so logout can be retried. */ } };
  return <header className="header"><NavLink className="brand" to="/"><span>Inkstone</span><small>stories worth keeping</small></NavLink><nav>
    <NavLink to="/">Stories</NavLink>
    {auth.status === "authenticated" ? <><NavLink to="/dashboard">My posts</NavLink><NavLink to="/posts/new">Write</NavLink><NavLink to="/account">Account</NavLink>{auth.user?.role === "ADMIN" && <NavLink to="/admin">Admin</NavLink>}<button className="link-button" onClick={signOut}>Log out</button></> : <><NavLink to="/login">Log in</NavLink><NavLink className="nav-cta" to="/register">Join</NavLink></>}
  </nav></header>;
}
