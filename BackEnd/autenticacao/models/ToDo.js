const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  dono: { type: String, required: true },
  titulo: { type: String, required: true },
  data_criacao: { type: Date, required: true },
  prazo: { type: Date, required: true },
  descricao: { type: String },
  concluido: { type: Boolean, default: false },
  prioridade: {
    type: String,
    enum: ["Alta", "Média-Alta", "Média", "Baixa"],
    required: true
  }
  
}, { collection: "Todo" });

const Todo = mongoose.model("Todo", TodoSchema);
module.exports = Todo;
