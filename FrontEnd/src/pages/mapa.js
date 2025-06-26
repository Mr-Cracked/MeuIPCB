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
            { id:"A4", roomLabel:"Sala A4", x:18, y:18, w:34, h:36 },
            { id:"A5", roomLabel:"Sala A5", x:36, y:30, w:34, h:36 },
            { id:"A6", roomLabel:"Sala A6", x:31, y:30, w:34, h:36 },
            { id:"A7", roomLabel:"Sala A7", x:27.5, y:30, w:34, h:36 },
            { id:"A8", roomLabel:"Sala A8", x:23.5, y:30, w:34, h:36 },
            { id:"A9", roomLabel:"Sala A9", x:20, y:30, w:34, h:36 },
            { id:"A10", roomLabel:"Sala A10", x:15.5, y:30, w:34, h:36 }
        ]}
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
