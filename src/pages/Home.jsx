import { useEffect, useState, useRef } from "react";
import "../styles/Home.css";
import axios from "axios";
import ProdutoCard from "../components/ProdutoCard";  // ⬅ IMPORTADO

const limit = 60;

export default function Home() {
    const [produtos, setProdutos] = useState([]);
    const [carrossel, setCarrossel] = useState({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const sentinelaRef = useRef(null);

    useEffect(() => {
        if (!hasMore || loading) return;

        const carregar = async () => {
            try {
                setLoading(true);

                const response = await axios.get(
                    `http://localhost:3000/produtos/page/${page}/limit/${limit}`
                );

                const data = response.data?.data || {};
                const items = data.items || [];

                setProdutos(prev => [...prev, ...items]);

                setCarrossel(prev => {
                    const novo = { ...prev };
                    items.forEach(p => {
                        if (novo[p.produto_id] == null) {
                            novo[p.produto_id] = 0;
                        }
                    });
                    return novo;
                });

                setHasMore(data.has_more === true);
                setLoading(false);
            } catch (err) {
                console.error("Erro ao carregar página:", page, err);
                setLoading(false);
                setHasMore(false);
            }
        };

        carregar();
    }, [page]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage(p => p + 1);
                }
            },
            { rootMargin: "300px" }
        );

        if (sentinelaRef.current) observer.observe(sentinelaRef.current);

        return () => observer.disconnect();
    }, [hasMore, loading]);

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
        <div className="catalogo-container">
            <h1 className="catalogo-titulo">Produtos</h1>

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

            <div ref={sentinelaRef} style={{ height: "40px" }} />

            {loading && <p style={{ textAlign: "center" }}>Carregando...</p>}
        </div>
    );
}
