import { NavLink, Outlet } from "react-router-dom";
export function AdminLayout() { return <div className="admin-shell"><aside><h2>Admin</h2><NavLink end to="/admin">Overview</NavLink><NavLink to="/admin/users">Users</NavLink><NavLink to="/admin/posts">Posts</NavLink><NavLink to="/admin/comments">Comments</NavLink></aside><section><Outlet /></section></div>; }
