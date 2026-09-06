/* SECURITY */

let securityStatus = null;
let securityInstructionsData = [];
let securityServicesData = [];
let securityEventsData = [];

async function loadSecurity() {
    await Promise.all([
        loadSecurityStatus(),
        loadSecurityInstructions(),
        loadSecurityServices(),
        loadSecurityEvents()
    ]);
}

async function loadSecurityStatus() {
    const { data, error } = await supabaseClient
        .from("security_status")
        .select("*")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error(error);
        $("securityStatusBox").textContent = "Nie udało się pobrać statusu.";
        return;
    }

    securityStatus = data;
    renderSecurityStatus();

    if (isAdmin() && data) {
        $("adminSecurityStatus").value = data.status || "Bezpieczny";
        $("adminSecurityMessage").value = data.message || "";
    }
}

function renderSecurityStatus() {
    const box = $("securityStatusBox");
    if (!securityStatus) {
        box.innerHTML = "<p class='muted'>Brak ustawionego statusu.</p>";
        return;
    }

    const status = escapeHtml(securityStatus.status || "Bezpieczny");
    const message = escapeHtml(securityStatus.message || "");
    const updated = securityStatus.updated_at ? new Date(securityStatus.updated_at).toLocaleString("pl-PL") : "-";

    box.innerHTML = `
        <div class="card" style="margin:0;">
            <h3>${status}</h3>
            <p>${message || "Brak dodatkowego komunikatu."}</p>
            <p class="muted">Ostatnia aktualizacja: ${escapeHtml(updated)}</p>
        </div>`;
}

async function loadSecurityInstructions() {
    const { data, error } = await supabaseClient
        .from("security_instructions")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) { console.error(error); securityInstructionsData = []; }
    else securityInstructionsData = data || [];

    const box = $("securityInstructions");
    if (!securityInstructionsData.length) box.innerHTML = '<p class="muted">Brak instrukcji.</p>';
    else box.innerHTML = securityInstructionsData.map(x => `
        <div class="card" style="margin:12px 0;">
            <h3>${escapeHtml(x.title)}</h3>
            <p style="white-space:pre-wrap;">${escapeHtml(x.content)}</p>
        </div>`).join("");

    renderAdminSecurityInstructions();
}

function renderAdminSecurityInstructions() {
    const box = $("adminSecurityInstructions");
    if (!box) return;
    if (!securityInstructionsData.length) { box.innerHTML = '<p class="muted">Brak instrukcji.</p>'; return; }
    box.innerHTML = securityInstructionsData.map(x => `
        <div class="card" style="margin:12px 0;">
            <h3>${escapeHtml(x.title)}</h3>
            <p style="white-space:pre-wrap;">${escapeHtml(x.content)}</p>
            <div class="form-actions"><button onclick="editSecurityInstruction(${x.id})">✏️ Edytuj</button><button class="danger" onclick="deleteSecurityInstruction(${x.id})">🗑️ Usuń</button></div>
        </div>`).join("");
}

async function loadSecurityServices() {
    const { data, error } = await supabaseClient.from("security_services").select("*").order("created_at", { ascending: false });
    if (error) { console.error(error); securityServicesData = []; } else securityServicesData = data || [];
    const box = $("securityServices");
    if (!securityServicesData.length) box.innerHTML = '<p class="muted">Brak wpisów.</p>';
    else box.innerHTML = securityServicesData.map(x => `
        <div class="card" style="margin:12px 0;">
            <h3>👮 ${escapeHtml(x.service_name)}</h3>
            <p><strong>Uprawnienia:</strong><br>${escapeHtml(x.permissions)}</p>
            <p><strong>Ograniczenia:</strong><br>${escapeHtml(x.restrictions || "Brak")}</p>
        </div>`).join("");
    renderAdminSecurityServices();
}

function renderAdminSecurityServices() {
    const box = $("adminSecurityServices"); if (!box) return;
    if (!securityServicesData.length) { box.innerHTML = '<p class="muted">Brak służb.</p>'; return; }
    box.innerHTML = securityServicesData.map(x => `
        <div class="card" style="margin:12px 0;">
            <h3>${escapeHtml(x.service_name)}</h3>
            <p><strong>Uprawnienia:</strong><br>${escapeHtml(x.permissions)}</p>
            <p><strong>Ograniczenia:</strong><br>${escapeHtml(x.restrictions || "Brak")}</p>
            <div class="form-actions"><button onclick="editSecurityService(${x.id})">✏️ Edytuj</button><button class="danger" onclick="deleteSecurityService(${x.id})">🗑️ Usuń</button></div>
        </div>`).join("");
}

async function loadSecurityEvents() {
    const { data, error } = await supabaseClient.from("security_events").select("*").order("event_date", { ascending: false });
    if (error) { console.error(error); securityEventsData = []; } else securityEventsData = data || [];
    const box = $("securityEvents");
    if (!securityEventsData.length) box.innerHTML = '<p class="muted">Brak zdarzeń.</p>';
    else box.innerHTML = securityEventsData.map(x => `
        <div class="card" style="margin:12px 0;">
            <h3>${escapeHtml(x.event_type)}</h3>
            <p>${escapeHtml(x.description)}</p>
            <p class="muted">${escapeHtml(new Date(x.event_date).toLocaleString("pl-PL"))}${x.service_name ? " · " + escapeHtml(x.service_name) : ""}</p>
        </div>`).join("");
    renderAdminSecurityEvents();
}

function renderAdminSecurityEvents() {
    const box = $("adminSecurityEvents"); if (!box) return;
    if (!securityEventsData.length) { box.innerHTML = '<p class="muted">Brak zdarzeń.</p>'; return; }
    box.innerHTML = securityEventsData.map(x => `
        <div class="card" style="margin:12px 0;">
            <h3>${escapeHtml(x.event_type)}</h3>
            <p>${escapeHtml(x.description)}</p>
            <p class="muted">${escapeHtml(new Date(x.event_date).toLocaleString("pl-PL"))}${x.service_name ? " · " + escapeHtml(x.service_name) : ""}</p>
            <div class="form-actions"><button onclick="editSecurityEvent(${x.id})">✏️ Edytuj</button><button class="danger" onclick="deleteSecurityEvent(${x.id})">🗑️ Usuń</button></div>
        </div>`).join("");
}

async function saveSecurityStatus() {
    if (!isAdmin()) return;
    const payload = { status: $("adminSecurityStatus").value, message: $("adminSecurityMessage").value.trim(), updated_at: new Date().toISOString() };
    let result;
    if (securityStatus?.id) result = await supabaseClient.from("security_status").update(payload).eq("id", securityStatus.id);
    else result = await supabaseClient.from("security_status").insert(payload);
    if (result.error) { alert(result.error.message); return; }
    await loadSecurityStatus();
}

function showSecurityInstructionForm(item = null) {
    $("securityInstructionForm").classList.remove("hidden");
    $("editSecurityInstructionId").value = item?.id || "";
    $("securityInstructionTitle").value = item?.title || "";
    $("securityInstructionContent").value = item?.content || "";
}
function editSecurityInstruction(id) { const x = securityInstructionsData.find(v => v.id === id); if (x) showSecurityInstructionForm(x); }
function cancelSecurityInstructionForm() { $("securityInstructionForm").classList.add("hidden"); }
async function saveSecurityInstruction() {
    const id = $("editSecurityInstructionId").value;
    const payload = { title: $("securityInstructionTitle").value.trim(), content: $("securityInstructionContent").value.trim() };
    if (!payload.title || !payload.content) { alert("Uzupełnij tytuł i treść."); return; }
    const r = id ? await supabaseClient.from("security_instructions").update(payload).eq("id", id) : await supabaseClient.from("security_instructions").insert(payload);
    if (r.error) { alert(r.error.message); return; }
    cancelSecurityInstructionForm(); await loadSecurityInstructions();
}
async function deleteSecurityInstruction(id) { if (!confirm("Usunąć instrukcję?")) return; const r = await supabaseClient.from("security_instructions").delete().eq("id", id); if (r.error) alert(r.error.message); else await loadSecurityInstructions(); }

function showSecurityServiceForm(item = null) {
    $("securityServiceForm").classList.remove("hidden");
    $("editSecurityServiceId").value = item?.id || "";
    $("securityServiceName").value = item?.service_name || "";
    $("securityServicePermissions").value = item?.permissions || "";
    $("securityServiceRestrictions").value = item?.restrictions || "";
}
function editSecurityService(id) { const x = securityServicesData.find(v => v.id === id); if (x) showSecurityServiceForm(x); }
function cancelSecurityServiceForm() { $("securityServiceForm").classList.add("hidden"); }
async function saveSecurityService() {
    const id = $("editSecurityServiceId").value;
    const payload = { service_name: $("securityServiceName").value.trim(), permissions: $("securityServicePermissions").value.trim(), restrictions: $("securityServiceRestrictions").value.trim() };
    if (!payload.service_name || !payload.permissions) { alert("Uzupełnij nazwę i uprawnienia."); return; }
    const r = id ? await supabaseClient.from("security_services").update(payload).eq("id", id) : await supabaseClient.from("security_services").insert(payload);
    if (r.error) { alert(r.error.message); return; }
    cancelSecurityServiceForm(); await loadSecurityServices();
}
async function deleteSecurityService(id) { if (!confirm("Usunąć służbę?")) return; const r = await supabaseClient.from("security_services").delete().eq("id", id); if (r.error) alert(r.error.message); else await loadSecurityServices(); }

function showSecurityEventForm(item = null) {
    $("securityEventForm").classList.remove("hidden");
    $("editSecurityEventId").value = item?.id || "";
    $("securityEventType").value = item?.event_type || "";
    $("securityEventService").value = item?.service_name || "";
    $("securityEventDescription").value = item?.description || "";
    $("securityEventDate").value = item?.event_date ? new Date(item.event_date).toISOString().slice(0,16) : "";
}
function editSecurityEvent(id) { const x = securityEventsData.find(v => v.id === id); if (x) showSecurityEventForm(x); }
function cancelSecurityEventForm() { $("securityEventForm").classList.add("hidden"); }
async function saveSecurityEvent() {
    const id = $("editSecurityEventId").value;
    const rawDate = $("securityEventDate").value;
    const payload = { event_type: $("securityEventType").value.trim(), service_name: $("securityEventService").value.trim() || null, description: $("securityEventDescription").value.trim(), event_date: rawDate ? new Date(rawDate).toISOString() : new Date().toISOString() };
    if (!payload.event_type || !payload.description) { alert("Uzupełnij typ i opis zdarzenia."); return; }
    const r = id ? await supabaseClient.from("security_events").update(payload).eq("id", id) : await supabaseClient.from("security_events").insert(payload);
    if (r.error) { alert(r.error.message); return; }
    cancelSecurityEventForm(); await loadSecurityEvents();
}
async function deleteSecurityEvent(id) { if (!confirm("Usunąć zdarzenie?")) return; const r = await supabaseClient.from("security_events").delete().eq("id", id); if (r.error) alert(r.error.message); else await loadSecurityEvents(); }

async function changePassword() {
    const password = prompt("Podaj nowe hasło (minimum 6 znaków):");
    if (password === null) return;
    if (password.length < 6) { alert("Hasło musi mieć co najmniej 6 znaków."); return; }
    const repeat = prompt("Powtórz nowe hasło:");
    if (repeat !== password) { alert("Hasła nie są takie same."); return; }
    const { error } = await supabaseClient.auth.updateUser({ password });
    if (error) { alert(error.message); return; }
    alert("Hasło zostało zmienione.");
}

async function logoutAllSessions() {
    if (!confirm("Wylogować konto ze wszystkich sesji?")) return;
    const { error } = await supabaseClient.auth.signOut({ scope: "global" });
    if (error) alert(error.message);
}
