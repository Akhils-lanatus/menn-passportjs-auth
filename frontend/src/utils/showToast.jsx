import { toast } from "react-toastify";
export const showToast = (type = "success", message = "Jay Shree Ram") =>
  toast[type](message, {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });
