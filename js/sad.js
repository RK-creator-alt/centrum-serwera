/* =====================================================
   COURT — PUBLIC
===================================================== */

async function loadCourtPublic() {

    const [v, a, s] = await Promise.all([

        supabaseClient
            .from("court_verdicts")
            .select("*")
            .eq("published", true)
            .order("issued_at", {
                ascending: false
            }),

        supabaseClient
            .from("court_acts")
            .select("*")
            .eq("access_type", "Jawne")
            .order("created_at", {
                ascending: false
            }),

        supabaseClient
            .from("court_schedule")
            .select("*")
            .order("event_date", {
                ascending: true
            })
            .order("event_time", {
                ascending: true
            })

    ]);


    /* =================================================
       PUBLIC VERDICTS
    ================================================= */

    if (v.error) {

        $("courtVerdictsContent").innerHTML =
            `<p class="muted">${escapeHtml(v.error.message)}</p>`;

    } else if (!v.data.length) {

        $("courtVerdictsContent").innerHTML =
            `<p class="muted">Brak opublikowanych wyroków.</p>`;

    } else {

        $("courtVerdictsContent").innerHTML = `

            <div class="table-wrap">

                <table>

                    <thead>

                        <tr>
                            <th>Sąd</th>
                            <th>Typ</th>
                            <th>Sprawa</th>
                            <th>Tytuł</th>
                            <th>Data</th>
                            <th>Status</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${v.data.map(x => `

                            <tr>

                                <td>
                                    ${escapeHtml(x.court_type)}
                                </td>

                                <td>
                                    ${escapeHtml(x.verdict_type)}
                                </td>

                                <td>
                                    ${escapeHtml(x.case_number)}
                                </td>

                                <td>
                                    <strong>
                                        ${escapeHtml(x.title)}
                                    </strong>
                                    <br>
                                    <span class="muted">
                                        ${escapeHtml(x.verdict_text)}
                                    </span>
                                </td>

                                <td>
                                    ${datePL(x.issued_at)}
                                </td>

                                <td>
                                    ${escapeHtml(x.status)}
                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        `;

    }


    /* =================================================
       PUBLIC ACTS
    ================================================= */

    if (a.error) {

        $("courtActsContent").innerHTML =
            `<p class="muted">${escapeHtml(a.error.message)}</p>`;

    } else if (!a.data.length) {

        $("courtActsContent").innerHTML =
            `<p class="muted">Brak jawnych akt.</p>`;

    } else {

        $("courtActsContent").innerHTML = `

            <div class="table-wrap">

                <table>

                    <thead>

                        <tr>
                            <th>Sprawa</th>
                            <th>Tytuł</th>
                            <th>Treść</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${a.data.map(x => `

                            <tr>

                                <td>
                                    ${escapeHtml(x.case_number)}
                                </td>

                                <td>
                                    ${escapeHtml(x.title)}
                                </td>

                                <td>
                                    ${escapeHtml(x.content)}
                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        `;

    }


    /* =================================================
       PUBLIC SCHEDULE
    ================================================= */

    if (s.error) {

        $("courtScheduleContent").innerHTML =
            `<p class="muted">${escapeHtml(s.error.message)}</p>`;

    } else if (!s.data.length) {

        $("courtScheduleContent").innerHTML =
            `<p class="muted">Brak zaplanowanych terminów.</p>`;

    } else {

        $("courtScheduleContent").innerHTML = `

            <div class="table-wrap">

                <table>

                    <thead>

                        <tr>
                            <th>Data</th>
                            <th>Godzina</th>
                            <th>Rodzaj</th>
                            <th>Tytuł</th>
                            <th>Sprawa</th>
                            <th>Opis</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${s.data.map(x => `

                            <tr>

                                <td>
                                    ${datePL(x.event_date)}
                                </td>

                                <td>
                                    ${escapeHtml(x.event_time || "-")}
                                </td>

                                <td>
                                    ${escapeHtml(x.event_type)}
                                </td>

                                <td>
                                    <strong>
                                        ${escapeHtml(x.title)}
                                    </strong>
                                </td>

                                <td>
                                    ${escapeHtml(x.case_number || "-")}
                                </td>

                                <td>
                                    ${escapeHtml(x.description || "-")}
                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        `;

    }

}


/* =====================================================
   COURT — ADMIN
===================================================== */

async function loadCourtAdmin() {

    await Promise.all([

        loadAdminCourtVerdicts(),
        loadAdminCourtActs(),
        loadAdminCourtSchedule()

    ]);

}


/* =====================================================
   ADMIN COURT — VERDICTS
===================================================== */

async function loadAdminCourtVerdicts() {

    const box =
        $("adminCourtVerdictsContent");

    const { data, error } =
        await supabaseClient
            .from("court_verdicts")
            .select("*")
            .order("issued_at", {
                ascending: false
            });

    if (error) {

        box.innerHTML =
            `<p class="muted">${escapeHtml(error.message)}</p>`;

        return;

    }

    box.innerHTML = data.length

        ? `

            <div class="table-wrap">

                <table>

                    <thead>

                        <tr>
                            <th>Sąd</th>
                            <th>Typ</th>
                            <th>Sprawa</th>
                            <th>Tytuł</th>
                            <th>Publikacja</th>
                            <th>Akcje</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${data.map(x => `

                            <tr>

                                <td>
                                    ${escapeHtml(x.court_type)}
                                </td>

                                <td>
                                    ${escapeHtml(x.verdict_type)}
                                </td>

                                <td>
                                    ${escapeHtml(x.case_number)}
                                </td>

                                <td>
                                    ${escapeHtml(x.title)}
                                </td>

                                <td>
                                    ${x.published
                                        ? "Opublikowany"
                                        : "Ukryty"}
                                </td>

                                <td>

                                    <button
                                        onclick='editCourtVerdict(${JSON.stringify(x)})'>
                                        ✏️
                                    </button>

                                    <button
                                        onclick="deleteCourtVerdict('${x.id}')">
                                        🗑️
                                    </button>

                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        `

        : `<p class="muted">Brak wyroków.</p>`;

}


/* =====================================================
   COURT VERDICT FORM
===================================================== */

function showCourtVerdictForm() {

    $("courtVerdictForm")
        .classList.remove("hidden");

    $("editCourtVerdictId").value = "";

    $("courtType").value =
        "Sąd";

    $("verdictType").value =
        "Zwykły";

    $("verdictCaseNumber").value =
        "";

    $("verdictTitle").value =
        "";

    $("verdictJudges").value =
        "";

    $("verdictParties").value =
        "";

    $("verdictIssuedAt").value =
        new Date()
            .toISOString()
            .slice(0, 10);

    $("verdictStatus").value =
        "Obowiązuje";

    $("verdictText").value =
        "";

    $("verdictReasoning").value =
        "";

}


function cancelCourtVerdictForm() {

    $("courtVerdictForm")
        .classList.add("hidden");

}


function editCourtVerdict(x) {

    showCourtVerdictForm();

    $("editCourtVerdictId").value =
        x.id;

    $("courtType").value =
        x.court_type;

    $("verdictType").value =
        x.verdict_type;

    $("verdictCaseNumber").value =
        x.case_number;

    $("verdictTitle").value =
        x.title;

    $("verdictJudges").value =
        x.judges || "";

    $("verdictParties").value =
        x.parties || "";

    $("verdictIssuedAt").value =
        x.issued_at || "";

    $("verdictStatus").value =
        x.status;

    $("verdictText").value =
        x.verdict_text || "";

    $("verdictReasoning").value =
        x.reasoning || "";

}


async function saveCourtVerdict() {

    if (!isAdmin()) return;

    const payload = {

        court_type:
            $("courtType").value,

        verdict_type:
            $("verdictType").value,

        case_number:
            $("verdictCaseNumber")
                .value
                .trim(),

        title:
            $("verdictTitle")
                .value
                .trim(),

        judges:
            $("verdictJudges")
                .value
                .trim() || null,

        parties:
            $("verdictParties")
                .value
                .trim() || null,

        issued_at:
            $("verdictIssuedAt")
                .value,

        status:
            $("verdictStatus")
                .value,

        verdict_text:
            $("verdictText")
                .value
                .trim(),

        reasoning:
            $("verdictReasoning")
                .value
                .trim() || null

    };

    if (
        !payload.case_number ||
        !payload.title ||
        !payload.verdict_text
    ) {

        alert(
            "Wypełnij numer sprawy, tytuł i treść wyroku."
        );

        return;

    }

    const id =
        $("editCourtVerdictId")
            .value;

    const q = id

        ? supabaseClient
            .from("court_verdicts")
            .update(payload)
            .eq("id", id)

        : supabaseClient
            .from("court_verdicts")
            .insert(payload);

    const { error } =
        await q;

    if (error) {

        alert(error.message);

        return;

    }

    cancelCourtVerdictForm();

    await loadCourtAdmin();

}


async function deleteCourtVerdict(id) {

    if (!confirm("Usunąć ten wyrok?")) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("court_verdicts")
            .delete()
            .eq("id", id);

    if (error) {

        alert(error.message);

    } else {

        await loadCourtAdmin();

    }

}


/* =====================================================
   ADMIN COURT — ACTS
===================================================== */

async function loadAdminCourtActs() {

    const box =
        $("adminCourtActsContent");

    const { data, error } =
        await supabaseClient
            .from("court_acts")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        box.innerHTML =
            `<p class="muted">${escapeHtml(error.message)}</p>`;

        return;

    }

    box.innerHTML = data.length

        ? `

            <div class="table-wrap">

                <table>

                    <thead>

                        <tr>
                            <th>Sprawa</th>
                            <th>Tytuł</th>
                            <th>Dostęp</th>
                            <th>Akcje</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${data.map(x => `

                            <tr>

                                <td>
                                    ${escapeHtml(x.case_number)}
                                </td>

                                <td>
                                    ${escapeHtml(x.title)}
                                </td>

                                <td>
                                    ${escapeHtml(x.access_type)}
                                </td>

                                <td>

                                    <button
                                        onclick='editCourtAct(${JSON.stringify(x)})'>
                                        ✏️
                                    </button>

                                    <button
                                        onclick="deleteCourtAct('${x.id}')">
                                        🗑️
                                    </button>

                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        `

        : `<p class="muted">Brak akt.</p>`;

}


function showCourtActForm() {

    $("courtActForm")
        .classList.remove("hidden");

    $("editCourtActId").value =
        "";

    $("actCaseNumber").value =
        "";

    $("actTitle").value =
        "";

    $("actAccess").value =
        "Jawne";

    $("actContent").value =
        "";

}


function cancelCourtActForm() {

    $("courtActForm")
        .classList.add("hidden");

}


function editCourtAct(x) {

    showCourtActForm();

    $("editCourtActId").value =
        x.id;

    $("actCaseNumber").value =
        x.case_number;

    $("actTitle").value =
        x.title;

    $("actAccess").value =
        x.access_type;

    $("actContent").value =
        x.content || "";

}


async function saveCourtAct() {

    if (!isAdmin()) return;

    const payload = {

        case_number:
            $("actCaseNumber")
                .value
                .trim(),

        title:
            $("actTitle")
                .value
                .trim(),

        access_type:
            $("actAccess")
                .value,

        content:
            $("actContent")
                .value
                .trim()

    };

    if (
        !payload.case_number ||
        !payload.title
    ) {

        alert(
            "Wypełnij numer sprawy i tytuł akt."
        );

        return;

    }

    const id =
        $("editCourtActId")
            .value;

    const q = id

        ? supabaseClient
            .from("court_acts")
            .update(payload)
            .eq("id", id)

        : supabaseClient
            .from("court_acts")
            .insert(payload);

    const { error } =
        await q;

    if (error) {

        alert(error.message);

        return;

    }

    cancelCourtActForm();

    await loadCourtAdmin();

}


async function deleteCourtAct(id) {

    if (!confirm("Usunąć te akta?")) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("court_acts")
            .delete()
            .eq("id", id);

    if (error) {

        alert(error.message);

    } else {

        await loadCourtAdmin();

    }

}


/* =====================================================
   ADMIN COURT — SCHEDULE
===================================================== */

async function loadAdminCourtSchedule() {

    const box =
        $("adminCourtScheduleContent");

    const { data, error } =
        await supabaseClient
            .from("court_schedule")
            .select("*")
            .order("event_date", {
                ascending: true
            })
            .order("event_time", {
                ascending: true
            });

    if (error) {

        box.innerHTML =
            `<p class="muted">${escapeHtml(error.message)}</p>`;

        return;

    }

    box.innerHTML = data.length

        ? `

            <div class="table-wrap">

                <table>

                    <thead>

                        <tr>
                            <th>Data</th>
                            <th>Godzina</th>
                            <th>Rodzaj</th>
                            <th>Tytuł</th>
                            <th>Sprawa</th>
                            <th>Akcje</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${data.map(x => `

                            <tr>

                                <td>
                                    ${datePL(x.event_date)}
                                </td>

                                <td>
                                    ${escapeHtml(x.event_time || "-")}
                                </td>

                                <td>
                                    ${escapeHtml(x.event_type)}
                                </td>

                                <td>
                                    ${escapeHtml(x.title)}
                                </td>

                                <td>
                                    ${escapeHtml(x.case_number || "-")}
                                </td>

                                <td>

                                    <button
                                        onclick='editCourtSchedule(${JSON.stringify(x)})'>
                                        ✏️
                                    </button>

                                    <button
                                        onclick="deleteCourtSchedule('${x.id}')">
                                        🗑️
                                    </button>

                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        `

        : `<p class="muted">Brak terminów.</p>`;

}


function showCourtScheduleForm() {

    $("courtScheduleForm")
        .classList.remove("hidden");

    $("editCourtScheduleId").value =
        "";

    $("scheduleDate").value =
        new Date()
            .toISOString()
            .slice(0, 10);

    $("scheduleTime").value =
        "";

    $("scheduleType").value =
        "Rozprawa";

    $("scheduleTitle").value =
        "";

    $("scheduleCaseNumber").value =
        "";

    $("scheduleDescription").value =
        "";

}


function cancelCourtScheduleForm() {

    $("courtScheduleForm")
        .classList.add("hidden");

}


function editCourtSchedule(x) {

    showCourtScheduleForm();

    $("editCourtScheduleId").value =
        x.id;

    $("scheduleDate").value =
        x.event_date;

    $("scheduleTime").value =
        x.event_time || "";

    $("scheduleType").value =
        x.event_type;

    $("scheduleTitle").value =
        x.title;

    $("scheduleCaseNumber").value =
        x.case_number || "";

    $("scheduleDescription").value =
        x.description || "";

}


async function saveCourtSchedule() {

    if (!isAdmin()) return;

    const payload = {

        event_date:
            $("scheduleDate")
                .value,

        event_time:
            $("scheduleTime")
                .value || null,

        event_type:
            $("scheduleType")
                .value
                .trim() || "Rozprawa",

        title:
            $("scheduleTitle")
                .value
                .trim(),

        case_number:
            $("scheduleCaseNumber")
                .value
                .trim() || null,

        description:
            $("scheduleDescription")
                .value
                .trim() || null

    };

    if (
        !payload.event_date ||
        !payload.title
    ) {

        alert(
            "Wypełnij datę i tytuł."
        );

        return;

    }

    const id =
        $("editCourtScheduleId")
            .value;

    const q = id

        ? supabaseClient
            .from("court_schedule")
            .update(payload)
            .eq("id", id)

        : supabaseClient
            .from("court_schedule")
            .insert(payload);

    const { error } =
        await q;

    if (error) {

        alert(error.message);

        return;

    }

    cancelCourtScheduleForm();

    await loadCourtAdmin();

}


async function deleteCourtSchedule(id) {

    if (!confirm("Usunąć ten termin?")) {
        return;
    }

    const { error } =
        await supabaseClient
            .from("court_schedule")
            .delete()
            .eq("id", id);

    if (error) {

        alert(error.message);

    } else {

        await loadCourtAdmin();

    }

}
