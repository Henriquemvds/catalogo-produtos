import React, { useEffect, useState } from "react";
import "../styles/CategoriasSideBar.css";

export default function CategoriasSideBar() {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [abertos, setAbertos] = useState({}); // controla dropdowns e o menu mobile

    const IDS_OCULTAR = [6, 105, 113, 129, 132, 141, 146, 185, 197, 239, 240, 475, 459, 233];

    // --------------------------------------------------------------
    // Remove categorias ocultas + seus descendentes
    // --------------------------------------------------------------
    const filtrarCategoriasComFilhos = (lista, idsOcultar) => {
        const ocultar = new Set(idsOcultar);
        let mudou = true;

        while (mudou) {
            mudou = false;
            lista.forEach(cat => {
                if (ocultar.has(cat.pai) && !ocultar.has(cat.id)) {
                    ocultar.add(cat.id);
                    mudou = true;
                }
            });
        }

        return lista.filter(cat => !ocultar.has(cat.id));
    };

    // --------------------------------------------------------------
    // Construir árvore pai → filhos
    // --------------------------------------------------------------
    const construirArvore = (categorias) => {
        const mapa = {};
        categorias.forEach(cat => mapa[cat.id] = { ...cat, filhos: [] });

        const raiz = [];
        categorias.forEach(cat => {
            if (cat.pai === null) raiz.push(mapa[cat.id]);
            else if (mapa[cat.pai]) mapa[cat.pai].filhos.push(mapa[cat.id]);
        });

        return raiz;
    };

    // --------------------------------------------------------------
    // Carregamento paginado automático
    // --------------------------------------------------------------
    useEffect(() => {
        const carregar = async () => {
            try {
                let todas = [];
                let page = 1;
                const limit = 100;
                let continuar = true;

                while (continuar) {
                    const res = await fetch(
                        `https://servidor-magazord.vercel.app/page/${page}/limit/${limit}`
                    );
                    const result = await res.json();
                    const items = result?.data?.items || [];

                    todas = [...todas, ...items];

                    if (items.length < limit) continuar = false;
                    else page++;
                }

                const filtradas = filtrarCategoriasComFilhos(todas, IDS_OCULTAR);
                const arvore = construirArvore(filtradas);

                setCategorias(arvore);
                setLoading(false);
            } catch (err) {
                console.error("Erro ao carregar categorias:", err);
                setLoading(false);
            }
        };

        carregar();
    }, []);

    // --------------------------------------------------------------
    // Toggle de categorias abertas
    // --------------------------------------------------------------
    const toggle = (id) => {
        setAbertos(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // --------------------------------------------------------------
    // Render recursivo com hover (desktop) + clique (mobile)
    // --------------------------------------------------------------
    const renderCategoria = (cat) => {
        const aberto = abertos[cat.id] || false;
        const temFilhos = cat.filhos.length > 0;

        return (
            <li key={cat.id} className="categoria-item">
                <div
                    className="categoria-header"
                    onClick={() => temFilhos && toggle(cat.id)}
                >
                    {cat.nome}

                    {temFilhos && (
                        <span className={`seta ${aberto ? "aberta" : ""}`}>▼</span>
                    )}
                </div>

                {temFilhos && (
                    <ul className={`sublista ${aberto ? "mostrar" : ""}`}>
                        {cat.filhos.map(filho => renderCategoria(filho))}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <>
            {/* Botão hambúrguer fixo para celulares */}
            <button
                className="hamburguer-btn"
                onClick={() => setAbertos(prev => ({ ...prev, menu: !prev.menu }))}
            >
                ☰
            </button>

            {/* Sidebar */}
            <aside className={`categorias-sidebar ${abertos.menu ? "mostrar-menu" : ""}`}>
                
                <h2>Todas as categorias</h2>

                {loading && <p>Carregando...</p>}

                <ul className="lista-categorias">
                    {categorias.map(cat => renderCategoria(cat))}
                </ul>
            </aside>

            {/* Overlay escuro quando o menu estiver aberto */}
            {abertos.menu && (
                <div
                    className="menu-overlay"
                    onClick={() => setAbertos(prev => ({ ...prev, menu: false }))}
                />
            )}
        </>
    );
}
