import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" }, // Stack vertically on mobile, horizontally on larger screens
        alignItems: "center",
        px: { xs: 2, sm: 8 },
        py: 2,
        bgcolor: "secondary.main",
        color: "secondary.contrastText",
        gap: { xs: 1, sm: 0 },
      }}
    >
      {/* Copyright */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          justifyContent: { xs: "center", sm: "flex-start" },
        }}
      >
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} All rights reserved.
        </Typography>
      </Box>

      {/* Social Media */}
      <Box sx={{ display: "flex", flex: 1, justifyContent: "center", gap: 1 }}>
        <YouTubeIcon />
        <TwitterIcon />
        <FacebookIcon />
      </Box>

      {/* Links */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          justifyContent: { xs: "center", sm: "flex-end" },
          gap: 2,
        }}
      >
        <Typography variant="body2">Contact Us</Typography>
        <Typography variant="body2">Privacy Policies</Typography>
        <Typography variant="body2">Help</Typography>
      </Box>
    </Box>
  );
}
