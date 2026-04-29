import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ButtonGroup from "@mui/material/ButtonGroup";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../hooks/useCart";
import { productApi, Product } from "../../../services/product.service";

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart, updateCartItem } = useCart();

  const quantity = cartItems.find((i) => i.product._id === product._id)?.quantity ?? 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the click from bubbling up to the Card and triggering navigation.
    addToCart({ productId: product._id, quantity: 1 });
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ productId: product._id, quantity: 1 });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity === 1) {
      removeFromCart(product._id);
    } else {
      updateCartItem(product._id, quantity - 1);
    }
  };

  return (
    <Card
      sx={{ height: "100%", display: "flex", flexDirection: "column", cursor: "pointer" }}
      onClick={() => navigate(`/products/${product._id}`)}
    >
      <CardMedia
        component="img"
        height={140}
        image={product.imageUrl ?? ""}
        alt={product.name}
        sx={{ objectFit: "cover" }}
      />
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom noWrap>
          {product.name}
        </Typography>
        {product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </Typography>
        )}
        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
          ${product.price.toFixed(2)}
        </Typography>
      </CardContent>
      <CardActions>
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
      </CardActions>
    </Card>
  );
}

const PAGE_SIZE = 10;

export default function Products() {
  const [products, setProducts] = React.useState<Product[]>([]); 
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [error, setError] = React.useState("");
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const isFetching = React.useRef(false);

  const fetchPage = React.useCallback(
    async (pageNum: number, currentSearch: string, reset: boolean) => {
      if (isFetching.current) return;
      isFetching.current = true;
      setLoading(true);
      setError("");
      try {
        const res = await productApi.getProducts({
          page: pageNum,
          limit: PAGE_SIZE,
          search: currentSearch || undefined,
        });
        setProducts((prev) => (reset ? res.data : [...prev, ...res.data]));
        setHasMore(res.data.length === PAGE_SIZE);
      } catch {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [],
  );

  // Initial load and search change
  React.useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
    fetchPage(1, search, true);
  }, [search, fetchPage]);

  // Intersection observer — load next page when sentinel is visible
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching.current) {
          setPage((prev) => {
            const next = prev + 1;
            fetchPage(next, search, false);
            return next;
          });
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, search, fetchPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <Box sx={{ p: {xs: 2, md: 4} }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography component="h1" variant="h5" sx={{display: { xs: "none", md: "block" }}} >
          Products
        </Typography>
        <Box component="form" onSubmit={handleSearch} sx={{width: { xs: "100%", md: "auto" }}}>
          <TextField
          fullWidth
            size="small"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Box>

      {error && (
        <Typography color="error" sx={{ py: 4, textAlign: "center" }}>
          {error}
        </Typography>
      )}

      {!error && products.length === 0 && !loading && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
          No products found.
        </Typography>
      )}

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={product._id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      {/* Sentinel + loading indicator */}
      <Box
        ref={sentinelRef}
        sx={{ display: "flex", justifyContent: "center", py: 4 }}
      >
        {loading && <CircularProgress size={28} />}
      </Box>
    </Box>
  );
}
