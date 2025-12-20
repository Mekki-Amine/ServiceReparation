package org.example.serviceelectro.controler;

import org.example.serviceelectro.dto.CartDTO;
import org.example.serviceelectro.entities.Cart;
import org.example.serviceelectro.mapper.CartMapper;
import org.example.serviceelectro.servicees.ICart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CartController {

    @Autowired
    private ICart cartService;

    @Autowired
    private CartMapper cartMapper;

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CartDTO> getCart(@PathVariable Long userId) {
        try {
            Cart cart = cartService.getOrCreateCart(userId);
            return ResponseEntity.ok(cartMapper.toDTO(cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/user/{userId}/items")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CartDTO> addItemToCart(
            @PathVariable Long userId,
            @RequestBody AddItemRequest request) {
        try {
            cartService.addItemToCart(userId, request.getPublicationId(), request.getQuantity());
            Cart cart = cartService.getOrCreateCart(userId);
            return ResponseEntity.ok(cartMapper.toDTO(cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/user/{userId}/items/{cartItemId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> removeItemFromCart(
            @PathVariable Long userId,
            @PathVariable Long cartItemId) {
        try {
            if (userId == null || cartItemId == null) {
                return ResponseEntity.badRequest().body("L'ID utilisateur et l'ID de l'article sont requis");
            }
            
            cartService.removeItemFromCart(userId, cartItemId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // Log pour le débogage
            return ResponseEntity.status(500).body("Erreur lors de la suppression de l'article du panier: " + e.getMessage());
        }
    }

    @PutMapping("/user/{userId}/items/{cartItemId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CartDTO> updateItemQuantity(
            @PathVariable Long userId,
            @PathVariable Long cartItemId,
            @RequestBody UpdateQuantityRequest request) {
        try {
            cartService.updateItemQuantity(userId, cartItemId, request.getQuantity());
            Cart cart = cartService.getOrCreateCart(userId);
            return ResponseEntity.ok(cartMapper.toDTO(cart));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/user/{userId}/clear")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        try {
            cartService.clearCart(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}/count")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Long> getCartItemCount(@PathVariable Long userId) {
        try {
            Long count = cartService.getCartItemCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.ok(0L);
        }
    }

    // Classes internes pour les requêtes
    public static class AddItemRequest {
        private Long publicationId;
        private Integer quantity = 1;

        public Long getPublicationId() {
            return publicationId;
        }

        public void setPublicationId(Long publicationId) {
            this.publicationId = publicationId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }

    public static class UpdateQuantityRequest {
        private Integer quantity;

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}

