import React, { useState } from "react";
import "../styles/NavBar.css";
import logo from "../images/logo.webp";

export default function NavBar({ ResultsSearch, ScrollToProducts }) {
    const [searchText, setSearchText] = useState("");

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    try {
        const response = await fetch(`https://servidor-magazord.vercel.app/produtos/search?q=${encodeURIComponent(searchText)}`);
        const data = await response.json();

        // envia resultados ao pai
        ResultsSearch(data);

        // desce para os produtos
        setTimeout(() => {
            ScrollToProducts();
        }, 50);

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
                     inputMode="search"
                    className="nav-cta"
                    placeholder="O que você procura?"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearch();
                        }
                    }}
                />

                <span className="search-icon" onClick={handleSearch} style={{ cursor: "pointer" }}>
                    🔍
                </span>
            </div>
        </nav>
    );
}