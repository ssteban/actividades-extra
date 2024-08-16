const login = async () => {
    console.log('entro');

    const usuario = document.getElementById('username').value;
    const contra = document.getElementById('password').value;
    const rol = document.getElementById('role').value;

    console.log('Enviando datos:', { username: usuario, password: contra, role: rol });

    try {
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: usuario, password: contra, role: rol })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Login successful:', data);
            localStorage.setItem('jwtToken', data.token);  // Guardamos el token en localStorage
            localStorage.setItem('loggedInUser', JSON.stringify({ user: usuario }));
            switch (data.role) {
                case 'admin':
                    window.location.href = 'admin/admin.html';
                    break;
                case 'rector':
                    window.location.href = 'rector.html';
                    break;
                case 'estudiante':
                    window.location.href = 'estudiante/estudiantes.html';
                    break;
                case 'profesor':
                    window.location.href = 'profesor/profesores.html';
                    break;
                default:
                    console.error('Role not recognized:', data.role);
            }
        } else {
            alert('Usuario y/o contraseña incorrectas');
            console.error('Login failed:', response.statusText);
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
};
