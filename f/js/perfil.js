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

function obtener() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const email = loggedInUser.user;  // Obtén el correo electrónico del usuario
    console.log(email);

    fetchWithToken('http://127.0.0.1:5000/get_user_profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('firstName').value = data.first_name || '';
        document.getElementById('secondName').value = data.last_name || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('phone').value = data.phone || '';
        document.getElementById('departmentOrCourse').value = data.department || data.course || '';
    })
    .catch(error => console.error('Error fetching user profile:', error));
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

obtener();
