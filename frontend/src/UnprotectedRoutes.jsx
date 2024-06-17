import Cookie from "js-cookie";
import { Outlet, Navigate } from "react-router-dom";
const UnprotectedRoute = () => {
  return Cookie.get("is_auth") ? (
    <Navigate to={"/user/dashboard"} />
  ) : (
    <Outlet />
  );
};

export default UnprotectedRoute;
