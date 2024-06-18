import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link, useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import { BACKEND_URL } from "../constants/constant";
import { showToast } from "../utils/showToast";
import axios from "axios";
import CustomErrorResponse from "../utils/ApiErrorResponse";
export default function Header() {
  const isAuth = Cookie.get("is_auth");
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/logout`, null, {
        withCredentials: true,
      });
      if (response.data.success) {
        showToast("success", response.data.message);
        navigate("/");
      } else {
        CustomErrorResponse(response, navigate);
      }
    } catch (error) {
      CustomErrorResponse({}, () => {}, "Something went wrong");
    }
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: "#254061 !important" }}>
        <Toolbar>
          <Link
            to={isAuth ? "/user/dashboard" : "/"}
            style={{ cursor: "pointer", color: "#fff", textDecoration: "none" }}
          >
            <Typography variant="h6" component="div" mr={3}>
              Home
            </Typography>
          </Link>
          <Link
            to={isAuth ? "/user/change-password" : "/"}
            style={{ cursor: "pointer", color: "#fff", textDecoration: "none" }}
          >
            <Typography
              variant="h6"
              component="div"
              mr={3}
              sx={{ cursor: "pointer" }}
            >
              {isAuth ? "Change Password" : "Login"}
            </Typography>
          </Link>
          {isAuth ? (
            <Typography
              variant="h6"
              component="div"
              mr={3}
              sx={{ cursor: "pointer" }}
              onClick={() => {
                handleLogout();
              }}
            >
              Logout
            </Typography>
          ) : (
            <Link
              to={"/register"}
              style={{
                cursor: "pointer",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              <Typography variant="h6" component="div" mr={3}>
                Register
              </Typography>
            </Link>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
