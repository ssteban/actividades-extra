// Obtener el token del localStorage
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

function fetchActividades() {
    console.log('sirve')
    fetchWithToken('http://127.0.0.1:5000/get_actividades')
        .then(response => response.json())
        .then(data => {
            const actividadesBody = document.getElementById('actividadesBody');
            actividadesBody.innerHTML = '';
            data.forEach(actividad => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${actividad.id}</td>
                    <td>${actividad.actividad}</td>
                    <td>${actividad.fecha}</td>
                    <td>${actividad.proponente}</td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="aprobarActividad(${actividad.id})">Aprobar</button>
                        <button class="btn btn-danger btn-sm" onclick="rechazarActividad(${actividad.id})">Rechazar</button>
                    </td>
                `;
                actividadesBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching actividades:', error));
}

function aprobarActividad(id) {
    fetchWithToken(`http://127.0.0.1:5000/update_actividad/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: 'aprobado' })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Actividad aprobada:", data);
        fetchActividades(); // Reload activities
    })
    .catch(error => console.error('Error aprobando actividad:', error));
}

function rechazarActividad(id) {
    // Mostrar el modal
    const rejectModal = new bootstrap.Modal(document.getElementById('rejectModal'));
    rejectModal.show();
    document.getElementById('cancelar').onclick = function() {
        rejectModal.hide(); // Cerrar el modal
    }
    
    document.getElementById('confirmRejectBtn').onclick = function() {
        const reason = document.getElementById('rejectReason').value.trim();
        if (reason === "") {
            alert("Por favor, ingrese una razón para el rechazo.");
            return;
        }

        fetchWithToken(`http://127.0.0.1:5000/update_actividad/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: 'rechazado', razon: reason })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Actividad rechazada:", data);
            fetchActividades();
            rejectModal.hide(); // Cerrar el modal
        })
        .catch(error => console.error('Error rechazando actividad:', error));
    };
}

const logout = async () => {
    try {
        localStorage.removeItem('jwtToken');
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

fetchActividades();
