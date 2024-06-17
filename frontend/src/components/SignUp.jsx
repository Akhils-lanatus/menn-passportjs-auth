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

export default function SignUp() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(null);
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
          Sign up
        </Typography>
        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            confirm_password: "",
          }}
          validationSchema={Yup.object({
            name: Yup.string()
              .required("Name is required")
              .max(16, "Too long name"),
            email: Yup.string()
              .required("Email is required")
              .email("Invalid email format"),
            password: Yup.string()
              .required("Password is required")
              .min(4, "Please enter at least 4 characters")
              .max(8, "Max 8 characters are allowed"),
            confirm_password: Yup.string()
              .required("Confirm password is required")
              .oneOf(
                [Yup.ref("password"), null],
                "Password and Confirm Password doesn't match"
              ),
          })}
          onSubmit={async (values, { resetForm }) => {
            try {
              setIsLoading(true);
              const response = await axios.post(
                `${BACKEND_URL}/register`,
                values
              );
              if (response.data.success) {
                resetForm();
                showToast("success", response.data.message);
                setIsLoading(null);
                navigate("/verify-email");
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
                    name="name"
                    required
                    fullWidth
                    id="name"
                    label=" Name"
                    helperText={<ErrorMessage name="name" />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
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
                {isLoading ? "Registering..." : "Register"}
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link to="/login">Already have an account? Sign in</Link>
                </Grid>
              </Grid>
            </Box>
          </Form>
        </Formik>
      </Box>
    </Container>
  );
}
