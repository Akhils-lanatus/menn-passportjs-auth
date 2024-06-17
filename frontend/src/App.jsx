import SignUp from "./components/SignUp";
import Login from "./components/Login";
import VerifyEmail from "./components/VerifyEmail";
import SendResetPassLink from "./components/SendResetPassLink";
import { ToastContainer, Bounce } from "react-toastify";
import { Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import ResetPassword from "./components/ResetPassword";
import ChangePassword from "./components/ChangePassword";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import UnprotectedRoute from "./UnprotectedRoutes";
import Header from "./components/Header";
import "./components/App.css";
const App = () => {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="" element={<UnprotectedRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password-link" element={<SendResetPassLink />} />
          <Route
            path="/account/reset-password/:id/:token"
            element={<ResetPassword />}
          />
        </Route>
        <Route path="/user" element={<ProtectedRoute />}>
          {/* Can use "/" or "" instead of "dashboard" */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Routes>
      <ToastContainer transition={Bounce} />
    </div>
  );
};

export default App;
