import { showToast } from "./showToast";
const CustomErrorResponse = (
  response = {},
  navigate = () => {},
  message = ""
) => {
  showToast("error", message || response.data.message);
  if (response.data?.token === false) {
    navigate("/");
  }
};
export default CustomErrorResponse;
