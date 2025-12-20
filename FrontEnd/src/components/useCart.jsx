import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export const useCart = () => {
  const { user } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0);

  const fetchCartItemCount = async () => {
    if (!user?.userId) {
      setCartItemCount(0);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`/api/cart/user/${user.userId}/count`, { headers });
      setCartItemCount(response.data || 0);
    } catch (err) {
      console.error('Error fetching cart count:', err);
      setCartItemCount(0);
    }
  };

  useEffect(() => {
    fetchCartItemCount();
    // Rafraîchir toutes les 5 secondes
    const interval = setInterval(fetchCartItemCount, 5000);
    return () => clearInterval(interval);
  }, [user?.userId]);

  return { cartItemCount, refreshCart: fetchCartItemCount };
};

