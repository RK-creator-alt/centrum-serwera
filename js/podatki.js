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

