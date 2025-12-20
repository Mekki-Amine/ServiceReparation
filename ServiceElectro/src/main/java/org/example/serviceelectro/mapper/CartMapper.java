package org.example.serviceelectro.mapper;

import org.example.serviceelectro.dto.CartDTO;
import org.example.serviceelectro.dto.CartItemDTO;
import org.example.serviceelectro.entities.Cart;
import org.example.serviceelectro.entities.CartItem;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class CartMapper {

    public CartDTO toDTO(Cart cart) {
        if (cart == null) {
            return null;
        }

        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setCreatedAt(cart.getCreatedAt());
        dto.setUpdatedAt(cart.getUpdatedAt());

        if (cart.getUser() != null) {
            dto.setUserId(cart.getUser().getId());
        }

        if (cart.getItems() != null) {
            dto.setItems(cart.getItems().stream()
                    .map(this::toItemDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public CartItemDTO toItemDTO(CartItem cartItem) {
        if (cartItem == null) {
            return null;
        }

        CartItemDTO dto = new CartItemDTO();
        dto.setId(cartItem.getId());
        dto.setQuantity(cartItem.getQuantity());
        dto.setCreatedAt(cartItem.getCreatedAt());

        if (cartItem.getPublication() != null) {
            dto.setPublicationId(cartItem.getPublication().getId());
            dto.setPublicationTitle(cartItem.getPublication().getTitle());
            dto.setPublicationDescription(cartItem.getPublication().getDescription());
            dto.setPublicationPrice(cartItem.getPublication().getPrice());
            dto.setPublicationFileUrl(cartItem.getPublication().getFileUrl());
        }

        return dto;
    }
}

