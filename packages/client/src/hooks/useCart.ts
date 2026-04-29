import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  fetchCart,
  applyCoupon,
  removeCoupon,
} from "../store/cartSlice";
import type { AddToCartInput, ValidateCouponInput } from "@project1/shared";

export const useCart = () => {
  const dispatch = useAppDispatch();
  const {
    items,
    subtotal,
    totalQuantity,
    discountAmount,
    appliedCoupon,
    loading,
    couponLoading,
  } = useAppSelector((s) => s.cart);

  return {
    cartItems: items,
    subtotal,
    totalQuantity,
    discountAmount,
    appliedCoupon,
    loading,
    couponLoading,
    // use useCallback to prevent infinite loops of re-renders in Header
    fetchCart: useCallback(() => dispatch(fetchCart()), [dispatch]),
    addToCart: useCallback(
      (input: AddToCartInput) => dispatch(addToCart(input)),
      [dispatch],
    ),
    updateCartItem: useCallback(
      (productId: string, quantity: number) =>
        dispatch(updateCartItem({ productId, quantity })),
      [dispatch],
    ),
    removeFromCart: useCallback(
      (productId: string) => dispatch(removeFromCart(productId)),
      [dispatch],
    ),
    clearCart: useCallback(() => dispatch(clearCart()), [dispatch]),
    applyCoupon: useCallback(
      (input: ValidateCouponInput) => dispatch(applyCoupon(input)).unwrap(),
      [dispatch],
    ),
    removeCoupon: useCallback(() => dispatch(removeCoupon()), [dispatch]),
  };
};
