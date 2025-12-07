import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
    const [produtos, setProdutos] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3000/produtos")
            .then(response => {
                const items = response.data?.data?.items;

                if (Array.isArray(items)) {
                    setProdutos(items);
                } else {
                    console.error("A API não retornou um array em data.items:", items);
                    setProdutos([]);
                }
            })
            .catch(error => {
                console.error("Erro ao carregar produtos:", error);
            });
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h1>Produtos</h1>

            {produtos.map((p) => {
                // pega primeira imagem
                const imagemPrincipal = p.midias?.length
                    ? `https://magazord-public.s3.sa-east-1.amazonaws.com/rodapeshop/${p.midias[0].path}${p.midias[0].arquivo_nome}`
                    : "/sem-imagem.png";

                return (
                    <div key={p.produto_id}>
                        <img
                            src={imagemPrincipal}
                            alt={p.nome}
                            style={{ width: "180px", marginBottom: "10px" }}
                        />

                        <h2>{p.nome}</h2>

                        <p><strong>Marca:</strong> {p.marca}</p>
                        <p><strong>Modelo:</strong> {p.modelo}</p>

                        <p><strong>Preço:</strong> R$ {p.valor}</p>

                        {p.valor_de &&
                            <p>De: R$ {p.valor_de}</p>
                        }

                        <p><strong>Estoque:</strong> {p.qtde_estoque}</p>

                        <p><strong>Complemento:</strong> {p.complemento}</p>

                        <a href={`/produto/${p.link}`}>
                            Ver Produto
                        </a>

                        <h3>Características</h3>
                        <ul>
                            {p.caracteristicas.map((c, i) => (
                                <li key={i}>
                                    <strong>{c.nome}</strong>{" "}
                                    {c.procar_valor ||
                                        (c.carlis_valor
                                            ? c.carlis_valor.join(", ")
                                            : "")
                                    }
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
}