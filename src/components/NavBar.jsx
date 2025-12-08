import React from "react";
import "../styles/NavBar.css";
import logo from "../images/logo.webp";

export default function NavBar() {
    return (
        <nav className="navbar">
            {/* Logo */}
            <div className="nav-logo">

                <img src={logo} alt="Logo RodapeShop" className="nav-logo-img" />
            </div>


            {/* Menu */}
            <div className="nav-menu">
               <h3>Conheça nosso Catalogo de produtos</h3>
            </div>


            {/* Botão CTA */}
            <div class="search-wrapper">
                <input type="search" className="nav-cta" placeholder="O que você Procura?" />
                <span className="search-icon">🔍</span>
            </div>


        </nav>
    );
}