/* =====================================================
   AUTH
===================================================== */

async function registerUser() {

    const email = $("registerEmail").value.trim();
    const password = $("registerPassword").value;
    const username = $("registerUsername").value.trim();
    const minecraftNick = $("registerMinecraftNick").value.trim();

    if (!email || !password || !username || !minecraftNick) {
        alert("Uzupełnij wszystkie pola.");
        return;
    }

    const { data, error } =
        await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                    display_name: username,
                    minecraft_nick: minecraftNick
                }
            }
        });

    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }

    alert(
        "Konto zostało utworzone. Możesz się teraz zalogować."
    );

    showLogin();
}


async function loginUser() {

    const email = $("loginEmail").value.trim();
    const password = $("loginPassword").value;

    if (!email || !password) {
        alert("Podaj email i hasło.");
        return;
    }

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }

    currentUser = data.user;

    await loadProfile();
    await showApp();
}


async function logoutUser() {

    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }

    currentUser = null;
    currentProfile = null;

    $("authScreen").classList.remove("hidden");
    $("app").classList.add("hidden");
}


function showLogin() {

    $("loginForm").classList.remove("hidden");
    $("registerForm").classList.add("hidden");

    if ($("loginTab")) {
        $("loginTab").classList.add("active");
    }

    if ($("registerTab")) {
        $("registerTab").classList.remove("active");
    }
}


function showRegister() {

    $("loginForm").classList.add("hidden");
    $("registerForm").classList.remove("hidden");

    if ($("loginTab")) {
        $("loginTab").classList.remove("active");
    }

    if ($("registerTab")) {
        $("registerTab").classList.add("active");
    }
}


async function loadProfile() {

    if (!currentUser) {
        return;
    }

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle();

    if (error) {
        console.error("Błąd pobierania profilu:", error);
        return;
    }

    currentProfile = data;

    renderProfile();
}


function renderProfile() {

    if (!currentProfile) {
        return;
    }

    const username =
        currentProfile.minecraft_nick ||
        currentProfile.username ||
        currentProfile.display_name ||
        currentUser?.email ||
        "Gracz";

    const role =
        currentProfile.role === "admin"
            ? "Administrator"
            : "Gracz";

    if ($("profileName")) {
        $("profileName").textContent = username;
    }

    if ($("profileRole")) {
        $("profileRole").textContent = role;
    }

    if ($("profileAvatar")) {
        $("profileAvatar").textContent =
            username.charAt(0).toUpperCase();
    }

    if ($("adminButton")) {
        $("adminButton").classList.toggle(
            "hidden",
            !isAdmin()
        );
    }
}


async function showApp() {

    $("authScreen").classList.add("hidden");
    $("app").classList.remove("hidden");

    goHome();

    if (typeof loadServerSettings === "function") {
        await loadServerSettings();
    }

    if (typeof loadMyTaxes === "function") {
        await loadMyTaxes();
    }

    if (typeof loadMyLicenses === "function") {
        await loadMyLicenses();
    }

    if (typeof loadMyFees === "function") {
        await loadMyFees();
    }

    if (typeof loadMySalaries === "function") {
        await loadMySalaries();
    }

    if (typeof loadMyProperties === "function") {
        await loadMyProperties();
    }
}


/* =====================================================
   INIT AUTH
===================================================== */

async function initAuth() {

    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error) {
        console.error(error);
    }

    if (data?.session) {

        currentUser = data.session.user;

        await loadProfile();
        await showApp();

    } else {

        $("authScreen").classList.remove("hidden");
        $("app").classList.add("hidden");

        showLogin();
    }


    supabaseClient.auth.onAuthStateChange(
        async (event, session) => {

            if (event === "SIGNED_IN" && session) {

                currentUser = session.user;

                await loadProfile();
                await showApp();
            }

            if (event === "SIGNED_OUT") {

                currentUser = null;
                currentProfile = null;

                $("authScreen").classList.remove("hidden");
                $("app").classList.add("hidden");

                showLogin();
            }
        }
    );
}
