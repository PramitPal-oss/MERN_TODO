import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
export function MainLayout() { return <><Header /><main className="container"><Outlet /></main><footer>Inkstone · Built with the MERN stack</footer></>; }
