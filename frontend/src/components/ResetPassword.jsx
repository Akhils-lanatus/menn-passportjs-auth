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
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { id, token } = useParams();
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
          Reset Password
        </Typography>
        <Formik
          initialValues={{
            password: "",
            confirm_password: "",
          }}
          validationSchema={Yup.object({
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
                `${BACKEND_URL}/reset-password/${id}/${token}`,
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
                {isLoading ? "Reseting..." : "Reset"}
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link to="/">Login Page</Link>
                </Grid>
              </Grid>
            </Box>
          </Form>
        </Formik>
      </Box>
    </Container>
  );
}
