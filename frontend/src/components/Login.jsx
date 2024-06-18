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
import GoogleIcon from "@mui/icons-material/Google";

export default function Login() {
  const [isLoading, setIsLoading] = useState(null);
  const navigate = useNavigate();
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
          Sign In
        </Typography>
        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          validationSchema={Yup.object({
            email: Yup.string()
              .required("Email is required")
              .email("Invalid email format"),
            password: Yup.string()
              .required("Password is required")
              .min(4, "Please enter at least 4 characters")
              .max(8, "Max 8 characters are allowed"),
          })}
          onSubmit={async (values, { resetForm }) => {
            setIsLoading(true);
            try {
              const response = await axios.post(
                `${BACKEND_URL}/login`,
                values,
                { withCredentials: true }
              );

              if (response.data.success) {
                resetForm();
                showToast("success", response.data.message);
                setIsLoading(null);
                navigate("/user/dashboard");
              } else {
                setIsLoading(null);
                showToast("error", response.data.message);
              }
            } catch (error) {
              setIsLoading(null);
              showToast("error", "Something Went Wrong");
            }
          }}
        >
          <Form>
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="email"
                    required
                    fullWidth
                    id="email"
                    label=" Email"
                    helperText={<ErrorMessage name="email" />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    required
                    fullWidth
                    id="password"
                    label="Password"
                    name="password"
                    type="password"
                    helperText={<ErrorMessage name="password" />}
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
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </Box>
          </Form>
        </Formik>
        <Button
          fullWidth
          variant="contained"
          disabled={isLoading}
          sx={{ mt: 3, mb: 2 }}
          startIcon={<GoogleIcon />}
          onClick={() => {
            window.open("http://localhost:8000/api/v1/auth/google", "_self");
          }}
        >
          Login With Google
        </Button>
        <Grid container justifyContent="space-between">
          <Grid item xs={6} textAlign={"start"}>
            <Link to="/reset-password-link">Forgot password</Link>
          </Grid>
          <Grid item xs={6} textAlign={"end"}>
            <Link to="/register">{`Don't have an account? Sign Up`}</Link>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
