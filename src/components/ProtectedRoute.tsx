import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuth = localStorage.getItem("admin-auth") === "true";
  return isAuth ? children : <Navigate to="/login" />;
}
