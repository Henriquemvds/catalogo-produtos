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
    const [carrossel, setCarrossel] = useState({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

 useEffect(() => {
    const carregar = async () => {
        try {
            setLoading(true);

            const url = `http://localhost:3000/produtos/page/${page}/limit/${limit}`;
            const response = await axios.get(url);

            const data = response.data?.data || {};
            const items = data.items || [];
            const total = data.total || 0;

            setTotalPages(Math.ceil(total / limit));

            // 🔥 FILTRAR DUPLICADOS SÓ DENTRO DA PÁGINA ATUAL
            const mapa = new Map();
            const filtrados = items.filter(p => {
                const chave = `${p.produto_id}|${p.nome.toLowerCase()}`;
                if (mapa.has(chave)) return false;
                mapa.set(chave, true);
                return true;
            });

            // 🔥 Agora sim: redefine produtos sem acumular páginas
            setProdutos(filtrados);

            // Reseta carrossel apenas com os itens filtrados
            setCarrossel(() => {
                const novo = {};
                filtrados.forEach(p => {
                    novo[p.produto_id] = 0;
                });
                return novo;
            });

            setLoading(false);
        } catch (err) {
            console.error("Erro ao carregar:", err);
            setLoading(false);
        }
    };

    carregar();
}, [page, limit]);

    // Controles de carrossel
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
            <NavBar />

            <div className="catalogo-wrapper">
                <CategoriasSideBar />

                <div className="catalogo-container">
                    <h1 className="catalogo-titulo">Produtos</h1>

                    {loading && <p style={{ textAlign: "center" }}>Carregando...</p>}

                    <div className="catalogo-grid">
                        {produtos.map((p) => (
                            <ProdutoCard
                                key={p.produto_id}
                                p={p}
                                indexAtual={carrossel[p.produto_id] ?? 0}
                                nextImg={nextImg}
                                prevImg={prevImg}
                            />
                        ))}
                    </div>

                    {/* Paginação */}
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
