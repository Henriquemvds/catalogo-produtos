import { useEffect, useState } from "react";
import "../styles/Home.css";
import axios from "axios";

export default function Home() {
    const [produtos, setProdutos] = useState([]);
    const [carrossel, setCarrossel] = useState({}); // estado global do carrossel

    useEffect(() => {
        axios.get("http://localhost:3000/produtos")
            .then(response => {
                const items = response.data?.data?.items;

                if (Array.isArray(items)) {
                    setProdutos(items);

                    // Inicializa o índice de cada produto como 0
                    const inicial = {};
                    items.forEach(p => inicial[p.produto_id] = 0);
                    setCarrossel(inicial);

                } else {
                    console.error("A API não retornou um array:", items);
                    setProdutos([]);
                }
            })
            .catch(error => {
                console.error("Erro ao carregar produtos:", error);
            });
    }, []);

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
                {produtos.map((p) => {

                    const midias = p.midias || [];
                    const totalImagens = midias.length;

                    const indexAtual = carrossel[p.produto_id] ?? 0;

                    const imagemAtual = totalImagens > 0
                        ? `https://magazord-public.s3.sa-east-1.amazonaws.com/rodapeshop/${midias[indexAtual].path}${midias[indexAtual].arquivo_nome}`
                        : "/sem-imagem.png";

                    return (
                        <div key={p.produto_id} className="produto-card">

                            {/* CARROSSEL */}
                            <div className="carrossel-container">
                                <div
                                    className="carrossel-slide"
                                    style={{ transform: `translateX(-${indexAtual * 100}%)` }}
                                >
                                    {midias.map((m, i) => (
                                        <img
                                            key={i}
                                            src={`https://magazord-public.s3.sa-east-1.amazonaws.com/rodapeshop/${m.path}${m.arquivo_nome}`}
                                            alt={p.nome}
                                            className="carrossel-img"
                                        />
                                    ))}
                                </div>

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

                            <p className="produto-preco">
                                R$ {p.valor.toFixed(2)}
                            </p>

                            {p.valor_de && (
                                <p className="produto-preco-de">De: R$ {p.valor_de.toFixed(2)}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
