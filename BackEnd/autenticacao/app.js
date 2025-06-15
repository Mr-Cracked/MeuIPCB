
require('dotenv').config();

var path = require('path');
var express = require('express');
var session = require('express-session');
var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index.js');
var usersRouter = require('./routes/users.js');
var authRouter = require('./routes/auth.js');

const alunoRoutes = require('./routes/aluno');
const anuncioRoutes = require('./routes/anuncio');
const escolaRoutes = require('./routes/escola');
const professorRoutes = require('./routes/professor');
const turmaRoutes = require('./routes/turma');
const cursoRoutes = require('./routes/curso');
const aiRoutes = require('./routes/ai');
const todoRoutes = require('./routes/toDo');

// initialize express
var app = express();

const cors = require('cors');

app.use(cors({
    origin: 'http://localhost:3001', // Permitir requisições do front-end (React)
    credentials: true // Permitir envio de cookies e headers de autenticação
}));


 app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // set this to true on production
    }
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use("/api/aluno", alunoRoutes);
app.use("/api/anuncio", anuncioRoutes);
app.use("/api/escola", escolaRoutes);
app.use("/api/professor", professorRoutes);
app.use("/api/turma", turmaRoutes);
app.use("/api/curso", cursoRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/todo", todoRoutes);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});


app.use(function (err, req, res, next) {
    console.error("Erro no servidor:", err);

    res.status(err.status || 500).json({
        error: err.message || "Ocorreu um erro no servidor.",
        status: err.status || 500
    });
});


module.exports = app;
