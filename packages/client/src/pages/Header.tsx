import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import Cart from "./cart/Cart";

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalQuantity, subtotal, fetchCart } = useCart();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [cartOpen, setCartOpen] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated && user?.role === "customer") {
      fetchCart();
    }
  }, [isAuthenticated, user?.role, fetchCart]);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate("/signin");
  };

  return (
    <Box sx={{ top: 0, zIndex: 1100 }}>
      <AppBar position="fixed" color="secondary" elevation={0}>
        <Toolbar sx={{ px: { xs: 2, sm: 8 } }}>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "baseline" }}>
            <Typography
              className="logo-management"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: "28px",
                display: { xs: "none", md: "block" },
              }}
            >
              Management
            </Typography>
            {/* Show "M" on mobile */}
            <Typography
              className="logo-management"
              noWrap
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: "28px",
                display: { xs: "block", md: "none" },
              }}
            >
              M
            </Typography>
            <Typography
              className="logo-chuwa"
              component="div"
              sx={{ fontWeight: 700, fontSize: "12px", flexShrink: 0 }}
            >
              Chuwa
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isAuthenticated && (
              <>
                <IconButton
                  color="inherit"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                >
                  <Avatar sx={{ width: 30, height: 30 }} />
                  <Typography
                    variant="body2"
                    sx={{ ml: 1, display: { xs: "none", sm: "block" } }}
                  >
                    {user?.email}
                  </Typography>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={!!anchorEl}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem onClick={handleLogout}>Log out</MenuItem>
                </Menu>
                {user?.role === "customer" && (
                  <IconButton
                    size="large"
                    color="inherit"
                    onClick={() => setCartOpen(true)}
                  >
                    <Badge badgeContent={totalQuantity || null} color="error">
                      <ShoppingCartIcon />
                    </Badge>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {subtotal.toFixed(2)}
                    </Typography>
                  </IconButton>
                )}
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Cart onClose={() => setCartOpen(false)} />
      </Drawer>
    </Box>
  );
}
