import { useEffect, useState, useMemo } from "react";
import "../styles/Home.css";
import axios from "axios";
import ProdutoCard from "../components/ProdutoCard";
import NavBar from "../components/NavBar";
import CategoriasSideBar from "../components/CategoriasSideBar";
import Pagination from "../components/Pagination";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Firebase";

const limit = 30;

export default function Home() {
    const [produtos, setProdutos] = useState([]);
    const [produtosBusca, setProdutosBusca] = useState(null);
    const [carrossel, setCarrossel] = useState({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // ✅ porcentagens carregadas de uma vez só
    const [porcentagensFirebase, setPorcentagensFirebase] = useState({});
    const [valoresFinais, setValoresFinais] = useState({});

    // ======================================================
    // ✅ CARREGAR PORCENTAGENS DO FIREBASE (1 requisição)
    // ======================================================
    useEffect(() => {
        async function carregarPorcentagens() {
            try {
                const snap = await getDocs(collection(db, "produtos"));

                const mapa = {};
                snap.forEach(doc => {
                    mapa[doc.id] = doc.data().porcentagem || 0;
                });

                setPorcentagensFirebase(mapa);
            } catch (error) {
                console.error("Erro ao carregar porcentagens:", error);
            }
        }

        carregarPorcentagens();
    }, []);

    // ======================================================
    // ✅ CARREGAMENTO NORMAL (API)
    // ======================================================
    useEffect(() => {
        if (produtosBusca !== null) return;

        const carregar = async () => {
            try {
                setLoading(true);

                const url = `https://servidor-magazord.vercel.app/produtos/page/${page}/limit/${limit}`;
                const response = await axios.get(url);

                const data = response.data?.data || {};
                const items = data.items || [];
                const total = data.total || 0;

                setTotalPages(Math.ceil(total / limit));

                // Remove duplicados por produto_id
                const mapa = new Map();
                const filtrados = items.filter(p => {
                    if (mapa.has(p.produto_id)) return false;
                    mapa.set(p.produto_id, true);
                    return true;
                });

                setProdutos(filtrados);
                setLoading(false);

            } catch (err) {
                console.error("Erro ao carregar:", err);
                setLoading(false);
            }
        };

        carregar();
    }, [page, produtosBusca]);

    // ======================================================
    // ✅ PAGINAÇÃO LOCAL (modo busca)
    // ======================================================
    const getProdutosPaginados = () => {
        if (!produtosBusca) return produtos;

        const inicio = (page - 1) * limit;
        return produtosBusca.slice(inicio, inicio + limit);
    };

    useEffect(() => {
        if (produtosBusca) {
            setTotalPages(Math.ceil(produtosBusca.length / limit));
            setPage(1);
        }
    }, [produtosBusca]);

    // ======================================================
    // ✅ LISTA FINAL MEMORIZADA
    // ======================================================
    const listaFinal = useMemo(() => {
        return produtosBusca ? getProdutosPaginados() : produtos;
    }, [produtosBusca, produtos, page]);

    // ======================================================
    // ✅ REMOVER DUPLICADOS
    // ======================================================
    const listaFinalSemDuplicados = useMemo(() => {
        const mapa = new Map();
        return listaFinal.filter(p => {
            if (mapa.has(p.produto_id)) return false;
            mapa.set(p.produto_id, true);
            return true;
        });
    }, [listaFinal]);

    // ======================================================
    // ✅ CALCULAR VALORES FINAIS (instantâneo)
    // ======================================================
    useEffect(() => {
        const novosValores = {};

        for (const p of listaFinalSemDuplicados) {
            const porcentagem = porcentagensFirebase[p.codigo] || 0;

            const acrescimo = p.valor * (porcentagem / 100);
            const novoValor = p.valor + acrescimo;

            novosValores[p.produto_id] = novoValor;
        }

        setValoresFinais(novosValores);
    }, [listaFinalSemDuplicados, porcentagensFirebase]);

    // ======================================================
    // ✅ CARROSSEL
    // ======================================================
    useEffect(() => {
        setCarrossel(prev => {
            const novo = { ...prev };

            listaFinalSemDuplicados.forEach(p => {
                if (!(p.produto_id in novo)) {
                    novo[p.produto_id] = 0;
                }
            });

            return novo;
        });
    }, [listaFinalSemDuplicados]);

    const nextImg = (produtoId, total) => {
        setCarrossel(prev => ({
            ...prev,
            [produtoId]: (prev[produtoId] + 1) % total
        }));
    };

    const prevImg = (produtoId, total) => {
        setCarrossel(prev => ({
            ...prev,
            [produtoId]: (prev[produtoId] - 1 + total) % total
        }));
    };

    // ======================================================
    // ✅ SCROLL
    // ======================================================
    const scrollToProducts = () => {
        const section = document.querySelector(".catalogo-container");
        if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // ======================================================
    // ✅ RENDER
    // ======================================================
    return (
        <div>
            <NavBar ResultsSearch={setProdutosBusca} ScrollToProducts={scrollToProducts} />

            <div className="catalogo-wrapper">
                <CategoriasSideBar />

                <div className="catalogo-container">
                    <h1 className="catalogo-titulo">Produtos</h1>

                    {!loading && listaFinalSemDuplicados.length === 0 && (
                        <p style={{
                            textAlign: "center",
                            fontSize: "20px",
                            width: "100%",
                            padding: "40px 0",
                            color: "#555"
                        }}>
                            Ops... Não temos no nosso catálogo, tente buscar outro.
                        </p>
                    )}

                    {loading && <p style={{ textAlign: "center" }}>Carregando...</p>}

                    <div className="catalogo-grid">
                        {listaFinalSemDuplicados.map((p) => (
                            <ProdutoCard
                                key={p.produto_id}
                                p={p}
                                valorFinal={valoresFinais[p.produto_id] ?? p.valor}
                                indexAtual={carrossel[p.produto_id] ?? 0}
                                nextImg={nextImg}
                                prevImg={prevImg}
                            />
                        ))}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        setCurrentPage={setPage}
                    />
                </div>
            </div>
        </div>
    );
}
