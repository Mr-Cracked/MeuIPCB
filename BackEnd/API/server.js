const express = require('express');
const cors = require("cors");
const database = require('./database/basedados');
database();


const alunoRoutes = require('./routes/aluno');
const anuncioRoutes = require('./routes/anuncio');
const escolaRoutes = require('./routes/escola');
const professorRoutes = require('./routes/professor');
const turmaRoutes = require('./routes/turma');

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3001",  // Atualiza para o URL do teu frontend
    credentials: true                 // Permite envio de cookies/sessão
}));

app.use("/api/aluno", alunoRoutes);
app.use("/api/anuncio", anuncioRoutes);
app.use("api/escola", escolaRoutes);
app.use("api/professor", professorRoutes);
app.use("api/turma", turmaRoutes);




app.listen(5780, () => console.log('Server started on port 5780.'));

