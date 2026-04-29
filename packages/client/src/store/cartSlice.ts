import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartApi, CartData, CartItem } from "../services/cart.service";
import { couponApi, CouponData, CouponValidateResult } from "../services/coupon.service";
import { AddToCartInput, ValidateCouponInput } from "@project1/shared";

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  discountAmount: number;
  appliedCoupon: CouponData | null;
  loading: boolean;
  couponLoading: boolean;
}

const calcTotals = (items: CartItem[]) => {
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  return { totalQuantity, subtotal };
};

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  subtotal: 0,
  discountAmount: 0,
  appliedCoupon: null,
  loading: false,
  couponLoading: false,
};

const setCart = (state: CartState, cart: CartData) => {
  state.items = cart.items;
  const { totalQuantity, subtotal } = calcTotals(cart.items);
  state.totalQuantity = totalQuantity;
  state.subtotal = subtotal;
};

export const fetchCart = createAsyncThunk("cart/fetch", async () => cartApi.getCart());
export const addToCart = createAsyncThunk("cart/add", async (input: AddToCartInput) =>
  cartApi.addToCart(input)
);
export const updateCartItem = createAsyncThunk("cart/update", async ({ productId, quantity }: { productId: string; quantity: number }) =>
  cartApi.updateCartItem(productId, { quantity })
);
export const removeFromCart = createAsyncThunk("cart/remove", async (productId: string) =>
  cartApi.removeFromCart(productId)
);
export const clearCart = createAsyncThunk("cart/clear", async () => cartApi.clearCart());

export const applyCoupon = createAsyncThunk<CouponValidateResult, ValidateCouponInput>(
  "cart/applyCoupon",
  async (input, { rejectWithValue }) => {
    try {
      return await couponApi.validateCoupon(input);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Invalid coupon code");
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    removeCoupon: (state) => {
      state.appliedCoupon = null;
      state.discountAmount = 0;
    }
  },
  extraReducers: (builder) => {
    const handlers = [fetchCart, addToCart, updateCartItem, removeFromCart, clearCart];

    handlers.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => { state.loading = true; })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading = false;
          setCart(state, action.payload);
        })
        .addCase(thunk.rejected, (state) => { state.loading = false; });
    });

    builder
      .addCase(applyCoupon.pending, (state) => { state.couponLoading = true; })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.couponLoading = false;
        state.appliedCoupon = action.payload.coupon;
        state.discountAmount = action.payload.discountAmount;
      })
      .addCase(applyCoupon.rejected, (state) => { state.couponLoading = false; });
  },
});

export const { removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;
