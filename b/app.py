from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import timedelta
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import base64
from main import *


app = Flask(__name__)
app.secret_key = 'clave'
app.config['JWT_SECRET_KEY'] = 'clave'
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    if loginuser(username, password, role):
        expires = timedelta(minutes=15)
        token = create_access_token(identity={'username': username, 'role': role}, expires_delta=expires)
        print(token)
        return jsonify({"message": "Login successful", "role": role, "token": token}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401


# Rutas protegidas con JWT
@app.route('/register_professor', methods=['POST'])
@jwt_required()
def register_professor_route():
    data = request.get_json()
    current_user = get_jwt_identity()
    print('Usuario autenticado:', current_user)

    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    phone = data.get('phone')
    department = data.get('department')
    password = data.get('password')

    if register_professor(first_name, last_name, email, phone, department, password):
        return jsonify({"message": "Professor registered successfully"}), 201
    else:
        return jsonify({"message": "Email already in use"}), 400

@app.route('/register_student', methods=['POST'])
@jwt_required()
def register_student_endpoint():
    data = request.get_json()
    current_user = get_jwt_identity()

    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    phone = data.get('phone')
    course = data.get('course')
    password = data.get('password')

    if register_student(first_name, last_name, email, phone, course, password):
        return jsonify({"message": "Student registered successfully"}), 200
    else:
        return jsonify({"message": "Failed to register student"}), 400

@app.route('/get_role_counts', methods=['GET'])
@jwt_required()
def get_role_counts():
    current_user = get_jwt_identity()
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT COUNT(*) AS count FROM roles WHERE role = 'profesor'")
    profesores_count = cursor.fetchone()['count']
    
    cursor.execute("SELECT COUNT(*) AS count FROM roles WHERE role = 'estudiante'")
    estudiantes_count = cursor.fetchone()['count']
    
    cursor.close()
    conn.close()
    
    return jsonify({
        'profesores': profesores_count,
        'estudiantes': estudiantes_count
    })

@app.route('/get_professors', methods=['GET'])
@jwt_required()
def get_professors():
    current_user = get_jwt_identity()
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM professors')
    professors = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(professors), 200

@app.route('/get_students', methods=['GET'])
@jwt_required()
def get_students():
    current_user = get_jwt_identity()
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM students')
    students = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(students), 200

@app.route('/get_user_profile', methods=['POST'])
@jwt_required()
def get_user_profile_route():
    current_user = get_jwt_identity()
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    profile = get_user_profile(email)
    if profile is None:
        return jsonify({'error': 'User not found or role not recognized'}), 404

    return jsonify(profile), 200

@app.route('/get_actividades', methods=['GET'])
@jwt_required()
def get_actividades():
    current_user = get_jwt_identity()
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    cursor.execute('SELECT * FROM actividades WHERE acciones=%s', ('pendiente',))
    actividades = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(actividades)


@app.route('/get_actividades_aprobadas', methods=['GET'])
@jwt_required()
def get_actividades_aprobadas():
    current_user = get_jwt_identity()
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    # Consultar las actividades aprobadas
    cursor.execute('SELECT id, actividad, fecha, proponente AS responsable, acciones FROM actividades WHERE acciones=%s', ('aprobado',))
    actividades = cursor.fetchall()

    # Crear un archivo PDF en memoria
    pdf_buffer = BytesIO()
    pdf = canvas.Canvas(pdf_buffer, pagesize=letter)
    pdf.setTitle("Actividades Aprobadas")

    # Escribir el contenido en el PDF
    pdf.drawString(100, 750, "Listado de Actividades Aprobadas")
    y = 700
    for actividad in actividades:
        pdf.drawString(100, y, f"ID: {actividad['id']}, Actividad: {actividad['actividad']}, Fecha: {actividad['fecha']}, Responsable: {actividad['responsable']}")
        y -= 20

    pdf.save()

    # Convertir el PDF a base64
    pdf_buffer.seek(0)
    pdf_base64 = base64.b64encode(pdf_buffer.read()).decode('utf-8')

    # Cerrar la conexión a la base de datos
    cursor.close()
    conn.close()
    print(pdf_base64)
    # Enviar las actividades y el PDF codificado en base64
    return jsonify({
        "actividades": actividades,
        "pdf_base64": pdf_base64
    })

@app.route('/update_actividad/<int:id>', methods=['POST'])
@jwt_required()
def update_actividad(id):
    current_user = get_jwt_identity()
    data = request.get_json()
    estado = data.get('estado')
    razon = data.get('razon')
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    query = "UPDATE actividades SET acciones = %s, razon = %s WHERE id = %s"
    cursor.execute(query, (estado, razon, id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'status': 'success', 'id': id, 'new_state': estado})

@app.route('/get_usuarios', methods=['GET'])
@jwt_required()
def get_usuarios():
    current_user = get_jwt_identity()
    usuarios = get_users_with_roles()
    return jsonify(usuarios)

@app.route('/update_role', methods=['POST'])
@jwt_required()
def update_role():
    current_user = get_jwt_identity()
    data = request.json
    email = data.get('email')
    new_role = data.get('rol')
    
    if not email or not new_role:
        return jsonify({'status': 'error', 'message': 'Missing email or role'}), 400

    success = change_user_role(email, new_role)
    
    if success:
        return jsonify({'status': 'success', 'email': email, 'new_role': new_role})
    else:
        return jsonify({'status': 'error', 'message': 'Failed to update role'}), 500

@app.route('/add_activityy', methods=['POST'])
@jwt_required()
def add_activityy():
    current_user = get_jwt_identity()
    data = request.json
    activity_name = data['name']
    activity_datetime = data['datetime']
    email = data['email']
    res = add_activity(activity_name, activity_datetime, email)
    return jsonify(res)

@app.route('/register_activity', methods=['POST'])
@jwt_required()
def register_activity():
    current_user = get_jwt_identity()
    data = request.get_json()
    student_email = data.get('email')
    activity_id = data.get('activity_id')

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    query = '''
        INSERT INTO registered_students (student_email, activity_id)
        VALUES (%s, %s)
    '''
    cursor.execute(query, (student_email, activity_id))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'status': 'success', 'message': 'Registration successful'})


@app.route('/get_registered_activities', methods=['POST'])
@jwt_required()
def get_registered_activities():
    student_email = request.json.get('email')  # Obtener el correo del estudiante del cuerpo de la solicitud JSON

    if not student_email:
        return jsonify({'error': 'Email parameter is required'}), 400

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # Obtener los IDs de las actividades en las que el estudiante está registrado
        query_ids = '''
            SELECT activity_id
            FROM registered_students
            WHERE student_email = %s
        '''
        cursor.execute(query_ids, (student_email,))
        activity_ids = cursor.fetchall()

        if not activity_ids:
            return jsonify([])  # Devolver un array vacío si no hay actividades registradas

        # Extraer solo los IDs de la tupla de resultados
        activity_ids = [activity_id[0] for activity_id in activity_ids]

        # Obtener los nombres, fechas y responsables de las actividades usando los IDs
        query_names = '''
            SELECT id, actividad, fecha, proponente
            FROM actividades
            WHERE id IN (%s)
        ''' % ','.join(['%s'] * len(activity_ids))  # Placeholder para cada ID

        cursor.execute(query_names, tuple(activity_ids))
        activities = cursor.fetchall()

    except mysql.connector.Error as err:
        cursor.close()
        conn.close()
        return jsonify({'error': str(err)}), 500

    cursor.close()
    conn.close()

    # Convertir los resultados a un formato JSON
    activity_list = [{'id': activity[0], 'name': activity[1], 'date': activity[2], 'responsable': activity[3]} for activity in activities]

    return jsonify(activity_list)



@app.route('/leave_activity', methods=['POST'])
@jwt_required()
def leave_activity():
    data = request.json
    activity_id = data.get('activity_id')
    email = data.get('email')

    if not activity_id or not email:
        return jsonify({'error': 'Faltan parámetros'}), 400

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    try:
        # Eliminar el registro de la actividad para el usuario específico
        query = '''
            DELETE FROM registered_students
            WHERE activity_id = %s AND student_email = %s
        '''
        cursor.execute(query, (activity_id, email))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'No se encontró el registro'}), 404

    except mysql.connector.Error as err:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'error': str(err)}), 500

    cursor.close()
    conn.close()

    return jsonify({'success': True, 'message': 'Actividad eliminada exitosamente'})


@app.route('/api/combined-stats', methods=['GET'])
@jwt_required()
def combined_stats():
    current_user = get_jwt_identity()
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)

    # Consultas separadas
    cursor.execute("""
        SELECT actividad AS course, COUNT(*) as activity_count
        FROM actividades
        GROUP BY actividad
    """)
    activities_by_course = cursor.fetchall()

    cursor.execute("""
        SELECT students.course AS course, COUNT(*) as participation_count
        FROM registered_students
        JOIN students ON registered_students.student_email = students.email
        GROUP BY students.course
    """)
    participation_by_course = cursor.fetchall()

    cursor.execute("""
        SELECT 'Estudiantes' as type, COUNT(*) as count FROM students
        UNION
        SELECT 'Profesores' as type, COUNT(*) as count FROM professors
    """)
    user_stats = cursor.fetchall()

    cursor.execute("""
        SELECT DATE_FORMAT(fecha, '%Y-%m') AS month, COUNT(*) AS activity_count
        FROM actividades
        GROUP BY DATE_FORMAT(fecha, '%Y-%m')
    """)
    activities_by_month = cursor.fetchall()

    cursor.execute("""
        SELECT DATE_FORMAT(registration_date, '%Y-%m') AS month, COUNT(*) AS user_count
        FROM users
        GROUP BY DATE_FORMAT(registration_date, '%Y-%m')
    """)
    user_stats_by_month = cursor.fetchall()

    cursor.close()
    conn.close()

    # Transformar los datos a JSON
    combined_data = {
        'activitiesByCourse': {
            'labels': [row['course'] for row in activities_by_course],
            'data': [row['activity_count'] for row in activities_by_course]
        },
        'participationByCourse': {
            'labels': [row['course'] for row in participation_by_course],
            'data': [row['participation_count'] for row in participation_by_course]
        },
        'userStats': {
            'labels': [row['type'] for row in user_stats],
            'data': [row['count'] for row in user_stats]
        },
        'activitiesByMonth': {
            'labels': [row['month'] for row in activities_by_month],
            'data': [row['activity_count'] for row in activities_by_month]
        },
        'userStatsByMonth': {
            'labels': [row['month'] for row in user_stats_by_month],
            'data': [row['user_count'] for row in user_stats_by_month]
        }
    }

    return jsonify(combined_data)



@app.route('/api/registration-stats', methods=['GET'])
@jwt_required()
def registration_stats():
    current_user = get_jwt_identity()
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    
    # Ejecutar ambas consultas en una sola función
    cursor.execute("""
        SELECT (SELECT COUNT(*) FROM actividades) AS activity_count,
               (SELECT COUNT(*) FROM users) AS user_count
    """)
    data = cursor.fetchone()
    
    cursor.close()
    conn.close()

    return jsonify({
        'activityCount': data['activity_count'],
        'userCount': data['user_count']
    })



@app.route('/get_participacion_estudiantil', methods=['GET'])
@jwt_required()
def get_participacion_estudiantil():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        # Consulta para obtener la participación estudiantil por mes
        cursor.execute("""
            SELECT MONTH(actividades.fecha) AS mes, COUNT(registered_students.id) AS participacion
            FROM actividades
            JOIN registered_students ON actividades.id = registered_students.activity_id
            GROUP BY mes
            ORDER BY mes
        """)
        resultados = cursor.fetchall()

        # Formatear los datos para Chart.js
        meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        participacion = [0] * 12  # Inicializar participación con ceros para los 12 meses

        for row in resultados:
            mes = row['mes']
            count = row['participacion']
            if isinstance(mes, int) and isinstance(count, int):
                participacion[mes - 1] = count  # Asignar el conteo al mes correspondiente
            else:
                print(f"Datos inesperados: Mes: {mes}, Count: {count}")

        return jsonify({
            'meses': meses,
            'participacion': participacion
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Error al obtener los datos de participación'}), 500
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()









if __name__ == '__main__':
    app.run(debug=True)