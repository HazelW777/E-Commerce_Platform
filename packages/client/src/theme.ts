import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "rgba(80, 72, 229, 1)",
      contrastText: "rgba(255, 255, 255, 1)",
    },
    secondary: {
      main: "rgba(17, 24, 39, 1)",
      light: "rgba(107, 114, 128, 1)",
      contrastText: "rgba(255, 255, 255, 1)",
    },
    error: {
      main: "rgba(252, 90, 68, 1)",
      contrastText: "rgba(255, 255, 255, 1)",
    },
    background: {
      default: "rgba(249, 250, 251, 1)",
      paper: "rgba(255, 255, 255, 1)",
    },
    text: {
      primary: "rgba(17, 24, 39, 1)",
      secondary: "rgba(107, 114, 128, 1)",
    },
  },
  typography: {
    fontFamily: "Inter, Arial, sans-serif",
    button: {
      textTransform: "none", // Disable uppercase transformation for buttons
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        outlined: {
          border: "1px solid rgba(204, 204, 204, 1)",
          backgroundColor: "rgba(255, 255, 255, 1)",
          color: "rgba(107, 114, 128, 1)",
        },
      },
    },
  },
});

export default theme;
