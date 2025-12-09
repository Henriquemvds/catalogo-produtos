import { useEffect, useState } from "react";
import "../styles/Home.css";
import axios from "axios";
import ProdutoCard from "../components/ProdutoCard";
import NavBar from "../components/NavBar";
import CategoriasSideBar from "../components/CategoriasSideBar";
import Pagination from "../components/Pagination";

const limit = 30;

export default function Home() {
    const [produtos, setProdutos] = useState([]);
    const [produtosBusca, setProdutosBusca] = useState(null); // <-- resultados da busca
    const [carrossel, setCarrossel] = useState({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // ===========================
    // MODO NORMAL (sem busca)
    // ===========================
    useEffect(() => {
        if (produtosBusca !== null) return; // se estiver buscando, não carregar API normal

        const carregar = async () => {
            try {
                setLoading(true);

                const url = `http://localhost:3000/produtos/page/${page}/limit/${limit}`;
                const response = await axios.get(url);

                const data = response.data?.data || {};
                const items = data.items || [];
                const total = data.total || 0;

                setTotalPages(Math.ceil(total / limit));

                // remover duplicados
                const mapa = new Map();
                const filtrados = items.filter(p => {
                    const chave = `${p.produto_id}|${p.nome.toLowerCase()}`;
                    if (mapa.has(chave)) return false;
                    mapa.set(chave, true);
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
    }, [page, limit, produtosBusca]);



    // ===========================
    // MODO BUSCA (paginate localmente)
    // ===========================
    const getProdutosPaginados = () => {
        if (!produtosBusca) return produtos;
        const inicio = (page - 1) * limit;
        const fim = inicio + limit;
        return produtosBusca.slice(inicio, fim);
    };

    // Atualiza totalPages dinamicamente quando é busca
    useEffect(() => {
        if (produtosBusca) {
            setTotalPages(Math.ceil(produtosBusca.length / limit));
            setPage(1); // reseta para página 1
        }
    }, [produtosBusca]);



    // ===========================
    // RECRIAR CARROSSEL SEMPRE
    // ===========================
    useEffect(() => {
        const lista = produtosBusca ? getProdutosPaginados() : produtos;

        const novo = {};
        lista.forEach((p) => {
            novo[p.produto_id] = 0;
        });
        setCarrossel(novo);
    }, [produtos, produtosBusca, page]);



    // ===========================
    // CONTROLES CARROSSEL
    // ===========================
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


    const listaFinal = produtosBusca ? getProdutosPaginados() : produtos;



    return (
        <div>
            <NavBar ResultsSearch={setProdutosBusca} /> {/* agora envia para produtosBusca */}

            <div className="catalogo-wrapper">
                <CategoriasSideBar />

                <div className="catalogo-container">
                    <h1 className="catalogo-titulo">Produtos</h1>

                    {loading && <p style={{ textAlign: "center" }}>Carregando...</p>}

                    <div className="catalogo-grid">
                        {listaFinal.map((p, index) => (
                            <ProdutoCard
                                key={`${p.produto_id}-${index}`}
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
