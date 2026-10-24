// ===== START: HOME PAGE LOGIC =====
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { items } = await api.get('/products?sort=rating');
    await renderProductGrid('featured-grid', items.slice(0, 8));
  } catch (e) {
    console.error(e);
  }
});
// ===== END: HOME PAGE LOGIC =====
