import { useEffect, useState, useRef, memo } from "react";
import "../styles/Home.css";
import axios from "axios";

const limit = 30; // número por página (ajustável)

// 🔥 Componente otimizado com memo()
// Só re-renderiza quando props mudam
const ProdutoCard = memo(function ProdutoCard({ p, indexAtual, nextImg, prevImg }) {

    const midias = p.midias || [];
    const totalImagens = midias.length;

    // Carrega somente UMA imagem atual
    const m = midias[indexAtual] || null;

    const imagemAtual = m
        ? `https://magazord-public.s3.sa-east-1.amazonaws.com/rodapeshop/${m.path}${m.arquivo_nome}`
        : "/sem-imagem.png";

    return (
        <div className="produto-card" key={p.produto_id}>
            
            {/* CARROSSEL */}
            <div className="carrossel-container">
                <img
                    loading="lazy"
                    src={imagemAtual}
                    alt={p.nome}
                    className="carrossel-img"
                />

                {totalImagens > 1 && (
                    <>
                        <button
                            className="carrossel-btn esquerda"
                            onClick={() => prevImg(p.produto_id, totalImagens)}
                        >
                            &#8249;
                        </button>

                        <button
                            className="carrossel-btn direita"
                            onClick={() => nextImg(p.produto_id, totalImagens)}
                        >
                            &#8250;
                        </button>
                    </>
                )}
            </div>

            <h2 className="produto-nome">{p.nome}</h2>

            <p className="produto-info"><strong>Marca:</strong> {p.marca}</p>
            <p className="produto-info"><strong>Modelo:</strong> {p.modelo}</p>

            <p className="produto-preco">R$ {p.valor.toFixed(2)}</p>

            {p.valor_de && (
                <p className="produto-preco-de">De: R$ {p.valor_de.toFixed(2)}</p>
            )}
        </div>
    );
});

export default function Home() {
    const [produtos, setProdutos] = useState([]);
    const [carrossel, setCarrossel] = useState({});
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const sentinelaRef = useRef(null);

    // 🔥 Paginação incremental (infinite scroll)
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

                // Inicializa carrossel apenas para novos produtos
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

    // 🔥 Observer para carregar mais quando chegar ao final
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

    // Trocar imagem para frente
    const nextImg = (produtoId, total) => {
        setCarrossel(prev => ({
            ...prev,
            [produtoId]: (prev[produtoId] + 1) % total
        }));
    };

    // Trocar imagem para trás
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
                        midias={p.midias}
                        indexAtual={carrossel[p.produto_id] ?? 0}
                        nextImg={nextImg}
                        prevImg={prevImg}
                    />
                ))}
            </div>

            {/* SENTINELA DO INFINITE SCROLL */}
            <div ref={sentinelaRef} style={{ height: "40px" }}></div>

            {loading && <p style={{ textAlign: "center" }}>Carregando...</p>}
        </div>
    );
}
