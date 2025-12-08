import React from "react";
import "../styles/CategoriasSideBar.css";

export default function CategoriasSideBar() {
    return (
          <aside className="categorias-sidebar">
                <h2>Categorias</h2>
                <ul>
                    <li>Todas</li>
                    <li>Eletrônicos</li>
                    <li>Roupas</li>
                    <li>Calçados</li>
                    <li>Acessórios</li>
                    <li>Casa & Jardim</li>
                    <li>Automotivo</li>
                </ul>
            </aside>
    );
}