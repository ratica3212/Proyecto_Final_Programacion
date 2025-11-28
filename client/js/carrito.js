// ===== Utils =====
function money(n) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Convierte "200.000,00", "$100,000.00", etc. a número
function toNumber(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val
      .replace(/[^\d,.\-]/g, '') // quita $, espacios, etc.
      .replace(/\./g, '')        // quita miles con punto
      .replace(',', '.');        // coma decimal -> punto
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * Normaliza montos que pueden venir en CENTAVOS (×100).
 * Si termina en ",00" o ".00" y el valor es >= 1,000,000, se divide entre 100.
 */
function normalizeAmount(val) {
  const raw = String(val ?? '');
  let n = toNumber(val);
  const looksLikeRoundDecimals = /,00$/.test(raw) || /\.00$/.test(raw);
  if (looksLikeRoundDecimals && n >= 1_000_000) n = n / 100;
  return n;
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

/**
 * Resuelve la URL de imagen probando varios campos y formatos:
 * - Soporta: imagen, image, url_imagen, imagen_url, foto, ruta_imagen, rutaImagen.
 * - Acepta: data URI, URL absoluta, ruta que ya empieza con "/".
 * - Si viene solo el filename => intenta "/uploads/<file>".
 * - Fallback => "../img/placeholder.png" (asegúrate de tener ese archivo).
 */
function resolveImage(item) {
  let raw =
    item?.imagen_url ?? item?.image ?? item?.url_imagen ?? item?.imagen ??
    item?.foto ?? item?.ruta_imagen ?? item?.rutaImagen ?? '';

  if (!raw) return '../img/placeholder.png';
  raw = String(raw).trim();

  // data URI
  if (raw.startsWith('data:')) return raw;

  // URL absoluta
  if (/^https?:\/\//i.test(raw)) return raw;

  // Ya es ruta absoluta del servidor
  if (raw.startsWith('/')) return raw;

  // Rutas relativas conocidas
  if (raw.startsWith('uploads/') || raw.includes('/uploads/')) {
    return '/' + raw.replace(/^\/+/, '');
  }
  if (raw.startsWith('img/') || raw.includes('/img/')) {
    return '/' + raw.replace(/^\/+/, '');
  }

  // Si es solo un filename con extensión, lo servimos desde /uploads
  if (/\.(png|jpe?g|webp|gif|svg)$/i.test(raw)) {
    return `/uploads/${raw}`;
  }

  return '../img/placeholder.png';
}

// ===== DOM =====
const elItems = document.getElementById('cart-items');
const elEmpty = document.getElementById('cart-empty');
const elSubtotal = document.getElementById('subtotal');
const elShipping = document.getElementById('shipping');
const elTotal = document.getElementById('total');
const btnRealizar = document.getElementById('realizarPedidoBtn');

let CART = { carrito: [], total: 0 };
const SHIPPING_FEE = 10000; // domicilio fijo

// ===== API =====
function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function apiGet(url) {
  const res = await fetch(url, { headers: { ...authHeader() } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body || {})
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.mensaje || 'Error de servidor');
  return data;
}

async function apiDelete(url) {
  const res = await fetch(url, { method: 'DELETE', headers: { ...authHeader() } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.mensaje || 'Error de servidor');
  return data;
}

// ===== Carga & render =====
async function cargarCarrito() {
  try {
    const data = await apiGet('/api/carrito');
    CART = data || { carrito: [], total: 0 };
    renderCarrito();
  } catch (e) {
    CART = { carrito: [], total: 0 };
    renderCarrito();
    console.error(e);
  }
}

function renderCarrito() {
  const items = Array.isArray(CART.carrito) ? CART.carrito : [];

  if (items.length === 0) {
    elItems.innerHTML = '';
    btnRealizar.hidden = true; 
    elEmpty.hidden = false;
    btnRealizar.style.display = 'none';
    elSubtotal.textContent = '$0.00';
    elShipping.textContent = '$0.00';
    elTotal.textContent = '$0.00';
    return;
  }
  // si SÍ hay ítems
  btnRealizar.hidden = false;    
  elEmpty.hidden = true;
  btnRealizar.style.display = '';

  elItems.innerHTML = items.map(item => {
    const nombre = item.nombre ?? item.titulo ?? 'Producto';
    const precio = normalizeAmount(item.precio);
    const cantidad = Number(item.cantidad || 0);
    const rowSubtotal = normalizeAmount(item.subtotal) || (precio * cantidad);
    const imgSrc = resolveImage(item);

    return `
      <div class="item-row" data-item-id="${item.id}" data-product-id="${item.producto_id}">
        <div class="item-media">
          <img class="item-thumb" src="${imgSrc}" alt="${escapeHtml(nombre)}"
               onerror="this.src='../img/placeholder.png';"/>
        </div>

        <div class="item-info">
          <div class="item-title">${escapeHtml(nombre)}</div>
          <div class="item-price">$${money(precio)}</div>
        </div>

        <div class="item-qty">
          <button class="qty-btn" data-action="dec" aria-label="Disminuir">−</button>
          <input class="qty-input" type="text" value="${cantidad}" inputmode="numeric" aria-label="Cantidad" readonly />
          <button class="qty-btn" data-action="inc" aria-label="Aumentar">+</button>
        </div>

        <div class="item-subtotal">$${money(rowSubtotal)}</div>

        <button class="item-remove" title="Eliminar" aria-label="Eliminar">
          <svg class="icon-trash" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              width="20" height="20" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
            <path d="M10 11v6"></path>
            <path d="M14 11v6"></path>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
          </svg>
        </button>

      </div>
    `;
  }).join('');

  // Totales (normalizados)
  const subtotal = items.reduce((acc, it) => {
    const precio = normalizeAmount(it.precio);
    const cant = Number(it.cantidad || 0);
    const sub = normalizeAmount(it.subtotal) || (precio * cant);
    return acc + sub;
  }, 0);

  const shipping = items.length > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  elSubtotal.textContent = `$${money(subtotal)}`;
  elShipping.textContent = `$${money(shipping)}`;
  elTotal.textContent = `$${money(total)}`;

  wireItemEvents();
}

function wireItemEvents() {
  // + / −
  elItems.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const row = e.currentTarget.closest('.item-row');
      const carritoItemId = row.getAttribute('data-item-id');
      const productoId = row.getAttribute('data-product-id');
      const input = row.querySelector('.qty-input');
      const currentQty = Number(input.value);

      const action = e.currentTarget.dataset.action;
      try {
        if (action === 'inc') {
          await apiPost('/api/carrito/agregar', { producto_id: Number(productoId), cantidad: 1 });
        } else {
          if (currentQty <= 1) {
            await apiDelete(`/api/carrito/item/${carritoItemId}`);
          } else {
            await apiPost('/api/carrito/agregar', { producto_id: Number(productoId), cantidad: -1 });
          }
        }
        await cargarCarrito();
      } catch (err) {
        console.error(err);
        alert('No se pudo actualizar la cantidad.');
      }
    });
  });

  // Eliminar
  elItems.querySelectorAll('.item-remove').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const row = e.currentTarget.closest('.item-row');
      const carritoItemId = row.getAttribute('data-item-id');
      try {
        await apiDelete(`/api/carrito/item/${carritoItemId}`);
        await cargarCarrito();
      } catch (err) {
        console.error(err);
        alert('No se pudo eliminar el producto.');
      }
    });
  });
}

// ===== Crear pedido (pago en Mis pedidos) =====
async function realizarPedido() {
  const direccion = prompt('📦 Ingresa tu dirección de entrega:');
  if (!direccion || !direccion.trim()) return;

  try {
    const data = await apiPost('/api/pedidos', { direccion: direccion.trim() });
    alert(data.mensaje || 'Pedido creado.');
    window.location.href = '/html/misPedidos.html';
  } catch (err) {
    const msg = ('' + err.message) || 'Error al crear el pedido';
    await cargarCarrito();
    alert(msg);
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  cargarCarrito();
  btnRealizar.addEventListener('click', realizarPedido);
});
