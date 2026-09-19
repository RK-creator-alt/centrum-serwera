/* =====================================================
   SUPABASE
===================================================== */

window.supabaseClient =
    window.supabase.createClient(
        "https://qbhmbawqdgzplwtboqal.supabase.co",
        "sb_publishable_Ixd8sxNPq3e8ImNjmHr9RQ_tOGNGPO9"
    );

/* =====================================================
   GLOBAL STATE
   Stored on window so this file cannot collide with an older
   inline script that may still exist in index.html.
===================================================== */

window.currentUser = window.currentUser ?? null;
window.currentProfile = window.currentProfile ?? null;
window.players = window.players ?? [];
window.selectedPlayer = window.selectedPlayer ?? null;
window.selectedPlayerProperties = window.selectedPlayerProperties ?? [];
window.taxDefinitions = window.taxDefinitions ?? [];
window.licenseDefinitions = window.licenseDefinitions ?? [];
window.feeDefinitions = window.feeDefinitions ?? [];
window.serverSettings = window.serverSettings ?? null;

/* =====================================================
   HELPERS
===================================================== */

function $(id) {
    return document.getElementById(id);
}

function escapeHtml(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function money(value) {
    return `${Number(value || 0).toFixed(2)} DX`;
}

function datePL(value) {
    if (!value) return "-";

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return value;
    }

    return d.toLocaleDateString("pl-PL");
}

function statusBadge(status) {

    let text = status;

    if (status === "paid") text = "Opłacone";
    if (status === "unpaid") text = "Nieopłacone";
    if (status === "cancelled") text = "Anulowane";
    if (status === "active") text = "Aktywna";
    if (status === "expired") text = "Wygasła";

    const cls =
        status === "paid" || status === "active"
            ? "badge badge-paid"
            : status === "cancelled"
                ? "badge badge-cancelled"
                : "badge badge-unpaid";

    return `<span class="${cls}">${escapeHtml(text)}</span>`;
}

