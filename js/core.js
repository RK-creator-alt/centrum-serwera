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
    return currentProfile &&
        currentProfile.role === "admin";
}


/* =====================================================
   PAGE NAVIGATION
===================================================== */

const pages = [
    "homePage",
    "myTaxesPage",
    "myLicensesPage",
    "myFeesPage",
    "mySalariesPage",
    "myPropertiesPage",
    "courtPage",
    "taxRulesPage",
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

    $("homePage").classList.remove("hidden");

    if (typeof renderHomeProfile === "function") {
        renderHomeProfile();
    }

    if (typeof loadServerSettings === "function") {
        loadServerSettings();
    }
}

async function openMyTaxes() {

    hideAllPages();

    $("myTaxesPage").classList.remove("hidden");

    await loadMyTaxes();
}

async function openMyLicenses() {

    hideAllPages();

    $("myLicensesPage").classList.remove("hidden");

    await loadMyLicenses();
}

async function openMyFees() {

    hideAllPages();

    $("myFeesPage").classList.remove("hidden");

    await loadMyFees();
}

async function openMyProperties() {

    hideAllPages();

    $("myPropertiesPage").classList.remove("hidden");

    await loadMyProperties();
}

async function openMySalaries() {

    hideAllPages();

    $("mySalariesPage").classList.remove("hidden");

    await loadMySalaries();
}

async function openCourt() {

    hideAllPages();

    $("courtPage").classList.remove("hidden");

    await loadCourtPublic();
}

async function openTaxRules() {

    hideAllPages();

    $("taxRulesPage").classList.remove("hidden");

    await renderTaxRules();
}

async function openAdmin() {

    if (!isAdmin()) {
        return;
    }

    hideAllPages();

    $("adminPage").classList.remove("hidden");

    await loadAdminData();
}
