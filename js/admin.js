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


function clearAdminTables() {

    $("adminTaxesContent").innerHTML =
        `<p class="muted">Najpierw wybierz gracza.</p>`;

    $("adminLicensesContent").innerHTML =
        `<p class="muted">Najpierw wybierz gracza.</p>`;

    $("adminFeesContent").innerHTML =
        `<p class="muted">Najpierw wybierz gracza.</p>`;

    $("adminPropertiesContent").innerHTML =
        `<p class="muted">Najpierw wybierz gracza.</p>`;

    $("adminSalariesContent").innerHTML =
        `<p class="muted">Najpierw wybierz gracza.</p>`;
}


/* =====================================================
   INITIALIZATION
===================================================== */

