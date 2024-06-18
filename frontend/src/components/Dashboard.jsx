import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import { Container } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../constants/constant";
import { showToast } from "../utils/showToast";

export default function UserCard() {
  const [userData, setUserData] = useState([]);
  useEffect(() => {
    const getUserProfileData = async () => {
      const res = await axios.get(`${BACKEND_URL}/profile`, {
        withCredentials: true,
      });
      if (!res.data.success) {
        showToast("error", res.data.message);
      }
      setUserData(res.data.user);
    };
    getUserProfileData();
  }, []);
  return (
    <Container sx={{ mt: 4 }}>
      <Box
        sx={{
          width: "100%",
          position: "relative",
          overflow: { xs: "auto", sm: "initial" },
        }}
      >
        <Box />
        <Card
          orientation="horizontal"
          sx={{
            width: "100%",
            flexWrap: "wrap",
            [`& > *`]: {
              "--stack-point": "500px",
              minWidth:
                "clamp(0px, (calc(var(--stack-point) - 2 * var(--Card-padding) - 2 * var(--variant-borderWidth, 0px)) + 1px - 100%) * 999, 100%)",
            },
            // make the card resizable for demo
            overflow: "auto",
            resize: "horizontal",
          }}
        >
          <AspectRatio flex ratio="1" maxHeight={182} sx={{ minWidth: 182 }}>
            <img
              src={
                userData?.avatar ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286"
              }
              srcSet="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286&dpr=2 2x"
              loading="lazy"
              alt=""
            />
          </AspectRatio>
          <CardContent>
            <Typography fontSize="xl" fontWeight="lg">
              {userData?.name}
            </Typography>
            <Typography
              level="body-sm"
              fontWeight="lg"
              textColor="text.tertiary"
            >
              {userData?.email}
            </Typography>
            <Sheet
              sx={{
                bgcolor: "background.level1",
                borderRadius: "sm",
                p: 1.5,
                my: 1.5,
                display: "flex",
                gap: 2,
                "& > div": { flex: 1 },
              }}
            >
              <div>
                <Typography level="body-xs" fontWeight="lg">
                  Articles
                </Typography>
                <Typography fontWeight="lg">34</Typography>
              </div>
              <div>
                <Typography level="body-xs" fontWeight="lg">
                  Followers
                </Typography>
                <Typography fontWeight="lg">980</Typography>
              </div>
              <div>
                <Typography level="body-xs" fontWeight="lg">
                  Rating
                </Typography>
                <Typography fontWeight="lg">8.9</Typography>
              </div>
            </Sheet>
            <Box sx={{ display: "flex", gap: 1.5, "& > button": { flex: 1 } }}>
              <Button variant="solid" color="primary">
                Edit Profile
              </Button>
              <Button variant="solid" color="danger">
                Delete Account
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
