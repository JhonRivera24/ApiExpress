require('dotenv').config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'mysql-186aa288-tortilleria.d.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_8bdNGWEWD3ltmU0CZPs',
    database: 'tortillas',
    port: 14038,
    ssl: {
        rejectUnauthorized: false
    }
});


db.connect(err => {
    if (err) throw err;
    console.log("Conectado a MySQL");
});

// Obtener todos los empleados
app.get("/empleados", (req, res) => {
    db.query(
        `SELECT empleados.id, empleados.nombre, empleados.puesto, empleados.domicilio, 
                sexo.nombre AS sexo 
         FROM empleados 
         LEFT JOIN sexo ON empleados.sexo_id = sexo.id`, 
        (err, results) => {
            if (err) throw err;
            res.json(results);
        }
    );
});

// Agregar empleado
app.post("/empleados", (req, res) => {
    const { nombre, puesto, domicilio, sexo_id } = req.body;
    db.query(
        "INSERT INTO empleados (nombre, puesto, domicilio, sexo_id) VALUES (?, ?, ?, ?)",
        [nombre, puesto, domicilio, sexo_id], 
        (err, result) => {
            if (err) throw err;
            res.json({ id: result.insertId, nombre, puesto, domicilio, sexo_id });
        }
    );
});

// Editar empleado
app.put("/empleados/:id", (req, res) => {
    const { nombre, puesto, domicilio, sexo_id } = req.body;
    db.query(
        "UPDATE empleados SET nombre=?, puesto=?, domicilio=?, sexo_id=? WHERE id=?",
        [nombre, puesto, domicilio, sexo_id, req.params.id], 
        (err) => {
            if (err) throw err;
            res.json({ mensaje: "Empleado actualizado" });
        }
    );
});

// Eliminar empleado
app.delete("/empleados/:id", (req, res) => {
    db.query("DELETE FROM empleados WHERE id=?", [req.params.id], (err) => {
        if (err) throw err;
        res.json({ mensaje: "Empleado eliminado" });
    });
});

app.post("/login", (req, res) => {
    const { nom_usuario, contraseña } = req.body;

    if (!nom_usuario || !contraseña) {
        return res.status(400).json({ 
            success: false,
            mensaje: "Todos los campos son obligatorios" 
        });
    }

    db.query("SELECT * FROM usuarios WHERE nom_usuario = ?", [nom_usuario], (err, results) => {
        if (err) {
            console.error("Error en la consulta:", err);
            return res.status(500).json({ 
                success: false,
                mensaje: "Error en el servidor" 
            });
        }

        if (results.length === 0) {
            return res.status(401).json({ 
                success: false,
                mensaje: "Usuario o contraseña incorrectos" 
            });
        }

        const usuario = results[0];

        // Comparación directa (sin cifrado)
        if (contraseña !== usuario.contraseña) {
            return res.status(401).json({ 
                success: false,
                mensaje: "Usuario o contraseña incorrectos" 
            });
        }
       

        // Respuesta exitosa sin token
        res.json({ 
            success: true,
            mensaje: "Login exitoso",
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nom_usuario,
                perfil_id: usuario.perfil_id
                // Agrega otros campos necesarios
            }
        });
    });
});

// Obtener módulos asignados a un perfil
app.get("/perfiles/:idPerfil/modulos", (req, res) => {
    const { idPerfil } = req.params;
    
    
    db.query(
        `SELECT  m.nombreModulo
         FROM Modulo m
         JOIN PerfilModulo pm ON m.id = pm.idModulo
         WHERE pm.perfil_id = ?`, 
        [idPerfil],
        (err, results) => {
            if (err) {
                console.error("Error en la consulta:", err);
                return res.status(500).json({ 
                    success: false,
                    mensaje: "Error al obtener módulos del perfil" 
                });
            }

            res.json({
                success: true,
                modulos: results
            });
        }
    );
});



// Obtener permisos específicos de un módulo para un perfil
app.get("/perfiles/:idPerfil/modulos/:idModulo/permisos", (req, res) => {
    const idPerfil = parseInt(req.params.idPerfil);
    const idModulo = parseInt(req.params.idModulo);
    
    db.query(
        `  SELECT PerfilModulo.bitAgregar, PerfilModulo.bitEditar, PerfilModulo.bitEliminar,
		 PerfilModulo.bitConsultar
         FROM PerfilModulo 
         JOIN Modulo ON PerfilModulo.idModulo = Modulo.id
         JOIN Perfil ON PerfilModulo.perfil_id = Perfil.idPerfil
         WHERE PerfilModulo.perfil_id = ? AND PerfilModulo.idModulo = ?;`,
        [idPerfil, idModulo],
        (err, results) => {
            if (err) {
                console.error("Error en la consulta:", err);
                return res.status(500).json({ 
                    success: false,
                    mensaje: "Error al obtener permisos" 
                });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    mensaje: "No se encontraron permisos para esta combinación de perfil y módulo" 
                });
            }
            
            res.json({
                success: true,
                permisos: results[0]
                
            });
        }
    );
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
