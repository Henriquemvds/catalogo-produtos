import React, { useEffect, useState } from "react";
import "../styles/CategoriasSideBar.css";

export default function CategoriasSideBar() {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [abertos, setAbertos] = useState({}); // controla quais dropdowns estão abertos

    // IDs que devem ser ocultados
    const IDS_OCULTAR = [6, 105, 113, 129, 132, 141, 146, 185, 197, 239, 240, 475, 459, 233, ];

    // -------------------------------------------------------------------
    // Remove categorias bloqueadas + todos os filhos desses IDs
    // -------------------------------------------------------------------
    const filtrarCategoriasComFilhos = (lista, idsOcultar) => {
        const ocultar = new Set(idsOcultar);
        let mudou = true;

        while (mudou) {
            mudou = false;

            lista.forEach(cat => {
                if (ocultar.has(cat.pai)) {
                    if (!ocultar.has(cat.id)) {
                        ocultar.add(cat.id);
                        mudou = true;
                    }
                }
            });
        }

        return lista.filter(cat => !ocultar.has(cat.id));
    };

    // -------------------------------------------------------------------
    // Transformar categorias planas em árvore pai → filhos
    // -------------------------------------------------------------------
    const construirArvore = (categorias) => {
        const mapa = {};

        categorias.forEach(cat => {
            mapa[cat.id] = { ...cat, filhos: [] };
        });

        const raiz = [];

        categorias.forEach(cat => {
            if (cat.pai === null) {
                raiz.push(mapa[cat.id]);
            } else {
                if (mapa[cat.pai]) {
                    mapa[cat.pai].filhos.push(mapa[cat.id]);
                }
            }
        });

        return raiz;
    };

    // -------------------------------------------------------------------
    // Carregar categorias com paginação automática
    // -------------------------------------------------------------------
    useEffect(() => {
        const carregarTodasCategorias = async () => {
            try {
                let todas = [];
                let page = 1;
                const limit = 100;
                let continuar = true;

                while (continuar) {
                    const response = await fetch(
                        `http://localhost:3000/categorias/page/${page}/limit/${limit}`
                    );
                    const result = await response.json();

                    const items = result?.data?.items || [];

                    todas = [...todas, ...items];

                    if (items.length < limit) continuar = false;
                    else page++;
                }

                // Remover ocultadas
                const filtradas = filtrarCategoriasComFilhos(todas, IDS_OCULTAR);

                // Construir árvore pai → filhos
                const arvore = construirArvore(filtradas);

                setCategorias(arvore);
                setLoading(false);
            } catch (error) {
                console.error("Erro ao carregar categorias:", error);
                setLoading(false);
            }
        };

        carregarTodasCategorias();
    }, []);

    // -------------------------------------------------------------------
    // Função de toggle de categorias abertas
    // -------------------------------------------------------------------
    const toggle = (id) => {
        setAbertos(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // -------------------------------------------------------------------
    // Render recursivo dos pais + filhos + animação
    // -------------------------------------------------------------------
    const renderCategoria = (cat) => {
        const aberto = abertos[cat.id] || false;
        const temFilhos = cat.filhos.length > 0;

        return (
            <li key={cat.id} className="categoria-item">
                
                <div className="categoria-header" onClick={() => temFilhos && toggle(cat.id)}>
                    {temFilhos && (
                        <span className={`seta ${aberto ? "aberta" : ""}`}>
                            ▼
                        </span>
                    )}
                    {cat.nome}
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
        <aside className="categorias-sidebar">
            <h2>Categorias</h2>

            {loading && <p>Carregando...</p>}

            <ul className="lista-categorias">
                <li className="categoria-item">Todas</li>

                {categorias.map(cat => renderCategoria(cat))}
            </ul>
        </aside>
    );
}
