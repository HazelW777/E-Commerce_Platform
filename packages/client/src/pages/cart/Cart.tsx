import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { useCart } from "../../hooks/useCart";
import { useAppDispatch } from "../../store";
import { clearCart } from "../../store/cartSlice";
import apiClient from "../../lib/apiClient";
import Divider from "@mui/material/Divider";

function CartItem({ item }: { item: any }) {
  const { addToCart, updateCartItem, removeFromCart } = useCart();
  const quantity = item.quantity;
  const product = item.product;

  const handleIncrement = () => {
    addToCart({ productId: product._id, quantity: 1 });
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateCartItem(product._id, quantity - 1);
    }
  };

  const handleRemove = () => {
    removeFromCart(product._id);
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        py: 1,
      }}
    >
      {/* Left: Image */}
      <Box
        component="img"
        src={product.imageUrl}
        alt={product.name}
        sx={{
          width: 80,
          height: 80,
          objectFit: "cover",
          borderRadius: 2,
          flexShrink: 0,
        }}
      />

      {/* Right: Details */}
      <Box
        sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}
      >
        {/* Top: Name and Unit Price */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="body2"
            noWrap // prevent text overflow
            sx={{
              mr: 2,
              flex: 1,
              minWidth: 0, // prevent text overflow
            }}
          >
            {product.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "primary.main", fontWeight: 700, flexShrink: 0 }}
          >
            ${product.price.toFixed(2)}
          </Typography>
        </Box>

        {/* Bottom: Quantity and Remove */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "auto",
          }}
        >
          <ButtonGroup size="small" variant="outlined" sx={{ height: 26 }}>
            <Button
              onClick={handleDecrement}
              disabled={quantity <= 1}
              sx={{ px: 1, minWidth: 28, py: 0 }}
            >
              <RemoveIcon sx={{ fontSize: 16 }} />
            </Button>
            <Button
              sx={{
                pointerEvents: "none",
                color: "text.primary",
                px: 1,
                minWidth: 28,
                py: 0,
                fontSize: "0.85rem",
              }}
            >
              {quantity}
            </Button>
            <Button
              onClick={handleIncrement}
              disabled={quantity >= product.stock}
              sx={{ px: 1, minWidth: 28, py: 0 }}
            >
              <AddIcon sx={{ fontSize: 16 }} />
            </Button>
          </ButtonGroup>

          <Button
            size="small"
            onClick={handleRemove}
            sx={{
              color: "text.secondary",
            }}
          >
            Remove
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default function Cart({ onClose }: { onClose?: () => void }) {
  const {
    cartItems,
    subtotal,
    discountAmount,
    appliedCoupon,
    couponLoading,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const [discountCode, setDiscountCode] = React.useState("");
  const [couponError, setCouponError] = React.useState<string | null>(null);

  const handleApplyCoupon = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!discountCode.trim()) return;
    try {
      setCouponError(null);
      await applyCoupon({ code: discountCode.trim(), subtotal });
      setDiscountCode("");
    } catch (error: any) {
      setCouponError(error);
    }
  };

  const dispatch = useAppDispatch();
  const [checkoutErrors, setCheckoutErrors] = React.useState<string[]>([]);
  const [checkoutLoading, setCheckoutLoading] = React.useState(false);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      await apiClient.post("/api/cart/checkout", {
        couponCode: appliedCoupon?.code,
      });
      dispatch(clearCart());
      if (onClose) onClose();
      window.location.reload();
    } catch (err: any) {
      const errors: string[] = err?.response?.data?.errors ?? [
        err?.response?.data?.message ?? "Checkout failed",
      ];
      setCheckoutErrors(errors);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const TAX_RATE = 0.0625;

  return (
    <>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: { xs: "100vw", sm: 400 },
        bgcolor: "background.paper",
      }}
    >
      {/* 1. Header */}
      <Box
        sx={{
          display: "flex",
          bgcolor: "primary.main",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            component="h1"
            variant="h5"
            sx={{ color: "primary.contrastText", fontWeight: 700 }}
          >
            Cart
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "primary.contrastText" }}
          >{`(${cartItems.length})`}</Typography>
        </Box>
        {onClose && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon sx={{ color: "primary.contrastText" }} />
          </IconButton>
        )}
      </Box>

      {/* 2. Content: auto fill*/}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto", // inner scroll
          px: 3,
          py: 2,
        }}
      >
        {cartItems.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.5,
            }}
          >
            <Typography variant="body1">
              Your cart is currently empty.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              {cartItems.map((item) => (
                <CartItem key={item.product._id} item={item} />
              ))}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography component="label" variant="body2">
                Discount Code
              </Typography>
              {appliedCoupon ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "text.primary", fontWeight: 500 }}
                  >
                    {appliedCoupon.code}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => removeCoupon()}
                    color="inherit"
                  >
                    <CloseIcon
                      fontSize="small"
                      sx={{ color: "secondary.light" }}
                    />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box
                    component="form"
                    onSubmit={handleApplyCoupon}
                    sx={{ display: "flex", width: "100%", gap: 1 }}
                  >
                    <TextField
                      placeholder="Enter your discount code here"
                      variant="outlined"
                      size="small"
                      sx={{ flex: 1 }}
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value);
                        if (couponError) setCouponError(null);
                      }}
                      disabled={couponLoading}
                      error={!!couponError}
                    />
                    <Button
                      variant="contained"
                      disableElevation
                      size="small"
                      type="submit"
                      disabled={!discountCode.trim() || couponLoading}
                      sx={{ borderRadius: 2 }}
                    >
                      {couponLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </Box>
                  {couponError && (
                    <Typography variant="caption" color="error">
                      {couponError}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            <Divider />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text">
                  Subtotal
                </Typography>
                <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text">
                  Tax
                </Typography>
                <Typography variant="body2">
                  ${(subtotal * TAX_RATE).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text">
                  Discount
                </Typography>
                <Typography variant="body2" color="text">
                  -${discountAmount.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Estimated Total</Typography>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                >
                  $
                  {Math.max(
                    0,
                    subtotal * (1 + TAX_RATE) - discountAmount,
                  ).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* 3. Footer: fixed bottom */}
      <Box
        sx={{
          px: 3,
          py: 2,
          flexShrink: 0,
        }}
      >
        <Button
          variant="contained"
          fullWidth
          disableElevation
          size="large"
          disabled={cartItems.length === 0 || checkoutLoading}
          onClick={handleCheckout}
          sx={{ py: 1.5, borderRadius: 2, fontSize: "1rem", fontWeight: 700 }}
        >
          {checkoutLoading ? <CircularProgress size={22} color="inherit" /> : "Checkout"}
        </Button>
      </Box>
    </Box>

    <Dialog open={checkoutErrors.length > 0} onClose={() => setCheckoutErrors([])}>
      <DialogTitle>Unable to checkout</DialogTitle>
      <DialogContent>
        <List disablePadding>
          {checkoutErrors.map((msg, i) => (
            <ListItem key={i} sx={{ px: 0, py: 0.5 }}>
              <Typography variant="body2">{msg}</Typography>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCheckoutErrors([])}>Got it</Button>
      </DialogActions>
    </Dialog>
    </>
  );
}
