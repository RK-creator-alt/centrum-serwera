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
    "securityPage",
    "courtPage",
    "taxRulesPage",
    "adminPage"
];

function hideAllPages() {

    pages.forEach(id => {
        $(id).classList.add("hidden");
    });
}

function goHome() {

    hideAllPages();

    $("homePage").classList.remove("hidden");

    renderHomeProfile();
    loadServerSettings();
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


async function openSecurity() {
    hideAllPages();
    $("securityPage").classList.remove("hidden");
    await loadSecurity();
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

    if (!isAdmin()) return;

    hideAllPages();

    $("adminPage").classList.remove("hidden");

    await loadAdminData();
}


/* =====================================================
   MY SALARIES
===================================================== */


async function init() {

    const {
        data
    } =
        await supabaseClient.auth.getSession();

    if (data.session) {

        currentUser =
            data.session.user;

        await loadProfile();

        await showApp();

    } else {

        $("authScreen")
            .classList.remove("hidden");

        $("app")
            .classList.add("hidden");
    }


    supabaseClient.auth.onAuthStateChange(
        async (event, session) => {

            if (event === "SIGNED_IN" && session) {

                currentUser =
                    session.user;

                await loadProfile();

                await showApp();
            }

            if (event === "SIGNED_OUT") {

                currentUser = null;
                currentProfile = null;

                $("authScreen")
                    .classList.remove("hidden");

                $("app")
                    .classList.add("hidden");
            }

        }
    );
}


/* =====================================================
   START
===================================================== */

init();

