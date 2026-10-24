// ===== START: PRODUCTS PAGE LOGIC =====
function getParams() { return new URLSearchParams(window.location.search); }

function buildQuery() {
  const params = new URLSearchParams();
  const q = getParams().get('q');
  if (q) params.set('q', q);

  const category = document.querySelector('input[name="category"]:checked')?.value;
  if (category) params.set('category', category);

  const brand = document.querySelector('input[name="brand"]:checked')?.value;
  if (brand) params.set('brand', brand);

  const size = document.querySelector('.size-chip.selected')?.dataset.size;
  if (size) params.set('size', size);

  const min = document.getElementById('min-price').value;
  const max = document.getElementById('max-price').value;
  if (min) params.set('minPrice', min);
  if (max) params.set('maxPrice', max);

  const sort = document.getElementById('sort-select').value;
  if (sort) params.set('sort', sort);

  return params;
}

async function loadProducts(paramsOverride) {
  const params = paramsOverride || buildQuery();
  const { items, total, facets } = await api.get('/products?' + params.toString());

  document.getElementById('results-count').textContent = `${total} product${total === 1 ? '' : 's'}`;
  const q = params.get('q');
  const category = params.get('category');
  document.getElementById('page-title').textContent = q ? `Results for "${q}"` : category ? `${category[0].toUpperCase()}${category.slice(1)}'s Shoes` : 'All Shoes';

  await renderProductGrid('product-grid', items);
  renderFacets(facets, params);
}

function renderFacets(facets, params) {
  const brandBox = document.getElementById('brand-filters');
  if (!brandBox.dataset.built) {
    brandBox.innerHTML = facets.brands.map(b => `
      <div class="filter-option">
        <input type="radio" name="brand" value="${b}" id="brand-${b}">
        <label for="brand-${b}">${b}</label>
      </div>`).join('') + `<div class="filter-option"><input type="radio" name="brand" value="" id="brand-any" checked><label for="brand-any">Any</label></div>`;
    brandBox.dataset.built = '1';
    brandBox.querySelectorAll('input[name="brand"]').forEach(r => r.addEventListener('change', () => loadProducts()));
  }
  const sizeBox = document.getElementById('size-filters');
  if (!sizeBox.dataset.built) {
    sizeBox.innerHTML = facets.sizes.map(s => `<button type="button" class="size-chip" data-size="${s}">${s}</button>`).join('');
    sizeBox.dataset.built = '1';
    sizeBox.querySelectorAll('.size-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const wasSelected = chip.classList.contains('selected');
        sizeBox.querySelectorAll('.size-chip').forEach(c => c.classList.remove('selected'));
        if (!wasSelected) chip.classList.add('selected');
        loadProducts();
      });
    });
  }

  // Re-apply current selection state from URL params so filters persist across reloads
  const category = params.get('category');
  document.querySelectorAll('input[name="category"]').forEach(r => r.checked = r.value === (category || ''));
}

document.addEventListener('DOMContentLoaded', () => {
  const initial = getParams();
  if (initial.get('category')) {
    document.querySelectorAll('input[name="category"]').forEach(r => r.checked = r.value === initial.get('category'));
  }

  loadProducts(initial);

  document.getElementById('apply-filters').addEventListener('click', () => loadProducts());
  document.getElementById('sort-select').addEventListener('change', () => loadProducts());
  document.querySelectorAll('input[name="category"]').forEach(r => r.addEventListener('change', () => loadProducts()));
  document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('min-price').value = '';
    document.getElementById('max-price').value = '';
    document.querySelectorAll('input[name="category"]')[0].checked = true;
    document.querySelectorAll('input[name="brand"]').forEach(r => r.checked = r.value === '');
    document.querySelectorAll('.size-chip').forEach(c => c.classList.remove('selected'));
    window.history.replaceState({}, '', 'products.html');
    loadProducts(new URLSearchParams());
  });
});
// ===== END: PRODUCTS PAGE LOGIC =====
