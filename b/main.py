import mysql.connector
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Configuración de la base de datos usando las variables de entorno
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
}

#crear tablas
def create_tables():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    # Crear tabla users si no existe
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(255) DEFAULT 'active'
        )
    """)
    
    # Crear tabla roles si no existe
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            role VARCHAR(255) NOT NULL,
            FOREIGN KEY (email) REFERENCES users(email)
        )
    """)

    # Crear tabla professors si no existe
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS professors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            phone VARCHAR(20),
            department VARCHAR(255),
            creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Crear tabla students si no existe
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            phone VARCHAR(20),
            course VARCHAR(255),
            creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    #crear tabla registered_students
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS registered_students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_email VARCHAR(255) NOT NULL,
        activity_id INT NOT NULL,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Crear tabla admin si no existe
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin (
            id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            phone VARCHAR(20),
            department VARCHAR(255),
            creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    #crear tabla de actividades
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS actividades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        actividad VARCHAR(255) NOT NULL,
        fecha DATE NOT NULL,
        proponente VARCHAR(255) NOT NULL,
        acciones VARCHAR(255),
        razon TEXT,
        creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

#iniciar secion
def loginuser(username, password, role): 
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    query = '''
        SELECT * FROM users WHERE email=%s AND password=%s
    '''
    cursor.execute(query, (username, password))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        conn.close()
        return False

    query = '''
        SELECT role FROM roles WHERE email=%s
    '''
    cursor.execute(query, (username,))
    user_role = cursor.fetchone()
    cursor.close()
    conn.close()

    if user_role and user_role[0] == role:
        return True
    else:
        return False

#registrar profesores
def register_professor(first_name, last_name, email, phone, department, password): 
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM professors WHERE email=%s', (email,))
    if cursor.fetchone() is not None:
        cursor.close()
        conn.close()
        return False  

    cursor.execute('SELECT * FROM users WHERE email=%s', (email,))
    if cursor.fetchone() is not None:
        cursor.close()
        conn.close()
        return False

    query = '''
        INSERT INTO professors (first_name, last_name, email, phone, department)
        VALUES (%s, %s, %s, %s, %s)
    '''
    cursor.execute(query, (first_name, last_name, email, phone, department))
    
    query = '''
        INSERT INTO users (email, password)
        VALUES (%s, %s)
    '''
    cursor.execute(query, (email, password))
    
    query = '''
        INSERT INTO roles (email, role)
        VALUES (%s, %s)
    '''
    cursor.execute(query, (email, 'profesor'))

    conn.commit()

    cursor.close()
    conn.close()
    return True

#resgistrar estudiantes
def register_student(first_name, last_name, email, phone, course, password):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM students WHERE email=%s', (email,))
    if cursor.fetchone() is not None:
        cursor.close()
        conn.close()
        return False  

    cursor.execute('SELECT * FROM users WHERE email=%s', (email,))
    if cursor.fetchone() is not None:
        cursor.close()
        conn.close()
        return False

    query = '''
        INSERT INTO students (first_name, last_name, email, phone, course)
        VALUES (%s, %s, %s, %s, %s)
    '''
    cursor.execute(query, (first_name, last_name, email, phone, course))

    query = '''
        INSERT INTO users (email, password)
        VALUES (%s, %s)
    '''
    cursor.execute(query, (email, password))

    query = '''
        INSERT INTO roles (email, role)
        VALUES (%s, %s)
    '''
    cursor.execute(query, (email, 'estudiante'))

    conn.commit()

    cursor.close()
    conn.close()
    return True

#registrar administradores
def register_admin(first_name, last_name, email, phone, department, password):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM admin WHERE email=%s', (email,))
    if cursor.fetchone() is not None:
        cursor.close()
        conn.close()
        return False

    cursor.execute('SELECT * FROM users WHERE email=%s', (email,))
    if cursor.fetchone() is not None:
        cursor.close()
        conn.close()
        return False

    query = '''
        INSERT INTO admin (first_name, last_name, email, phone, department)
        VALUES (%s, %s, %s, %s, %s)
    '''
    cursor.execute(query, (first_name, last_name, email, phone, department))

    query = '''
        INSERT INTO users (email, password)
        VALUES (%s, %s)
    '''
    cursor.execute(query, (email, password))

    query = '''
        INSERT INTO roles (email, role)
        VALUES (%s, %s)
    '''
    cursor.execute(query, (email, 'admin'))

    conn.commit()

    cursor.close()
    conn.close()
    return True

#register_admin('fidel', 'sanchez', 'admin@gmail.com', '123456', 'admin','123456')

#cambiar roll del usuario
def change_user_role(email, new_role):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM users WHERE email=%s', (email,))
    if cursor.fetchone() is None:
        cursor.close()
        conn.close()
        return False  # User does not exist

    query = '''
        UPDATE roles SET role=%s WHERE email=%s
    '''
    cursor.execute(query, (new_role, email))

    conn.commit()

    cursor.close()
    conn.close()
    return True

#mostrar datos en perfil
def get_user_profile(email):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    cursor.execute('SELECT role FROM roles WHERE email=%s', (email,))
    role_result = cursor.fetchone()
    if role_result is None:
        cursor.close()
        conn.close()
        return None  # User does not exist or role is not assigned

    role = role_result['role']

    user_info = {'role': role}

    if role == 'profesor':
        cursor.execute('SELECT first_name, last_name, email, phone, department FROM professors WHERE email=%s', (email,))
    elif role == 'estudiante':
        cursor.execute('SELECT first_name, last_name, email, phone, course FROM students WHERE email=%s', (email,))
    elif role == 'admin':
        cursor.execute('SELECT first_name, last_name, email, phone, department FROM admin WHERE email=%s', (email,))
    else:
        cursor.close()
        conn.close()
        return None  # Role not recognized

    user_result = cursor.fetchone()
    if user_result is None:
        cursor.close()
        conn.close()
        return None  # User does not exist in the specific role table

    user_info.update(user_result)

    cursor.close()
    conn.close()
    return user_info

#mostrar para cambiar roll
def get_users_with_roles():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    
    query = """
    SELECT r.id, p.first_name, p.last_name, p.email, r.role 
    FROM roles r
    LEFT JOIN professors p ON r.email = p.email
    WHERE p.email IS NOT NULL
    UNION
    SELECT r.id, s.first_name, s.last_name, s.email, r.role 
    FROM roles r
    LEFT JOIN students s ON r.email = s.email
    WHERE s.email IS NOT NULL
    UNION
    SELECT r.id, a.first_name, a.last_name, a.email, r.role 
    FROM roles r
    LEFT JOIN admin a ON r.email = a.email
    WHERE a.email IS NOT NULL
    """
    cursor.execute(query)
    users = cursor.fetchall()
    
    cursor.close()
    conn.close()
    return users

#añadir una nueva actividad
def add_activity(activity_name, activity_datetime, email):
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT first_name, last_name FROM professors WHERE email=%s', (email,))
        professor = cursor.fetchone()

        if professor:
            first_name, last_name = professor
            full_name = f"{first_name} {last_name}"
            query = '''
                INSERT INTO actividades (actividad, fecha, proponente, acciones) VALUES (%s, %s, %s,%s)
            '''
            cursor.execute(query, (activity_name, activity_datetime, full_name, 'pendiente'))

            conn.commit()
            response = {'status': 'success', 'message': 'Actividad añadida con exitoy'}
        else:
            response = {'status': 'error', 'message': 'Profesor no encontrado'}
    except mysql.connector.Error as err:
        response = {'status': 'error', 'message': str(err)}
    finally:
        cursor.close()
        conn.close()

    return response











create_tables()



