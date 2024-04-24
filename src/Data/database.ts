// Importa el módulo mysql
import mysql from 'mysql';

// Función para obtener la conexión a la base de datos
export function getConnection() {
    // Configura la conexión a la base de datos
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'questify'
    });

    // Retorna la conexión
    return connection;
}
