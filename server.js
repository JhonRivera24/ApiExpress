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
    db.query("SELECT * FROM empleados", (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Agregar empleado
app.post("/empleados", (req, res) => {
    const { nombre, puesto, edad, domicilio } = req.body;
    db.query("INSERT INTO empleados (nombre, puesto, edad, domicilio) VALUES (?, ?, ?, ?)",
        [nombre, puesto, edad, domicilio], (err, result) => {
            if (err) throw err;
            res.json({ id: result.insertId, nombre, puesto, edad, domicilio });
        });
});

// Editar empleado
app.put("/empleados/:id", (req, res) => {
    const { nombre, puesto, edad, domicilio } = req.body;
    db.query("UPDATE empleados SET nombre=?, puesto=?, edad=?, domicilio=? WHERE id=?",
        [nombre, puesto, edad, domicilio, req.params.id], (err) => {
            if (err) throw err;
            res.json({ mensaje: "Empleado actualizado" });
        });
});

// Eliminar empleado
app.delete("/empleados/:id", (req, res) => {
    db.query("DELETE FROM empleados WHERE id=?", [req.params.id], (err) => {
        if (err) throw err;
        res.json({ mensaje: "Empleado eliminado" });
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});