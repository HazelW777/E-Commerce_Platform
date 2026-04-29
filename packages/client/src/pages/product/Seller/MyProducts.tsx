import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { productApi, Product } from "../../../services/product.service";
import { useSellerProductList } from "../../../hooks/useSellerProductList";

// ProductsTable component
interface ProductsTableProps {
  rows: Product[];
  total: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function ProductsTable({
  rows,
  total,
  loading,
  paginationModel,
  onPaginationModelChange,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  const columns: GridColDef<Product>[] = [
    {
      field: "imageUrl",
      headerName: "Image",
      width: 160,
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <img
            src={params.value}
            alt="product"
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        ) : (
          <Box
            sx={{ width: 56, height: 56, bgcolor: "grey.200", borderRadius: 1 }}
          />
        ),
    },
    { field: "name", headerName: "Name", flex: 1, minWidth: 120 },
    {
      field: "description",
      headerName: "Description",
      flex: 1.5,
      minWidth: 150,
    },
    { field: "price", headerName: "Price ($)", type: "number", width: 110 },
    { field: "stock", headerName: "Stock", type: "number", width: 90 },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      type: "singleSelect",
      valueOptions: ["active", "inactive"],
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(params.row._id)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(params.row._id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(row) => row._id}
      rowCount={total}
      loading={loading}
      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      pageSizeOptions={[10, 25, 50]}
      rowHeight={70}
      disableRowSelectionOnClick
      sx={{ bgcolor: "background.paper" }}
    />
  );
}

// MyProducts page
export default function MyProducts() {
  const navigate = useNavigate();
  const {
    rows,
    total,
    loading,
    paginationModel,
    setPaginationModel,
    deleteTargetId,
    setDeleteTargetId,
    handleDeleteConfirm,
  } = useSellerProductList();

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography component="h1" variant="h5">
          My Products
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/my-products/create")}
        >
          Create New Product
        </Button>
      </Box>

      <ProductsTable
        rows={rows}
        total={total}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onEdit={(id) => navigate(`/my-products/${id}/edit`)}
        onDelete={(id) => setDeleteTargetId(id)}
      />

      <Dialog open={!!deleteTargetId} onClose={() => setDeleteTargetId(null)}>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This product will be permanently removed and will no longer appear
            in the store.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTargetId(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
