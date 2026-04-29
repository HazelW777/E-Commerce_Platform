import * as React from "react";
import { GridPaginationModel } from "@mui/x-data-grid";
import { productApi, Product } from "../services/product.service";

export const useSellerProductList = () => {
  const [rows, setRows] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null);

  const fetchProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await productApi.getMyProducts({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      });
      setRows(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [paginationModel]);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    await productApi.deleteProduct(deleteTargetId);
    setDeleteTargetId(null);
    fetchProducts();
  };

  return {
    rows,
    total,
    loading,
    paginationModel,
    setPaginationModel,
    deleteTargetId,
    setDeleteTargetId,
    handleDeleteConfirm,
  };
};
