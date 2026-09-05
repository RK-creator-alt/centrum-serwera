
/* =====================================================
   APP INITIALIZATION
===================================================== */

/*
   WAŻNE:

   Ten plik NIE zawiera już:
   - const pages
   - isAdmin()
   - hideAllPages()
   - goHome()
   - openMyTaxes()
   - openMyLicenses()
   - itd.

   Wszystkie funkcje nawigacji znajdują się w core.js.

   Dzięki temu nie ma konfliktu:
   Identifier 'pages' has already been declared
*/


let appInitialized = false;
let authListenerRegistered = false;


/* =====================================================
   AUTH SESSION
===================================================== */

async function handleAuthSession(session) {

    if (session) {

        currentUser = session.user;

        /*
           Korzystamy z loadProfile(), jeśli istnieje w auth.js.
           Dzięki temu nie duplikujemy logiki profilu tutaj.
        */

        if (typeof loadProfile === "function") {
            await loadProfile();
        } else {

            /*
               Awaryjnie pobierz profil, jeżeli auth.js
               nie posiada funkcji loadProfile().
            */

            const {
                data: profile,
                error
            } = await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", currentUser.id)
                .maybeSingle();

            if (error) {
                console.error(
                    "Błąd pobierania profilu:",
                    error
                );

                currentProfile = null;
            } else {
                currentProfile = profile;
            }
        }


        if (typeof showApp === "function") {
            await showApp();
        }

        return;
    }


    /* =================================================
       USER LOGGED OUT
    ================================================= */

    currentUser = null;
    currentProfile = null;

    if (typeof showLogin === "function") {
        showLogin();
    }
}


/* =====================================================
   INIT
===================================================== */

async function init() {

    /*
       Zabezpieczenie przed wielokrotnym uruchomieniem init().
    */

    if (appInitialized) {
        return;
    }

    appInitialized = true;


    /* =================================================
       CHECK EXISTING SESSION
    ================================================= */

    try {

        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Błąd pobierania sesji Supabase:",
                error
            );

            if (typeof showLogin === "function") {
                showLogin();
            }

        } else {

            await handleAuthSession(session);

        }

    } catch (error) {

        console.error(
            "Błąd podczas uruchamiania aplikacji:",
            error
        );

        if (typeof showLogin === "function") {
            showLogin();
        }
    }


    /* =================================================
       AUTH STATE LISTENER
    ================================================= */

    if (!authListenerRegistered) {

        authListenerRegistered = true;

        supabaseClient.auth.onAuthStateChange(
            async (_event, session) => {

                /*
                   Pozwalamy zakończyć bieżący callback Supabase,
                   zanim wykonamy kolejną operację asynchroniczną.
                */

                await Promise.resolve();

                try {

                    await handleAuthSession(session);

                } catch (error) {

                    console.error(
                        "Błąd zmiany stanu autoryzacji:",
                        error
                    );

                }

            }
        );
    }
}


/* =====================================================
   START APPLICATION
===================================================== */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        init,
        { once: true }
    );

} else {

    init();

}

