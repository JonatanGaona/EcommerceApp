
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Error fetching products');
  return res.json();
}
