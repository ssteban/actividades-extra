// Función para obtener el token del localStorage
function getAuthToken() {
    return localStorage.getItem('jwtToken');
}

// Función para hacer solicitudes fetch con el token incluido
async function fetchWithToken(url, options = {}) {
    const token = getAuthToken();
    if (!options.headers) {
        options.headers = {};
    }
    options.headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la solicitud');
    }
    return response.json();
}

function fetchActividades() {
    fetchWithToken('http://127.0.0.1:5000/get_actividades_aprobadas')
        .then(data => {
            const actividadesBody = document.getElementById('actividadesBody');
            actividadesBody.innerHTML = '';
            
            // Procesar actividades y mostrarlas en la tabla
            data.actividades.forEach(actividad => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${actividad.id}</td>
                    <td>${actividad.actividad}</td>
                    <td>${actividad.fecha}</td>
                    <td>${actividad.responsable}</td>
                    <td>${actividad.acciones}</td>
                `;
                actividadesBody.appendChild(row);
            });
            console.log(data.pdf_base64)
            // Crear y agregar el botón de descarga del PDF
            const downloadBtn = document.createElement('button');
            downloadBtn.textContent = 'Descargar Reporte';
            downloadBtn.className = 'btn btn-primary'; // Añadir clase Bootstrap para estilos

            // Convertir el PDF base64 en un archivo descargable
            downloadBtn.addEventListener('click', () => {
                const link = document.createElement('a');
                link.href = 'data:application/pdf;base64,' + data.pdf_base64;
                link.download = 'actividades_aprobadas.pdf';
                link.click();
            });

            // Añadir el botón al DOM, por ejemplo, en algún contenedor específico
            const downloadContainer = document.getElementById('downloadContainer');
            downloadContainer.innerHTML = ''; // Limpiar cualquier contenido previo
            downloadContainer.appendChild(downloadBtn);
        })
        .catch(error => console.error('Error fetching actividades:', error));
}


const logout = async () => {
    try {
        localStorage.removeItem('jwtToken'); // Asegúrate de eliminar también el token
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

fetchActividades();
