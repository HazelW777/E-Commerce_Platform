import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, updateProductSchema, CreateProductInput, UpdateProductInput } from "@project1/shared";
import apiClient from "../../../lib/apiClient";
import { Product } from "../../../services/product.service";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: { maxWidth: "600px" },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
}));

type FormInput = CreateProductInput | UpdateProductInput;

export default function ProductManagement() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(isEdit ? updateProductSchema : createProductSchema) as any,
    mode: "onBlur",
    defaultValues: { stock: 0 },
  });

  const [fetchLoading, setFetchLoading] = React.useState(isEdit);
  const [fetchError, setFetchError] = React.useState("");
  const [existingImageUrl, setExistingImageUrl] = React.useState<string | null>(null);
  const [image, setImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState("");
  const [serverError, setServerError] = React.useState("");

  React.useEffect(() => {
    if (!isEdit) return;
    apiClient
      .get<{ success: boolean; data: Product }>(`/api/products/${id}`)
      .then(({ data }) => {
        const p = data.data;
        reset({ name: p.name, price: p.price, stock: p.stock, description: p.description ?? "", status: p.status });
        setExistingImageUrl(p.imageUrl ?? null);
      })
      .catch(() => setFetchError("Product not found"))
      .finally(() => setFetchLoading(false));
  }, [id, isEdit, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
    if (file) setImageError("");
  };

  const onSubmit = async (data: FormInput) => {
    if (!isEdit && !image) {
      setImageError("Product image is required");
      return;
    }
    setServerError("");
    try {
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.price !== undefined) formData.append("price", String(data.price));
      if (data.stock !== undefined) formData.append("stock", String(data.stock));
      if (data.description) formData.append("description", data.description);
      if ("status" in data && data.status) formData.append("status", data.status);
      if (image) formData.append("image", image);

      if (isEdit) {
        await apiClient.put(`/api/products/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await apiClient.post("/api/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      navigate("/my-products");
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? `Failed to ${isEdit ? "update" : "create"} product`);
    }
  };

  if (fetchLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Stack direction="column" sx={{ justifyContent: "center", flex: 1, p: 2 }}>
        <Card variant="outlined">
          <Alert severity="error">{fetchError}</Alert>
          <Button variant="outlined" onClick={() => navigate("/my-products")}>
            Back to My Products
          </Button>
        </Card>
      </Stack>
    );
  }

  const previewSrc = imagePreview ?? existingImageUrl;

  return (
    <Stack direction="column" sx={{ justifyContent: "center", flex: 1, p: 2 }}>
      <Card variant="outlined">
        <Typography component="h1" variant="h5">
          {isEdit ? "Edit Product" : "Create New Product"}
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <FormControl>
            <FormLabel>Name {!isEdit && "*"}</FormLabel>
            <TextField
              {...register("name")}
              fullWidth
              placeholder="Product name"
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </FormControl>

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Price ($) {!isEdit && "*"}</FormLabel>
              <TextField
                {...register("price")}
                type="number"
                slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                placeholder="0.00"
                error={!!errors.price}
                helperText={errors.price?.message}
              />
            </FormControl>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Stock {!isEdit && "*"}</FormLabel>
              <TextField
                {...register("stock")}
                type="number"
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
                placeholder="0"
                error={!!errors.stock}
                helperText={errors.stock?.message}
              />
            </FormControl>
          </Box>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <TextField
              {...register("description")}
              fullWidth
              multiline
              rows={3}
              placeholder="Product description (optional)"
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </FormControl>

          {isEdit && (
            <FormControl error={!!(errors as any).status}>
              <FormLabel>Status</FormLabel>
              <Controller
                name={"status" as any}
                control={control}
                render={({ field }) => (
                  <Select {...field}>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                )}
              />
              {(errors as any).status && (
                <FormHelperText>{(errors as any).status.message}</FormHelperText>
              )}
            </FormControl>
          )}

          <FormControl>
            <FormLabel>Image {!isEdit && "*"}</FormLabel>
            <Button variant="outlined" component="label" sx={{ alignSelf: "flex-start" }}>
              {existingImageUrl && !image ? "Replace Image" : "Upload Image"}
              <input type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
            </Button>
            {imageError && <FormHelperText error>{imageError}</FormHelperText>}
            {previewSrc && (
              <Box
                component="img"
                src={previewSrc}
                alt="preview"
                sx={{ mt: 1, maxHeight: 180, maxWidth: 260, borderRadius: 1, objectFit: "cover" }}
              />
            )}
          </FormControl>

          {serverError && (
            <Alert severity="error" onClose={() => setServerError("")}>
              {serverError}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="outlined" fullWidth onClick={() => navigate("/my-products")} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" fullWidth disabled={isSubmitting}>
              {isSubmitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Product")}
            </Button>
          </Box>
        </Box>
      </Card>
    </Stack>
  );
}
