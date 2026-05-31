const API_URL = 'http://localhost:3000';

// =========================
// BUSCADOR DE ARTÍCULOS
// =========================

function buscarArticulos() {

    const input = document
        .querySelector('.search-box input')
        .value
        .toLowerCase();

    const articulos = document.querySelectorAll('.article');

    articulos.forEach(art => {

        const titulo = art
            .querySelector('h3')
            .innerText
            .toLowerCase();

        art.style.display = titulo.includes(input)
            ? 'flex'
            : 'none';
    });
}

const btnBuscar = document.querySelector('.search-box button');

if (btnBuscar) {
    btnBuscar.addEventListener('click', buscarArticulos);
}

// =========================
// LOGIN
// =========================

async function login() {

    try {

        // TU BACKEND USA "email"
        const email = document.getElementById('correo').value.trim();

        const password = document
            .getElementById('password')
            .value
            .trim();

        const response = await fetch(`${API_URL}/api/auth/login`, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        console.log(data);

        if (response.ok && data.token) {

            // Guardar token
            localStorage.setItem('token', data.token);

            // Guardar usuario
            localStorage.setItem(
                'user',
                JSON.stringify(data.user)
            );

            alert('Inicio de sesión correcto');

            window.location.href = 'usuario.html';

        } else {

            alert(data.message || 'Error al iniciar sesión');
        }

    } catch (error) {

        console.error(error);

        alert('Error del servidor');
    }
}

// =========================
// CREAR TICKET
// =========================

async function crearTicket() {

    try {

        const token = localStorage.getItem('token');

        if (!token) {

            alert('Debes iniciar sesión');

            return;
        }

        const titulo = document
            .getElementById('titulo')
            .value
            .trim();

        // IMPORTANTE:
        // Tu backend usa "categoria"
        const categoria = document
            .getElementById('aplicacion')
            .value
            .trim();

        const prioridad = document
            .getElementById('prioridad')
            .value
            .trim()
            .toLowerCase();

        const descripcion = document
            .getElementById('descripcion')
            .value
            .trim();

        if (!titulo || !categoria || !prioridad || !descripcion) {

            alert('Todos los campos son obligatorios');

            return;
        }

        const response = await fetch(`${API_URL}/api/tickets`, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },

            body: JSON.stringify({
                titulo,
                descripcion,
                categoria,
                prioridad
            })
        });

        const data = await response.json();

        console.log(data);

        if (response.ok) {

            alert('Ticket creado correctamente');

            // Limpiar formulario
            document.getElementById('titulo').value = '';
            document.getElementById('descripcion').value = '';

        } else {

            alert(
                data.message ||
                data.error ||
                'Error al crear ticket'
            );
        }

    } catch (error) {

        console.error(error);

        alert('Error del servidor');
    }
}