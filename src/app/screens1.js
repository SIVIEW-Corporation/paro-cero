"use client";
import React, { useState } from "react";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

import {
    ASSETS, PLANS, complianceData, downtimeData, tipoData, topFallas,
    STC, STL, PRC, PRL, CRC, TT
} from "./data";

import {
    Badge, KpiCard, Td, PageHeader, Card, CardTitle, RowData, BtnPrimary, BtnGhost, BtnBack, DataTable, Modal, Field, ModalFooter
} from "./ui";

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export function LoginScreen({ onLogin }) {
    const [email, setEmail] = useState("supervisor@apex.com");
    const [pass, setPass] = useState("demo1234");
    const [error, setError] = useState("");

    function handleLogin() {
        if (!email.trim()) { setError("Ingresa un correo electronico."); return; }
        if (!pass.trim()) { setError("Ingresa una contrasena."); return; }
        setError("");
        onLogin();
    }

    return (
        <div style={{ minHeight: "100vh", background: "#060e20", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(30,58,95,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(30,58,95,0.15) 1px,transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(circle,rgba(245,158,11,0.06) 0%,transparent 65%)", pointerEvents: "none" }} />

            <div style={{ width: 440, position: "relative", zIndex: 1 }}>
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                        <div style={{ width: 46, height: 46, background: "#f59e0b", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: 26, fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.03em", lineHeight: 1 }}>APEX <span style={{ color: "#f59e0b" }}>Maintenance</span></div>
                            <div style={{ fontSize: 11, color: "#334155", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>Sistema de Gestion de Mantenimiento</div>
                        </div>
                    </div>
                </div>

                <Card style={{ padding: 36 }}>
                    <Field label="Correo electronico">
                        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@empresa.com" />
                    </Field>
                    <Field label="Contrasena">
                        <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Contrasena"
                            onKeyDown={e => { if (e.key === "Enter") handleLogin(); }} />
                    </Field>

                    {error && (
                        <div style={{ background: "#ef444420", border: "1px solid #ef444450", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 16 }}>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        style={{ width: "100%", background: "#f59e0b", color: "#000", fontWeight: 800, fontSize: 15, padding: "13px", borderRadius: 8, border: "none", cursor: "pointer", letterSpacing: "0.02em", fontFamily: "inherit" }}>
                        Iniciar Sesion →
                    </button>

                    <div style={{ marginTop: 20, padding: "14px", background: "#0a1628", borderRadius: 7, border: "1px solid #1e3a5f" }}>
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>Credenciales de Demo</div>
                        <div style={{ fontSize: 12, color: "#475569", fontFamily: "monospace" }}>supervisor@apex.com / demo1234</div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export function Dashboard({ wo }) {
    const open = wo.filter(w => !["completado", "cancelado"].includes(w.status)).length;
    const overdue = wo.filter(w => w.status === "vencido").length;
    const completed = wo.filter(w => w.status === "completado").length;
    const totalDownMin = wo.reduce((s, w) => s + (w.downtime || 0), 0);
    const upcoming = wo.filter(w => ["pendiente", "asignado"].includes(w.status));

    return (
        <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%" }}>
            <PageHeader title="Panel de Control" sub="Visibilidad operativa en tiempo real · 7 de marzo 2026" />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 24 }}>
                <KpiCard label="OT Abiertas" value={open} sub="ordenes activas" color="#f59e0b" icon="📂" />
                <KpiCard label="OT Vencidas" value={overdue} sub="requieren atencion" color="#ef4444" icon="⏰" />
                <KpiCard label="Completadas" value={completed} sub="este mes" color="#22c55e" icon="✅" />
                <KpiCard label="Cumplimiento PM" value="68%" sub="meta: 90%" color="#3b82f6" icon="📊" />
                <KpiCard label="Horas de Paro" value={`${Math.round(totalDownMin / 60)}h`} sub="acumuladas" color="#f97316" icon="⚠" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
                <Card>
                    <CardTitle>Cumplimiento PM — Ultimos 6 Meses (%)</CardTitle>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={complianceData}>
                            <defs>
                                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                            <XAxis dataKey="mes" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                            <Tooltip contentStyle={TT} />
                            <Area type="monotone" dataKey="val" stroke="#3b82f6" fill="url(#cg)" strokeWidth={2.5} name="Cumplimiento %" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
                <Card>
                    <CardTitle>Mix de Ordenes de Trabajo</CardTitle>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={tipoData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={68} paddingAngle={4}>
                                {tipoData.map((d, i) => <Cell key={i} fill={d.color} />)}
                            </Pie>
                            <Tooltip contentStyle={TT} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Card>
                    <CardTitle>Pendientes y Proximas a Vencer</CardTitle>
                    {upcoming.length === 0
                        ? <p style={{ fontSize: 13, color: "#475569", textAlign: "center", padding: "16px 0" }}>Sin pendientes</p>
                        : upcoming.map(w => (
                            <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #0d1f38" }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{w.titulo}</div>
                                    <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>{w.asignado} · Vence {w.fechaVen}</div>
                                </div>
                                <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 12 }}>
                                    <Badge label={PRL[w.prioridad]} color={PRC[w.prioridad]} />
                                </div>
                            </div>
                        ))
                    }
                </Card>
                <Card>
                    <CardTitle>Top Fallas por Activo</CardTitle>
                    {topFallas.map((f, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #0d1f38" }}>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <span style={{ fontSize: 12, fontFamily: "monospace", color: i === 0 ? "#ef4444" : i === 1 ? "#f97316" : "#475569", fontWeight: 800, width: 18, textAlign: "center" }}>{i + 1}</span>
                                <span style={{ fontSize: 13, color: "#e2e8f0" }}>{f.asset}</span>
                            </div>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <span style={{ fontSize: 12, fontFamily: "monospace", color: "#ef4444", fontWeight: 700 }}>{f.count} fallas</span>
                                <span style={{ fontSize: 12, fontFamily: "monospace", color: "#f97316" }}>{f.down}h</span>
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
        </div>
    );
}

// ─── ASSETS ───────────────────────────────────────────────────────────────────
export function AssetsScreen({ wo }) {
    const [search, setSearch] = useState("");
    const [filterArea, setFilterArea] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [selected, setSelected] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    const areas = [...new Set(ASSETS.map(a => a.area))];
    const filtered = ASSETS.filter(a => {
        const q = search.toLowerCase();
        return (a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q))
            && (!filterArea || a.area === filterArea)
            && (!filterStatus || a.status === filterStatus);
    });

    if (selected) {
        const assetWOs = wo.filter(w => w.assetId === selected.id);
        const assetPlans = PLANS.filter(p => p.assetId === selected.id);
        return (
            <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%" }}>
                <BtnBack onClick={() => setSelected(null)} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #1e3a5f" }}>
                    <div>
                        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#f59e0b", marginBottom: 5, letterSpacing: "0.05em" }}>{selected.code}</div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>{selected.name}</h1>
                        <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{selected.area}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <Badge label={STL[selected.status]} color={STC[selected.status]} />
                        <Badge label={"Criticidad " + selected.criticidad} color={CRC[selected.criticidad]} />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <Card>
                        <CardTitle>Ficha Tecnica</CardTitle>
                        <RowData label="Fabricante" value={selected.fabricante} />
                        <RowData label="Modelo" value={selected.modelo} />
                        <RowData label="N de Serie" value={<span style={{ fontFamily: "monospace", fontSize: 12 }}>{selected.serie}</span>} />
                        <RowData label="Fecha instalacion" value={selected.instalacion} />
                        <RowData label="Area" value={selected.area} />
                    </Card>
                    <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
                        <CardTitle>Acceso Rapido QR</CardTitle>
                        <div style={{ width: 120, height: 120, background: "#060e20", border: "1px solid #1e3a5f", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="88" height="88" viewBox="0 0 88 88">
                                <rect x="2" y="2" width="36" height="36" fill="none" stroke="#f59e0b" strokeWidth="3" />
                                <rect x="12" y="12" width="16" height="16" fill="#f59e0b" />
                                <rect x="50" y="2" width="36" height="36" fill="none" stroke="#f59e0b" strokeWidth="3" />
                                <rect x="60" y="12" width="16" height="16" fill="#f59e0b" />
                                <rect x="2" y="50" width="36" height="36" fill="none" stroke="#f59e0b" strokeWidth="3" />
                                <rect x="12" y="60" width="16" height="16" fill="#f59e0b" />
                                <rect x="50" y="50" width="10" height="10" fill="#f59e0b" />
                                <rect x="68" y="50" width="10" height="10" fill="#f59e0b" />
                                <rect x="50" y="68" width="10" height="10" fill="#f59e0b" />
                                <rect x="68" y="68" width="10" height="10" fill="#f59e0b" />
                                <rect x="59" y="59" width="10" height="10" fill="#1e3a5f" />
                            </svg>
                        </div>
                        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#f59e0b" }}>apex.app/{selected.code}</div>
                        <BtnGhost onClick={() => { }}>Descargar QR</BtnGhost>
                    </Card>
                </div>

                <Card style={{ marginBottom: 16 }}>
                    <CardTitle>Planes de Mantenimiento Asociados</CardTitle>
                    {assetPlans.length === 0
                        ? <p style={{ fontSize: 13, color: "#475569" }}>Sin planes asignados.</p>
                        : <DataTable head={["Plan", "Frecuencia", "Actividades", "Duracion", "Prioridad", "Estado"]}>
                            {assetPlans.map(p => (
                                <tr key={p.id}>
                                    <Td bold>{p.name}</Td>
                                    <Td mono>Cada {p.freq} {p.unit}</Td>
                                    <Td mono>{p.items.length} items</Td>
                                    <Td mono>{p.duracion}h</Td>
                                    <Td><Badge label={PRL[p.prioridad]} color={PRC[p.prioridad]} /></Td>
                                    <Td><Badge label={p.activo ? "Activo" : "Inactivo"} color={p.activo ? "#22c55e" : "#64748b"} /></Td>
                                </tr>
                            ))}
                        </DataTable>
                    }
                </Card>

                <Card>
                    <CardTitle>Historial de Ordenes de Trabajo</CardTitle>
                    {assetWOs.length === 0
                        ? <p style={{ fontSize: 13, color: "#475569" }}>Sin historial de ordenes.</p>
                        : <DataTable head={["Folio", "Titulo", "Tipo", "Status", "Vencimiento", "Paro"]}>
                            {assetWOs.map(w => (
                                <tr key={w.id}>
                                    <Td mono>{w.folio}</Td>
                                    <Td>{w.titulo}</Td>
                                    <Td><Badge label={w.tipo === "preventivo" ? "Preventivo" : "Correctivo"} color={w.tipo === "preventivo" ? "#3b82f6" : "#ef4444"} /></Td>
                                    <Td><Badge label={STL[w.status]} color={STC[w.status]} /></Td>
                                    <Td mono>{w.fechaVen}</Td>
                                    <Td mono>{w.downtime ? w.downtime + " min" : "—"}</Td>
                                </tr>
                            ))}
                        </DataTable>
                    }
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: "28px 32px", overflowY: "auto", height: "100%" }}>
            <PageHeader
                title="Activos"
                sub={filtered.length + " de " + ASSETS.length + " equipos"}
                action={<BtnPrimary onClick={() => setShowCreate(true)}>+ Nuevo Activo</BtnPrimary>}
            />

            <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o codigo..." style={{ maxWidth: 340 }} />
                <select value={filterArea} onChange={e => setFilterArea(e.target.value)} style={{ maxWidth: 220 }}>
                    <option value="">Todas las areas</option>
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 200 }}>
                    <option value="">Todos los estados</option>
                    {["activo", "detenido", "mantenimiento", "descomisionado"].map(s => <option key={s} value={s}>{STL[s]}</option>)}
                </select>
            </div>

            <Card style={{ padding: 0, overflow: "hidden" }}>
                <DataTable head={["Codigo", "Nombre", "Area", "Estado", "Criticidad", ""]}>
                    {filtered.map(a => (
                        <tr key={a.id} style={{ cursor: "pointer" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#0f2040"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <Td mono>{a.code}</Td>
                            <Td bold>{a.name}</Td>
                            <Td>{a.area}</Td>
                            <Td><Badge label={STL[a.status]} color={STC[a.status]} /></Td>
                            <Td><Badge label={a.criticidad.charAt(0).toUpperCase() + a.criticidad.slice(1)} color={CRC[a.criticidad]} /></Td>
                            <Td><BtnGhost onClick={() => setSelected(a)}>Ver detalle</BtnGhost></Td>
                        </tr>
                    ))}
                </DataTable>
            </Card>

            {showCreate && (
                <Modal title="Registrar Nuevo Activo" onClose={() => setShowCreate(false)}>
                    <Field label="Codigo de Equipo"><input defaultValue="EQP-008" /></Field>
                    <Field label="Nombre del Equipo"><input placeholder="Ej: Bomba centrifuga #3" /></Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Area"><select><option>Planta de Utilidades</option><option>Linea de Empaque A</option><option>Taller Central</option><option>Almacen Principal</option></select></Field>
                        <Field label="Criticidad"><select><option>baja</option><option>media</option><option>alta</option></select></Field>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Fabricante"><input placeholder="Ej: Atlas Copco" /></Field>
                        <Field label="Modelo"><input placeholder="Ej: GA55" /></Field>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="N de Serie"><input placeholder="Ej: ATC-2026-001" /></Field>
                        <Field label="Fecha de Instalacion"><input type="date" /></Field>
                    </div>
                    <ModalFooter onCancel={() => setShowCreate(false)} onConfirm={() => setShowCreate(false)} confirmLabel="Crear Activo" />
                </Modal>
            )}
        </div>
    );
}
