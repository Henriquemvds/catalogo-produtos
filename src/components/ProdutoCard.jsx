import { memo } from "react";

const ProdutoCard = memo(function ProdutoCard({ p, indexAtual, nextImg, prevImg }) {
    const midias = p.midias || [];
    const totalImagens = midias.length;

    const m = midias[indexAtual] || null;

    const imagemAtual = m
        ? `https://magazord-public.s3.sa-east-1.amazonaws.com/rodapeshop/${m.path}${m.arquivo_nome}`
        : "/sem-imagem.png";

    return (
        <div className="produto-card" key={p.produto_id}>
            
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
