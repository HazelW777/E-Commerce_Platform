import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Header from "./pages/Header";
import Footer from "./pages/Footer";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ResetPassword from "./pages/auth/ResetPassword";
import Products from "./pages/product/Customer/Products";
import ProductDetails from "./pages/product/Customer/ProductDetails";
import MyProducts from "./pages/product/Seller/MyProducts";
import ProductManagement from "./pages/product/Seller/ProductManagement";
import { useAppDispatch, useAppSelector } from "./store";
import { initializeAuth } from "./store/authSlice";
import { GlobalErrorScreen } from "./components/GlobalErrorScreen";

function LoadingScreen() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function RootRedirect() {
  const { user, loading } = useAppSelector((s) => s.auth);
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/signin" replace />;
  if (user.role === "seller") return <Navigate to="/my-products" replace />;
  return <Navigate to="/products" replace />;
}

function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Array<"customer" | "seller" | "admin">;
}) {
  const { user, loading } = useAppSelector((s) => s.auth);
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/signin" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/products"
        element={
          <ProtectedRoute roles={["customer"]}>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/:id"
        element={
          <ProtectedRoute roles={["customer"]}>
            <ProductDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-products"
        element={
          <ProtectedRoute roles={["seller"]}>
            <MyProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-products/create"
        element={
          <ProtectedRoute roles={["seller"]}>
            <ProductManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-products/:id/edit"
        element={
          <ProtectedRoute roles={["seller"]}>
            <ProductManagement />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  const { loading } = useAppSelector((s) => s.auth);

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <Header />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          pt: { xs: "56px", sm: "64px" },
        }}
      >
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AppRoutes />
        </Box>
        <Footer />
        <GlobalErrorScreen />
      </Box>
    </Router>
  );
}

export default App;
