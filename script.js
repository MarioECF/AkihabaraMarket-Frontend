const API_URL = 'https://akihabara-backend.onrender.com/productos';

const form = document.getElementById('producto-form');
const tabla = document.getElementById('tabla-productos');

// Bootstrap validation
(() => {
  'use strict';
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      event.stopPropagation();
      form.classList.add('was-validated');
    } else {
      await enviarProducto(); // ahora detecta si es nuevo o edición
    }
  }, false);
})();

// Envía producto: POST si nuevo, PUT si edición
async function enviarProducto() {
  const producto = {
    nombre: document.getElementById('nombre').value,
    categoria: document.getElementById('categoria').value,
    precio: parseFloat(document.getElementById('precio').value),
    stock: parseInt(document.getElementById('stock').value)
  };

  const id = form.dataset.id;
  const url = id ? `${API_URL}/${id}` : API_URL;
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto)
    });

    if (res.ok) {
      alert(id ? '✅ Producto actualizado' : '✅ Producto agregado');
      form.reset();
      form.classList.remove('was-validated');
      delete form.dataset.id;
      form.querySelector('button[type="submit"]').textContent = "Agregar producto";
      cargarProductos();
    } else {
      alert('❌ Error al guardar el producto');
    }
  } catch (err) {
    console.error(err);
  }
}

async function cargarProductos() {
  try {
    const res = await fetch(API_URL);
    const productos = await res.json();

    tabla.innerHTML = '';
    productos.forEach(p => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>${p.categoria}</td>
        <td>${p.precio}€</td>
        <td>${p.stock}</td>
        <td>
          <button class="btn btn-sm btn-secondary me-1" onclick="cargarFormulario(${p.id})">📝</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${p.id})">🗑️</button>
        </td>
      `;
      tabla.appendChild(row);
    });
  } catch (err) {
    console.error('Error al cargar productos:', err);
  }
}

async function eliminarProducto(id) {
  if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      alert('🗑️ Producto eliminado');
      cargarProductos();
    } else {
      alert('❌ No se pudo eliminar el producto');
    }
  } catch (err) {
    console.error(err);
  }
}

// Carga un producto al formulario para editar
async function cargarFormulario(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const p = await res.json();

    document.getElementById('nombre').value = p.nombre;
    document.getElementById('categoria').value = p.categoria;
    document.getElementById('precio').value = p.precio;
    document.getElementById('stock').value = p.stock;

    form.dataset.id = p.id;
    form.querySelector('button[type="submit"]').textContent = "Actualizar producto";
    form.classList.remove('was-validated');
  } catch (err) {
    console.error('Error al cargar producto:', err);
  }
}

// Inicializar
cargarProductos();
