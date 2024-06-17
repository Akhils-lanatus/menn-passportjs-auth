import SignUp from "./components/SignUp";
import Login from "./components/Login";
import VerifyEmail from "./components/VerifyEmail";
import SendResetPassLink from "./components/SendResetPassLink";
import { ToastContainer, Bounce } from "react-toastify";
import { Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import ResetPassword from "./components/ResetPassword";
import ChangePassword from "./components/ChangePassword";
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password-link" element={<SendResetPassLink />} />
        <Route
          path="/account/reset-password/:id/:token"
          element={<ResetPassword />}
        />
        <Route path="/change-password" element={<ChangePassword />} />
      </Routes>
      <ToastContainer transition={Bounce} />
    </div>
  );
};

export default App;
