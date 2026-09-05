async function loadMyTaxes() {

    const box = $("myTaxesContent");

    box.innerHTML =
        `<div class="card">Ładowanie...</div>`;

    const { data, error } =
        await supabaseClient
            .from("tax_liabilities")
            .select(`
                *,
                properties (
                    plot_number,
                    address
                ),
                tax_rates (
                    name
                )
            `)
            .eq("user_id", currentUser.id)
            .order("created_at", {
                ascending: false
            });

    if (error) {

        box.innerHTML =
            `<div class="card">${escapeHtml(error.message)}</div>`;

        return;
    }

    if (!data.length) {

        box.innerHTML =
            `<div class="card">
                <h3>Brak podatków</h3>
                <p class="muted">
                    Aktualnie nie masz przypisanych żadnych podatków.
                </p>
            </div>`;

        return;
    }

    const total = data.reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
    );

    box.innerHTML = `

        <div class="card">

            <div class="section-title">
                <div>
                    <h2>🧾 Podatki</h2>
                    <p class="muted">
                        Suma wszystkich zobowiązań: <strong>${money(total)}</strong>
                    </p>
                </div>
            </div>

            <div class="table-wrap">

                <table>

                    <thead>
                        <tr>
                            <th>Podatek</th>
                            <th>Kwota</th>
                            <th>Termin</th>
                            <th>Nieruchomość</th>
                            <th>Status</th>
                            <th>Notatka</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${data.map(t => `

                            <tr>

                                <td>
                                    <strong>${escapeHtml(t.title)}</strong>
                                    ${t.tax_rates?.name
                                        ? `<div class="small">${escapeHtml(t.tax_rates.name)}</div>`
                                        : ""}
                                </td>

                                <td>${money(t.amount)}</td>

                                <td>${datePL(t.due_date)}</td>

                                <td>
                                    ${t.properties
                                        ? `Działka ${escapeHtml(t.properties.plot_number || "-")}
                                           <div class="small">${escapeHtml(t.properties.address || "")}</div>`
                                        : "-"}
                                </td>

                                <td>${statusBadge(t.status)}</td>

                                <td>${escapeHtml(t.note || "-")}</td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        </div>
    `;
}


/* =====================================================
   MY LICENSES
===================================================== */

async function loadMyLicenses() {

    const box = $("myLicensesContent");

    box.innerHTML =
        `<div class="card">Ładowanie...</div>`;

    const { data, error } =
        await supabaseClient
            .from("player_licenses")
            .select(`
                *,
                licenses (
                    name
                )
            `)
            .eq("user_id", currentUser.id)
            .order("created_at", {
                ascending: false
            });

    if (error) {

        box.innerHTML =
            `<div class="card">${escapeHtml(error.message)}</div>`;

        return;
    }

    if (!data.length) {

        box.innerHTML =
            `<div class="card">
                <h3>Brak licencji</h3>
                <p class="muted">
                    Nie masz jeszcze żadnej przypisanej licencji.
                </p>
            </div>`;

        return;
    }

    box.innerHTML = `

        <div class="card">

            <div class="table-wrap">

                <table>

                    <thead>
                        <tr>
                            <th>Licencja</th>
                            <th>Cena</th>
                            <th>Ważna od</th>
                            <th>Ważna do</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${data.map(l => `

                            <tr>

                                <td>
                                    <strong>${escapeHtml(l.name)}</strong>
                                    ${l.licenses?.name
                                        ? `<div class="small">${escapeHtml(l.licenses.name)}</div>`
                                        : ""}
                                </td>

                                <td>${money(l.price)}</td>

                                <td>${datePL(l.valid_from)}</td>

                                <td>${datePL(l.valid_until)}</td>

                                <td>${statusBadge(l.status)}</td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        </div>
    `;
}


/* =====================================================
   MY FEES
===================================================== */

async function loadMyFees() {

    const box = $("myFeesContent");

    box.innerHTML =
        `<div class="card">Ładowanie...</div>`;

    const { data, error } =
        await supabaseClient
            .from("player_fees")
            .select(`
                *,
                fees (
                    name
                )
            `)
            .eq("user_id", currentUser.id)
            .order("created_at", {
                ascending: false
            });

    if (error) {

        box.innerHTML =
            `<div class="card">${escapeHtml(error.message)}</div>`;

        return;
    }

    if (!data.length) {

        box.innerHTML =
            `<div class="card">
                <h3>Brak opłat</h3>
                <p class="muted">
                    Nie masz obecnie żadnych przypisanych opłat.
                </p>
            </div>`;

        return;
    }

    const total = data.reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
    );

    box.innerHTML = `

        <div class="card">

            <div class="section-title">
                <div>
                    <h2>🧾 Podatki</h2>
                    <p class="muted">
                        Suma wszystkich zobowiązań: <strong>${money(total)}</strong>
                    </p>
                </div>
            </div>

            <div class="table-wrap">

                <table>

                    <thead>
                        <tr>
                            <th>Opłata</th>
                            <th>Kwota</th>
                            <th>Termin</th>
                            <th>Status</th>
                            <th>Notatka</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${data.map(f => `

                            <tr>

                                <td>
                                    <strong>${escapeHtml(f.name)}</strong>
                                    ${f.fees?.name
                                        ? `<div class="small">${escapeHtml(f.fees.name)}</div>`
                                        : ""}
                                </td>

                                <td>${money(f.amount)}</td>

                                <td>${datePL(f.due_date)}</td>

                                <td>${statusBadge(f.status)}</td>

                                <td>${escapeHtml(f.note || "-")}</td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        </div>
    `;
}


/* =====================================================
   MY PROPERTIES
===================================================== */

async function loadMyProperties() {

    const box = $("myPropertiesContent");

    box.innerHTML =
        `<div class="card">Ładowanie...</div>`;

    const { data, error } =
        await supabaseClient
            .from("properties")
            .select("*")
            .eq("owner_id", currentUser.id)
            .order("created_at", {
                ascending: false
            });

    if (error) {

        box.innerHTML =
            `<div class="card">${escapeHtml(error.message)}</div>`;

        return;
    }

    if (!data.length) {

        box.innerHTML =
            `<div class="card">
                <h3>Brak nieruchomości</h3>
                <p class="muted">
                    Nie masz jeszcze przypisanych nieruchomości.
                </p>
            </div>`;

        return;
    }

    box.innerHTML = `

        <div class="card">

            <div class="table-wrap">

                <table>

                    <thead>
                        <tr>
                            <th>Działka</th>
                            <th>Adres</th>
                            <th>Typ</th>
                            <th>Wartość</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${data.map(p => `

                            <tr>

                                <td>${escapeHtml(p.plot_number || "-")}</td>

                                <td>${escapeHtml(p.address || "-")}</td>

                                <td>${escapeHtml(p.property_type || "-")}</td>

                                <td>${money(p.value)}</td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        </div>
    `;
}


/* =====================================================
   LOAD DEFINITIONS
===================================================== */

async function loadDefinitions() {

    const taxes =
        await supabaseClient
            .from("tax_rates")
            .select("*")
            .order("name");

    if (!taxes.error) {
        taxDefinitions = taxes.data || [];
    }

    const licenses =
        await supabaseClient
            .from("licenses")
            .select("*")
            .order("name");

    if (!licenses.error) {
        licenseDefinitions = licenses.data || [];
    }

    const fees =
        await supabaseClient
            .from("fees")
            .select("*")
            .order("name");

    if (!fees.error) {
        feeDefinitions = fees.data || [];
    }
}


/* =====================================================
   TAX RULES
===================================================== */

async function renderTaxRules() {

    const box = $("taxRulesContent");

    await loadDefinitions();

    if (!taxDefinitions.length) {

        box.innerHTML =
            `<div class="card">Brak zdefiniowanych stawek.</div>`;

        return;
    }

    box.innerHTML = `

        <div class="card">

            <div class="table-wrap">

                <table>

                    <thead>
                        <tr>
                            <th>Nazwa</th>
                            <th>Stawka</th>
                            <th>Jednostka</th>
                            <th>Opis</th>
                            <th>Aktywna</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${taxDefinitions.map(t => `

                            <tr>

                                <td>
                                    <strong>${escapeHtml(t.name)}</strong>
                                </td>

                                <td>${money(t.rate)}</td>

                                <td>${escapeHtml(t.unit || "DX")}</td>

                                <td>${escapeHtml(t.description || "-")}</td>

                                <td>
                                    ${t.active
                                        ? statusBadge("active")
                                        : statusBadge("cancelled")}
                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        </div>
    `;
}


/* =====================================================
   ADMIN DATA
===================================================== */

async function loadAdminData() {

    await loadServerSettings();
    await loadDefinitions();

    await loadPlayers();

    await loadAdminStats();

    fillDefinitionSelects();

    if (selectedPlayer) {
        await loadSelectedPlayer();
    } else {
        clearAdminTables();
    }

    await renderAdminDefinitions();
    await loadCourtAdmin();
}


/* =====================================================
   PLAYERS
===================================================== */

async function loadPlayers() {

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .order("minecraft_nick");

    if (error) {

        console.error(error);

        players = [];

        return;
    }

    players = data || [];

    const select =
        $("adminPlayerSelect");

    const old =
        select.value;

    select.innerHTML =
        `<option value="">-- wybierz gracza --</option>`;

    players
        .filter(p => p.role !== "admin")
        .forEach(p => {

            const name =
                p.minecraft_nick ||
                p.display_name ||
                p.username ||
                p.id;

            const option =
                document.createElement("option");

            option.value = p.id;

            option.textContent = name;

            select.appendChild(option);
        });

    if (old && players.some(p => p.id === old)) {
        select.value = old;
    }
}


/* =====================================================
   SELECT PLAYER
===================================================== */

async function loadSelectedPlayer() {

    const id =
        $("adminPlayerSelect").value;

    if (!id) {

        selectedPlayer = null;

        clearAdminTables();

        $("selectedPlayerInfo").textContent = "";

        return;
    }

    selectedPlayer =
        players.find(p => p.id === id);

    if (!selectedPlayer) return;

    const name =
        selectedPlayer.minecraft_nick ||
        selectedPlayer.display_name ||
        selectedPlayer.username;

    $("selectedPlayerInfo").innerHTML =
        `Wybrany gracz: <strong>${escapeHtml(name)}</strong>`;

    await loadPlayerProperties();

    await loadAdminTaxes();

    await loadAdminLicenses();

    await loadAdminFees();
    await loadAdminSalaries();
}


/* =====================================================
   ADMIN STATS
===================================================== */

async function loadAdminStats() {

    const playerCount =
        players.filter(p => p.role !== "admin").length;

    $("statPlayers").textContent =
        playerCount;

    const taxes =
        await supabaseClient
            .from("tax_liabilities")
            .select("id", {
                count: "exact",
                head: true
            });

    $("statTaxes").textContent =
        taxes.count || 0;

    const licenses =
        await supabaseClient
            .from("player_licenses")
            .select("id", {
                count: "exact",
                head: true
            });

    $("statLicenses").textContent =
        licenses.count || 0;

    const fees =
        await supabaseClient
            .from("player_fees")
            .select("id", {
                count: "exact",
                head: true
            });

    $("statFees").textContent =
        fees.count || 0;
}


/* =====================================================
   ADMIN TAXES
===================================================== */

async function loadAdminTaxes() {

    const box =
        $("adminTaxesContent");

    if (!selectedPlayer) {

        box.innerHTML =
            `<p class="muted">Najpierw wybierz gracza.</p>`;

        return;
    }

    const { data, error } =
        await supabaseClient
            .from("tax_liabilities")
            .select(`
                *,
                properties (
                    plot_number,
                    address
                ),
                tax_rates (
                    name
                )
            `)
            .eq("user_id", selectedPlayer.id)
            .order("created_at", {
                ascending: false
            });

    if (error) {

        box.innerHTML =
            `<p>${escapeHtml(error.message)}</p>`;

        return;
    }

    if (!data.length) {

        box.innerHTML =
            `<p class="muted">Ten gracz nie ma podatków.</p>`;

        return;
    }

    const total = data.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    box.innerHTML = `

        <p class="muted"><strong>Suma podatków:</strong> ${money(total)}</p>

            <div class="table-wrap">

            <table>

                <thead>

                    <tr>
                        <th>Podatek</th>
                        <th>Kwota</th>
                        <th>Termin</th>
                        <th>Nieruchomość</th>
                        <th>Status</th>
                        <th>Akcje</th>
                    </tr>

                </thead>

                <tbody>

                    ${data.map(t => `

                        <tr>

                            <td>
                                <strong>${escapeHtml(t.title)}</strong>
                            </td>

                            <td>${money(t.amount)}</td>

                            <td>${datePL(t.due_date)}</td>

                            <td>
                                ${t.properties
                                    ? `${escapeHtml(t.properties.plot_number || "-")}`
                                    : "-"}
                            </td>

                            <td>${statusBadge(t.status)}</td>

                            <td>

                                <div class="actions">

                                    <button
                                        onclick='editTax(${JSON.stringify(t)})'>
                                        ✏️
                                    </button>

                                    <button
                                        class="danger"
                                        onclick="deleteTax('${t.id}')">
                                        🗑️
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>
    `;
}


/* =====================================================
   TAX FORM
===================================================== */

function showTaxAddForm() {

    if (!selectedPlayer) {

        alert("Najpierw wybierz gracza.");

        return;
    }

    $("adminTaxForm").classList.remove("hidden");

    $("editTaxId").value = "";

    $("taxTitle").value = "";
    $("taxAmount").value = "";
    $("taxDueDate").value = "";
    $("taxStatus").value = "unpaid";
    $("taxNote").value = "";

    fillDefinitionSelects();
    fillPropertySelect();
}

function cancelTaxForm() {

    $("adminTaxForm").classList.add("hidden");
}

function editTax(tax) {

    $("adminTaxForm").classList.remove("hidden");

    $("editTaxId").value = tax.id;

    $("taxTitle").value =
        tax.title || "";

    $("taxAmount").value =
        tax.amount || "";

    $("taxDueDate").value =
        tax.due_date || "";

    $("taxStatus").value =
        tax.status || "unpaid";

    $("taxNote").value =
        tax.note || "";

    fillDefinitionSelects();
    fillPropertySelect();

    $("taxDefinitionSelect").value =
        tax.tax_id || "";

    $("taxPropertySelect").value =
        tax.property_id || "";
}

async function saveAdminTax() {

    if (!selectedPlayer) {

        alert("Najpierw wybierz gracza.");

        return;
    }

    const id =
        $("editTaxId").value;

    const payload = {

        user_id: selectedPlayer.id,

        title:
            $("taxTitle").value.trim(),

        amount:
            Number($("taxAmount").value || 0),

        due_date:
            $("taxDueDate").value || null,

        tax_id:
            $("taxDefinitionSelect").value || null,

        property_id:
            $("taxPropertySelect").value || null,

        status:
            $("taxStatus").value,

        note:
            $("taxNote").value.trim() || null

    };

    if (!payload.title) {

        alert("Podaj nazwę podatku.");

        return;
    }

    let result;

    if (id) {

        result =
            await supabaseClient
                .from("tax_liabilities")
                .update(payload)
                .eq("id", id);

    } else {

        result =
            await supabaseClient
                .from("tax_liabilities")
                .insert(payload);
    }

    if (result.error) {

        alert(result.error.message);

        return;
    }

    cancelTaxForm();

    await loadAdminTaxes();

    await loadAdminStats();
}

async function deleteTax(id) {

    if (!confirm("Usunąć ten podatek graczowi?")) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("tax_liabilities")
            .delete()
            .eq("id", id);

    if (error) {

        alert(error.message);

        return;
    }

    await loadAdminTaxes();
    await loadAdminStats();
}


/* =====================================================
   PLAYER PROPERTIES
===================================================== */

async function loadPlayerProperties() {

    if (!selectedPlayer) return;

    const { data, error } =
        await supabaseClient
            .from("properties")
            .select("*")
            .eq("owner_id", selectedPlayer.id)
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(error);

        selectedPlayerProperties = [];

        return;
    }

    selectedPlayerProperties =
        data || [];

    renderAdminProperties();
}

function renderAdminProperties() {

    const box =
        $("adminPropertiesContent");

    if (!selectedPlayer) {

        box.innerHTML =
            `<p class="muted">Najpierw wybierz gracza.</p>`;

        return;
    }

    if (!selectedPlayerProperties.length) {

        box.innerHTML =
            `<p class="muted">
                Ten gracz nie ma jeszcze nieruchomości.
            </p>`;

        return;
    }

    box.innerHTML = `

        <div class="table-wrap">

            <table>

                <thead>

                    <tr>
                        <th>Działka</th>
                        <th>Adres</th>
                        <th>Typ</th>
                        <th>Wartość</th>
                        <th>Akcje</th>
                    </tr>

                </thead>

                <tbody>

                    ${selectedPlayerProperties.map(p => `

                        <tr>

                            <td>${escapeHtml(p.plot_number || "-")}</td>

                            <td>${escapeHtml(p.address || "-")}</td>

                            <td>${escapeHtml(p.property_type || "-")}</td>

                            <td>${money(p.value)}</td>

                            <td>

                                <div class="actions">

                                    <button
                                        onclick='editProperty(${JSON.stringify(p)})'>
                                        ✏️
                                    </button>

                                    <button
                                        class="danger"
                                        onclick="deleteProperty('${p.id}')">
                                        🗑️
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>
    `;
}


/* =====================================================
   PROPERTY FORM
===================================================== */

function showPropertyAddForm() {

    if (!selectedPlayer) {

        alert("Najpierw wybierz gracza.");

        return;
    }

    $("adminPropertyForm")
        .classList.remove("hidden");

    $("editPropertyId").value = "";

    $("propertyPlot").value = "";
    $("propertyAddress").value = "";
    $("propertyType").value = "";
    $("propertyValue").value = "";
}

function cancelPropertyForm() {

    $("adminPropertyForm")
        .classList.add("hidden");
}

function editProperty(p) {

    $("adminPropertyForm")
        .classList.remove("hidden");

    $("editPropertyId").value =
        p.id;

    $("propertyPlot").value =
        p.plot_number || "";

    $("propertyAddress").value =
        p.address || "";

    $("propertyType").value =
        p.property_type || "";

    $("propertyValue").value =
        p.value || "";
}

async function saveAdminProperty() {

    if (!selectedPlayer) {

        alert("Najpierw wybierz gracza.");

        return;
    }

    const id =
        $("editPropertyId").value;

    const payload = {

        owner_id:
            selectedPlayer.id,

        plot_number:
            $("propertyPlot").value.trim(),

        address:
            $("propertyAddress").value.trim(),

        owner_name:
            selectedPlayer.minecraft_nick ||
            selectedPlayer.display_name ||
            selectedPlayer.username,

        property_type:
            $("propertyType").value.trim(),

        value:
            Number($("propertyValue").value || 0)

    };

    let result;

    if (id) {

        result =
            await supabaseClient
                .from("properties")
                .update(payload)
                .eq("id", id);

    } else {

        result =
            await supabaseClient
                .from("properties")
                .insert(payload);
    }

    if (result.error) {

        alert(result.error.message);

        return;
    }

    cancelPropertyForm();

    await loadPlayerProperties();
}

async function deleteProperty(id) {

    if (!confirm("Usunąć nieruchomość?")) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("properties")
            .delete()
            .eq("id", id);

    if (error) {

        alert(error.message);

        return;
    }

    await loadPlayerProperties();
}


/* =====================================================
   ADMIN LICENSES
===================================================== */

async function loadAdminLicenses() {

    const box =
        $("adminLicensesContent");

    if (!selectedPlayer) {

        box.innerHTML =
            `<p class="muted">Najpierw wybierz gracza.</p>`;

        return;
    }

    const { data, error } =
        await supabaseClient
            .from("player_licenses")
            .select(`
                *,
                licenses (
                    name
                )
            `)
            .eq("user_id", selectedPlayer.id)
            .order("created_at", {
                ascending: false
            });

    if (error) {

        box.innerHTML =
            `<p>${escapeHtml(error.message)}</p>`;

        return;
    }

    if (!data.length) {

        box.innerHTML =
            `<p class="muted">Brak licencji tego gracza.</p>`;

        return;
    }

    box.innerHTML = `

        <div class="table-wrap">

            <table>

                <thead>

                    <tr>
                        <th>Licencja</th>
                        <th>Cena</th>
                        <th>Ważna do</th>
                        <th>Status</th>
                        <th>Akcje</th>
                    </tr>

                </thead>

                <tbody>

                    ${data.map(l => `

                        <tr>

                            <td>${escapeHtml(l.name)}</td>

                            <td>${money(l.price)}</td>

                            <td>${datePL(l.valid_until)}</td>

                            <td>${statusBadge(l.status)}</td>

                            <td>

                                <div class="actions">

                                    <button
                                        onclick='editLicense(${JSON.stringify(l)})'>
                                        ✏️
                                    </button>

                                    <button
                                        class="danger"
                                        onclick="deleteLicense('${l.id}')">
                                        🗑️
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>
    `;
}


/* =====================================================
   LICENSE FORM
===================================================== */

function showLicenseAddForm() {

    if (!selectedPlayer) {

        alert("Najpierw wybierz gracza.");

        return;
    }

    $("adminLicenseForm")
        .classList.remove("hidden");

    $("editLicenseId").value = "";

    $("playerLicenseName").value = "";
    $("playerLicensePrice").value = "";
    $("licenseFrom").value = "";
    $("licenseUntil").value = "";
    $("licenseStatus").value = "active";
    $("licenseNote").value = "";

    fillDefinitionSelects();
}

function cancelLicenseForm() {

    $("adminLicenseForm")
        .classList.add("hidden");
}

function editLicense(l) {

    $("adminLicenseForm")
        .classList.remove("hidden");

    $("editLicenseId").value =
        l.id;

    $("playerLicenseName").value =
        l.name || "";

    $("playerLicensePrice").value =
        l.price || "";

    $("licenseFrom").value =
        l.valid_from || "";

    $("licenseUntil").value =
        l.valid_until || "";

    $("licenseStatus").value =
        l.status || "active";

    $("licenseNote").value =
        l.note || "";

    fillDefinitionSelects();

    $("licenseDefinitionSelect").value =
        l.license_id || "";
}

async function saveAdminLicense() {

    if (!selectedPlayer) {

        alert("Najpierw wybierz gracza.");

        return;
    }

    const id =
        $("editLicenseId").value;

    const payload = {

        user_id:
            selectedPlayer.id,

        license_id:
            $("licenseDefinitionSelect").value || null,

        name:
            $("playerLicenseName").value.trim(),

        price:
            Number($("playerLicensePrice").value || 0),

        valid_from:
            $("licenseFrom").value || null,

        valid_until:
            $("licenseUntil").value || null,

        status:
            $("licenseStatus").value,

        note:
            $("licenseNote").value.trim() || null

    };

    if (!payload.name) {

        alert("Podaj nazwę licencji.");

        return;
    }

    let result;

    if (id) {

        result =
            await supabaseClient
                .from("player_licenses")
                .update(payload)
                .eq("id", id);

    } else {

        result =
            await supabaseClient
                .from("player_licenses")
                .insert(payload);
    }

    if (result.error) {

        alert(result.error.message);

        return;
    }

    cancelLicenseForm();

    await loadAdminLicenses();

    await loadAdminStats();
}

async function deleteLicense(id) {

    if (!confirm("Usunąć tę licencję graczowi?")) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("player_licenses")
            .delete()
            .eq("id", id);

    if (error) {

        alert(error.message);

        return;
    }

    await loadAdminLicenses();

    await loadAdminStats();
}


/* =====================================================
   COURT
===================================================== */

async function loadCourtPublic() {
    const [v, a, s] = await Promise.all([
        supabaseClient.from("court_verdicts").select("*").eq("published", true).order("issued_at", { ascending: false }),
        supabaseClient.from("court_acts").select("*").eq("access_type", "Jawne").order("created_at", { ascending: false }),
        supabaseClient.from("court_schedule").select("*").order("event_date", { ascending: true }).order("event_time", { ascending: true })
    ]);

    if (v.error) $("courtVerdictsContent").innerHTML = `<p class="muted">${escapeHtml(v.error.message)}</p>`;
    else if (!v.data.length) $("courtVerdictsContent").innerHTML = `<p class="muted">Brak opublikowanych wyroków.</p>`;
    else $("courtVerdictsContent").innerHTML = `<div class="table-wrap"><table><thead><tr><th>Sąd</th><th>Typ</th><th>Sprawa</th><th>Tytuł</th><th>Data</th><th>Status</th></tr></thead><tbody>${v.data.map(x => `<tr><td>${escapeHtml(x.court_type)}</td><td>${escapeHtml(x.verdict_type)}</td><td>${escapeHtml(x.case_number)}</td><td><strong>${escapeHtml(x.title)}</strong><br><span class="muted">${escapeHtml(x.verdict_text)}</span></td><td>${datePL(x.issued_at)}</td><td>${escapeHtml(x.status)}</td></tr>`).join("")}</tbody></table></div>`;

    if (a.error) $("courtActsContent").innerHTML = `<p class="muted">${escapeHtml(a.error.message)}</p>`;
    else if (!a.data.length) $("courtActsContent").innerHTML = `<p class="muted">Brak jawnych akt.</p>`;
    else $("courtActsContent").innerHTML = `<div class="table-wrap"><table><thead><tr><th>Sprawa</th><th>Tytuł</th><th>Treść</th></tr></thead><tbody>${a.data.map(x => `<tr><td>${escapeHtml(x.case_number)}</td><td>${escapeHtml(x.title)}</td><td>${escapeHtml(x.content)}</td></tr>`).join("")}</tbody></table></div>`;

    if (s.error) $("courtScheduleContent").innerHTML = `<p class="muted">${escapeHtml(s.error.message)}</p>`;
    else if (!s.data.length) $("courtScheduleContent").innerHTML = `<p class="muted">Brak zaplanowanych terminów.</p>`;
    else $("courtScheduleContent").innerHTML = `<div class="table-wrap"><table><thead><tr><th>Data</th><th>Godzina</th><th>Rodzaj</th><th>Tytuł</th><th>Sprawa</th><th>Opis</th></tr></thead><tbody>${s.data.map(x => `<tr><td>${datePL(x.event_date)}</td><td>${escapeHtml(x.event_time || "-")}</td><td>${escapeHtml(x.event_type)}</td><td><strong>${escapeHtml(x.title)}</strong></td><td>${escapeHtml(x.case_number || "-")}</td><td>${escapeHtml(x.description || "-")}</td></tr>`).join("")}</tbody></table></div>`;
}

async function loadCourtAdmin() {
    await Promise.all([loadAdminCourtVerdicts(), loadAdminCourtActs(), loadAdminCourtSchedule()]);
}

async function loadAdminCourtVerdicts() {
    const box = $("adminCourtVerdictsContent");
    const { data, error } = await supabaseClient.from("court_verdicts").select("*").order("issued_at", { ascending: false });
    if (error) { box.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`; return; }
    box.innerHTML = data.length ? `<div class="table-wrap"><table><thead><tr><th>Sąd</th><th>Typ</th><th>Sprawa</th><th>Tytuł</th><th>Publikacja</th><th>Akcje</th></tr></thead><tbody>${data.map(x => `<tr><td>${escapeHtml(x.court_type)}</td><td>${escapeHtml(x.verdict_type)}</td><td>${escapeHtml(x.case_number)}</td><td>${escapeHtml(x.title)}</td><td>${x.published ? "Opublikowany" : "Ukryty"}</td><td><button onclick='editCourtVerdict(${JSON.stringify(x)})'>✏️</button> <button onclick="deleteCourtVerdict('${x.id}')">🗑️</button></td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Brak wyroków.</p>`;
}

function showCourtVerdictForm() {
    $("courtVerdictForm").classList.remove("hidden");
    $("editCourtVerdictId").value = "";
    $("courtType").value = "Sąd";
    $("verdictType").value = "Zwykły";
    $("verdictCaseNumber").value = "";
    $("verdictTitle").value = "";
    $("verdictJudges").value = "";
    $("verdictParties").value = "";
    $("verdictIssuedAt").value = new Date().toISOString().slice(0,10);
    $("verdictStatus").value = "Obowiązuje";
    $("verdictText").value = "";
    $("verdictReasoning").value = "";
}
function cancelCourtVerdictForm() { $("courtVerdictForm").classList.add("hidden"); }
function editCourtVerdict(x) { showCourtVerdictForm(); $("editCourtVerdictId").value=x.id; $("courtType").value=x.court_type; $("verdictType").value=x.verdict_type; $("verdictCaseNumber").value=x.case_number; $("verdictTitle").value=x.title; $("verdictJudges").value=x.judges||""; $("verdictParties").value=x.parties||""; $("verdictIssuedAt").value=x.issued_at||""; $("verdictStatus").value=x.status; $("verdictText").value=x.verdict_text||""; $("verdictReasoning").value=x.reasoning||""; }
async function saveCourtVerdict() {
    if (!isAdmin()) return;
    const payload={court_type:$("courtType").value,verdict_type:$("verdictType").value,case_number:$("verdictCaseNumber").value.trim(),title:$("verdictTitle").value.trim(),judges:$("verdictJudges").value.trim()||null,parties:$("verdictParties").value.trim()||null,issued_at:$("verdictIssuedAt").value, status:$("verdictStatus").value,verdict_text:$("verdictText").value.trim(),reasoning:$("verdictReasoning").value.trim()||null};
    if (!payload.case_number || !payload.title || !payload.verdict_text) { alert("Wypełnij numer sprawy, tytuł i treść wyroku."); return; }
    const id=$("editCourtVerdictId").value; const q=id ? supabaseClient.from("court_verdicts").update(payload).eq("id",id) : supabaseClient.from("court_verdicts").insert(payload);
    const {error}=await q; if(error){alert(error.message);return;} cancelCourtVerdictForm(); await loadCourtAdmin();
}
async function deleteCourtVerdict(id) { if(!confirm("Usunąć ten wyrok?")) return; const {error}=await supabaseClient.from("court_verdicts").delete().eq("id",id); if(error) alert(error.message); else await loadCourtAdmin(); }

async function loadAdminCourtActs() {
    const box=$("adminCourtActsContent"); const {data,error}=await supabaseClient.from("court_acts").select("*").order("created_at",{ascending:false});
    if(error){box.innerHTML=`<p class="muted">${escapeHtml(error.message)}</p>`;return;}
    box.innerHTML=data.length?`<div class="table-wrap"><table><thead><tr><th>Sprawa</th><th>Tytuł</th><th>Dostęp</th><th>Akcje</th></tr></thead><tbody>${data.map(x=>`<tr><td>${escapeHtml(x.case_number)}</td><td>${escapeHtml(x.title)}</td><td>${escapeHtml(x.access_type)}</td><td><button onclick='editCourtAct(${JSON.stringify(x)})'>✏️</button> <button onclick="deleteCourtAct('${x.id}')">🗑️</button></td></tr>`).join("")}</tbody></table></div>`:`<p class="muted">Brak akt.</p>`;
}
function showCourtActForm(){ $("courtActForm").classList.remove("hidden"); $("editCourtActId").value=""; $("actCaseNumber").value=""; $("actTitle").value=""; $("actAccess").value="Jawne"; $("actContent").value=""; }
function cancelCourtActForm(){ $("courtActForm").classList.add("hidden"); }
function editCourtAct(x){showCourtActForm();$("editCourtActId").value=x.id;$("actCaseNumber").value=x.case_number;$("actTitle").value=x.title;$("actAccess").value=x.access_type;$("actContent").value=x.content||"";}
async function saveCourtAct(){if(!isAdmin())return;const payload={case_number:$("actCaseNumber").value.trim(),title:$("actTitle").value.trim(),access_type:$("actAccess").value,content:$("actContent").value.trim()};if(!payload.case_number||!payload.title){alert("Wypełnij numer sprawy i tytuł akt.");return;}const id=$("editCourtActId").value;const q=id?supabaseClient.from("court_acts").update(payload).eq("id",id):supabaseClient.from("court_acts").insert(payload);const{error}=await q;if(error){alert(error.message);return;}cancelCourtActForm();await loadCourtAdmin();}
async function deleteCourtAct(id){if(!confirm("Usunąć te akta?"))return;const{error}=await supabaseClient.from("court_acts").delete().eq("id",id);if(error)alert(error.message);else await loadCourtAdmin();}

async function loadAdminCourtSchedule(){const box=$("adminCourtScheduleContent");const{data,error}=await supabaseClient.from("court_schedule").select("*").order("event_date",{ascending:true}).order("event_time",{ascending:true});if(error){box.innerHTML=`<p class="muted">${escapeHtml(error.message)}</p>`;return;}box.innerHTML=data.length?`<div class="table-wrap"><table><thead><tr><th>Data</th><th>Godzina</th><th>Rodzaj</th><th>Tytuł</th><th>Sprawa</th><th>Akcje</th></tr></thead><tbody>${data.map(x=>`<tr><td>${datePL(x.event_date)}</td><td>${escapeHtml(x.event_time||"-")}</td><td>${escapeHtml(x.event_type)}</td><td>${escapeHtml(x.title)}</td><td>${escapeHtml(x.case_number||"-")}</td><td><button onclick='editCourtSchedule(${JSON.stringify(x)})'>✏️</button> <button onclick="deleteCourtSchedule('${x.id}')">🗑️</button></td></tr>`).join("")}</tbody></table></div>`:`<p class="muted">Brak terminów.</p>`;}
function showCourtScheduleForm(){ $("courtScheduleForm").classList.remove("hidden"); $("editCourtScheduleId").value=""; $("scheduleDate").value=new Date().toISOString().slice(0,10); $("scheduleTime").value=""; $("scheduleType").value="Rozprawa"; $("scheduleTitle").value=""; $("scheduleCaseNumber").value=""; $("scheduleDescription").value=""; }
function cancelCourtScheduleForm(){ $("courtScheduleForm").classList.add("hidden"); }
function editCourtSchedule(x){showCourtScheduleForm();$("editCourtScheduleId").value=x.id;$("scheduleDate").value=x.event_date;$("scheduleTime").value=x.event_time||"";$("scheduleType").value=x.event_type;$("scheduleTitle").value=x.title;$("scheduleCaseNumber").value=x.case_number||"";$("scheduleDescription").value=x.description||"";}
async function saveCourtSchedule(){if(!isAdmin())return;const payload={event_date:$("scheduleDate").value,event_time:$("scheduleTime").value||null,event_type:$("scheduleType").value.trim()||"Rozprawa",title:$("scheduleTitle").value.trim(),case_number:$("scheduleCaseNumber").value.trim()||null,description:$("scheduleDescription").value.trim()||null};if(!payload.event_date||!payload.title){alert("Wypełnij datę i tytuł.");return;}const id=$("editCourtScheduleId").value;const q=id?supabaseClient.from("court_schedule").update(payload).eq("id",id):supabaseClient.from("court_schedule").insert(payload);const{error}=await q;if(error){alert(error.message);return;}cancelCourtScheduleForm();await loadCourtAdmin();}
async function deleteCourtSchedule(id){if(!confirm("Usunąć ten termin?"))return;const{error}=await supabaseClient.from("court_schedule").delete().eq("id",id);if(error)alert(error.message);else await loadCourtAdmin();}


/* =====================================================
   ADMIN SALARIES
===================================================== */

async function loadAdminSalaries() {

    const box = $("adminSalariesContent");

    if (!selectedPlayer) {

        box.innerHTML =
            `<p class="muted">Najpierw wybierz gracza.</p>`;

        return;

    }

    const { data, error } =
        await supabaseClient
            .from("player_salaries")
            .select("*")
            .eq("user_id", selectedPlayer.id)
            .order("created_at", { ascending: false });

    if (error) {

        box.innerHTML =
            `<p class="muted">${escapeHtml(error.message)}</p>`;

        return;

    }

    if (!data.length) {

        box.innerHTML =
            `<p class="muted">Ten gracz nie ma jeszcze żadnych pensji.</p>`;

        return;

    }

    const total = data.reduce(
        (sum, s) => sum + Number(s.amount || 0),
        0
    );

    box.innerHTML = `

        <div class="summary-box">
            <strong>Suma pensji miesięcznie: ${money(total)}</strong>
        </div>

        <div class="table-wrap">

            <table>

                <thead>
                    <tr>
                        <th>Praca / budynek</th>
                        <th>Kwota miesięczna</th>
                        <th>Notatka</th>
                        <th>Akcje</th>
                    </tr>
                </thead>

                <tbody>

                    ${data.map(s => `
                        <tr>
                            <td><strong>${escapeHtml(s.job_name)}</strong></td>
                            <td>${money(s.amount)}</td>
                            <td>${escapeHtml(s.note || "-")}</td>
                            <td>
                                <button onclick='editSalary(${JSON.stringify(s)})'>✏️</button>
                                <button onclick="deleteSalary('${s.id}')">🗑️</button>
                            </td>
                        </tr>
                    `).join("")}

                </tbody>

            </table>

        </div>

    `;

}


function showSalaryAddForm() {

    if (!selectedPlayer) return;

    $("adminSalaryForm").classList.remove("hidden");

    $("editSalaryId").value = "";
    $("salaryJob").value = "";
    $("salaryAmount").value = "";
    $("salaryNote").value = "";

}


function cancelSalaryForm() {

    $("adminSalaryForm").classList.add("hidden");

}


function editSalary(s) {

    $("adminSalaryForm").classList.remove("hidden");

    $("editSalaryId").value = s.id;
    $("salaryJob").value = s.job_name || "";
    $("salaryAmount").value = s.amount ?? "";
    $("salaryNote").value = s.note || "";

}


async function saveAdminSalary() {

    if (!selectedPlayer) return;

    const id = $("editSalaryId").value;

    const payload = {

        user_id: selectedPlayer.id,
        job_name: $("salaryJob").value.trim(),
        amount: Number($("salaryAmount").value || 0),
        note: $("salaryNote").value.trim() || null

    };

    if (!payload.job_name) {

        alert("Wpisz, za jaką pracę lub budynek jest pensja.");

        return;

    }

    if (id) {

        const { error } =
            await supabaseClient
                .from("player_salaries")
                .update(payload)
                .eq("id", id);

        if (error) {

            alert(error.message);

            return;

        }

    } else {

        const { error } =
            await supabaseClient
                .from("player_salaries")
                .insert(payload);

        if (error) {

            alert(error.message);

            return;

        }

    }

    cancelSalaryForm();

    await loadAdminSalaries();
    await loadAdminStats();

}


async function deleteSalary(id) {

    if (!confirm("Usunąć tę pensję?")) return;

    const { error } =
        await supabaseClient
            .from("player_salaries")
            .delete()
            .eq("id", id);

    if (error) {

        alert(error.message);

        return;

    }

    await loadAdminSalaries();
    await loadAdminStats();

}


/* =====================================================
   ADMIN FEES
===================================================== */

async function loadAdminFees() {

    const box =
        $("adminFeesContent");

    if (!selectedPlayer) {

        box.innerHTML =
            `<p class="muted">Najpierw wybierz gracza.</p>`;

        return;
    }

    const { data, error } =
        await supabaseClient
            .from("player_fees")
            .select(`
                *,
                fees (
                    name
                )
            `)
            .eq("user_id", selectedPlayer.id)
            .order("created_at", {
                ascending: false
            });

    if (error) {

        box.innerHTML =
            `<p>${escapeHtml(error.message)}</p>`;

        return;
    }

    if (!data.length) {

        box.innerHTML =
            `<p class="muted">Brak opłat tego gracza.</p>`;

        return;
    }

    const total = data.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    box.innerHTML = `

        <p class="muted"><strong>Suma opłat:</strong> ${money(total)}</p>

            <div class="table-wrap">

            <table>

                <thead>

                    <tr>
                        <th>Opłata</th>
                        <th>Kwota</th>
                        <th>Termin</th>
                        <th>Status</th>
                        <th>Akcje</th>
                    </tr>

                </thead>

                <tbody>

                    ${data.map(f => `

                        <tr>

                            <td>${escapeHtml(f.name)}</td>

                            <td>${money(f.amount)}</td>

                            <td>${datePL(f.due_date)}</td>

                            <td>${statusBadge(f.status)}</td>

                            <td>

                                <div class="actions">

                                    <button
                                        onclick='editFee(${JSON.stringify(f)})'>
                                        ✏️
                                    </button>

                                    <button
                                        class="danger"
                                        onclick="deleteFee('${f.id}')">
                                        🗑️
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>
    `;
}


/* =====================================================
   FEE FORM
===================================================== */

function showFeeAddForm() {

    if (!selectedPlayer) {

        alert("Najpierw wybierz gracza.");

        return;
    }

    $("adminFeeForm")
        .classList.remove("hidden");

    $("editFeeId").value = "";

    $("playerFeeName").value = "";
    $("playerFeeAmount").value = "";
    $("feeDueDate").value = "";
    $("feeStatus").value = "unpaid";
    $("feeNote").value = "";

    fillDefinitionSelects();
}

function cancelFeeForm() {

    $("adminFeeForm")
        .classList.add("hidden");
}

function editFee(f) {

    $("adminFeeForm")
        .classList.remove("hidden");

    $("editFeeId").value =
        f.id;

    $("playerFeeName").value =
        f.name || "";

    $("playerFeeAmount").value =
        f.amount || "";

    $("feeDueDate").value =
        f.due_date || "";

    $("feeStatus").value =
        f.status || "unpaid";

    $("feeNote").value =
        f.note || "";

    fillDefinitionSelects();

    $("feeDefinitionSelect").value =
        f.fee_id || "";
}

async function saveAdminFee() {

    if (!selectedPlayer) {

        alert("Najpierw wybierz gracza.");

        return;
    }

    const id =
        $("editFeeId").value;

    const payload = {

        user_id:
            selectedPlayer.id,

        fee_id:
            $("feeDefinitionSelect").value || null,

        name:
            $("playerFeeName").value.trim(),

        amount:
            Number($("playerFeeAmount").value || 0),

        due_date:
            $("feeDueDate").value || null,

        status:
            $("feeStatus").value,

        note:
            $("feeNote").value.trim() || null

    };

    if (!payload.name) {

        alert("Podaj nazwę opłaty.");

        return;
    }

    let result;

    if (id) {

        result =
            await supabaseClient
                .from("player_fees")
                .update(payload)
                .eq("id", id);

    } else {

        result =
            await supabaseClient
                .from("player_fees")
                .insert(payload);
    }

    if (result.error) {

        alert(result.error.message);

        return;
    }

    cancelFeeForm();

    await loadAdminFees();

    await loadAdminStats();
}

async function deleteFee(id) {

    if (!confirm("Usunąć tę opłatę graczowi?")) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("player_fees")
            .delete()
            .eq("id", id);

    if (error) {

        alert(error.message);

        return;
    }

    await loadAdminFees();

    await loadAdminStats();
}


/* =====================================================
   SELECTS
===================================================== */

function fillDefinitionSelects() {

    const taxSelect =
        $("taxDefinitionSelect");

    if (taxSelect) {

        taxSelect.innerHTML =
            `<option value="">-- opcjonalnie --</option>`;

        taxDefinitions.forEach(t => {

            const option =
                document.createElement("option");

            option.value = t.id;

            option.textContent =
                `${t.name} — ${money(t.rate)}`;

            taxSelect.appendChild(option);
        });
    }


    const licenseSelect =
        $("licenseDefinitionSelect");

    if (licenseSelect) {

        licenseSelect.innerHTML =
            `<option value="">-- opcjonalnie --</option>`;

        licenseDefinitions.forEach(l => {

            const option =
                document.createElement("option");

            option.value = l.id;

            option.textContent =
                `${l.name} — ${money(l.price)}`;

            licenseSelect.appendChild(option);
        });
    }


    const feeSelect =
        $("feeDefinitionSelect");

    if (feeSelect) {

        feeSelect.innerHTML =
            `<option value="">-- opcjonalnie --</option>`;

        feeDefinitions.forEach(f => {

            const option =
                document.createElement("option");

            option.value = f.id;

            option.textContent =
                `${f.name} — ${money(f.amount)}`;

            feeSelect.appendChild(option);
        });
    }
}

function fillPropertySelect() {

    const select =
        $("taxPropertySelect");

    if (!select) return;

    select.innerHTML =
        `<option value="">-- brak --</option>`;

    selectedPlayerProperties.forEach(p => {

        const option =
            document.createElement("option");

        option.value = p.id;

        option.textContent =
            `Działka ${p.plot_number || "-"} — ${p.address || "brak adresu"}`;

        select.appendChild(option);
    });
}


/* =====================================================
   TAX DEFINITIONS ADMIN
===================================================== */

function showDefinitionForm() {

    $("definitionForm")
        .classList.remove("hidden");

    $("editDefinitionId").value = "";

    $("definitionName").value = "";
    $("definitionRate").value = "";
    $("definitionUnit").value = "DX";
    $("definitionDescription").value = "";
    $("definitionActive").value = "true";
}

function cancelDefinitionForm() {

    $("definitionForm")
        .classList.add("hidden");
}

async function saveDefinition() {

    const id =
        $("editDefinitionId").value;

    const payload = {

        name:
            $("definitionName").value.trim(),

        rate:
            Number($("definitionRate").value || 0),

        unit:
            $("definitionUnit").value.trim() || "DX",

        description:
            $("definitionDescription").value.trim() || null,

        active:
            $("definitionActive").value === "true"

    };

    if (!payload.name) {

        alert("Podaj nazwę stawki.");

        return;
    }

    let result;

    if (id) {

        result =
            await supabaseClient
                .from("tax_rates")
                .update(payload)
                .eq("id", id);

    } else {

        result =
            await supabaseClient
                .from("tax_rates")
                .insert(payload);
    }

    if (result.error) {

        alert(result.error.message);

        return;
    }

    cancelDefinitionForm();

    await loadDefinitions();

    await renderAdminDefinitions();

    fillDefinitionSelects();
}

async function renderAdminDefinitions() {

    const box =
        $("adminDefinitionsContent");

    await loadDefinitions();

    if (!taxDefinitions.length) {

        box.innerHTML =
            `<p class="muted">Brak definicji podatków.</p>`;

        return;
    }

    box.innerHTML = `

        <div class="table-wrap">

            <table>

                <thead>

                    <tr>
                        <th>Nazwa</th>
                        <th>Stawka</th>
                        <th>Jednostka</th>
                        <th>Aktywna</th>
                        <th>Akcje</th>
                    </tr>

                </thead>

                <tbody>

                    ${taxDefinitions.map(t => `

                        <tr>

                            <td>
                                <strong>${escapeHtml(t.name)}</strong>
                                <div class="small">
                                    ${escapeHtml(t.description || "")}
                                </div>
                            </td>

                            <td>${money(t.rate)}</td>

                            <td>${escapeHtml(t.unit || "DX")}</td>

                            <td>
                                ${t.active
                                    ? statusBadge("active")
                                    : statusBadge("cancelled")}
                            </td>

                            <td>

                                <div class="actions">

                                    <button
                                        onclick='editDefinition(${JSON.stringify(t)})'>
                                        ✏️
                                    </button>

                                    <button
                                        class="danger"
                                        onclick="deleteDefinition('${t.id}')">
                                        🗑️
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>
    `;
}

function editDefinition(t) {

    $("definitionForm")
        .classList.remove("hidden");

    $("editDefinitionId").value =
        t.id;

    $("definitionName").value =
        t.name || "";

    $("definitionRate").value =
        t.rate || "";

    $("definitionUnit").value =
        t.unit || "DX";

    $("definitionDescription").value =
        t.description || "";

    $("definitionActive").value =
        t.active ? "true" : "false";
}

async function deleteDefinition(id) {

    if (!confirm(
        "Usunąć definicję podatku? Istniejące podatki graczy nie zostaną automatycznie usunięte."
    )) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("tax_rates")
            .delete()
            .eq("id", id);

    if (error) {

        alert(error.message);

        return;
    }

    await loadDefinitions();

    await renderAdminDefinitions();

    fillDefinitionSelects();
}


