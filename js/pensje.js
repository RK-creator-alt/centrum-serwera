async function loadMySalaries() {

    const box = $("mySalariesContent");

    box.innerHTML = `<div class="card">Ładowanie...</div>`;

    const { data, error } =
        await supabaseClient
            .from("player_salaries")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false });

    if (error) {

        box.innerHTML =
            `<div class="card">${escapeHtml(error.message)}</div>`;

        return;

    }

    if (!data.length) {

        box.innerHTML =
            `<div class="card">
                <h3>Brak pensji</h3>
                <p class="muted">
                    Nie masz obecnie przypisanych żadnych pensji.
                </p>
            </div>`;

        return;

    }

    const total = data.reduce(
        (sum, s) => sum + Number(s.amount || 0),
        0
    );

    box.innerHTML = `

        <div class="card">

            <div class="section-title">
                <div>
                    <h2>💵 Pensje</h2>
                    <p class="muted">
                        Łącznie miesięcznie: <strong>${money(total)}</strong>
                    </p>
                </div>
            </div>

            <div class="table-wrap">

                <table>

                    <thead>
                        <tr>
                            <th>Praca / budynek</th>
                            <th>Kwota miesięczna</th>
                            <th>Notatka</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${data.map(s => `
                            <tr>
                                <td><strong>${escapeHtml(s.job_name)}</strong></td>
                                <td>${money(s.amount)}</td>
                                <td>${escapeHtml(s.note || "-")}</td>
                            </tr>
                        `).join("")}

                    </tbody>

                </table>

            </div>

        </div>

    `;

}


/* =====================================================
   MY TAXES
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

