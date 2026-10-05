import { Link } from "react-router-dom";
export const ForbiddenPage = () => <div className="status-page"><p className="eyebrow">403</p><h1>That area is restricted.</h1><p>Your account does not have permission to view this page.</p><Link className="button primary" to="/">Back home</Link></div>;
export const NotFoundPage = () => <div className="status-page"><p className="eyebrow">404</p><h1>This page has wandered off.</h1><p>The link may be old, or the page may have moved.</p><Link className="button primary" to="/">Back home</Link></div>;
