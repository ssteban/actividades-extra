// // Función para obtener el token del localStorage
// function getAuthToken() {
//     return localStorage.getItem('jwtToken');
// }

// // Función para hacer solicitudes fetch con el token incluido
// async function fetchWithToken(url, options = {}) {
//     const token = getAuthToken();
//     if (!options.headers) {
//         options.headers = {};
//     }
//     options.headers['Authorization'] = `Bearer ${token}`;
    
//     const response = await fetch(url, options);
//     if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Error en la solicitud');
//     }
//     return response.json();
// }

// const showTableData = async () => {
//     const userType = document.getElementById("userTypeSelect").value;
//     const tableBody = document.getElementById("tableBody");

//     tableBody.innerHTML = "";

//     let endpoint = userType === "profesores" ? 'get_professors' : 'get_students';
    
//     try {
//         const data = await fetchWithToken(`http://127.0.0.1:5000/${endpoint}`);
//         data.forEach(user => {
//             let row = document.createElement("tr");
//             row.innerHTML = `
//                 <td>${user.id}</td>
//                 <td>${user.first_name}</td>
//                 <td>${user.last_name}</td>
//                 <td>${user.email}</td>
//                 <td>${user.phone}</td>
//                 <td>${user.department || user.course}</td>
//             `;
//             tableBody.appendChild(row);
//         });
//     } catch (error) {
//         console.error("Error fetching data:", error);
//     }
// };

// document.getElementById('showChartBtn').addEventListener('click', async function() {
//     const canvas = document.getElementById('userChart');
//     const showBtn = document.getElementById('showChartBtn');
//     const hideBtn = document.getElementById('hideChartBtn');
    
//     canvas.style.display = 'block';
//     showBtn.style.display = 'none';
//     hideBtn.style.display = 'inline-block';
    
//     const ctx = canvas.getContext('2d');
    
//     try {
//         const data = await fetchWithToken('http://127.0.0.1:5000/get_role_counts');
//         const { profesores, estudiantes } = data;
        
//         if (!canvas.chart) {
//             canvas.chart = new Chart(ctx, {
//                 type: 'bar',
//                 data: {
//                     labels: ['Profesores', 'Estudiantes'],
//                     datasets: [{
//                         label: '# de Usuarios',
//                         data: [profesores, estudiantes],
//                         backgroundColor: [
//                             'rgba(54, 162, 235, 0.2)',
//                             'rgba(75, 192, 192, 0.2)'
//                         ],
//                         borderColor: [
//                             'rgba(54, 162, 235, 1)',
//                             'rgba(75, 192, 192, 1)'
//                         ],
//                         borderWidth: 1
//                     }]
//                 },
//                 options: {
//                     scales: {
//                         y: {
//                             beginAtZero: true
//                         }
//                     }
//                 }
//             });
//         } else {
//             canvas.chart.data.datasets[0].data = [profesores, estudiantes];
//             canvas.chart.update();
//         }
//     } catch (error) {
//         console.error('Error al obtener los datos:', error);
//         alert('Hubo un problema al obtener los datos.');
//     }
// });

// document.getElementById('hideChartBtn').addEventListener('click', function() {
//     const canvas = document.getElementById('userChart');
//     const showBtn = document.getElementById('showChartBtn');
//     const hideBtn = document.getElementById('hideChartBtn');
    
//     canvas.style.display = 'none';
//     showBtn.style.display = 'inline-block';
//     hideBtn.style.display = 'none';
// });

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


// Función para obtener y mostrar el conteo de actividades y usuarios
const conteonumero = async () => {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/registration-stats', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken') // Asegúrate de ajustar la forma en que obtienes el token
            }
        });
        const data = await response.json();
        document.getElementById('activityCount').textContent = data.activityCount;
        document.getElementById('userCount').textContent = data.userCount;
    } catch (error) {
        console.error('Error fetching registration stats:', error);
    }
};

// Función para obtener datos para las gráficas
// Función para obtener datos para las gráficas
const fetchData = async () => {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('http://127.0.0.1:5000/api/combined-stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
};


// Función para crear las gráficas dinámicamente
// Función para crear las gráficas dinámicamente
const createCharts = async () => {
    const data = await fetchData();
    if (!data) return;

    // Gráfica de Actividades Registradas por Cursos
    const activitiesByCourseCtx = document.getElementById('activitiesByCourseChart').getContext('2d');
    new Chart(activitiesByCourseCtx, {
        type: 'bar',
        data: {
            labels: data.activitiesByCourse.labels,
            datasets: [{
                label: 'Número de Actividades Registradas',
                data: data.activitiesByCourse.data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfica de Participación por Curso
    const participationByCourseCtx = document.getElementById('participationByCourseChart').getContext('2d');
    new Chart(participationByCourseCtx, {
        type: 'pie',
        data: {
            labels: data.participationByCourse.labels,
            datasets: [{
                label: 'Participación de Estudiantes',
                data: data.participationByCourse.data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (context.parsed) {
                                label += ': ' + context.parsed + ' participaciones';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    // Gráfica de Usuarios Registrados
    const userStatsCtx = document.getElementById('userStatsChart').getContext('2d');
    new Chart(userStatsCtx, {
        type: 'doughnut',
        data: {
            labels: data.userStats.labels,
            datasets: [{
                label: 'Número de Usuarios Registrados',
                data: data.userStats.data,
                backgroundColor: [
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 159, 64, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (context.parsed) {
                                label += ': ' + context.parsed + ' usuarios';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    // Gráfica de Actividades por Mes
    const activitiesByMonthCtx = document.getElementById('activitiesByMonthChart').getContext('2d');
    new Chart(activitiesByMonthCtx, {
        type: 'line',
        data: {
            labels: data.activitiesByMonth.labels,
            datasets: [{
                label: 'Actividades Registradas',
                data: data.activitiesByMonth.data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfica de Usuarios Registrados por Mes
    const userChartCtx = document.getElementById('userChart').getContext('2d');
    new Chart(userChartCtx, {
        type: 'bar',
        data: {
            labels: data.userStatsByMonth.labels,
            datasets: [{
                label: 'Usuarios Registrados',
                data: data.userStatsByMonth.data,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

// Ejecutar las funciones cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    createCharts();
    conteonumero();
});
