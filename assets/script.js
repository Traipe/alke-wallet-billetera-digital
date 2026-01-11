
// Alke Wallet - script.js

// Obtener usuario activo
const activeUser = localStorage.getItem('alke_active_user');

// Guardar y obtener saldo del usuario activo
let saldo = activeUser ? Number(localStorage.getItem(`${activeUser}_saldo`)) || 0 : 0;

// Guardar y obtener transacciones del usuario activo
let transacciones = activeUser && localStorage.getItem(`${activeUser}_tx`)
  ? localStorage.getItem(`${activeUser}_tx`).split(';')
  : [];

// ===============================
// REGISTRO DE USUARIO
// ===============================
$(function () {
  const registerForm = $('#registerForm');
  if (registerForm.length) {
    registerForm.on('submit', function (e) {
      e.preventDefault();
      const email = $('#regEmail').val();
      const pass = $('#regPassword').val();

      // Guardar usuario en localStorage
      localStorage.setItem(`${email}_email`, email);
      localStorage.setItem(`${email}_pass`, pass);

      // Inicializar saldo y transacciones para este usuario
      localStorage.setItem(`${email}_saldo`, 0);
      localStorage.setItem(`${email}_tx`, '');

      // Mensaje de éxito
      const contenedor = document.querySelector('main');
      if (contenedor) {
        contenedor.innerHTML = `
          <section class="card shadow-sm p-4 text-center">
            <h2 class="text-success">✅ Cuenta creada con éxito!</h2>
            <p>Serás redirigido al login en 2 segundos...</p>
          </section>
        `;
      }

      setTimeout(() => {
        window.location.href = './login.html';
      }, 2000);
    });
  }
});

// ===============================
// LOGIN DE USUARIO
// ===============================
 const loginForm = $('#loginForm');
  
  if (loginForm.length) { // Verifica si el formulario existe en la página
    loginForm.on('submit', function (e) {
      e.preventDefault(); // Evita recarga de página
      
      // Obtiene valores del formulario
      const email = document.getElementById('email').value;
      const pass = document.getElementById('password').value;
      
      // Recupera credenciales guardadas en localStorage
      // NOTA: Formato vulnerable - las claves son predecibles para entrega de la tarea de módulo
      const savedEmail = localStorage.getItem(`${email}_email`);
      const savedPass = localStorage.getItem(`${email}_pass`);
      
      // Validación de credenciales
      if (email === savedEmail && pass === savedPass) {
        alert('Login exitoso ✅');
        localStorage.setItem('alke_active_user', email); // Sesión activa
        window.location.href = '../index.html'; // Redirección
      } else {
        alert('Credenciales inválidas ❌. Regístrate si no tienes cuenta.');
      }
    });
  }


// ===============================
// DEPÓSITO DE DINERO
// ===============================
$(function () {
  const depositForm = $('#depositForm');
  const saldoEl = $('#saldoActual');
  
  if (saldoEl.length) saldoEl.text(`$${saldo}`); // Muestra saldo actual
  
  if (depositForm.length) {
    depositForm.on('submit', function (e) {
      e.preventDefault();
      const monto = Number($('#montoDeposito').val());
      
      if (!monto || monto <= 0) return alert('Ingresa un monto válido');
      
      // Actualiza saldo
      saldo += monto;
      localStorage.setItem(`${activeUser}_saldo`, saldo);
      
      // Crea registro de transacción
      const fecha = new Date();
      const registro = `${fecha.toISOString()}|Depósito|+${monto}|Saldo:${saldo}`;
      transacciones.push(registro);
      localStorage.setItem(`${activeUser}_tx`, transacciones.join(';')); // Guarda como string separado por ;
      
      // Actualiza UI
      saldoEl.text(`$${saldo}`);
      $('#montoDeposito').val(''); // Limpia campo
      $('#mensajeDeposito').show();
      $('#btnVolver').show();
    });
  }
});

// ===============================
// ENVÍO DE DINERO
// ===============================
$(function () {
  const sendForm = $('#sendForm');
  
  if (sendForm.length) {
    sendForm.on('submit', function (e) {
      e.preventDefault();
      const contacto = $('#contacto').val();
      const monto = Number($('#montoEnvio').val());
      
      // Validaciones
      if (!contacto || !monto || monto <= 0) return alert('Completa contacto y monto válido');
      if (monto > saldo) return alert('Saldo insuficiente ❌');
      
      // Procesa transferencia
      saldo -= monto;
      localStorage.setItem(`${activeUser}_saldo`, saldo);
      
      const fecha = new Date();
      const registro = `${fecha.toISOString()}|Transferencia a ${contacto}|-${monto}|Saldo:${saldo}`;
      transacciones.push(registro);
      localStorage.setItem(`${activeUser}_tx`, transacciones.join(';'));
      
      alert('Transferencia realizada ✅');
      $('#montoEnvio').val('');
      
      $('#mensajeEnvio').show();
      $('#btnVolver').show();
    });
  }
});

// ===============================
// CONTACTOS (por usuario)
// ===============================
$(function () {
  // Elementos del DOM
  const addBtn = $('#addContact');
  const contactList = $('#contactList');
  const contactoInput = $('#contacto');
  const suggestions = $('#suggestions');
  
  // Carga contactos desde localStorage
  let contactos = activeUser && localStorage.getItem(`${activeUser}_contactos`)
    ? JSON.parse(localStorage.getItem(`${activeUser}_contactos`))
    : [];
  
  // Renderiza lista de contactos
  function renderContactos() {
    contactList.empty();
    contactos.forEach(c => {
      contactList.append(`<li class="list-group-item">${c.id} - ${c.nombre}</li>`);
    });
  }
  
  renderContactos();
  
  // Agregar nuevo contacto
  if (addBtn.length) {
    addBtn.on('click', function () {
      if (contactos.length >= 100) {
        return alert('Has alcanzado el máximo de 100 contactos ❌');
      }
      
      const nombre = prompt('Ingresa el nombre del nuevo contacto:');
      if (!nombre) return;
      
      // Genera ID autoincremental con padding
      const nuevoId = String(contactos.length + 1).padStart(3, '0');
      const nuevoContacto = { id: nuevoId, nombre: nombre };
      contactos.push(nuevoContacto);
      
      localStorage.setItem(`${activeUser}_contactos`, JSON.stringify(contactos));
      renderContactos();
      
      alert(`Contacto ${nombre} agregado con ID ${nuevoId} ✅`);
    });
  }
  
  // Sistema de sugerencias (autocompletado)
  if (contactoInput.length) {
    contactoInput.on('input', function () {
      const query = contactoInput.val().toLowerCase();
      suggestions.empty();
      
      if (!query) return;
      
      // Filtra contactos que coincidan
      const filtrados = contactos.filter(c => c.nombre.toLowerCase().includes(query));
      
      // Muestra sugerencias
      filtrados.forEach(c => {
        suggestions.append(`<li class="list-group-item suggestion-item">${c.id} - ${c.nombre}</li>`);
      });
      
      // Click en sugerencia para autocompletar
      $('.suggestion-item').on('click', function () {
        contactoInput.val($(this).text().split(' - ')[1]);
        suggestions.empty();
      });
    });
  }
});

// ===============================
// LISTA DE TRANSACCIONES
// ===============================
$(function () {
  const txTable = $('#txTableBody');
  const saldoEl = $('#saldoActual');
  const buscarBtn = $('#btnBuscarFecha');
  
  if (saldoEl.length) saldoEl.text(`$${saldo}`);
  
  // Renderiza todas las transacciones inicialmente
  if (txTable.length) {
    renderTx(transacciones);
  }
  
  // Búsqueda por fecha
  if (buscarBtn.length) {
    buscarBtn.on('click', function () {
      const fechaBuscar = $('#buscarFecha').val();
      if (!fechaBuscar) return alert('Selecciona una fecha');
      
      // Filtra transacciones por fecha
      const filtradas = transacciones.filter(tx => {
        const partes = tx.split('|');
        const fechaISO = partes[0].split('T')[0]; // Obtiene solo fecha (YYYY-MM-DD)
        return fechaISO === fechaBuscar;
      });
      renderTx(filtradas);
      
      $('#mensajeTx').show();
      $('#btnVolverTx').show();
    });
  }
  
  // Función para renderizar transacciones en tabla
  function renderTx(list) {
    txTable.empty();
    list.forEach(tx => {
      const partes = tx.split('|');
      const fecha = new Date(partes[0]);
      
      // Formatea fechas en español de Chile
      const hora = fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
      const dia = fecha.toLocaleDateString('es-CL', { weekday: 'long' });
      const fechaStr = fecha.toLocaleDateString('es-CL');
      const origen = partes[1];
      const monto = partes[2];
      const saldoTx = partes[3];
      
      // Añade fila a la tabla
      txTable.append(`
        <tr>
          <td>${hora}</td>
          <td>${dia}</td>
          <td>${fechaStr}</td>
          <td>${origen}</td>
          <td>${monto}</td>
          <td>${saldoTx}</td>
        </tr>
      `);
    });
  }
});

// ===============================
// CERRAR SESIÓN
// ===============================
$(function () {
  const logoutBtn = $('#logoutBtn');
  if (logoutBtn.length) {
    logoutBtn.on('click', function (e) {
      e.preventDefault();
      
      // Elimina usuario activo del localStorage
      localStorage.removeItem('alke_active_user');
      
      // Redirige a página de login
      window.location.href = './pages/login.html';
      // NOTA: Comentario sugiere ajustar ruta según estructura
    });
  }
});