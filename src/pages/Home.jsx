import { useEffect, useState, useMemo } from "react";
import "../styles/Home.css";
import axios from "axios";
import ProdutoCard from "../components/ProdutoCard";
import NavBar from "../components/NavBar";
import CategoriasSideBar from "../components/CategoriasSideBar";
import Pagination from "../components/Pagination";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Firebase";

const limit = 15;

export default function Home() {
    const [produtos, setProdutos] = useState([]);
    const [produtosBusca, setProdutosBusca] = useState(null);
    const [carrossel, setCarrossel] = useState({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    // ✅ Cache de custos por código
    const [custosCache, setCustosCache] = useState({});
    const [custosCarregados, setCustosCarregados] = useState(false);

    // ✅ Porcentagens do Firebase
    const [porcentagensFirebase, setPorcentagensFirebase] = useState({});

    // ✅ Preços finais
    const [valoresFinais, setValoresFinais] = useState({});

    // ======================================================
    // ✅ CARREGAR PORCENTAGENS DO FIREBASE
    // ======================================================
    useEffect(() => {
        async function carregarPorcentagens() {
            try {
                const snap = await getDocs(collection(db, "produtos"));

                const mapa = {};
                snap.forEach(doc => {
                    mapa[doc.id] = doc.data().porcentagem || 0;
                });

                setPorcentagensFirebase(mapa);
            } catch (error) {
                console.error("Erro ao carregar porcentagens:", error);
            }
        }

        carregarPorcentagens();
    }, []);

    // ======================================================
    // ✅ BUSCAR CUSTO POR CÓDIGO (com delay)
    // ======================================================
    async function buscarCustoPorCodigo(codigo) {
        try {
            const url = `http://localhost:3000/custos/produto/${codigo}`;
            const response = await axios.get(url);

            // ✅ API retorna { data: [ {...} ] }
            const item = response.data?.data?.[0] || null;
            const custo = item?.custoVirtual ?? null;

            // ✅ Salvar no cache
            setCustosCache(prev => ({
                ...prev,
                [codigo]: custo
            }));

            // ✅ Delay para não travar API
            await new Promise(res => setTimeout(res, 200));

            return custo;
        } catch (err) {
            console.error("Erro ao buscar custo por código:", codigo, err);
            return null;
        }
    }

    // ======================================================
    // ✅ CARREGAR CUSTOS PARA OS PRODUTOS DA PÁGINA
    // ======================================================


    // ======================================================
    // ✅ CARREGAMENTO NORMAL (API DE PRODUTOS)
    // ======================================================
    useEffect(() => {
        if (produtosBusca !== null) return;

        const carregar = async () => {
            try {
                setLoading(true);

                const url = `https://servidor-magazord.vercel.app/produtos/page/${page}/limit/${limit}`;
                const response = await axios.get(url);

                const data = response.data?.data || {};
                const items = data.items || [];
                const total = data.total || 0;

                setTotalPages(Math.ceil(total / limit));

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
    // ✅ PAGINAÇÃO LOCAL (modo busca)
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
    // ✅ LISTA FINAL MEMORIZADA
    // ======================================================
    const listaFinal = useMemo(() => {
        return produtosBusca ? getProdutosPaginados() : produtos;
    }, [produtosBusca, produtos, page]);

    // ======================================================
    // ✅ REMOVER DUPLICADOS
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
    // ✅ CALCULAR VALORES FINAIS (CUSTO + PORCENTAGEM)
    // ======================================================
    useEffect(() => {
        const novos = {};

        for (const p of listaFinalSemDuplicados) {
            const codigo = String(p.codigo);
            const custo = custosCache[codigo];

            if (!custo || custo <= 0) {
                novos[p.produto_id] = null;
                continue;
            }

            const porcentagem = porcentagensFirebase[codigo] || 0;

            const acrescimo = custo * (porcentagem / 100);
            const precoFinal = custo + acrescimo;

            novos[p.produto_id] = precoFinal;
        }

        setValoresFinais(novos);
    }, [listaFinalSemDuplicados, custosCache, porcentagensFirebase]);

    // ======================================================
    // ✅ CARROSSEL
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

     useEffect(() => {
        async function carregarCustosDaPagina() {
            if (listaFinalSemDuplicados.length === 0) return;

            for (const p of listaFinalSemDuplicados) {
                const codigo = String(p.codigo);

                // ✅ Já está no cache?
                if (custosCache[codigo] !== undefined) continue;

                // ✅ Buscar com delay
                await buscarCustoPorCodigo(codigo);
            }

            setCustosCarregados(true);
        }

        carregarCustosDaPagina();
    }, [listaFinalSemDuplicados]);

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

    // ======================================================
    // ✅ SCROLL
    // ======================================================
    const scrollToProducts = () => {
        const section = document.querySelector(".catalogo-container");
        if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // ======================================================
    // ✅ RENDER
    // ======================================================
    return (
        <div>
        
                <>
                    <NavBar ResultsSearch={setProdutosBusca} ScrollToProducts={scrollToProducts} />

                    <div className="catalogo-wrapper">
                        <CategoriasSideBar />

                        <div className="catalogo-container">
                            <h1 className="catalogo-titulo">Produtos</h1>

                            {!loading && listaFinalSemDuplicados.length === 0 && (
                                <p style={{
                                    textAlign: "center",
                                    fontSize: "20px",
                                    width: "100%",
                                    padding: "40px 0",
                                    color: "#555"
                                }}>
                                    Ops... Não temos no nosso catálogo, tente buscar outro.
                                </p>
                            )}

                            {loading && <p style={{ textAlign: "center" }}>Carregando...</p>}

                            <div className="catalogo-grid">
                                {listaFinalSemDuplicados.map((p) => (
                                    <ProdutoCard
                                        key={p.produto_id}
                                        p={p}
                                        valorFinal={valoresFinais[p.produto_id]}
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
                </>
           
        </div>
    );
}
