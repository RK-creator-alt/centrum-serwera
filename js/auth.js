```javascript
/* =====================================================
   AUTH
===================================================== */

async function registerPlayer() {

    const email = $("registerEmail").value.trim();
    const password = $("registerPassword").value;
    const password2 = $("registerPassword2").value;
    const minecraftNick = $("registerNick").value.trim();

    if (!email || !password || !minecraftNick) {
        alert("Uzupełnij wszystkie pola.");
        return;
    }

    if (password !== password2) {
        alert("Hasła nie są takie same.");
        return;
    }

    const { data, error } =
        await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: minecraftNick,
                    display_name: minecraftNick,
                    minecraft_nick: minecraftNick
                }
            }
        });

    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }

    alert("Konto zostało utworzone. Możesz się teraz zalogować.");

    showLogin();
}


async function login() {

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


async function logout() {

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

    showLogin();
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

    if ($("topUser")) {
        $("topUser").textContent = username;
    }

    if ($("profileMinecraftNick")) {
        $("profileMinecraftNick").textContent =
            currentProfile.minecraft_nick || "-";
    }

    if ($("profileEmail")) {
        $("profileEmail").textContent =
            currentUser?.email || "-";
    }

    if ($("profileDisplayName")) {
        $("profileDisplayName").textContent =
            currentProfile.display_name ||
            currentProfile.username ||
            "-";
    }

    if ($("profileCreatedAt")) {
        $("profileCreatedAt").textContent =
            currentProfile.created_at
                ? datePL(currentProfile.created_at)
                : "-";
    }

    if ($("adminNotice")) {
        $("adminNotice").classList.toggle(
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
```
