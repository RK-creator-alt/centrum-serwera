```javascript
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

async function loadServerSettings() {

    const { data, error } =
        await supabaseClient
            .from("server_settings")
            .select("*")
            .limit(1)
            .maybeSingle();

    if (error) {
        console.error(error);
        return;
    }

    serverSettings = data;

    if (!serverSettings) return;

    const status = serverSettings.server_status || "-";

    if ($("serverAddress")) $("serverAddress").textContent =
        serverSettings.server_address || "-";

    if ($("serverVersion")) $("serverVersion").textContent =
        serverSettings.server_version || "-";

    if ($("serverMayor")) $("serverMayor").textContent =
        serverSettings.mayor_name || "-";

    if ($("serverStatus")) {
        $("serverStatus").textContent = status;

        $("serverStatus").classList.remove(
            "status-online",
            "status-offline"
        );

        if (status === "Online")
            $("serverStatus").classList.add("status-online");

        if (status === "Offline")
            $("serverStatus").classList.add("status-offline");
    }

    if ($("serverPlayers")) $("serverPlayers").textContent =
        `${serverSettings.online_players ?? 0} / ${serverSettings.max_players ?? 0}`;

    if ($("serverAnnouncement")) $("serverAnnouncement").textContent =
        serverSettings.announcement || "Brak ważnych komunikatów.";

    if ($("serverNewsLink")) {

        const url = (serverSettings.news_url || "").trim();

        if (url) {
            $("serverNewsLink").href = url;
            $("serverNewsLink").classList.remove("hidden");
        } else {
            $("serverNewsLink").classList.add("hidden");
        }
    }

    if ($("adminServerAddress")) {

        $("adminServerAddress").value =
            serverSettings.server_address || "";

        $("adminServerVersion").value =
            serverSettings.server_version || "";

        $("adminServerMayor").value =
            serverSettings.mayor_name || "";

        $("adminServerStatus").value =
            serverSettings.server_status || "Online";

        $("adminServerPlayers").value =
            serverSettings.online_players ?? 0;

        $("adminServerMaxPlayers").value =
            serverSettings.max_players ?? 50;

        $("adminServerAnnouncement").value =
            serverSettings.announcement || "";

        $("adminServerNewsUrl").value =
            serverSettings.news_url || "";
    }
}


async function saveServerSettings() {

    if (!isAdmin()) return;

    const payload = {

        server_address:
            $("adminServerAddress").value.trim(),

        server_version:
            $("adminServerVersion").value.trim(),

        mayor_name:
            $("adminServerMayor").value.trim(),

        server_status:
            $("adminServerStatus").value,

        online_players:
            Number($("adminServerPlayers").value || 0),

        max_players:
            Number($("adminServerMaxPlayers").value || 50),

        announcement:
            $("adminServerAnnouncement").value.trim() || null,

        news_url:
            $("adminServerNewsUrl").value.trim() || null,

        updated_at:
            new Date().toISOString()
    };

    let result;

    if (serverSettings?.id) {

        result = await supabaseClient
            .from("server_settings")
            .update(payload)
            .eq("id", serverSettings.id);

    } else {

        result = await supabaseClient
            .from("server_settings")
            .insert(payload);
    }

    if (result.error) {
        alert(result.error.message);
        return;
    }

    await loadServerSettings();

    alert("Informacje serwera zostały zapisane.");
}


function renderHomeProfile() {

    if (!currentUser) return;

    if ($("profileMinecraftNick"))
        $("profileMinecraftNick").textContent =
            currentProfile?.minecraft_nick ||
            currentProfile?.username ||
            "-";

    if ($("profileEmail"))
        $("profileEmail").textContent =
            currentUser.email || "-";

    if ($("profileDisplayName"))
        $("profileDisplayName").textContent =
            currentProfile?.display_name ||
            currentProfile?.username ||
            "-";

    if ($("profileRole"))
        $("profileRole").textContent =
            currentProfile?.role === "admin"
                ? "Administrator"
                : "Gracz";

    if ($("profileCreatedAt"))
        $("profileCreatedAt").textContent =
            datePL(currentUser.created_at);
}


/* =====================================================
   SHOW APP
===================================================== */

async function showApp() {

    $("authScreen").classList.add("hidden");
    $("app").classList.remove("hidden");

    $("topUser").textContent =
        currentProfile?.minecraft_nick ||
        currentProfile?.display_name ||
        currentProfile?.username ||
        currentUser.email;

    if (isAdmin()) {
        $("adminNotice").classList.remove("hidden");
    } else {
        $("adminNotice").classList.add("hidden");
    }

    await loadDefinitions();
    await loadServerSettings();

    renderHomeProfile();

    goHome();
}
```

