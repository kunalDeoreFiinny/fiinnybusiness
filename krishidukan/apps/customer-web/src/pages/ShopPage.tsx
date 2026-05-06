// Legacy route /shop/:id — redirects to /retailer/:id
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export function ShopPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useEffect(() => {
    navigate(id ? `/retailer/${id}` : '/', { replace: true });
  }, [id, navigate]);
  return null;
}
