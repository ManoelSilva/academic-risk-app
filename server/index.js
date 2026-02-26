const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const {
  register,
  riskEvaluationCount,
  riskEvaluationDuration,
  riskEvaluationResults,
  studentCount,
  modelApiHealth,
  metricsMiddleware,
} = require('./metrics');

const app = express();
const PORT = process.env.PORT || 3000;
const RISK_MODEL_URL = process.env.RISK_MODEL_URL || 'http://localhost:5000';

app.use(cors());
app.use(bodyParser.json());
app.use(metricsMiddleware);

app.get('/api/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

app.get('/api/health', (req, res) => {
  fetch(`${RISK_MODEL_URL}/health`, { signal: AbortSignal.timeout(5000) })
    .then(r => {
      modelApiHealth.set(r.ok ? 1 : 0);
      return r.ok ? r.json() : null;
    })
    .then(modelHealth => {
      res.json({
        status: 'ok',
        timestamp: new Date(),
        dependencies: {
          model_api: modelHealth ? modelHealth.status : 'unreachable',
        },
      });
    })
    .catch(() => {
      modelApiHealth.set(0);
      res.json({
        status: 'degraded',
        timestamp: new Date(),
        dependencies: { model_api: 'unreachable' },
      });
    });
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

app.post('/api/risk/evaluate/:studentId', (req, res) => {
    const studentId = req.params.studentId;
    const evalStart = process.hrtime.bigint();

    db.get("SELECT * FROM students WHERE id = ?", [studentId], (err, student) => {
        if (err) {
            riskEvaluationCount.inc({ status: 'error' });
            return res.status(400).json({ status: 'error', message: err.message });
        }
        if (!student) {
            riskEvaluationCount.inc({ status: 'not_found' });
            return res.status(404).json({ status: 'error', message: 'Student not found' });
        }

        const featureVector = {
            INDE: student.inde || 0,
            IAA: student.iaa || 0,
            IEG: student.ieg || 0,
            IPS: student.ips || 0,
            IDA: student.ida || 0,
            IPP: student.ipp || 0,
            IPV: student.ipv || 0,
            IAN: student.ian || 0,
            DEFASAGEM: student.defasagem || 0,
            IDADE_ALUNO: student.idadeAluno || 0,
            ANOS_PM: student.anosPm || 0,
            PEDRA: student.pedra || '',
            PONTO_VIRADA: student.pontoVirada || '',
            SINALIZADOR_INGRESSANTE: student.sinalizadorIngressante || ''
        };

        fetch(`${RISK_MODEL_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([featureVector]),
            signal: AbortSignal.timeout(30000)
        })
        .then(response => {
            if (!response.ok) throw new Error(`Risk API responded with ${response.status}`);
            return response.json();
        })
        .then(riskResponse => {
            if (riskResponse.status !== 'success' || !riskResponse.predictions?.length) {
                throw new Error(riskResponse.message || 'No predictions returned');
            }
            const prediction = riskResponse.predictions[0];
            const now = new Date().toISOString();

            const elapsed = Number(process.hrtime.bigint() - evalStart) / 1e9;
            riskEvaluationDuration.observe(elapsed);
            riskEvaluationCount.inc({ status: 'success' });
            riskEvaluationResults.inc({ risk_label: prediction.risk_label });

            db.run(
                `UPDATE students SET riskScore = ?, riskProbability = ?, riskLabel = ?, riskEvaluatedAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
                [prediction.risk_prediction, prediction.risk_probability, prediction.risk_label, now, studentId],
                function(updateErr) {
                    if (updateErr) {
                        return res.status(500).json({ status: 'error', message: updateErr.message });
                    }
                    res.json({
                        status: 'success',
                        prediction: {
                            riskScore: prediction.risk_prediction,
                            riskProbability: prediction.risk_probability,
                            riskLabel: prediction.risk_label,
                            riskEvaluatedAt: now
                        }
                    });
                }
            );
        })
        .catch(fetchErr => {
            const elapsed = Number(process.hrtime.bigint() - evalStart) / 1e9;
            riskEvaluationDuration.observe(elapsed);
            const isTimeout = fetchErr.name === 'TimeoutError' || fetchErr.name === 'AbortError';
            riskEvaluationCount.inc({ status: isTimeout ? 'timeout' : 'error' });
            modelApiHealth.set(0);
            res.status(isTimeout ? 504 : 502).json({
                status: 'error',
                message: isTimeout ? 'Risk Model API timed out' : `Risk Model API error: ${fetchErr.message}`
            });
        });
    });
});

function updateStudentCount() {
  db.get("SELECT COUNT(*) as count FROM students", [], (err, row) => {
    if (!err && row) studentCount.set(row.count);
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  updateStudentCount();
  setInterval(updateStudentCount, 60000);
});
