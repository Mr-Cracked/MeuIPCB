// src/pages/Mapa.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import TopNavbar from "../components/TopNavbar";
import "../mapa.css";               // caminho revisto

/* ---------- imagens ---------- */
import A0 from "../assets/mapas/Bloco A piso 0.png";
import A1 from "../assets/mapas/Bloco A piso 1.png";
import B0 from "../assets/mapas/Bloco B piso 0.png";
import B1 from "../assets/mapas/Bloco B piso 1.png";
import C0 from "../assets/mapas/Bloco C piso 0.png";
import C1 from "../assets/mapas/Bloco C piso 1.png";
import D0 from "../assets/mapas/Bloco D piso 0.png";
import D1 from "../assets/mapas/Bloco D piso 1.png";

const imgs   = { A:{0:A0,1:A1}, B:{0:B0,1:B1}, C:{0:C0,1:C1}, D:{0:D0,1:D1} };
const blocks = ["A","B","C","D"];

/* ---------- hot-spots ---------- */
const hotspots = {
    A: { 0: [
            { id:"auditorioA", roomLabel:"Auditório Bloco A - EST", x:20, y:49, w:34, h:36 }
        ],
        1:  [
            { id:"A1", roomLabel:"Sala A1", x:35, y:18, w:34, h:36 },
            { id:"A2", roomLabel:"Sala A2", x:29, y:18, w:34, h:36 },
            { id:"A3", roomLabel:"Sala A3", x:23, y:18, w:34, h:36 },
            { id:"A4", roomLabel:"Sala A4", x:17, y:18, w:34, h:36 },
            { id:"A5", roomLabel:"Sala A5", x:36, y:30, w:34, h:36 },
            { id:"A6", roomLabel:"Sala A6", x:31.5, y:30, w:34, h:36 },
            { id:"A7", roomLabel:"Sala A7", x:27, y:30, w:34, h:36 },
            { id:"A8", roomLabel:"Sala A8", x:23, y:30, w:34, h:36 },
            { id:"A9", roomLabel:"Sala A9", x:18.5, y:30, w:34, h:36 },
            { id:"A10", roomLabel:"Sala A10", x:14.5, y:30, w:34, h:36 }
        ]},
    B: { 0: [
            { id:"auditorioB", roomLabel:"Anfiteatro Bloco B - EST", x:28, y:25, w:34, h:36 }
        ],
        1:  [
            { id:"B4", roomLabel:"Sala B4", x:23.5, y:19.5, w:34, h:36 },
            { id:"B5", roomLabel:"Sala B5", x:36, y:20, w:34, h:36 },
            { id:"B6", roomLabel:"Sala B6", x:25, y:45, w:34, h:36 },
            { id:"B7", roomLabel:"Sala B7", x:35, y:45, w:34, h:36 },
        ]},
    C: { 0:  [
            { id:"C3", roomLabel:"Sala C3", x:41.5, y:45, w:34, h:36 },
            { id:"C4", roomLabel:"Sala C4", x:36, y:20, w:34, h:36 },
            { id:"C5", roomLabel:"Sala C5", x:25, y:20, w:34, h:36 },
            { id:"C6", roomLabel:"Sala C6", x:13, y:20, w:34, h:36 },
        ],
        1:  [
            { id:"C8", roomLabel:"Sala C8", x:18, y:15, w:34, h:36 },
            { id:"C9", roomLabel:"Sala C9", x:29, y:20, w:34, h:36 },
            { id:"C10", roomLabel:"Sala C10", x:36, y:20, w:34, h:36 },
            { id:"C11", roomLabel:"Sala C11", x:42, y:8, w:34, h:36 },
            { id:"C12", roomLabel:"Sala C12", x:50, y:8, w:34, h:36 },
            { id:"C13", roomLabel:"Sala C13", x:50, y:30, w:34, h:36 },
        ]},
    D: { 0:  [
            { id:"D7", roomLabel:"Sala D7", x:44, y:40, w:34, h:36 },
            { id:"D8", roomLabel:"Sala D8", x:44, y:20, w:34, h:36 },
            { id:"D9", roomLabel:"Sala D9", x:35, y:20, w:34, h:36 },
            { id:"D10", roomLabel:"Sala D10", x:27, y:20, w:34, h:36 },
            { id:"D11", roomLabel:"Sala D11", x:34, y:40, w:34, h:36 },
        ],
        1:  [
            { id:"D2", roomLabel:"Sala D2", x:12, y:18, w:34, h:36 },
            { id:"D3", roomLabel:"Sala D3", x:12, y:35, w:34, h:36 },
            { id:"D4", roomLabel:"Sala D4", x:36, y:35, w:34, h:36 },
            { id:"D5", roomLabel:"Sala D5", x:46, y:34, w:34, h:36 },
            { id:"D6", roomLabel:"Sala D6", x:46, y:20, w:34, h:36 },
            { id:"D7", roomLabel:"Sala D7", x:28, y:18, w:34, h:36 },
            { id:"D8", roomLabel:"Sala D8", x:36, y:18, w:34, h:36 },
        ]},

};



/* ---------- utilitários ---------- */
function processaHorario(arr = []) {
    const porDia = {};
    arr.forEach(({ dia, aulas = [] }) => (porDia[dia] ||= []).push(...aulas));
    Object.values(porDia).forEach(l => l.sort((a,b)=>a.hora_inicio.localeCompare(b.hora_inicio)));
    return porDia;
}
function gerarLinhasHorario(porDia){
    const dias=["Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira"];
    const blocos=new Set();
    dias.forEach(d=>(porDia[d]??[]).forEach(a=>blocos.add(`${a.hora_inicio} - ${a.hora_fim}`)));
    return[...blocos].sort().map(int=>(
        <tr key={int}>
            <td><strong>{int}</strong></td>
            {dias.map(dia=>{
                const a=(porDia[dia]??[]).find(x=>`${x.hora_inicio} - ${x.hora_fim}`===int);
                return(<td key={dia}>{a&&(<><div><strong>{a.disciplina}</strong></div>{a.turma&&<div>{a.turma}</div>}</>)}</td>);
            })}
        </tr>
    ));}

/* ---------- componente ---------- */
export default function Mapa(){
    const[block,setBlock]=useState("A");
    const[floor,setFloor]=useState(0);
    const[room,setRoom]=useState(null);
    const[horario,setHor]=useState({});
    const[loading,setLoad]=useState(false);

    useEffect(()=>{
        const o=document.body.style.overflow;
        document.body.style.overflow="auto";
        return()=>{document.body.style.overflow=o;};
    },[]);

    useEffect(()=>{
        if(!room)return;
        setLoad(true);
        axios.get("http://localhost:3000/api/escola/horariosSalas",{withCredentials:true})
            .then(r=>{
                const reg=r.data?.horariosSalas?.find(s=>s.sala===room);
                setHor(reg?processaHorario(reg.horario):{});
            })
            .catch(()=>setHor({erro:"Falha na ligação"}))
            .finally(()=>setLoad(false));
    },[room]);

    const zones=hotspots[block]?.[floor]??[];

    return(
        <div className="mapa-container">
            <TopNavbar/>

            {/* ---------- controlos ---------- */}
            <div className="mapa-controls">
                {blocks.map(b=>(
                    <button key={b} className={`block-btn ${b===block?"active":""}`} onClick={()=>setBlock(b)}>{b}</button>
                ))}
                <button className="floor-btn" onClick={()=>setFloor(f=>f?0:1)}>
                    Piso&nbsp;{floor}
                </button>
            </div>

            {/* ---------- planta + zonas ---------- */}
            <div className="mapa-plant-wrapper">
                <img src={imgs[block][floor]} alt="" className="map-image"/>

                {zones.map(z=>(
                    <div
                        key={z.id}
                        className="hotspot-wrapper"
                        style={{left:`${z.x}%`,top:`${z.y}%`,width:`${z.w}%`,height:`${z.h}%`}}
                    >
                        <button
                            className="hotspot-label-btn"
                            onClick={()=>setRoom(z.roomLabel)}
                            title={z.roomLabel}
                            style={{left:"calc(100% + 6px)",top:"50%"}}
                        >
                            {z.roomLabel}
                        </button>
                    </div>
                ))}
            </div>

            {/* ---------- modal horário ---------- */}
            {room&&(
                <div className="modal-overlay" onClick={()=>{setRoom(null);setHor({});}}>
                    <div className="modal-dialog" onClick={e=>e.stopPropagation()}>
                        <h3 style={{marginTop:0}}>{room}</h3>

                        {loading&&<p>A carregar…</p>}
                        {!loading&&horario.erro&&<p style={{color:"red"}}>{horario.erro}</p>}
                        {!loading&&!horario.erro&&Object.keys(horario).length===0&&<p>Sem dados disponíveis.</p>}

                        {!loading&&Object.keys(horario).length>0&&!horario.erro&&(
                            <div style={{overflowX:"auto"}}>
                                <table className="schedule-table">
                                    <thead><tr>{["Hora","Segunda","Terça","Quarta","Quinta","Sexta"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                                    <tbody>{gerarLinhasHorario(horario)}</tbody>
                                </table>
                            </div>
                        )}

                        <button className="modal-close-btn" onClick={()=>{setRoom(null);setHor({});}}>Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
}
