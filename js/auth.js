function showMessage(text, type = "ok") {

    const box = $("authMessage");

    box.textContent = text;
    box.className = `message show ${type}`;
}

function hideMessage() {
    $("authMessage").className = "message";
}


/* =====================================================
   AUTH SCREENS
===================================================== */

function showLogin() {

    $("loginForm").classList.remove("hidden");
    $("registerForm").classList.add("hidden");

    $("loginTab").classList.add("primary");
    $("registerTab").classList.remove("primary");

    hideMessage();
}

function showRegister() {

    $("loginForm").classList.add("hidden");
    $("registerForm").classList.remove("hidden");

    $("loginTab").classList.remove("primary");
    $("registerTab").classList.add("primary");

    hideMessage();
}


/* =====================================================
   REGISTER
===================================================== */

async function registerPlayer() {

    hideMessage();

    const nick =
        $("registerNick").value.trim();

    const email =
        $("registerEmail").value.trim();

    const password =
        $("registerPassword").value;

    const password2 =
        $("registerPassword2").value;

    if (!nick || !email || !password) {

        showMessage(
            "Wypełnij wszystkie pola.",
            "error"
        );

        return;
    }

    if (password.length < 6) {

        showMessage(
            "Hasło musi mieć minimum 6 znaków.",
            "error"
        );

        return;
    }

    if (password !== password2) {

        showMessage(
            "Hasła nie są takie same.",
            "error"
        );

        return;
    }

    const { data, error } =
        await supabaseClient.auth.signUp({

            email,
            password,

            options: {
                data: {
                    username: nick,
                    display_name: nick,
                    minecraft_nick: nick
                }
            }

        });

    if (error) {

        showMessage(
            error.message,
            "error"
        );

        return;
    }

    if (data.session) {

        showMessage(
            "Konto utworzone. Logowanie...",
            "ok"
        );

        return;
    }

    showMessage(
        "Konto utworzone. Jeżeli Supabase wymaga potwierdzenia e-maila, sprawdź skrzynkę.",
        "ok"
    );
}


/* =====================================================
   LOGIN
===================================================== */

async function login() {

    hideMessage();

    const email =
        $("loginEmail").value.trim();

    const password =
        $("loginPassword").value;

    if (!email || !password) {

        showMessage(
            "Wpisz e-mail i hasło.",
            "error"
        );

        return;
    }

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    if (error) {

        showMessage(
            error.message,
            "error"
        );

        return;
    }

    currentUser = data.user;

    await loadProfile();

    await showApp();
}


/* =====================================================
   LOGOUT
===================================================== */

async function logout() {

    await supabaseClient.auth.signOut();

    currentUser = null;
    currentProfile = null;

    $("app").classList.add("hidden");
    $("authScreen").classList.remove("hidden");

    showLogin();
}


/* =====================================================
   PROFILE
===================================================== */

async function loadProfile() {

    if (!currentUser) return;

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .single();

    if (error) {

        console.error(error);

        currentProfile = {
            id: currentUser.id,
            username: currentUser.email,
            display_name: currentUser.email,
            role: "player"
        };

        return;
    }

    currentProfile = data;
}


/* =====================================================
   SERVER SETTINGS + HOME PROFILE
===================================================== */

