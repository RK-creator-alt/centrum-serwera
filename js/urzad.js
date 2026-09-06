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

