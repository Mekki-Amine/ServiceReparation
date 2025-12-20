package org.example.serviceelectro.servicees;

import org.example.serviceelectro.entities.Cart;
import org.example.serviceelectro.entities.CartItem;

public interface ICart {
    Cart getOrCreateCart(Long userId);
    CartItem addItemToCart(Long userId, Long publicationId, Integer quantity);
    void removeItemFromCart(Long userId, Long cartItemId);
    void updateItemQuantity(Long userId, Long cartItemId, Integer quantity);
    void clearCart(Long userId);
    Long getCartItemCount(Long userId);
}

