import { useEffect, useState, useMemo } from "react";
import "../styles/Home.css";
import axios from "axios";
import ProdutoCard from "../components/ProdutoCard";
import NavBar from "../components/NavBar";
import CategoriasSideBar from "../components/CategoriasSideBar";
import Pagination from "../components/Pagination";

const limit = 30;

export default function Home() {
    const [produtos, setProdutos] = useState([]);
    const [produtosBusca, setProdutosBusca] = useState(null);
    const [carrossel, setCarrossel] = useState({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // ======================================================
    // CARREGAMENTO NORMAL (quando NÃO está em modo de busca)
    // ======================================================
    useEffect(() => {
        if (produtosBusca !== null) return;

        const carregar = async () => {
            try {
                setLoading(true);

                const url = `http://localhost:3000/produtos/page/${page}/limit/${limit}`;
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
    // PAGINAÇÃO LOCAL (modo busca)
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
    // LISTA FINAL MEMORIZADA
    // ======================================================
    const listaFinal = useMemo(() => {
        return produtosBusca ? getProdutosPaginados() : produtos;
    }, [produtosBusca, produtos, page]);

    // ======================================================
    // REMOVER DUPLICADOS DA LISTA FINAL (produto_id)
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
    // ATUALIZAR CARROSSEL SOMENTE PARA PRODUTOS NOVOS
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

    // ======================================================
    // PRÉ-CARREGAMENTO DAS IMAGENS
    // ======================================================
    useEffect(() => {
        listaFinalSemDuplicados.forEach(produto => {
            produto.fotos?.forEach(url => {
                const img = new Image();
                img.src = url;
            });
        });
    }, [listaFinalSemDuplicados]);

    // ======================================================
    // CONTROLES DO CARROSSEL
    // ======================================================
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

    return (
        <div>
            <NavBar ResultsSearch={setProdutosBusca} />

            <div className="catalogo-wrapper">
                <CategoriasSideBar />

                <div className="catalogo-container">
                    <h1 className="catalogo-titulo">Produtos</h1>

                    {loading && <p style={{ textAlign: "center" }}>Carregando...</p>}

                    <div className="catalogo-grid">
                        {listaFinalSemDuplicados.map((p) => (
                            <ProdutoCard
                                key={p.produto_id}
                                p={p}
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
