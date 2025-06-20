import React from "react";
import "./confirmarApagar.css";

export default function ConfirmarModal({ onConfirmar, onCancelar }) {
  return (
    <div className="modal-confirmar-overlay">
      <div className="modal-confirmar">
        <h3>Confirmar eliminação</h3>
        <p>Queres mesmo apagar esta tarefa?</p>
        <div className="botoes-modal">
          <button className="confirmar" onClick={onConfirmar}>Sim</button>
          <button className="cancelar" onClick={onCancelar}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
