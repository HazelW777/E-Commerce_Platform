import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import ButtonGroup from "@mui/material/ButtonGroup";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import apiClient from "../../../lib/apiClient";
import { Product } from "../../../services/product.service";
import { useCart } from "../../../hooks/useCart";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { cartItems, addToCart, removeFromCart, updateCartItem } = useCart();

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const quantity = product
    ? (cartItems.find((i) => i.product._id === product._id)?.quantity ?? 0)
    : 0;

  const handleAdd = () => addToCart({ productId: product!._id, quantity: 1 });
  const handleIncrement = () => addToCart({ productId: product!._id, quantity: 1 });
  const handleDecrement = () => {
    if (quantity === 1) removeFromCart(product!._id);
    else updateCartItem(product!._id, quantity - 1);
  };

  React.useEffect(() => {
    if (!id) return;
    apiClient
      .get<{ success: boolean; data: Product }>(`/api/products/${id}`)
      .then(({ data }) => setProduct(data.data))
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
        <Alert severity="error">{error || "Product not found."}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/products")}>
          Back to Products
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
          flexShrink: 0,
        }}
      >
        <IconButton onClick={() => navigate("/products")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography component="h1" variant="h5">
          Product Details
        </Typography>
      </Box>

      <Card
        variant="outlined"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          overflow: "hidden",
        }}
      >
        {/* Left: image */}
        <Box
          component="img"
          src={product.imageUrl ?? ""}
          alt={product.name}
          sx={{
            width: { xs: "100%", md: "50%" },
            maxHeight: { xs: 300, md: "100%" },
            p: { xs: 2, md: 4 },
            objectFit: "cover",
            flexShrink: 0,
          }}
        />

        {/* Right: info */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 3, md: 4 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflow: "auto",
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography
              component="h1"
              variant="h5"
              sx={{ flex: 1, wordBreak: "break-word" }}
            >
              {product.name}
            </Typography>
            {product.stock === 0 && (
              <Chip
                label="Out of stock"
                color="error"
                size="small"
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>

          <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
            ${product.price.toFixed(2)}
          </Typography>

          {product.description && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {product.description}
            </Typography>
          )}

          <Box sx={{ mt: "auto", pt: 2, flexShrink: 0 }}>
            {quantity === 0 ? (
              <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={product.stock === 0}
                onClick={handleAdd}
              >
                Add to Cart
              </Button>
            ) : (
              <ButtonGroup variant="contained" size="large" fullWidth>
                <Button onClick={handleDecrement} sx={{ width: "25%" }}>
                  <RemoveIcon fontSize="small" />
                </Button>
                <Button disableRipple sx={{ pointerEvents: "none", width: "50%" }}>
                  {quantity}
                </Button>
                <Button
                  onClick={handleIncrement}
                  disabled={quantity >= product.stock}
                  sx={{ width: "25%" }}
                >
                  <AddIcon fontSize="small" />
                </Button>
              </ButtonGroup>
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
