const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Student Routes
app.get('/api/students', (req, res) => {
    const sql = "SELECT * FROM students";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});

app.get('/api/students/:id', (req, res) => {
    const sql = "SELECT * FROM students WHERE id = ?";
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message":"success",
            "data":row
        })
    });
});

app.post('/api/students', (req, res) => {
    const data = {
        fullName: req.body.fullName,
        registrationNumber: req.body.registrationNumber,
        course: req.body.course,
        academicYear: req.body.academicYear,
        gpa: req.body.gpa,
        attendancePercentage: req.body.attendancePercentage,
        inde: req.body.inde,
        iaa: req.body.iaa,
        ieg: req.body.ieg,
        ips: req.body.ips,
        ida: req.body.ida,
        ipp: req.body.ipp,
        ipv: req.body.ipv,
        ian: req.body.ian,
        defasagem: req.body.defasagem,
        idadeAluno: req.body.idadeAluno,
        anosPm: req.body.anosPm,
        pedra: req.body.pedra,
        pontoVirada: req.body.pontoVirada,
        sinalizadorIngressante: req.body.sinalizadorIngressante
    }
    const sql = `INSERT INTO students (
        fullName, registrationNumber, course, academicYear, gpa, attendancePercentage,
        inde, iaa, ieg, ips, ida, ipp, ipv, ian, defasagem, idadeAluno, anosPm, pedra, pontoVirada, sinalizadorIngressante
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const params = [
        data.fullName, data.registrationNumber, data.course, data.academicYear, data.gpa, data.attendancePercentage,
        data.inde, data.iaa, data.ieg, data.ips, data.ida, data.ipp, data.ipv, data.ian, data.defasagem, data.idadeAluno, data.anosPm, data.pedra, data.pontoVirada, data.sinalizadorIngressante
    ];
    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id": this.lastID
        });
    });
});

app.put('/api/students/:id', (req, res) => {
    const data = {
        fullName: req.body.fullName,
        registrationNumber: req.body.registrationNumber,
        course: req.body.course,
        academicYear: req.body.academicYear,
        gpa: req.body.gpa,
        attendancePercentage: req.body.attendancePercentage,
        inde: req.body.inde,
        iaa: req.body.iaa,
        ieg: req.body.ieg,
        ips: req.body.ips,
        ida: req.body.ida,
        ipp: req.body.ipp,
        ipv: req.body.ipv,
        ian: req.body.ian,
        defasagem: req.body.defasagem,
        idadeAluno: req.body.idadeAluno,
        anosPm: req.body.anosPm,
        pedra: req.body.pedra,
        pontoVirada: req.body.pontoVirada,
        sinalizadorIngressante: req.body.sinalizadorIngressante
    };
    db.run(
        `UPDATE students set 
           fullName = COALESCE(?,fullName), 
           registrationNumber = COALESCE(?,registrationNumber),
           course = COALESCE(?,course),
           academicYear = COALESCE(?,academicYear),
           gpa = COALESCE(?,gpa),
           attendancePercentage = COALESCE(?,attendancePercentage),
           inde = COALESCE(?,inde),
           iaa = COALESCE(?,iaa),
           ieg = COALESCE(?,ieg),
           ips = COALESCE(?,ips),
           ida = COALESCE(?,ida),
           ipp = COALESCE(?,ipp),
           ipv = COALESCE(?,ipv),
           ian = COALESCE(?,ian),
           defasagem = COALESCE(?,defasagem),
           idadeAluno = COALESCE(?,idadeAluno),
           anosPm = COALESCE(?,anosPm),
           pedra = COALESCE(?,pedra),
           pontoVirada = COALESCE(?,pontoVirada),
           sinalizadorIngressante = COALESCE(?,sinalizadorIngressante),
           updatedAt = CURRENT_TIMESTAMP
           WHERE id = ?`,
        [data.fullName, data.registrationNumber, data.course, data.academicYear, data.gpa, data.attendancePercentage,
         data.inde, data.iaa, data.ieg, data.ips, data.ida, data.ipp, data.ipv, data.ian, data.defasagem, data.idadeAluno, data.anosPm, data.pedra, data.pontoVirada, data.sinalizadorIngressante,
         req.params.id],
        function (err, result) {
            if (err) {
                res.status(400).json({"error": res.message});
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            });
    });
});

app.delete("/api/students/:id", (req, res) => {
    db.run(
        'DELETE FROM students WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err) {
                res.status(400).json({"error": res.message});
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
