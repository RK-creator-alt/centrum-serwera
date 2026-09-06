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


/* =====================================================
   CLEAR ADMIN TABLES
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

