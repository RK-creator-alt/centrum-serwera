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

