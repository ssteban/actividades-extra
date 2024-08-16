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

const register_p = async () => {
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const departamento = document.getElementById('departamento').value;
    const contraseña = document.getElementById('contraseña').value;

    try {
        const response = await fetchWithToken('http://127.0.0.1:5000/register_professor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                first_name: nombre,
                last_name: apellido,
                email: email,
                phone: telefono,
                department: departamento,
                password: contraseña
            })
        });

        if (response.ok) {
            const result = await response.json();
            alert('Profesor registrado correctamente.');
            document.getElementById('nombre').value = "";
            document.getElementById('apellido').value = "";
            document.getElementById('email').value = "";
            document.getElementById('telefono').value = "";
            document.getElementById('departamento').value = "";
            document.getElementById('contraseña').value = "";
        } else {
            const error = await response.json();
            alert('Error al registrar el profesor.');
        }
    } catch (error) {
        console.error('Error durante el registro:', error);
        alert('Error al registrar el profesor.');
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
