import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import TopNavbar from "../components/TopNavbar";
import "../anuncios.css";

/* ---------- Modal visualmente atualizado ---------- */
function AnuncioModal({ anuncio, onClose }) {
  if (!anuncio) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-ver-anuncio" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2 className="titulo-anuncio">{anuncio.titulo}</h2>
        <p className="data-dono">
          {new Date(anuncio.data).toLocaleString("pt-PT")} · {anuncio.dono}
        </p>
        <p className="descricao-anuncio">{anuncio.descricao}</p>
        <p className="instituicoes-anuncio">
          <strong>Instituições:</strong> {anuncio.instituicoes?.join(", ")}
        </p>
      </div>
    </div>
  );
}

/* ---------- Modal para criar/editar ---------- */
function FormularioModal({ anuncio, onClose, onSubmit }) {
  const [titulo, setTitulo] = useState(anuncio?.titulo || "");
  const [descricao, setDescricao] = useState(anuncio?.descricao || "");
  const [instituicoes, setInstituicoes] = useState(anuncio?.instituicoes?.join(", ") || "");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...anuncio,
      titulo,
      descricao,
      instituicoes: instituicoes.split(",").map((s) => s.trim()),
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal-editar-anuncio" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>{anuncio ? "Editar anúncio" : "Novo anúncio"}</h3>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required placeholder="Título" />
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} required placeholder="Descrição" />
        <input value={instituicoes} onChange={(e) => setInstituicoes(e.target.value)} placeholder="Instituições (separadas por vírgulas)" />
        <button type="submit" className="submit-btn">Guardar</button>
      </form>
    </div>
  );
}

/* ---------- Página de Anúncios para Coordenadores ---------- */
export default function AnunciosC() {
  const [anuncios, setAnuncios] = useState([]);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [criterioOrdenacao, setCriterio] = useState("data-desc");
  const [selecionado, setSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(undefined);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/anuncio/veraluno", { withCredentials: true })
      .then((r) => setAnuncios(r.data))
      .catch((err) => console.error("Erro ao buscar anúncios:", err));
  }, []);

  const filtrados = useMemo(() =>
    anuncios.filter((a) =>
      a.titulo?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      a.descricao?.toLowerCase().includes(termoPesquisa.toLowerCase())
    ), [anuncios, termoPesquisa]);

  const ordenados = useMemo(() => {
    const lista = [...filtrados];
    switch (criterioOrdenacao) {
      case "titulo-asc":  return lista.sort((a, b) => a.titulo.localeCompare(b.titulo));
      case "titulo-desc": return lista.sort((a, b) => b.titulo.localeCompare(a.titulo));
      case "data-asc":    return lista.sort((a, b) => new Date(a.data) - new Date(b.data));
      default:            return lista.sort((a, b) => new Date(b.data) - new Date(a.data));
    }
  }, [filtrados, criterioOrdenacao]);

  async function guardarAnuncio(dados) {
    try {
      if (dados._id) {
        const { data } = await axios.put(`http://localhost:3000/api/anuncio/${dados._id}`, dados, { withCredentials: true });
        setAnuncios((prev) => prev.map((a) => (a._id === data._id ? data : a)));
      } else {
        const { data } = await axios.post("http://localhost:3000/api/anuncio", dados, { withCredentials: true });
        setAnuncios((prev) => [...prev, data]);
      }
      setModoEdicao(undefined);
    } catch (err) {
      console.error("Erro ao guardar anúncio:", err);
    }
  }

  async function removerAnuncio(id) {
    try {
      await axios.delete(`http://localhost:3000/api/anuncio/${id}`, { withCredentials: true });
      setAnuncios((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error("Erro ao remover anúncio:", err);
    }
  }

  return (
    <div className="perfil-container">
      <div className="main-layout">
        <main className="content">
          <TopNavbar />

          <div className="anuncios-wrapper">
            <div className="filtro-pesquisa">
              <input
                className="input-pesquisa-global"
                placeholder="O que procuras?"
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
              />

              <select
                className="select-filtro"
                value={criterioOrdenacao}
                onChange={(e) => setCriterio(e.target.value)}
              >
                <option value="data-desc">Mais recentes</option>
                <option value="data-asc">Mais antigos</option>
                <option value="titulo-asc">Título A-Z</option>
                <option value="titulo-desc">Título Z-A</option>
              </select>

              <button className="btn-novo" onClick={() => setModoEdicao(null)}>
                + Novo anúncio
              </button>
            </div>

            <section className="anuncios-grid">
              {ordenados.length ? (
                ordenados.map((a) => (
                  <article key={a._id} className="anuncio-card">
                    <div className="card-topo" onClick={() => setSelecionado(a)}>
                      <h3>{a.titulo}</h3>
                      <time>{new Date(a.data).toLocaleDateString("pt-PT")}</time>
                    </div>
                    <p className="descricao-limitada">
                      {a.descricao?.length > 150
                        ? `${a.descricao.slice(0, 147)}…`
                        : a.descricao}
                    </p>
                    <div className="acoes">
                      <button onClick={() => setModoEdicao(a)}>✎</button>
                      <button onClick={() => removerAnuncio(a._id)}>🗑️</button>
                    </div>
                  </article>
                ))
              ) : (
                <p>Não há anúncios para mostrar.</p>
              )}
            </section>
          </div>
        </main>
      </div>

      <AnuncioModal anuncio={selecionado} onClose={() => setSelecionado(null)} />

      {modoEdicao !== undefined && (
        <FormularioModal
          anuncio={modoEdicao}
          onClose={() => setModoEdicao(undefined)}
          onSubmit={guardarAnuncio}
        />
      )}
    </div>
  );
}
