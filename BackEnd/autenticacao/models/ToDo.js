const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
    dono: { type: String, required: true},
    titulo: { type: String, required: true},
    data_criacao: { type: Date, required: true},
    prazo: { type: Date, required: true},
    descricao: { type: String, required: true},
    prioridade: { type: Number, required: true},
}, { collection: "Todo" });

const Todo = mongoose.model("Todo", TodoSchema);
module.exports = Todo;