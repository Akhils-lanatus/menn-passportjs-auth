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

export default function VerifyEmail() {
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
          Verify Email
        </Typography>
        <Typography variant="subtitle2">
          Enter OTP to verify email. OTP will be valid for 5 minutes
        </Typography>
        <Formik
          initialValues={{
            email: "",
            otp: "",
          }}
          validationSchema={Yup.object({
            email: Yup.string()
              .required("Email is required")
              .email("Invalid email format"),
            otp: Yup.string().required("OTP is required").max(4, "Invalid OTP"),
          })}
          onSubmit={async (values, { resetForm }) => {
            setIsLoading(true);
            try {
              const response = await axios.post(
                `${BACKEND_URL}/verify-email`,
                values
              );
              if (response.data.success) {
                resetForm();
                showToast("success", response.data.message);
                setIsLoading(null);
                navigate("/");
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
                    id="otp"
                    label="OTP"
                    name="otp"
                    helperText={<ErrorMessage name="otp" />}
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
                {isLoading ? "Verifying..." : "Verify Yourself"}
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link to="/register">Register Page</Link>
                </Grid>
              </Grid>
            </Box>
          </Form>
        </Formik>
      </Box>
    </Container>
  );
}
