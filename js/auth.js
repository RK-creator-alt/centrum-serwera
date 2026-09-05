
```js
/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://qbhmbawqdgzplwtboqal.supabase.co";

/*
   Wklej tutaj swój AKTUALNY PUBLISHABLE KEY.
   Nie używaj secret/service_role.
*/
const SUPABASE_KEY =
    "sb_publishable_Ixd8sxNPq3e8ImNjmHr9RQ_tOGNGPO9";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   GLOBAL STATE
===================================================== */

let currentUser = null;
let currentProfile = null;

let players = [];
let selectedPlayer = null;
let selectedPlayerProperties = [];

let taxDefinitions = [];
let licenseDefinitions = [];
let feeDefinitions = [];
let serverSettings = null;


/* =====================================================
   HELPERS
===================================================== */

function $(id) {
    return document.getElementById(id);
}

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

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
    if (!value) {
        return "-";
    }

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return value;
    }

    return d.toLocaleDateString("pl-PL");
}

function statusBadge(status) {

    let text = status;

    if (status === "paid") {
        text = "Opłacone";
    }

    if (status === "unpaid") {
        text = "Nieopłacone";
    }

    if (status === "cancelled") {
        text = "Anulowane";
    }

    if (status === "active") {
        text = "Aktywna";
    }

    if (status === "expired") {
        text = "Wygasła";
    }

    const cls =
        status === "paid" || status === "active"
            ? "badge badge-paid"
            : status === "cancelled"
                ? "badge badge-cancelled"
                : "badge badge-unpaid";

    return `<span class="${cls}">${escapeHtml(text)}</span>`;
}


/* =====================================================
   ADMIN CHECK
===================================================== */

function isAdmin() {
    return currentProfile?.role === "admin";
}


/* =====================================================
   PAGE NAVIGATION
===================================================== */

/*
   UWAGA:
   Nawigacja jest zdefiniowana tylko tutaj.

   Nie deklarujemy drugi raz:
   - pages
   - hideAllPages()
   - goHome()
   - openMyTaxes()
   - itd.

   Dzięki temu nie występuje błąd:
   "Identifier 'pages' has already been declared"
*/

const pages = [
    "homePage",
    "urzadPage",
    "myTaxesPage",
    "myLicensesPage",
    "myFeesPage",
    "mySalariesPage",
    "myPropertiesPage",
    "taxRulesPage",
    "courtPage",
    "adminPage"
];


function hideAllPages() {

    pages.forEach(id => {

        const page = $(id);

        if (page) {
            page.classList.add("hidden");
        }

    });
}


function goHome() {

    hideAllPages();

    const page = $("homePage");

    if (page) {
        page.classList.remove("hidden");
    }

    if (typeof renderHomeProfile === "function") {
        renderHomeProfile();
    }

    if (typeof loadServerSettings === "function") {
        loadServerSettings();
    }
}


async function openMyTaxes() {

    hideAllPages();

    const page = $("myTaxesPage");

    if (page) {
        page.classList.remove("hidden");
    }

    if (typeof loadMyTaxes === "function") {
        await loadMyTaxes();
    }
}


async function openMyLicenses() {

    hideAllPages();

    const page = $("myLicensesPage");

    if (page) {
        page.classList.remove("hidden");
    }

    if (typeof loadMyLicenses === "function") {
        await loadMyLicenses();
    }
}


async function openMyFees() {

    hideAllPages();

    const page = $("myFeesPage");

    if (page) {
        page.classList.remove("hidden");
    }

    if (typeof loadMyFees === "function") {
        await loadMyFees();
    }
}


async function openMyProperties() {

    hideAllPages();

    const page = $("myPropertiesPage");

    if (page) {
        page.classList.remove("hidden");
    }

    if (typeof loadMyProperties === "function") {
        await loadMyProperties();
    }
}


async function openMySalaries() {

    hideAllPages();

    const page = $("mySalariesPage");

    if (page) {
        page.classList.remove("hidden");
    }

    if (typeof loadMySalaries === "function") {
        await loadMySalaries();
    }
}


async function openTaxRules() {

    hideAllPages();

    const page = $("taxRulesPage");

    if (page) {
        page.classList.remove("hidden");
    }

    /*
       W zależności od wersji taxRules.js używana jest
       jedna z tych funkcji.
    */

    if (typeof renderTaxRules === "function") {
        await renderTaxRules();
    } else if (typeof loadDefinitions === "function") {
        await loadDefinitions();
    }
}


async function openCourt() {

    hideAllPages();

    const page = $("courtPage");

    if (page) {
        page.classList.remove("hidden");
    }

    if (typeof loadCourtPublic === "function") {
        await loadCourtPublic();
    }
}


async function openAdmin() {

    if (!isAdmin()) {
        return;
    }

    hideAllPages();

    const page = $("adminPage");

    if (page) {
        page.classList.remove("hidden");
    }

    if (typeof loadAdminData === "function") {
        await loadAdminData();
    }
}
```
