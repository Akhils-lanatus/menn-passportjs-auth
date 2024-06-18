import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import * as Yup from "yup";
import { Form, ErrorMessage, Field, Formik } from "formik";
import axios from "axios";
import { BACKEND_URL } from "../constants/constant";
import { showToast } from "../utils/showToast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CustomErrorResponse from "../utils/ApiErrorResponse";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(null);
  const handleSubmit = async (values, { resetForm }) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${BACKEND_URL}/change-password`,
        values,
        { withCredentials: true }
      );
      if (response.data.success) {
        resetForm();
        showToast("success", response.data.message);
        navigate("/user/dashboard");
      } else {
        CustomErrorResponse(response, navigate);
      }
    } catch (error) {
      CustomErrorResponse({}, {}, "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Change Password
        </Typography>
        <Formik
          initialValues={{
            oldPassword: "",
            newPassword: "",
            confirm_password: "",
          }}
          validationSchema={Yup.object({
            oldPassword: Yup.string()
              .required("Old Password is required")
              .min(4, "Please enter at least 4 characters")
              .max(8, "Max 8 characters are allowed"),
            newPassword: Yup.string()
              .required("Password is required")
              .min(4, "Please enter at least 4 characters")
              .max(8, "Max 8 characters are allowed"),
            confirm_password: Yup.string()
              .required("Confirm password is required")
              .oneOf(
                [Yup.ref("newPassword"), null],
                "Password and Confirm Password doesn't match"
              ),
          })}
          onSubmit={handleSubmit}
        >
          <Form>
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    required
                    fullWidth
                    id="oldPassword"
                    label="Old Password"
                    name="oldPassword"
                    type="password"
                    helperText={<ErrorMessage name="oldPassword" />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    required
                    fullWidth
                    id="newPassword"
                    label="New Password"
                    name="newPassword"
                    type="password"
                    helperText={<ErrorMessage name="newPassword" />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    required
                    fullWidth
                    name="confirm_password"
                    label="Confirm Password"
                    type="password"
                    id="confirm_password"
                    helperText={<ErrorMessage name="confirm_password" />}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{ mt: 3, mb: 2 }}
              >
                {isLoading ? "Changing..." : "Change"}
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link to="/user/dashboard">Goto Dashboard</Link>
                </Grid>
              </Grid>
            </Box>
          </Form>
        </Formik>
      </Box>
    </Container>
  );
}
