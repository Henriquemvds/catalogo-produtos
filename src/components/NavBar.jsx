import React, { useState } from "react";
import "../styles/NavBar.css";
import logo from "../images/logo.webp";

export default function NavBar({ ResultsSearch }) {
    const [searchText, setSearchText] = useState("");

    const handleSearch = async () => {
        if (!searchText.trim()) return;

        try {
            const response = await fetch(`http://localhost:3000/produtos/search?q=${encodeURIComponent(searchText)}`);
            const data = await response.json();

            console.log("Resultado da busca:", data);

            // 🔥 AGORA ENVIA PARA O COMPONENTE PAI
            ResultsSearch(data);

        } catch (error) {
            console.error("Erro ao buscar:", error);
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-logo">
                <img src={logo} alt="Logo RodapeShop" className="nav-logo-img" />
            </div>

            <div className="nav-menu">
                <h3>Conheça nosso Catálogo de produtos</h3>
            </div>

            <div className="search-wrapper">
                <input
                    type="search"
                    className="nav-cta"
                    placeholder="O que você procura?"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                <span className="search-icon" onClick={handleSearch} style={{ cursor: "pointer" }}>
                    🔍
                </span>
            </div>
        </nav>
    );
}