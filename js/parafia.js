/* =====================================================
   PARAFIA
===================================================== */

let parishAdminChurches = [];
let parishAdminMasses = [];
let parishAdminIntentions = [];
let parishAdminAnnouncements = [];

/* Integrated page/admin UI */
function ensureParishPage() {
    if ($("parishPage")) return;
    const page = document.createElement("div");
    page.id = "parishPage";
    page.className = "hidden";
    page.innerHTML = `
        <button class="back" onclick="goHome()">← Wróć</button>
        <div class="card"><h1>⛪ Parafia</h1><div id="parishWelcomeContent">Ładowanie...</div></div>
        <div class="card"><h2>⛪ Kościoły i adresy</h2><div id="parishChurchesContent">Ładowanie...</div></div>
        <div class="card"><h2>🕊️ Terminarz Mszy Świętych</h2><div id="parishMassScheduleContent">Ładowanie...</div></div>
        <div class="card"><h2>🕯️ Intencje Mszalne</h2><div id="parishIntentionsContent">Ładowanie...</div></div>
        <div class="card"><h2>📢 Ogłoszenia duszpasterskie</h2><div id="parishAnnouncementsContent">Ładowanie...</div></div>`;
    $("app").querySelector(".container").appendChild(page);
    if (typeof pages !== "undefined" && !pages.includes("parishPage")) pages.push("parishPage");
}

function ensureParishAdminCard() {
    if (!isAdmin() || $("parishAdminCard")) return;
    const card = document.createElement("div");
    card.id = "parishAdminCard";
    card.className = "card";
    card.innerHTML = `
        <div class="admin-section-heading"><span>⛪</span><div><strong>Parafia</strong><small>Informacje, Msze Święte, intencje i ogłoszenia</small></div></div>
        <div class="section-title"><div><h2>⛪ Informacje parafialne</h2><p class="muted">Dane wyświetlane graczom w zakładce Parafia.</p></div><button class="primary" onclick="saveParishInfo()">💾 Zapisz informacje</button></div>
        <div class="form-grid"><div class="field"><label>Tytuł powitania</label><input id="parishWelcomeTitle"></div><div class="field"><label>Proboszcz</label><input id="parishPastorName"></div><div class="field"><label>Adres kancelarii</label><input id="parishOfficeAddress"></div><div class="field"><label>Telefon</label><input id="parishOfficePhone"></div><div class="field"><label>E-mail</label><input id="parishOfficeEmail" type="email"></div><div class="field"><label>Godziny kancelarii</label><input id="parishOfficeHours"></div></div><br>
        <div class="field"><label>Tekst powitalny / informacje ogólne</label><textarea id="parishWelcomeText"></textarea></div><br><div class="field"><label>Dodatkowe informacje</label><textarea id="parishAdditionalInfo"></textarea></div>
        <hr><div class="section-title"><h2>📍 Kościoły i adresy</h2><button class="primary" onclick="showParishChurchForm()">➕ Dodaj kościół</button></div>
        <div id="parishChurchForm" class="hidden"><input type="hidden" id="parishChurchId"><div class="form-grid"><div class="field"><label>Nazwa</label><input id="parishChurchName"></div><div class="field"><label>Adres</label><input id="parishChurchAddress"></div><div class="field"><label>Kolejność</label><input id="parishChurchOrder" type="number" value="0"></div><div class="field"><label>Aktywny</label><select id="parishChurchActive"><option value="true">Tak</option><option value="false">Nie</option></select></div></div><br><div class="field"><label>Opis</label><textarea id="parishChurchDescription"></textarea></div><button class="primary" onclick="saveParishChurch()">💾 Zapisz</button> <button onclick="cancelParishChurchForm()">Anuluj</button></div><div id="adminParishChurches"></div>
        <hr><div class="section-title"><h2>🕊️ Terminarz Mszy Świętych</h2><button class="primary" onclick="showParishMassForm()">➕ Dodaj Mszę</button></div>
        <div id="parishMassForm" class="hidden"><input type="hidden" id="parishMassId"><div class="form-grid"><div class="field"><label>Dni</label><input id="parishMassDays" placeholder="Poniedziałek–Piątek"></div><div class="field"><label>Godzina</label><input id="parishMassTime" type="time"></div><div class="field"><label>Kościół</label><input id="parishMassChurch"></div><div class="field"><label>Kolejność</label><input id="parishMassOrder" type="number" value="0"></div><div class="field"><label>Aktywna</label><select id="parishMassActive"><option value="true">Tak</option><option value="false">Nie</option></select></div></div><br><div class="field"><label>Opis / szczegóły</label><textarea id="parishMassDetails"></textarea></div><button class="primary" onclick="saveParishMass()">💾 Zapisz</button> <button onclick="cancelParishMassForm()">Anuluj</button></div><div id="adminParishMasses"></div>
        <hr><div class="section-title"><h2>🕯️ Intencje Mszalne</h2><button class="primary" onclick="showParishIntentionForm()">➕ Dodaj intencję</button></div>
        <div id="parishIntentionForm" class="hidden"><input type="hidden" id="parishIntentionId"><div class="form-grid"><div class="field"><label>Zaplanowana Msza</label><select id="parishIntentionSchedule"></select></div><div class="field"><label>Data</label><input id="parishIntentionDate" type="date"></div></div><br><div class="field"><label>Intencja</label><textarea id="parishIntentionText"></textarea></div><button class="primary" onclick="saveParishIntention()">💾 Zapisz</button> <button onclick="cancelParishIntentionForm()">Anuluj</button></div><div id="adminParishIntentions"></div>
        <hr><div class="section-title"><h2>📢 Ogłoszenia duszpasterskie</h2><button class="primary" onclick="showParishAnnouncementForm()">➕ Dodaj ogłoszenie</button></div>
        <div id="parishAnnouncementForm" class="hidden"><input type="hidden" id="parishAnnouncementId"><div class="form-grid"><div class="field"><label>Tytuł</label><input id="parishAnnouncementTitle"></div><div class="field"><label>Opublikowane</label><select id="parishAnnouncementPublished"><option value="true">Tak</option><option value="false">Nie</option></select></div></div><br><div class="field"><label>Treść</label><textarea id="parishAnnouncementContent"></textarea></div><button class="primary" onclick="saveParishAnnouncement()">💾 Zapisz</button> <button onclick="cancelParishAnnouncementForm()">Anuluj</button></div><div id="adminParishAnnouncements"></div>`;
    $("adminPage").appendChild(card);
}

function parishFormatTime(value) {
    if (!value) return "-";
    const text = String(value);
    return text.slice(0, 5);
}

function parishDateTime(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString("pl-PL");
}

function parishInfoRow(label, value) {
    if (!value) return "";
    return `
        <div class="info-row">
            <span class="info-label">${escapeHtml(label)}</span>
            <span class="info-value">${escapeHtml(value)}</span>
        </div>
    `;
}

function parishStatus(status) {
    return status
        ? `<span class="badge badge-paid">Aktywna</span>`
        : `<span class="badge badge-cancelled">Nieaktywna</span>`;
}

async function openParish() {
    ensureParishPage();
    ensureParishAdminCard();
    const page = $("parishPage");

    if (!page) {
        console.error("Brak elementu #parishPage w index.html");
        return;
    }

    hideAllPages();
    page.classList.remove("hidden");

    await loadParish();
}

/* Add the new page to the existing navigation without changing app.js. */

async function loadParish() {
    const welcomeBox = $("parishWelcomeContent");
    const churchesBox = $("parishChurchesContent");
    const scheduleBox = $("parishMassScheduleContent");
    const intentionsBox = $("parishIntentionsContent");
    const announcementsBox = $("parishAnnouncementsContent");

    if (!welcomeBox || !churchesBox || !scheduleBox || !intentionsBox || !announcementsBox) {
        return;
    }

    welcomeBox.innerHTML = "Ładowanie...";
    churchesBox.innerHTML = "Ładowanie...";
    scheduleBox.innerHTML = "Ładowanie...";
    intentionsBox.innerHTML = "Ładowanie...";
    announcementsBox.innerHTML = "Ładowanie...";

    const [infoResult, churchesResult, massesResult, intentionsResult, announcementsResult] = await Promise.all([
        supabaseClient.from("parish_info").select("*").eq("id", 1).maybeSingle(),
        supabaseClient.from("parish_churches").select("*").eq("active", true).order("sort_order", { ascending: true }).order("name", { ascending: true }),
        supabaseClient.from("parish_mass_schedules").select("*").eq("active", true).order("sort_order", { ascending: true }).order("mass_time", { ascending: true }),
        supabaseClient.from("parish_mass_intentions").select("*").order("mass_date", { ascending: true }).order("created_at", { ascending: true }),
        supabaseClient.from("parish_announcements").select("*").eq("published", true).order("created_at", { ascending: false })
    ]);

    /* Welcome / general info */
    if (infoResult.error) {
        welcomeBox.innerHTML = `<p>${escapeHtml(infoResult.error.message)}</p>`;
    } else {
        const info = infoResult.data || {};
        const title = info.welcome_title || "Witamy w naszej parafii!";
        welcomeBox.innerHTML = `
            <h2>${escapeHtml(title)}</h2>
            ${info.welcome_text ? `<p style="white-space:pre-wrap;">${escapeHtml(info.welcome_text)}</p>` : ""}
            ${[
                parishInfoRow("Proboszcz", info.pastor_name),
                parishInfoRow("Adres kancelarii", info.office_address),
                parishInfoRow("Telefon", info.office_phone),
                parishInfoRow("E-mail", info.office_email),
                parishInfoRow("Godziny kancelarii", info.office_hours)
            ].join("")}
            ${info.additional_info ? `
                <div class="news-box" style="margin-top:16px;">
                    <strong>ℹ️ Dodatkowe informacje</strong>
                    <div style="white-space:pre-wrap;margin-top:8px;">${escapeHtml(info.additional_info)}</div>
                </div>` : ""}
        `;
    }

    /* Churches */
    if (churchesResult.error) {
        churchesBox.innerHTML = `<p>${escapeHtml(churchesResult.error.message)}</p>`;
    } else if (!churchesResult.data?.length) {
        churchesBox.innerHTML = `<p class="muted">Brak wpisanych kościołów.</p>`;
    } else {
        churchesBox.innerHTML = churchesResult.data.map(church => `
            <div class="news-box" style="margin-top:0;margin-bottom:12px;">
                <strong>⛪ ${escapeHtml(church.name)}</strong>
                <div style="margin-top:6px;">${escapeHtml(church.address)}</div>
                ${church.description ? `<div class="muted" style="white-space:pre-wrap;margin-top:6px;">${escapeHtml(church.description)}</div>` : ""}
            </div>
        `).join("");
    }

    /* Mass schedule */
    if (massesResult.error) {
        scheduleBox.innerHTML = `<p>${escapeHtml(massesResult.error.message)}</p>`;
    } else if (!massesResult.data?.length) {
        scheduleBox.innerHTML = `<p class="muted">Brak wpisanego terminarza Mszy Świętych.</p>`;
    } else {
        scheduleBox.innerHTML = `
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Dni</th>
                            <th>Godzina</th>
                            <th>Kościół</th>
                            <th>Szczegóły</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${massesResult.data.map(mass => `
                            <tr>
                                <td><strong>${escapeHtml(mass.days_label)}</strong></td>
                                <td>${escapeHtml(parishFormatTime(mass.mass_time))}</td>
                                <td>${escapeHtml(mass.church_name || "-")}</td>
                                <td style="white-space:pre-wrap;">${escapeHtml(mass.details || "-")}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    /* Intentions */
    if (intentionsResult.error) {
        intentionsBox.innerHTML = `<p>${escapeHtml(intentionsResult.error.message)}</p>`;
    } else if (!intentionsResult.data?.length) {
        intentionsBox.innerHTML = `<p class="muted">Brak wpisanych intencji Mszalnych.</p>`;
    } else {
        const masses = massesResult.data || [];
        const massMap = new Map(masses.map(mass => [String(mass.id), mass]));

        intentionsBox.innerHTML = intentionsResult.data.map(intention => {
            const mass = massMap.get(String(intention.mass_schedule_id));
            return `
                <div class="news-box" style="margin-top:0;margin-bottom:12px;">
                    <div class="section-title">
                        <strong>🕯️ ${escapeHtml(datePL(intention.mass_date))}</strong>
                        <span class="badge">${escapeHtml(mass ? parishFormatTime(mass.mass_time) : "-")}</span>
                    </div>
                    <div class="muted" style="margin-top:5px;">
                        ${escapeHtml(mass?.church_name || "-" )}
                        ${mass ? ` • ${escapeHtml(mass.days_label)}` : ""}
                    </div>
                    <div style="white-space:pre-wrap;margin-top:10px;">${escapeHtml(intention.intention)}</div>
                </div>
            `;
        }).join("");
    }

    /* Announcements */
    if (announcementsResult.error) {
        announcementsBox.innerHTML = `<p>${escapeHtml(announcementsResult.error.message)}</p>`;
    } else if (!announcementsResult.data?.length) {
        announcementsBox.innerHTML = `<p class="muted">Brak ogłoszeń.</p>`;
    } else {
        announcementsBox.innerHTML = announcementsResult.data.map(announcement => `
            <details style="margin-bottom:10px;">
                <summary style="cursor:pointer;font-weight:bold;padding:10px 0;">${escapeHtml(announcement.title)}</summary>
                <div style="white-space:pre-wrap;padding:0 0 12px 0;">${escapeHtml(announcement.content)}</div>
            </details>
        `).join("");
    }
}

/* =====================================================
   ADMIN: INFO
===================================================== */

async function loadAdminParish() {
    await Promise.all([
        loadAdminParishInfo(),
        loadAdminParishChurches(),
        loadAdminParishMasses(),
        loadAdminParishIntentions(),
        loadAdminParishAnnouncements()
    ]);
}

async function loadAdminParishInfo() {
    const { data, error } = await supabaseClient
        .from("parish_info")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

    if (error) {
        console.error(error);
        return;
    }

    const info = data || {};
    $("parishWelcomeTitle").value = info.welcome_title || "";
    $("parishWelcomeText").value = info.welcome_text || "";
    $("parishPastorName").value = info.pastor_name || "";
    $("parishOfficeAddress").value = info.office_address || "";
    $("parishOfficePhone").value = info.office_phone || "";
    $("parishOfficeEmail").value = info.office_email || "";
    $("parishOfficeHours").value = info.office_hours || "";
    $("parishAdditionalInfo").value = info.additional_info || "";
}

async function saveParishInfo() {
    const payload = {
        id: 1,
        welcome_title: $("parishWelcomeTitle").value.trim() || "Witamy w naszej parafii!",
        welcome_text: $("parishWelcomeText").value.trim() || null,
        pastor_name: $("parishPastorName").value.trim() || null,
        office_address: $("parishOfficeAddress").value.trim() || null,
        office_phone: $("parishOfficePhone").value.trim() || null,
        office_email: $("parishOfficeEmail").value.trim() || null,
        office_hours: $("parishOfficeHours").value.trim() || null,
        additional_info: $("parishAdditionalInfo").value.trim() || null,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabaseClient
        .from("parish_info")
        .upsert(payload, { onConflict: "id" });

    if (error) {
        alert(error.message);
        return;
    }

    alert("Informacje parafialne zostały zapisane.");
}

/* =====================================================
   ADMIN: CHURCHES
===================================================== */

async function loadAdminParishChurches() {
    const box = $("adminParishChurches");
    if (!box) return;

    const { data, error } = await supabaseClient
        .from("parish_churches")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

    if (error) {
        box.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
        return;
    }

    parishAdminChurches = data || [];

    if (!parishAdminChurches.length) {
        box.innerHTML = `<p class="muted">Brak kościołów.</p>`;
        return;
    }

    box.innerHTML = `
        <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>Nazwa</th><th>Adres</th><th>Aktywna</th><th>Akcje</th></tr>
                </thead>
                <tbody>
                    ${parishAdminChurches.map(church => `
                        <tr>
                            <td><strong>${escapeHtml(church.name)}</strong></td>
                            <td>${escapeHtml(church.address)}</td>
                            <td>${parishStatus(church.active)}</td>
                            <td class="actions">
                                <button onclick='editParishChurch(${JSON.stringify(church)})'>✏️</button>
                                <button onclick="deleteParishChurch('${church.id}')">🗑️</button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function showParishChurchForm() {
    $("parishChurchForm").classList.remove("hidden");
    $("parishChurchId").value = "";
    $("parishChurchName").value = "";
    $("parishChurchAddress").value = "";
    $("parishChurchDescription").value = "";
    $("parishChurchOrder").value = "0";
    $("parishChurchActive").value = "true";
}

function cancelParishChurchForm() {
    $("parishChurchForm").classList.add("hidden");
}

function editParishChurch(church) {
    $("parishChurchForm").classList.remove("hidden");
    $("parishChurchId").value = church.id;
    $("parishChurchName").value = church.name || "";
    $("parishChurchAddress").value = church.address || "";
    $("parishChurchDescription").value = church.description || "";
    $("parishChurchOrder").value = church.sort_order ?? 0;
    $("parishChurchActive").value = church.active ? "true" : "false";
}

async function saveParishChurch() {
    const name = $("parishChurchName").value.trim();
    const address = $("parishChurchAddress").value.trim();

    if (!name || !address) {
        alert("Podaj nazwę kościoła i adres.");
        return;
    }

    const payload = {
        name,
        address,
        description: $("parishChurchDescription").value.trim() || null,
        sort_order: Number($("parishChurchOrder").value || 0),
        active: $("parishChurchActive").value === "true",
        updated_at: new Date().toISOString()
    };

    const id = $("parishChurchId").value;
    let result;

    if (id) {
        result = await supabaseClient.from("parish_churches").update(payload).eq("id", id);
    } else {
        result = await supabaseClient.from("parish_churches").insert(payload);
    }

    if (result.error) {
        alert(result.error.message);
        return;
    }

    cancelParishChurchForm();
    await loadAdminParishChurches();
}

async function deleteParishChurch(id) {
    if (!confirm("Usunąć ten kościół z listy?")) return;

    const { error } = await supabaseClient.from("parish_churches").delete().eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    await loadAdminParishChurches();
}

/* =====================================================
   ADMIN: MASS SCHEDULE
===================================================== */

async function loadAdminParishMasses() {
    const box = $("adminParishMasses");
    if (!box) return;

    const { data, error } = await supabaseClient
        .from("parish_mass_schedules")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("mass_time", { ascending: true });

    if (error) {
        box.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
        return;
    }

    parishAdminMasses = data || [];
    parishFillIntentionScheduleSelect();

    if (!parishAdminMasses.length) {
        box.innerHTML = `<p class="muted">Brak terminarza Mszy.</p>`;
        return;
    }

    box.innerHTML = `
        <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>Dni</th><th>Godzina</th><th>Kościół</th><th>Szczegóły</th><th>Aktywna</th><th>Akcje</th></tr>
                </thead>
                <tbody>
                    ${parishAdminMasses.map(mass => `
                        <tr>
                            <td><strong>${escapeHtml(mass.days_label)}</strong></td>
                            <td>${escapeHtml(parishFormatTime(mass.mass_time))}</td>
                            <td>${escapeHtml(mass.church_name || "-")}</td>
                            <td style="white-space:pre-wrap;">${escapeHtml(mass.details || "-")}</td>
                            <td>${parishStatus(mass.active)}</td>
                            <td class="actions">
                                <button onclick='editParishMass(${JSON.stringify(mass)})'>✏️</button>
                                <button onclick="deleteParishMass('${mass.id}')">🗑️</button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function showParishMassForm() {
    $("parishMassForm").classList.remove("hidden");
    $("parishMassId").value = "";
    $("parishMassDays").value = "";
    $("parishMassTime").value = "";
    $("parishMassChurch").value = "";
    $("parishMassDetails").value = "";
    $("parishMassOrder").value = "0";
    $("parishMassActive").value = "true";
}

function cancelParishMassForm() {
    $("parishMassForm").classList.add("hidden");
}

function editParishMass(mass) {
    $("parishMassForm").classList.remove("hidden");
    $("parishMassId").value = mass.id;
    $("parishMassDays").value = mass.days_label || "";
    $("parishMassTime").value = parishFormatTime(mass.mass_time);
    $("parishMassChurch").value = mass.church_name || "";
    $("parishMassDetails").value = mass.details || "";
    $("parishMassOrder").value = mass.sort_order ?? 0;
    $("parishMassActive").value = mass.active ? "true" : "false";
}

async function saveParishMass() {
    const days = $("parishMassDays").value.trim();
    const time = $("parishMassTime").value;

    if (!days || !time) {
        alert("Podaj dni i godzinę Mszy.");
        return;
    }

    const payload = {
        days_label: days,
        mass_time: time,
        church_name: $("parishMassChurch").value.trim() || null,
        details: $("parishMassDetails").value.trim() || null,
        sort_order: Number($("parishMassOrder").value || 0),
        active: $("parishMassActive").value === "true",
        updated_at: new Date().toISOString()
    };

    const id = $("parishMassId").value;
    let result;

    if (id) {
        result = await supabaseClient.from("parish_mass_schedules").update(payload).eq("id", id);
    } else {
        result = await supabaseClient.from("parish_mass_schedules").insert(payload);
    }

    if (result.error) {
        alert(result.error.message);
        return;
    }

    cancelParishMassForm();
    await loadAdminParishMasses();
}

async function deleteParishMass(id) {
    if (!confirm("Usunąć ten termin Mszy? Przypisane do niego intencje pozostaną zapisane, ale stracą powiązanie z terminem.")) return;

    const { error } = await supabaseClient.from("parish_mass_schedules").delete().eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    await Promise.all([loadAdminParishMasses(), loadAdminParishIntentions()]);
}

/* =====================================================
   ADMIN: INTENTIONS
===================================================== */

function parishFillIntentionScheduleSelect(selectedId = "") {
    const select = $("parishIntentionSchedule");
    if (!select) return;

    select.innerHTML = `<option value="">-- wybierz zaplanowaną Mszę --</option>` + parishAdminMasses.map(mass => `
        <option value="${escapeHtml(mass.id)}">
            ${escapeHtml(mass.days_label)} — ${escapeHtml(parishFormatTime(mass.mass_time))} — ${escapeHtml(mass.church_name || "bez kościoła")}${mass.active ? "" : " — nieaktywna"}
        </option>
    `).join("");

    select.value = selectedId ? String(selectedId) : "";
}

async function loadAdminParishIntentions() {
    const box = $("adminParishIntentions");
    if (!box) return;

    const { data, error } = await supabaseClient
        .from("parish_mass_intentions")
        .select("*")
        .order("mass_date", { ascending: true })
        .order("created_at", { ascending: true });

    if (error) {
        box.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
        return;
    }

    parishAdminIntentions = data || [];
    const massMap = new Map(parishAdminMasses.map(mass => [String(mass.id), mass]));

    if (!parishAdminIntentions.length) {
        box.innerHTML = `<p class="muted">Brak intencji.</p>`;
        return;
    }

    box.innerHTML = `
        <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>Data</th><th>Msza</th><th>Intencja</th><th>Akcje</th></tr>
                </thead>
                <tbody>
                    ${parishAdminIntentions.map(intention => {
                        const mass = massMap.get(String(intention.mass_schedule_id));
                        return `
                            <tr>
                                <td>${escapeHtml(datePL(intention.mass_date))}</td>
                                <td>${escapeHtml(mass ? `${mass.days_label} — ${parishFormatTime(mass.mass_time)} — ${mass.church_name || ""}` : "Brak powiązanej Mszy")}</td>
                                <td style="white-space:pre-wrap;">${escapeHtml(intention.intention)}</td>
                                <td class="actions">
                                    <button onclick='editParishIntention(${JSON.stringify(intention)})'>✏️</button>
                                    <button onclick="deleteParishIntention('${intention.id}')">🗑️</button>
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function showParishIntentionForm() {
    if (!parishAdminMasses.length) {
        alert("Najpierw dodaj termin Mszy Świętej.");
        return;
    }

    $("parishIntentionForm").classList.remove("hidden");
    $("parishIntentionId").value = "";
    $("parishIntentionDate").value = "";
    $("parishIntentionText").value = "";
    parishFillIntentionScheduleSelect();
}

function cancelParishIntentionForm() {
    $("parishIntentionForm").classList.add("hidden");
}

function editParishIntention(intention) {
    $("parishIntentionForm").classList.remove("hidden");
    $("parishIntentionId").value = intention.id;
    $("parishIntentionDate").value = intention.mass_date || "";
    $("parishIntentionText").value = intention.intention || "";
    parishFillIntentionScheduleSelect(intention.mass_schedule_id || "");
}

async function saveParishIntention() {
    const scheduleId = $("parishIntentionSchedule").value;
    const date = $("parishIntentionDate").value;
    const text = $("parishIntentionText").value.trim();

    if (!scheduleId || !date || !text) {
        alert("Wybierz Mszę, podaj datę i wpisz intencję.");
        return;
    }

    const payload = {
        mass_schedule_id: Number(scheduleId),
        mass_date: date,
        intention: text,
        updated_at: new Date().toISOString()
    };

    const id = $("parishIntentionId").value;
    let result;

    if (id) {
        result = await supabaseClient.from("parish_mass_intentions").update(payload).eq("id", id);
    } else {
        result = await supabaseClient.from("parish_mass_intentions").insert(payload);
    }

    if (result.error) {
        alert(result.error.message);
        return;
    }

    cancelParishIntentionForm();
    await loadAdminParishIntentions();
}

async function deleteParishIntention(id) {
    if (!confirm("Usunąć tę intencję?")) return;

    const { error } = await supabaseClient.from("parish_mass_intentions").delete().eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    await loadAdminParishIntentions();
}

/* =====================================================
   ADMIN: ANNOUNCEMENTS
===================================================== */

async function loadAdminParishAnnouncements() {
    const box = $("adminParishAnnouncements");
    if (!box) return;

    const { data, error } = await supabaseClient
        .from("parish_announcements")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        box.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
        return;
    }

    parishAdminAnnouncements = data || [];

    if (!parishAdminAnnouncements.length) {
        box.innerHTML = `<p class="muted">Brak ogłoszeń.</p>`;
        return;
    }

    box.innerHTML = parishAdminAnnouncements.map(announcement => `
        <div class="news-box" style="margin-top:0;margin-bottom:12px;">
            <div class="section-title">
                <strong>${escapeHtml(announcement.title)}</strong>
                ${announcement.published ? `<span class="badge badge-paid">Opublikowane</span>` : `<span class="badge badge-cancelled">Ukryte</span>`}
            </div>
            <div class="muted" style="margin-top:6px;">${escapeHtml(parishDateTime(announcement.created_at))}</div>
            <div class="actions" style="margin-top:10px;">
                <button onclick='editParishAnnouncement(${JSON.stringify(announcement)})'>✏️ Edytuj</button>
                <button onclick="deleteParishAnnouncement('${announcement.id}')">🗑️ Usuń</button>
            </div>
        </div>
    `).join("");
}

function showParishAnnouncementForm() {
    $("parishAnnouncementForm").classList.remove("hidden");
    $("parishAnnouncementId").value = "";
    $("parishAnnouncementTitle").value = "";
    $("parishAnnouncementContent").value = "";
    $("parishAnnouncementPublished").value = "true";
}

function cancelParishAnnouncementForm() {
    $("parishAnnouncementForm").classList.add("hidden");
}

function editParishAnnouncement(announcement) {
    $("parishAnnouncementForm").classList.remove("hidden");
    $("parishAnnouncementId").value = announcement.id;
    $("parishAnnouncementTitle").value = announcement.title || "";
    $("parishAnnouncementContent").value = announcement.content || "";
    $("parishAnnouncementPublished").value = announcement.published ? "true" : "false";
}

async function saveParishAnnouncement() {
    const title = $("parishAnnouncementTitle").value.trim();
    const content = $("parishAnnouncementContent").value.trim();

    if (!title || !content) {
        alert("Podaj tytuł i treść ogłoszenia.");
        return;
    }

    const payload = {
        title,
        content,
        published: $("parishAnnouncementPublished").value === "true",
        updated_at: new Date().toISOString()
    };

    const id = $("parishAnnouncementId").value;
    let result;

    if (id) {
        result = await supabaseClient.from("parish_announcements").update(payload).eq("id", id);
    } else {
        result = await supabaseClient.from("parish_announcements").insert(payload);
    }

    if (result.error) {
        alert(result.error.message);
        return;
    }

    cancelParishAnnouncementForm();
    await loadAdminParishAnnouncements();
}

async function deleteParishAnnouncement(id) {
    if (!confirm("Usunąć to ogłoszenie?")) return;

    const { error } = await supabaseClient.from("parish_announcements").delete().eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    await loadAdminParishAnnouncements();
}

/* =====================================================
   ADMIN LOAD HOOK
===================================================== */

if (typeof loadAdminData === "function" && !window.__parishAdminHookInstalled) {
    window.__parishAdminHookInstalled = true;

    const parishOriginalLoadAdminData = loadAdminData;

    loadAdminData = async function() {
        ensureParishAdminCard();
        await parishOriginalLoadAdminData();
        await loadAdminParish();
    };
}

ensureParishPage();
if (typeof isAdmin === "function" && isAdmin()) ensureParishAdminCard();
