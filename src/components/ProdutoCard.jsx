import { memo } from "react";
import "../styles/ProdutoCard.css";

const ProdutoCard = memo(function ProdutoCard({ p, indexAtual, nextImg, prevImg }) {
    const midias = p.midias || [];
    const totalImagens = midias.length;

    return (
        <div className="produto-card" key={p.produto_id}>

            {/* CARROSSEL */}
            <div className="carrossel-container">

                <div
                    className="carrossel-slide"
                    style={{
                        width: `${totalImagens * 100}%`,
                        transform: `translateX(-${indexAtual * (100 / totalImagens)}%)`,
                    }}
                >
                    {midias.map((m, idx) => {
                        const url = `https://magazord-public.s3.sa-east-1.amazonaws.com/rodapeshop/${m.path}${m.arquivo_nome}`;
                        return (
                            <img
                                key={idx}
                                loading="lazy"
                                src={url}
                                alt={p.nome}
                                className="carrossel-img"
                                style={{ width: `${100 / totalImagens}%` }}
                            />
                        );
                    })}
                </div>

                {/* BOTÕES */}
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

            {/* INFORMAÇÕES DO PRODUTO */}
            <h2 className="produto-nome">{p.nome}</h2>

            <p className="produto-info">
                <strong>Marca:</strong> {p.marca}
            </p>

            <p className="produto-info">
                <strong>Modelo:</strong> {p.modelo}
            </p>

            <p className="produto-preco">R$ {p.valor.toFixed(2)}</p>

            {p.valor_de && (
                <p className="produto-preco-de">
                    De: R$ {p.valor_de.toFixed(2)}
                </p>
            )}
        </div>
    );
});

export default ProdutoCard;
