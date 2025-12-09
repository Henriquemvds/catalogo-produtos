export function getPageNumbers(currentPage, totalPages) {
    const pages = [];
    const maxButtons = 5;

    if (totalPages <= maxButtons) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages;
    }

    pages.push("first");

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (start > 2) {
        pages.push(1);
        pages.push("...");
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (end < totalPages - 1) {
        pages.push("...");
        pages.push(totalPages);
    }

    pages.push("last");

    return pages;
}
