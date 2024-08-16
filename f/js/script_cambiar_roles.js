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

function fetchUsuarios() {
    fetchWithToken('http://127.0.0.1:5000/get_usuarios')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('tbody');
            tbody.innerHTML = ''; // Limpiar filas existentes

            data.forEach(usuario => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${usuario.id}</td>
                    <td>${usuario.first_name} ${usuario.last_name}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.role || 'N/A'}</td>
                    <td>
                        <select class="form-control" id="nuevoRol${usuario.id}">
                            <option value="null" ${!usuario.role || usuario.role === 'null' ? 'selected' : ''}></option>
                            <option value="admin" ${usuario.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="rector" ${usuario.role === 'rector' ? 'selected' : ''}>Rector</option>
                            <option value="estudiante" ${usuario.role === 'estudiante' ? 'selected' : ''}>Estudiante</option>
                            <option value="profesor" ${usuario.role === 'profesor' ? 'selected' : ''}>Profesor</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-primary" onclick="cambiarRol(${usuario.id}, '${usuario.email}')">Cambiar Rol</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching usuarios:', error));
}

function cambiarRol(id, email) {
    const nuevoRol = document.getElementById(`nuevoRol${id}`).value;

    fetchWithToken('http://127.0.0.1:5000/update_role', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, rol: nuevoRol === 'null' ? null : nuevoRol })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'Error cambiando rol');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Rol actualizado:", data);
        // Aquí puedes actualizar la tabla o la interfaz de usuario
        fetchUsuarios(); // Recargar usuarios
    })
    .catch(error => console.error('Error cambiando rol:', error));
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
};

fetchUsuarios();
