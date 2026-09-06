/* SECURITY */

async function loadSecurity() {
    if (!currentUser) return;

    const page = $("securityPage");
    if (!page) {
        console.error("Brak #securityPage w index.html");
        return;
    }

    await Promise.all([
        loadSecurityStatus(),
        loadSecurityInstructions(),
        loadSecurityServices(),
        loadSecurityEvents()
    ]);

    if (isAdmin()) {
        await loadAdminSecurity();
    }
}

async function loadSecurityStatus() {
    const box = $("securityStatusBox");
    const { data, error } = await supabaseClient
        .from("security_status")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        box.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
        return;
    }
    if (!data) {
        box.innerHTML = `<p class="muted">Brak informacji o statusie bezpieczeństwa.</p>`;
        return;
    }

    box.innerHTML = `
        <div class="stat-grid">
            <div class="stat">
                <div class="muted">Status</div>
                <div class="stat-number">${escapeHtml(data.status)}</div>
            </div>
            <div class="stat">
                <div class="muted">Ostatnia aktualizacja</div>
                <div>${datePL(data.updated_at)}</div>
            </div>
        </div>
        <p>${escapeHtml(data.message || "Brak dodatkowego komunikatu.")}</p>
    `;
}

async function loadSecurityInstructions() {
    const box = $("securityInstructions");
    const { data, error } = await supabaseClient
        .from("security_instructions")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) { box.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`; return; }
    box.innerHTML = data?.length ? data.map(x => `
        <div class="card">
            <h3>${escapeHtml(x.title)}</h3>
            <p>${escapeHtml(x.content).replace(/\n/g, "<br>")}</p>
        </div>
    `).join("") : `<p class="muted">Brak instrukcji.</p>`;
}

async function loadSecurityServices() {
    const box = $("securityServices");
    const { data, error } = await supabaseClient
        .from("security_services")
        .select("*")
        .order("service_name", { ascending: true });

    if (error) { box.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`; return; }
    box.innerHTML = data?.length ? `
        <div class="table-wrap"><table><thead><tr><th>Służba</th><th>Uprawnienia</th><th>Ograniczenia</th></tr></thead><tbody>
        ${data.map(x => `<tr><td>${escapeHtml(x.service_name)}</td><td>${escapeHtml(x.permissions).replace(/\n/g,"<br>")}</td><td>${escapeHtml(x.restrictions || "-").replace(/\n/g,"<br>")}</td></tr>`).join("")}
        </tbody></table></div>` : `<p class="muted">Brak zdefiniowanych służb.</p>`;
}

async function loadSecurityEvents() {
    const box = $("securityEvents");
    const { data, error } = await supabaseClient
        .from("security_events")
        .select("*")
        .order("event_date", { ascending: false });

    if (error) { box.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`; return; }
    box.innerHTML = data?.length ? `
        <div class="table-wrap"><table><thead><tr><th>Data</th><th>Rodzaj</th><th>Opis</th><th>Służba</th></tr></thead><tbody>
        ${data.map(x => `<tr><td>${datePL(x.event_date)}</td><td>${escapeHtml(x.event_type)}</td><td>${escapeHtml(x.description).replace(/\n/g,"<br>")}</td><td>${escapeHtml(x.service_name || "-")}</td></tr>`).join("")}
        </tbody></table></div>` : `<p class="muted">Brak zdarzeń.</p>`;
}

async function saveSecurityStatus() {
    if (!isAdmin()) return;
    const payload = {
        status: $("adminSecurityStatus").value,
        message: $("adminSecurityMessage").value.trim(),
        updated_at: new Date().toISOString()
    };
    const { data: existing, error: readError } = await supabaseClient.from("security_status").select("id").limit(1).maybeSingle();
    if (readError) { alert(readError.message); return; }
    const q = existing
        ? supabaseClient.from("security_status").update(payload).eq("id", existing.id)
        : supabaseClient.from("security_status").insert(payload);
    const { error } = await q;
    if (error) { alert(error.message); return; }
    await loadSecurityStatus();
    alert("Status bezpieczeństwa zapisany.");
}

function clearSecurityInstructionForm() {
    $("editSecurityInstructionId").value = "";
    $("securityInstructionTitle").value = "";
    $("securityInstructionContent").value = "";
}
function cancelSecurityInstructionForm() { clearSecurityInstructionForm(); }

async function saveSecurityInstruction() {
    if (!isAdmin()) return;
    const payload = { title: $("securityInstructionTitle").value.trim(), content: $("securityInstructionContent").value.trim() };
    if (!payload.title || !payload.content) { alert("Wypełnij tytuł i treść instrukcji."); return; }
    const id = $("editSecurityInstructionId").value;
    const q = id ? supabaseClient.from("security_instructions").update(payload).eq("id", id) : supabaseClient.from("security_instructions").insert(payload);
    const { error } = await q;
    if (error) { alert(error.message); return; }
    clearSecurityInstructionForm();
    await loadSecurityInstructions();
    await loadAdminSecurityInstructions();
}

function editSecurityInstruction(x) {
    $("editSecurityInstructionId").value = x.id;
    $("securityInstructionTitle").value = x.title || "";
    $("securityInstructionContent").value = x.content || "";
}
async function deleteSecurityInstruction(id) {
    if (!confirm("Usunąć tę instrukcję?")) return;
    const { error } = await supabaseClient.from("security_instructions").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    await loadSecurityInstructions(); await loadAdminSecurityInstructions();
}

function clearSecurityServiceForm() {
    $("editSecurityServiceId").value = "";
    $("securityServiceName").value = "";
    $("securityServicePermissions").value = "";
    $("securityServiceRestrictions").value = "";
}
function cancelSecurityServiceForm() { clearSecurityServiceForm(); }

async function saveSecurityService() {
    if (!isAdmin()) return;
    const payload = {
        service_name: $("securityServiceName").value.trim(),
        permissions: $("securityServicePermissions").value.trim(),
        restrictions: $("securityServiceRestrictions").value.trim() || null
    };
    if (!payload.service_name || !payload.permissions) { alert("Wypełnij nazwę służby i uprawnienia."); return; }
    const id = $("editSecurityServiceId").value;
    const q = id ? supabaseClient.from("security_services").update(payload).eq("id", id) : supabaseClient.from("security_services").insert(payload);
    const { error } = await q;
    if (error) { alert(error.message); return; }
    clearSecurityServiceForm(); await loadSecurityServices(); await loadAdminSecurityServices();
}
function editSecurityService(x) {
    $("editSecurityServiceId").value = x.id;
    $("securityServiceName").value = x.service_name || "";
    $("securityServicePermissions").value = x.permissions || "";
    $("securityServiceRestrictions").value = x.restrictions || "";
}
async function deleteSecurityService(id) {
    if (!confirm("Usunąć tę służbę?")) return;
    const { error } = await supabaseClient.from("security_services").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    await loadSecurityServices(); await loadAdminSecurityServices();
}

function clearSecurityEventForm() {
    $("editSecurityEventId").value = "";
    $("securityEventType").value = "";
    $("securityEventDescription").value = "";
    $("securityEventService").value = "";
    $("securityEventDate").value = new Date().toISOString().slice(0,16);
}
function cancelSecurityEventForm() { clearSecurityEventForm(); }

async function saveSecurityEvent() {
    if (!isAdmin()) return;
    const dateValue = $("securityEventDate").value;
    const payload = {
        event_type: $("securityEventType").value.trim(),
        description: $("securityEventDescription").value.trim(),
        service_name: $("securityEventService").value.trim() || null,
        event_date: dateValue ? new Date(dateValue).toISOString() : new Date().toISOString()
    };
    if (!payload.event_type || !payload.description) { alert("Wypełnij rodzaj i opis zdarzenia."); return; }
    const id = $("editSecurityEventId").value;
    const q = id ? supabaseClient.from("security_events").update(payload).eq("id", id) : supabaseClient.from("security_events").insert(payload);
    const { error } = await q;
    if (error) { alert(error.message); return; }
    clearSecurityEventForm(); await loadSecurityEvents(); await loadAdminSecurityEvents();
}
function editSecurityEvent(x) {
    $("editSecurityEventId").value = x.id;
    $("securityEventType").value = x.event_type || "";
    $("securityEventDescription").value = x.description || "";
    $("securityEventService").value = x.service_name || "";
    $("securityEventDate").value = x.event_date ? new Date(x.event_date).toISOString().slice(0,16) : "";
}
async function deleteSecurityEvent(id) {
    if (!confirm("Usunąć to zdarzenie?")) return;
    const { error } = await supabaseClient.from("security_events").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    await loadSecurityEvents(); await loadAdminSecurityEvents();
}

async function loadAdminSecurity() {
    const { data, error } = await supabaseClient.from("security_status").select("*").order("updated_at", {ascending:false}).limit(1).maybeSingle();
    if (!error && data) {
        $("adminSecurityStatus").value = data.status || "Bezpieczny";
        $("adminSecurityMessage").value = data.message || "";
    }
    await loadAdminSecurityInstructions();
    await loadAdminSecurityServices();
    await loadAdminSecurityEvents();
    clearSecurityEventForm();
}
async function loadAdminSecurityInstructions() {
    const box = $("adminSecurityInstructions");
    const { data, error } = await supabaseClient.from("security_instructions").select("*").order("created_at", {ascending:false});
    if (error) { box.innerHTML=`<p class="muted">${escapeHtml(error.message)}</p>`; return; }
    box.innerHTML = data?.length ? `<div class="table-wrap"><table><thead><tr><th>Tytuł</th><th>Treść</th><th>Akcje</th></tr></thead><tbody>${data.map(x=>`<tr><td>${escapeHtml(x.title)}</td><td>${escapeHtml(x.content)}</td><td><button onclick='editSecurityInstruction(${JSON.stringify(x)})'>✏️</button> <button onclick="deleteSecurityInstruction('${x.id}')">🗑️</button></td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Brak instrukcji.</p>`;
}
async function loadAdminSecurityServices() {
    const box = $("adminSecurityServices");
    const { data, error } = await supabaseClient.from("security_services").select("*").order("service_name", {ascending:true});
    if (error) { box.innerHTML=`<p class="muted">${escapeHtml(error.message)}</p>`; return; }
    box.innerHTML = data?.length ? `<div class="table-wrap"><table><thead><tr><th>Służba</th><th>Uprawnienia</th><th>Ograniczenia</th><th>Akcje</th></tr></thead><tbody>${data.map(x=>`<tr><td>${escapeHtml(x.service_name)}</td><td>${escapeHtml(x.permissions)}</td><td>${escapeHtml(x.restrictions||"-")}</td><td><button onclick='editSecurityService(${JSON.stringify(x)})'>✏️</button> <button onclick="deleteSecurityService('${x.id}')">🗑️</button></td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Brak służb.</p>`;
}
async function loadAdminSecurityEvents() {
    const box = $("adminSecurityEvents");
    const { data, error } = await supabaseClient.from("security_events").select("*").order("event_date", {ascending:false});
    if (error) { box.innerHTML=`<p class="muted">${escapeHtml(error.message)}</p>`; return; }
    box.innerHTML = data?.length ? `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Rodzaj</th><th>Opis</th><th>Służba</th><th>Akcje</th></tr></thead><tbody>${data.map(x=>`<tr><td>${datePL(x.event_date)}</td><td>${escapeHtml(x.event_type)}</td><td>${escapeHtml(x.description)}</td><td>${escapeHtml(x.service_name||"-")}</td><td><button onclick='editSecurityEvent(${JSON.stringify(x)})'>✏️</button> <button onclick="deleteSecurityEvent('${x.id}')">🗑️</button></td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Brak zdarzeń.</p>`;
}

async function changePassword() {
    if (!currentUser) return;
    const password = prompt("Podaj nowe hasło (minimum 6 znaków):");
    if (password === null) return;
    if (password.length < 6) { alert("Hasło musi mieć co najmniej 6 znaków."); return; }
    const password2 = prompt("Powtórz nowe hasło:");
    if (password2 === null) return;
    if (password !== password2) { alert("Hasła nie są takie same."); return; }
    const { error } = await supabaseClient.auth.updateUser({ password });
    if (error) { alert(error.message); return; }
    alert("Hasło zostało zmienione.");
}

async function logoutAllSessions() {
    if (!confirm("Wylogować konto ze wszystkich urządzeń i sesji?")) return;
    const { error } = await supabaseClient.auth.signOut({ scope: "global" });
    if (error) { alert(error.message); return; }
    showLogin();
}
