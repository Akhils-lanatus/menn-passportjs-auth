import Cookie from "js-cookie";
import { Outlet, Navigate } from "react-router-dom";
const ProtectedRoute = () => {
  return Cookie.get("is_auth") ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
