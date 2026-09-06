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

