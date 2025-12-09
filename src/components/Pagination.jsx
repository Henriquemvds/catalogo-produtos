import { getPageNumbers } from "../data/Pagination";
import "../styles/Pagination.css";

export default function Pagination({ currentPage, totalPages, setCurrentPage }) {
    return (
        <div className="pagination">

            {getPageNumbers(currentPage, totalPages).map((num, index) => {

                if (num === "first") {
                    return (
                        <button key={index} onClick={() => setCurrentPage(1)}>
                            Primeira
                        </button>
                    );
                }

                if (num === "last") {
                    return (
                        <button key={index} onClick={() => setCurrentPage(totalPages)}>
                            Última
                        </button>
                    );
                }

                if (num === "...") {
                    return <span key={index}>...</span>;
                }

                return (
                    <button
                        key={index}
                        className={currentPage === num ? "active" : ""}
                        onClick={() => setCurrentPage(num)}
                    >
                        {num}
                    </button>
                );
            })}
        </div>
    );
}
