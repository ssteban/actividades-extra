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

document.getElementById('activityForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const email = loggedInUser.user;
    const activityName = document.getElementById('activityName').value;
    const activityDateTime = document.getElementById('activityDateTime').value;

    fetchWithToken('https://actividades-extra-7g06.onrender.com/add_activityy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: activityName, datetime: activityDateTime, email: email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);            

            // Limpiar el formulario
            document.getElementById('activityForm').reset();
        } else {
            alert('Error agregando la actividad');
        }
    })
    .catch(error => console.error('Error agregando la actividad:', error));
});

function fetchActividades() {
    fetchWithToken('https://actividades-extra-7g06.onrender.com/get_actividades_aprobadas')
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data); // Verifica qué datos estás recibiendo

            if (!data || !Array.isArray(data.actividades)) {
                throw new Error('Expected an object with an array "actividades" but got: ' + JSON.stringify(data));
            }

            const actividadesList = document.getElementById('activityList');
            actividadesList.innerHTML = ''; // Limpiar la lista antes de agregar nuevos elementos

            data.actividades.forEach(actividad => {
                const listItem = document.createElement('li');
                listItem.className = 'list-group-item';
                listItem.textContent = actividad.actividad; // Mostrar solo el nombre de la actividad
                actividadesList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching actividades:', error));
}


const logout = async () => {
    try {
        localStorage.removeItem('jwtToken'); // Asegúrate de eliminar también el token
        localStorage.removeItem('loggedInUser');
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
};

const checkLogin = async () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        setTimeout(function() {
            window.location.href = '../index.html';
        }, 1000);
    } else {
        return true;
    }
};

fetchActividades();
