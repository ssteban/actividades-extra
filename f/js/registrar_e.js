// Función para obtener el token del localStorage
function getAuthToken() {
    return localStorage.getItem('jwtToken');
}

// Función para hacer solicitudes fetch con el token incluido
function fetchWithToken(url, options = {}) {
    const token = getAuthToken();
    if (!options.headers) {
        options.headers = {};
    }
    options.headers['Authorization'] = `Bearer ${token}`;
    return fetch(url, options);
}

const register_e = async () => {
    const firstName = document.getElementById('nombre').value;
    const lastName = document.getElementById('apellido').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('telefono').value;
    const course = document.getElementById('curso').value;
    const password = document.getElementById('contraseña').value;

    try {
        const response = await fetchWithToken('http://127.0.0.1:5000/register_student', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ first_name: firstName, last_name: lastName, email: email, phone: phone, course: course, password: password })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Registro exitoso: ', data);
            alert('Estudiante registrado correctamente.');
            // Limpiar campos del formulario
            document.getElementById('nombre').value = "";
            document.getElementById('apellido').value = "";
            document.getElementById('email').value = "";
            document.getElementById('telefono').value = "";
            document.getElementById('curso').value = "";
            document.getElementById('contraseña').value = "";
        } else {
            console.error('Fallo en el registro: ', response.statusText);
            alert('Error en el registro del estudiante.');
        }
    } catch (error) {
        console.error('Error en el registro: ', error);
        alert('Error en el registro del estudiante.');
    }
}

const logout = async () => {
    try {
        localStorage.removeItem('jwtToken');  // Asegúrate de eliminar también el token
        localStorage.removeItem('loggedInUser');
        window.location.href = '../login.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
};

const checkLogin = async () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        setTimeout(function() {
            window.location.href = '../login.html';
        }, 1000);
    } else {
        return true;
    }
}
