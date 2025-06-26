import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "../anuncios.css";
import TopNavbar from "../components/TopNavbar";
import { NavLink } from "react-router-dom";

/* ---------- Modal simples ---------- */
function AnuncioModal({ anuncio, onClose }) {
    if (!anuncio) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>

                <h3>{anuncio.titulo}</h3>
                <p className="meta">
                    {new Date(anuncio.data).toLocaleString("pt-PT")}
                    {" · "}{anuncio.dono}
                </p>

                <p>{anuncio.descricao}</p>

                <p><strong>Instituições:</strong> {anuncio.instituicoes?.join(", ")}</p>
            </div>
        </div>
    );
}

/* ---------- Página de Anúncios ---------- */
export default function Anuncios() {
    const [anuncios, setAnuncios]           = useState([]);
    const [termoPesquisa, setTermoPesquisa] = useState("");
    const [criterioOrdenacao, setCriterio]  = useState("data-desc");
    const [selecionado, setSelecionado]     = useState(null);       // ← para o modal

    /* 1. Busca inicial  */
    useEffect(() => {
        axios.get("http://localhost:3000/api/anuncio/veraluno", { withCredentials: true })
            .then(r => setAnuncios(r.data))
            .catch(err => console.error("Erro ao buscar anúncios:", err));
    }, []);

    /* 2. Filtra por termo */
    const filtrados = useMemo(() => (
        anuncios.filter(a =>
            a.titulo?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
            a.descricao?.toLowerCase().includes(termoPesquisa.toLowerCase())
        )
    ), [anuncios, termoPesquisa]);

    /* 3. Ordena conforme critério */
    const ordenados = useMemo(() => {
        const lista = [...filtrados];
        switch (criterioOrdenacao) {
            case "titulo-asc":  return lista.sort((a, b) => a.titulo.localeCompare(b.titulo));
            case "titulo-desc": return lista.sort((a, b) => b.titulo.localeCompare(a.titulo));
            case "data-asc":    return lista.sort((a, b) => new Date(a.data) - new Date(b.data));
            default:            return lista.sort((a, b) => new Date(b.data) - new Date(a.data));
        }
    }, [filtrados, criterioOrdenacao]);

    return (
        <div className="perfil-container">
            <div className="main-layout">

                {/* Conteúdo principal */}
                <main className="content">
                    <TopNavbar />

                    <div className="anuncios-wrapper">
                        {/* Pesquisa + ordenação */}
                        <div className="filtro-pesquisa">
                            <input
                                className="input-pesquisa-global"
                                placeholder="O que procuras?"
                                value={termoPesquisa}
                                onChange={e => setTermoPesquisa(e.target.value)}
                            />

                            <select
                                className="select-filtro"
                                value={criterioOrdenacao}
                                onChange={e => setCriterio(e.target.value)}
                            >
                                <option value="data-desc">Mais recentes</option>
                                <option value="data-asc">Mais antigos</option>
                                <option value="titulo-asc">Título A-Z</option>
                                <option value="titulo-desc">Título Z-A</option>
                            </select>
                        </div>

                        {/* Grid */}
                        <section className="anuncios-grid">
                            {ordenados.length ? (
                                ordenados.map(a => (
                                    <article
                                        key={a._id}
                                        className="anuncio-card"
                                        onClick={() => setSelecionado(a)}
                                    >
                                        <h3>{a.titulo}</h3>
                                        <time>{new Date(a.data).toLocaleDateString("pt-PT")}</time>

                                        <p className="descricao-limitada">
                                            {a.descricao?.length > 150
                                                ? `${a.descricao.slice(0, 147)}…`
                                                : a.descricao}
                                        </p>
                                    </article>
                                ))
                            ) : (
                                <p>Não há anúncios para mostrar.</p>
                            )}
                        </section>
                    </div>
                </main>
            </div>

            {/* Modal */}
            <AnuncioModal anuncio={selecionado} onClose={() => setSelecionado(null)} />
        </div>
    );
}
