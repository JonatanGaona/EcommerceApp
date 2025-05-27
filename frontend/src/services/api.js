
const API_BASE = 'http://localhost:4000';

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Error fetching products');
  return res.json();
}
