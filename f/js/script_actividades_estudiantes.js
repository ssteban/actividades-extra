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

document.addEventListener("DOMContentLoaded", function () {
    fetchRegisteredActivities();
});

function fetchRegisteredActivities() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        console.error("No se encontró el correo electrónico del usuario en el localStorage");
        return;
    }

    fetchWithToken("http://127.0.0.1:5000/get_registered_activities", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: loggedInUser.user }),
    })
    .then(response => response.json())
    .then(data => {
        data.sort((a, b) => new Date(a.date) - new Date(b.date));

        const registeredEvents = data.map(activity => ({
            title: activity.name,
            start: new Date(activity.date).toISOString().split('T')[0],
            extendedProps: {
                responsable: activity.responsable,
                activityId: activity.id,
                registered: true
            }
        }));

        fetchActividadesDisponibles(registeredEvents);
    })
    .catch(error => console.error("Error fetching registered activities:", error));
}

function fetchActividadesDisponibles(registeredEvents) {
    fetchWithToken('http://127.0.0.1:5000/get_actividades_aprobadas')
    .then(response => response.json())
    .then(data => {
        console.log(data);  // Verificar qué datos estás recibiendo
        const actividades = data.actividades;  // Acceder al array de actividades

        if (Array.isArray(actividades)) {
            actividades.forEach(activity => {
                if (!registeredEvents.find(e => e.extendedProps.activityId === activity.id)) {
                    registeredEvents.push({
                        title: activity.actividad,
                        start: new Date(activity.fecha).toISOString().split('T')[0],
                        extendedProps: {
                            responsable: activity.responsable,
                            activityId: activity.id,
                            registered: false
                        }
                    });
                }
            });
        } else {
            console.error("La respuesta no contiene un array de actividades:", data);
        }

        initializeCalendar(registeredEvents);
    })
    .catch(error => console.error('Error fetching available activities:', error));
}

function initializeCalendar(events) {
    var calendarEl = document.getElementById("calendar");
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        events: events,
        eventClick: function (info) {
            const modalTitle = document.getElementById("modalTitle");
            const modalDate = document.getElementById("modalDate");
            const modalResponsable = document.getElementById("modalResponsable");
            const modalFooter = document.getElementById("modalFooter");

            modalTitle.textContent = info.event.title;
            modalDate.textContent = `Fecha: ${info.event.start.toISOString().split('T')[0]}`;
            modalResponsable.textContent = `Responsable: ${info.event.extendedProps.responsable}`;
            modalFooter.innerHTML = ''; // Clear previous buttons

            if (info.event.extendedProps.registered) {
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn btn-danger';
                deleteButton.textContent = 'Eliminar registro';
                deleteButton.onclick = () => {
                    leaveActivity(info.event.extendedProps.activityId);
                };
                modalFooter.appendChild(deleteButton);
            } else {
                const registerButton = document.createElement('button');
                registerButton.className = 'btn btn-primary';
                registerButton.textContent = 'Registrar';
                registerButton.onclick = () => {
                    registerActivity(info.event.extendedProps.activityId);
                };
                modalFooter.appendChild(registerButton);
            }

            var myModal = new bootstrap.Modal(document.getElementById("eventModal"));
            myModal.show();
        },
    });
    calendar.render();
}

function registerActivity(activityId) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    fetchWithToken('http://127.0.0.1:5000/register_activity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: loggedInUser.user, activity_id: activityId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            fetchRegisteredActivities(); // Re-fetch only if successful
        } else {
            alert('Error registrando la actividad');
        }
    })
    .catch(error => console.error('Error registrando la actividad:', error));
}

function leaveActivity(activityId) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    fetchWithToken('http://127.0.0.1:5000/leave_activity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activity_id: activityId, email: loggedInUser.user })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Actividad eliminada');
            fetchRegisteredActivities(); // Re-fetch only if successful
        } else {
            alert('Error al salir de la actividad');
        }
    })
    .catch(error => console.error('Error al salir de la actividad:', error));
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
        setTimeout(function () {
            window.location.href = '../login.html';
        }, 1000);
    } else {
        return true;
    }
};
