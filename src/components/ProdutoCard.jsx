import { memo } from "react";
import "../styles/ProdutoCard.css";

const ProdutoCard = memo(function ProdutoCard({ p, valorFinal, indexAtual, nextImg, prevImg }) {


    const midias = p.midias || [];
    const totalImagens = midias.length;



    return (
        <div className="produto-card" key={p.produto_id}>

            {/* CARROSSEL */}
            <div className="carrossel-container">
                <div
                    className="carrossel-slide"
                    style={{ transform: `translateX(-${indexAtual * 100}%)` }}
                >
                    {midias.map((m, idx) => {
                        const url = `https://magazord-public.s3.sa-east-1.amazonaws.com/rodapeshop/${m.path}${m.arquivo_nome}`;
                        return (
                            <img
                                key={idx}
                                loading="lazy"
                                decoding="async"
                                src={url}
                                alt={p.nome}
                                className="carrossel-img"
                            />
                        );
                    })}
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

            {/* INFORMAÇÕES DO PRODUTO */}
            <h2 className="produto-nome">{p.nome}</h2>

            <p className="produto-info">
                <strong>Cod:</strong> {p.codigo}
            </p>

            <p className="produto-info">
                <strong>Marca:</strong> {p.marca}
            </p>

            <p className="produto-info">
                <strong>Modelo:</strong> {p.modelo}
            </p>

           
      
    <p className="produto-preco">R$ {Number(valorFinal).toFixed(2)}</p>

      

        </div>
    );
});

export default ProdutoCard;
