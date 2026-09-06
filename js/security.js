/* =====================================================
   UBEZPIECZENIA
===================================================== */

function insuranceStatusBadge(status) {
    const map = {
        active: ['Aktywne', 'status-active'],
        expired: ['Wygasłe', 'status-warning'],
        cancelled: ['Anulowane', 'status-danger']
    };

    const [label, cls] = map[status] || ['Nieznany', 'status-warning'];
    return `<span class="status-badge ${cls}">${label}</span>`;
}


async function loadMyInsurances() {
    const box = $("myInsurancesContent");

    if (!box || !currentUser) return;

    box.innerHTML = `<div class="card">Ładowanie...</div>`;

    const { data, error } = await supabaseClient
        .from("player_insurances")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("valid_until", { ascending: true });

    if (error) {
        box.innerHTML = `<div class="card"><p>${escapeHtml(error.message)}</p></div>`;
        return;
    }

    if (!data || !data.length) {
        box.innerHTML = `
            <div class="card">
                <h3>Brak ubezpieczeń</h3>
                <p class="muted">Nie masz jeszcze przypisanych polis ubezpieczeniowych.</p>
            </div>`;
        return;
    }

    box.innerHTML = data.map(i => `
        <div class="card">
            <div class="section-title">
                <div>
                    <h2>🛡️ ${escapeHtml(i.name)}</h2>
                    <p class="muted">Polisa ${escapeHtml(i.policy_number || "-")}</p>
                </div>
                ${insuranceStatusBadge(i.status)}
            </div>

            <div class="info-grid">
                <div><span class="muted">Na co</span><strong>${escapeHtml(i.protection || "-")}</strong></div>
                <div><span class="muted">Składka miesięczna</span><strong>${money(i.monthly_payment)}</strong></div>
                <div><span class="muted">Odszkodowanie</span><strong>${money(i.compensation)}</strong></div>
                <div><span class="muted">Obowiązuje od</span><strong>${datePL(i.valid_from)}</strong></div>
                <div><span class="muted">Do kiedy</span><strong>${datePL(i.valid_until)}</strong></div>
            </div>

            ${i.description ? `
                <div class="summary-box" style="margin-top:16px;">
                    <span class="muted">Opis / warunki</span>
                    <div>${escapeHtml(i.description)}</div>
                </div>` : ""}
        </div>
    `).join("");
}


async function loadAdminInsurances() {
    const box = $("adminInsurancesContent");

    if (!box) return;

    if (!selectedPlayer) {
        box.innerHTML = `<p class="muted">Najpierw wybierz gracza.</p>`;
        return;
    }

    const { data, error } = await supabaseClient
        .from("player_insurances")
        .select("*")
        .eq("user_id", selectedPlayer.id)
        .order("valid_until", { ascending: true });

    if (error) {
        box.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
        return;
    }

    if (!data || !data.length) {
        box.innerHTML = `<p class="muted">Ten gracz nie ma jeszcze żadnych ubezpieczeń.</p>`;
        return;
    }

    box.innerHTML = `
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Polisa</th>
                        <th>Na co</th>
                        <th>Składka</th>
                        <th>Odszkodowanie</th>
                        <th>Do kiedy</th>
                        <th>Status</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(i => `
                        <tr>
                            <td>
                                <strong>${escapeHtml(i.name)}</strong><br>
                                <span class="muted">${escapeHtml(i.policy_number || "-")}</span>
                            </td>
                            <td>${escapeHtml(i.protection || "-")}</td>
                            <td>${money(i.monthly_payment)}</td>
                            <td>${money(i.compensation)}</td>
                            <td>${datePL(i.valid_until)}</td>
                            <td>${insuranceStatusBadge(i.status)}</td>
                            <td>
                                <button onclick='editInsurance(${JSON.stringify(i)})'>✏️</button>
                                <button onclick="deleteInsurance('${i.id}')">🗑️</button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>`;
}


function showInsuranceAddForm() {
    if (!selectedPlayer) {
        alert("Najpierw wybierz gracza.");
        return;
    }

    $("adminInsuranceForm").classList.remove("hidden");
    $("editInsuranceId").value = "";
    $("insurancePolicyNumber").value = "";
    $("insuranceName").value = "";
    $("insuranceProtection").value = "";
    $("insuranceMonthlyPayment").value = "";
    $("insuranceCompensation").value = "";
    $("insuranceValidFrom").value = "";
    $("insuranceValidUntil").value = "";
    $("insuranceStatus").value = "active";
    $("insuranceDescription").value = "";
}


function cancelInsuranceForm() {
    $("adminInsuranceForm").classList.add("hidden");
}


function editInsurance(i) {
    $("adminInsuranceForm").classList.remove("hidden");
    $("editInsuranceId").value = i.id;
    $("insurancePolicyNumber").value = i.policy_number || "";
    $("insuranceName").value = i.name || "";
    $("insuranceProtection").value = i.protection || "";
    $("insuranceMonthlyPayment").value = i.monthly_payment ?? "";
    $("insuranceCompensation").value = i.compensation ?? "";
    $("insuranceValidFrom").value = i.valid_from || "";
    $("insuranceValidUntil").value = i.valid_until || "";
    $("insuranceStatus").value = i.status || "active";
    $("insuranceDescription").value = i.description || "";
}


async function saveAdminInsurance() {
    if (!selectedPlayer) return;

    const name = $("insuranceName").value.trim();
    const protection = $("insuranceProtection").value.trim();

    if (!name || !protection) {
        alert("Wpisz nazwę ubezpieczenia oraz określ, na co jest ubezpieczenie.");
        return;
    }

    const payload = {
        user_id: selectedPlayer.id,
        policy_number: $("insurancePolicyNumber").value.trim() || null,
        name,
        protection,
        monthly_payment: Number($("insuranceMonthlyPayment").value || 0),
        compensation: Number($("insuranceCompensation").value || 0),
        valid_from: $("insuranceValidFrom").value || null,
        valid_until: $("insuranceValidUntil").value || null,
        status: $("insuranceStatus").value,
        description: $("insuranceDescription").value.trim() || null
    };

    const id = $("editInsuranceId").value;
    let result;

    if (id) {
        result = await supabaseClient
            .from("player_insurances")
            .update(payload)
            .eq("id", id);
    } else {
        result = await supabaseClient
            .from("player_insurances")
            .insert(payload);
    }

    if (result.error) {
        alert(result.error.message);
        return;
    }

    cancelInsuranceForm();
    await loadAdminInsurances();
}


async function deleteInsurance(id) {
    if (!confirm("Usunąć tę polisę?")) return;

    const { error } = await supabaseClient
        .from("player_insurances")
        .delete()
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    await loadAdminInsurances();
}


/* =====================================================
   INTEGRACJA Z APLIKACJĄ
===================================================== */

async function openMyInsurances() {
    if (typeof hideAllPages === "function") hideAllPages();
    const page = $("myInsurancesPage");
    if (page) page.classList.remove("hidden");
    await loadMyInsurances();
}

if (typeof pages !== "undefined" && !pages.includes("myInsurancesPage")) {
    pages.push("myInsurancesPage");
}

if (typeof loadSelectedPlayer === "function") {
    const _loadSelectedPlayerBeforeInsurance = loadSelectedPlayer;
    loadSelectedPlayer = async function() {
        await _loadSelectedPlayerBeforeInsurance();
        await loadAdminInsurances();
    };
}
