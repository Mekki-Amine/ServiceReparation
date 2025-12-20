package org.example.serviceelectro.repository;

import org.example.serviceelectro.entities.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCart_Id(Long cartId);
    
    Optional<CartItem> findByCart_IdAndPublication_Id(Long cartId, Long publicationId);
    
    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.cart.user.id = :userId")
    Long countItemsByUserId(@Param("userId") Long userId);
}

