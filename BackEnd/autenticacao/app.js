require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const indexRouter = require("./routes/index.js");
const usersRouter = require("./routes/users.js");
const authRouter = require("./routes/auth.js");

const alunoRoutes = require("./routes/aluno");
const anuncioRoutes = require("./routes/anuncio");
const escolaRoutes = require("./routes/escola");
const professorRoutes = require("./routes/professor");
const turmaRoutes = require("./routes/turma");
const cursoRoutes = require("./routes/curso");
const aiRoutes = require("./routes/ai");
const todoRoutes = require("./routes/toDo");

// initialize express
const app = express();

// ───────────────────────────────────────────────────────────────
// MIDDLEWARES ESSENCIAIS (na ordem correta!)

// CORS deve vir ANTES de qualquer rota ou sessão
app.use(
  cors({
    origin: "http://localhost:3001", // Porta do front-end React
    credentials: true,
  })
);

// Parser de cookies (para ler cookies da sessão)
app.use(cookieParser());

// Logger
app.use(logger("dev"));

// Parser de JSON e formulários
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sessão (depois de cookieParser, antes das rotas)
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET || "segredo123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true apenas em produção com HTTPS
    },
  })
);

// Ficheiros estáticos
app.use(express.static(path.join(__dirname, "public")));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// ───────────────────────────────────────────────────────────────
// ROTAS
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);

app.use("/api/aluno", alunoRoutes);
app.use("/api/anuncio", anuncioRoutes);
app.use("/api/escola", escolaRoutes);
app.use("/api/professor", professorRoutes);
app.use("/api/turma", turmaRoutes);
app.use("/api/curso", cursoRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/todo", todoRoutes);

// ───────────────────────────────────────────────────────────────
// ERROS
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  console.error("Erro no servidor:", err);

  res.status(err.status || 500).json({
    error: err.message || "Ocorreu um erro no servidor.",
    status: err.status || 500,
  });
});

app.use("/api/alunos", alunoRoutes);

module.exports = app;
