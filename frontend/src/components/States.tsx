export const LoadingState = ({ label = "Loading…" }: { label?: string }) => <div className="state" role="status"><span className="spinner" />{label}</div>;
export const EmptyState = ({ children = "Nothing to show yet." }: { children?: React.ReactNode }) => <div className="state muted">{children}</div>;
export const ErrorState = ({ message, retry }: { message: string; retry?: () => void }) => <div className="alert error" role="alert"><span>{message}</span>{retry && <button className="button ghost" onClick={retry}>Try again</button>}</div>;
