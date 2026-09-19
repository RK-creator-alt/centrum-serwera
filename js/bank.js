/* =====================================================
   BANK MODULE
===================================================== */

(function () {
    "use strict";

    let bankInfo = null;
    let bankSelectedApplication = null;

    function bankMoney(value) {
        return `${Number(value || 0).toFixed(2)} DX`;
    }

    function bankTypeLabel(type) {
        return type === "credit" ? "Kredyt" : "Pożyczka";
    }

    function bankStatusLabel(status) {
        const map = {
            pending: "Oczekuje",
            approved: "Zaakceptowany",
            rejected: "Odrzucony",
            cancelled: "Anulowany",
            active: "Aktywne",
            paid: "Spłacone"
        };
        return map[status] || status || "-";
    }

    function ensureBankPage() {
        if ($("bankPage")) return;

        const page = document.createElement("div");
        page.id = "bankPage";
        page.className = "hidden";
        page.innerHTML = `
            <button class="back" onclick="goHome()">← Wróć</button>

            <div class="card">
                <h1>🏦 Bank</h1>
                <p class="muted">Informacje o banku, wnioski o finansowanie i Twoje zobowiązania.</p>
            </div>

            <div class="card">
                <h2>🏦 Informacje o banku</h2>
                <div id="bankInfoContent"><p class="muted">Ładowanie...</p></div>
            </div>

            <div class="card">
                <div class="section-title">
                    <div>
                        <h2>📄 Złóż wniosek</h2>
                        <p class="muted">Samo złożenie wniosku nie tworzy długu. O przyznaniu finansowania decyduje administrator.</p>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="field">
                        <label>Rodzaj</label>
                        <select id="bankApplicationType">
                            <option value="loan">Pożyczka</option>
                            <option value="credit">Kredyt</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>Kwota (DX)</label>
                        <input id="bankApplicationAmount" type="number" min="0.01" step="0.01" placeholder="np. 10000">
                    </div>
                    <div class="field">
                        <label>Proponowana liczba rat</label>
                        <input id="bankApplicationInstallments" type="number" min="1" step="1" value="1">
                    </div>
                </div>
                <br>
                <div class="field">
                    <label>Cel / przeznaczenie</label>
                    <input id="bankApplicationPurpose" placeholder="Np. zakup nieruchomości">
                </div>
                <br>
                <div class="field">
                    <label>Dodatkowa informacja</label>
                    <textarea id="bankApplicationNote" placeholder="Opcjonalnie"></textarea>
                </div>
                <div class="form-actions">
                    <button class="primary" onclick="submitBankApplication()">📨 Wyślij wniosek</button>
                </div>
            </div>

            <div class="card">
                <h2>📋 Moje wnioski</h2>
                <div id="bankMyApplicationsContent"></div>
            </div>

            <div class="card">
                <h2>💳 Moje zobowiązania</h2>
                <div id="bankMyLoansContent"></div>
            </div>
        `;

        const container = document.querySelector(".container");
        const admin = $("adminPage");
        if (admin && admin.parentNode === container) {
            container.insertBefore(page, admin);
        } else {
            container.appendChild(page);
        }

        if (typeof pages !== "undefined" && !pages.includes("bankPage")) {
            pages.push("bankPage");
        }
    }

    function ensureBankAdminCard() {
        if (!isAdmin() || $("bankAdminCard")) return;

        const card = document.createElement("div");
        card.id = "bankAdminCard";
        card.className = "card";
        card.innerHTML = `
            <div class="section-title">
                <div>
                    <h2>🏦 Bank — administracja</h2>
                    <p class="muted">Zarządzanie informacjami banku, wnioskami i zobowiązaniami.</p>
                </div>
                <button class="primary" onclick="saveBankInfo()">💾 Zapisz informacje banku</button>
            </div>

            <div class="form-grid">
                <div class="field"><label>Nazwa banku</label><input id="adminBankName"></div>
                <div class="field"><label>Prezes banku</label><input id="adminBankPresident"></div>
                <div class="field"><label>Adres</label><input id="adminBankAddress"></div>
                <div class="field"><label>Telefon</label><input id="adminBankPhone"></div>
                <div class="field"><label>E-mail</label><input id="adminBankEmail" type="email"></div>
                <div class="field"><label>Godziny pracy</label><input id="adminBankHours"></div>
            </div>
            <br>
            <div class="field"><label>Opis banku</label><textarea id="adminBankDescription"></textarea></div>
            <br>
            <div class="field"><label>Komunikat banku</label><textarea id="adminBankAnnouncement"></textarea></div>

            <hr style="border-color:#213650;margin:25px 0;">

            <h3>📨 Wnioski graczy</h3>
            <div id="bankAdminApplicationsContent"><p class="muted">Ładowanie...</p></div>

            <div id="bankApprovalBox" class="hidden">
                <hr style="border-color:#213650;margin:25px 0;">
                <h3>🔐 Decyzja banku</h3>
                <p id="bankApprovalInfo" class="muted"></p>
                <input type="hidden" id="bankApprovalApplicationId">

                <div class="form-grid">
                    <div class="field"><label>Kwota przyznana (DX)</label><input id="bankApprovalAmount" type="number" min="0.01" step="0.01"></div>
                    <div class="field"><label>Oprocentowanie (%)</label><input id="bankApprovalInterest" type="number" min="0" step="0.01" value="10" oninput="recalculateBankApproval()"></div>
                    <div class="field"><label>Liczba rat</label><input id="bankApprovalInstallments" type="number" min="1" step="1" value="12" oninput="recalculateBankApproval()"></div>
                    <div class="field"><label>Pierwsza rata</label><input id="bankApprovalFirstDueDate" type="date"></div>
                </div>
                <br>
                <div class="summary-box" style="padding:14px;border:1px solid #29415f;border-radius:10px;background:#091626;">
                    <div>Odsetki: <strong id="bankApprovalInterestAmount">0.00 DX</strong></div>
                    <div>Łącznie do spłaty: <strong id="bankApprovalTotal">0.00 DX</strong></div>
                    <div>Jedna rata: <strong id="bankApprovalInstallmentAmount">0.00 DX</strong></div>
                </div>
                <br>
                <div class="field"><label>Notatka banku</label><textarea id="bankApprovalNote"></textarea></div>
                <br>
                <div class="field"><label>Hasło administratora — wymagane przy zatwierdzaniu</label><input id="bankApprovalPassword" type="password" autocomplete="current-password"></div>
                <div class="form-actions">
                    <button class="success" onclick="approveBankApplication()">✅ Zatwierdź i utwórz zobowiązanie</button>
                    <button class="danger" onclick="rejectBankApplication()">❌ Odrzuć wniosek</button>
                    <button onclick="closeBankApproval()">Anuluj</button>
                </div>
            </div>

            <hr style="border-color:#213650;margin:25px 0;">
            <h3>💳 Zobowiązania gracza</h3>
            <div id="bankAdminLoansContent"><p class="muted">Wybierz gracza w głównym wyborze administratora.</p></div>
        `;

        const adminPage = $("adminPage");
        adminPage.appendChild(card);
    }

    async function loadBankInfo() {
        const { data, error } = await supabaseClient
            .from("bank_info")
            .select("*")
            .eq("id", 1)
            .maybeSingle();

        if (error) {
            if ($("bankInfoContent")) $("bankInfoContent").innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
            return;
        }

        bankInfo = data;
        renderBankInfo();
        fillBankAdminInfo();
    }

    function renderBankInfo() {
        const box = $("bankInfoContent");
        if (!box) return;
        if (!bankInfo) {
            box.innerHTML = `<p class="muted">Brak informacji o banku.</p>`;
            return;
        }
        box.innerHTML = `
            <div class="info-list">
                <div class="info-row"><span class="info-label">Nazwa</span><span class="info-value">${escapeHtml(bankInfo.bank_name || "-")}</span></div>
                <div class="info-row"><span class="info-label">Prezes</span><span class="info-value">${escapeHtml(bankInfo.president_name || "-")}</span></div>
                <div class="info-row"><span class="info-label">Adres</span><span class="info-value">${escapeHtml(bankInfo.address || "-")}</span></div>
                <div class="info-row"><span class="info-label">Telefon</span><span class="info-value">${escapeHtml(bankInfo.phone || "-")}</span></div>
                <div class="info-row"><span class="info-label">E-mail</span><span class="info-value">${escapeHtml(bankInfo.email || "-")}</span></div>
                <div class="info-row"><span class="info-label">Godziny pracy</span><span class="info-value">${escapeHtml(bankInfo.opening_hours || "-")}</span></div>
            </div>
            ${bankInfo.description ? `<div class="news-box"><strong>Informacje</strong><p class="muted">${escapeHtml(bankInfo.description)}</p></div>` : ""}
            ${bankInfo.announcement ? `<div class="news-box"><strong>📢 Komunikat banku</strong><p class="muted">${escapeHtml(bankInfo.announcement)}</p></div>` : ""}
        `;
    }

    function fillBankAdminInfo() {
        if (!$("adminBankName") || !bankInfo) return;
        $("adminBankName").value = bankInfo.bank_name || "";
        $("adminBankPresident").value = bankInfo.president_name || "";
        $("adminBankAddress").value = bankInfo.address || "";
        $("adminBankPhone").value = bankInfo.phone || "";
        $("adminBankEmail").value = bankInfo.email || "";
        $("adminBankHours").value = bankInfo.opening_hours || "";
        $("adminBankDescription").value = bankInfo.description || "";
        $("adminBankAnnouncement").value = bankInfo.announcement || "";
    }

    async function saveBankInfo() {
        if (!isAdmin()) return;
        const payload = {
            bank_name: $("adminBankName").value.trim() || "Bank Serwera",
            president_name: $("adminBankPresident").value.trim() || null,
            address: $("adminBankAddress").value.trim() || null,
            phone: $("adminBankPhone").value.trim() || null,
            email: $("adminBankEmail").value.trim() || null,
            opening_hours: $("adminBankHours").value.trim() || null,
            description: $("adminBankDescription").value.trim() || null,
            announcement: $("adminBankAnnouncement").value.trim() || null,
            updated_at: new Date().toISOString()
        };
        const { error } = await supabaseClient.from("bank_info").update(payload).eq("id", 1);
        if (error) return alert(error.message);
        await loadBankInfo();
        alert("Informacje banku zostały zapisane.");
    }

    async function submitBankApplication() {
        if (!currentUser) { alert("Musisz być zalogowany, aby złożyć wniosek."); return; }
        const amount = Number($("bankApplicationAmount").value || 0);
        const installments = Number($("bankApplicationInstallments").value || 0);
        if (amount <= 0 || installments <= 0) return alert("Podaj poprawną kwotę i liczbę rat.");

        const { error } = await supabaseClient.from("bank_applications").insert({
            user_id: currentUser.id,
            application_type: $("bankApplicationType").value,
            requested_amount: amount,
            requested_installments: installments,
            purpose: $("bankApplicationPurpose").value.trim() || null,
            note: $("bankApplicationNote").value.trim() || null
        });
        if (error) return alert(error.message);

        $("bankApplicationAmount").value = "";
        $("bankApplicationPurpose").value = "";
        $("bankApplicationNote").value = "";
        await loadMyBankData();
        alert("Wniosek został wysłany. Nie powstało jeszcze żadne zadłużenie.");
    }

    async function loadMyBankData() {
        if (!currentUser) return;
        await loadBankInfo();

        const apps = await supabaseClient.from("bank_applications")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false });

        const appBox = $("bankMyApplicationsContent");
        if (apps.error) {
            appBox.innerHTML = `<p class="muted">${escapeHtml(apps.error.message)}</p>`;
        } else if (!apps.data?.length) {
            appBox.innerHTML = `<p class="muted">Nie masz jeszcze żadnych wniosków.</p>`;
        } else {
            appBox.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Rodzaj</th><th>Kwota</th><th>Raty</th><th>Status</th><th>Data</th><th>Informacja banku</th></tr></thead><tbody>${apps.data.map(a => `<tr><td>${bankTypeLabel(a.application_type)}</td><td>${bankMoney(a.requested_amount)}</td><td>${a.requested_installments}</td><td>${bankStatusLabel(a.status)}</td><td>${datePL(a.created_at)}</td><td>${escapeHtml(a.admin_note || "-")}</td></tr>`).join("")}</tbody></table></div>`;
        }

        const loans = await supabaseClient.from("bank_loans")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false });

        const loanBox = $("bankMyLoansContent");
        if (loans.error) {
            loanBox.innerHTML = `<p class="muted">${escapeHtml(loans.error.message)}</p>`;
        } else if (!loans.data?.length) {
            loanBox.innerHTML = `<p class="muted">Brak aktywnych zobowiązań.</p>`;
        } else {
            loanBox.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Rodzaj</th><th>Kwota</th><th>Oprocentowanie</th><th>Do spłaty</th><th>Raty</th><th>Rata</th><th>Spłacono</th><th>Status</th></tr></thead><tbody>${loans.data.map(l => `<tr><td>${bankTypeLabel(l.loan_type)}</td><td>${bankMoney(l.principal_amount)}</td><td>${Number(l.interest_percent).toFixed(2)}%</td><td>${bankMoney(l.total_amount)}</td><td>${l.installments_count}</td><td>${bankMoney(l.installment_amount)}</td><td>${bankMoney(l.paid_amount)}</td><td>${bankStatusLabel(l.status)}</td></tr>`).join("")}</tbody></table></div>`;
        }
    }

    async function loadBankAdminApplications() {
        if (!isAdmin()) return;
        const box = $("bankAdminApplicationsContent");
        if (!box) return;

        const { data, error } = await supabaseClient
            .from("bank_applications")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) return box.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
        if (!data?.length) return box.innerHTML = `<p class="muted">Brak wniosków.</p>`;

        const profileResult = await supabaseClient.from("profiles").select("id,minecraft_nick,display_name,username").in("id", [...new Set(data.map(x => x.user_id))]);
        const profiles = Object.fromEntries((profileResult.data || []).map(p => [p.id, p]));

        box.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Gracz</th><th>Rodzaj</th><th>Kwota</th><th>Raty</th><th>Status</th><th>Cel</th><th>Data</th><th>Akcje</th></tr></thead><tbody>${data.map(a => {
            const p = profiles[a.user_id];
            const playerName = p?.minecraft_nick || p?.display_name || p?.username || a.user_id;
            return `<tr><td>${escapeHtml(playerName)}</td><td>${bankTypeLabel(a.application_type)}</td><td>${bankMoney(a.requested_amount)}</td><td>${a.requested_installments}</td><td>${bankStatusLabel(a.status)}</td><td>${escapeHtml(a.purpose || "-")}</td><td>${datePL(a.created_at)}</td><td>${a.status === "pending" ? `<button class="primary" onclick='openBankApproval(${JSON.stringify(a)})'>Rozpatrz</button>` : "-"}</td></tr>`;
        }).join("")}</tbody></table></div>`;
    }

    function openBankApproval(application) {
        bankSelectedApplication = application;
        $("bankApprovalApplicationId").value = application.id;
        $("bankApprovalAmount").value = Number(application.requested_amount || 0);
        $("bankApprovalInstallments").value = Number(application.requested_installments || 1);
        $("bankApprovalInterest").value = 10;
        $("bankApprovalFirstDueDate").value = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
        $("bankApprovalPassword").value = "";
        $("bankApprovalNote").value = "";
        $("bankApprovalBox").classList.remove("hidden");
        $("bankApprovalInfo").textContent = `${bankTypeLabel(application.application_type)} — ${bankMoney(application.requested_amount)}. Zatwierdzenie utworzy faktyczne zobowiązanie.`;
        recalculateBankApproval();
        $("bankApprovalBox").scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function closeBankApproval() {
        bankSelectedApplication = null;
        if ($("bankApprovalBox")) $("bankApprovalBox").classList.add("hidden");
    }

    function recalculateBankApproval() {
        const amount = Number($("bankApprovalAmount")?.value || 0);
        const interest = Number($("bankApprovalInterest")?.value || 0);
        const installments = Number($("bankApprovalInstallments")?.value || 1);
        const interestAmount = amount * interest / 100;
        const total = Math.round((amount + interestAmount) * 100) / 100;
        const installment = installments > 0 ? Math.round((total / installments) * 100) / 100 : 0;
        if ($("bankApprovalInterestAmount")) $("bankApprovalInterestAmount").textContent = bankMoney(interestAmount);
        if ($("bankApprovalTotal")) $("bankApprovalTotal").textContent = bankMoney(total);
        if ($("bankApprovalInstallmentAmount")) $("bankApprovalInstallmentAmount").textContent = bankMoney(installment);
    }

    async function confirmBankAdminPassword() {
        const password = $("bankApprovalPassword").value;
        if (!password) {
            alert("Przy zatwierdzaniu wymagane jest ponowne wpisanie hasła administratora.");
            return false;
        }
        const email = currentUser?.email;
        if (!email) return false;
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            alert("Nieprawidłowe hasło administratora. Zobowiązanie nie zostało utworzone.");
            return false;
        }
        return true;
    }

    async function approveBankApplication() {
        if (!isAdmin() || !bankSelectedApplication) return;
        if (!(await confirmBankAdminPassword())) return;

        const amount = Number($("bankApprovalAmount").value || 0);
        const interest = Number($("bankApprovalInterest").value || 0);
        const installments = Number($("bankApprovalInstallments").value || 0);
        const firstDueDate = $("bankApprovalFirstDueDate").value || null;
        if (amount <= 0 || interest < 0 || installments <= 0) return alert("Wprowadź poprawne dane kredytu/pożyczki.");

        const calc = await supabaseClient.rpc("calculate_bank_loan", {
            p_amount: amount,
            p_interest_percent: interest,
            p_installments: installments
        });
        if (calc.error || !calc.data?.[0]) return alert(calc.error?.message || "Nie udało się obliczyć raty.");

        const total = Number(calc.data[0].total_amount);
        const installment = Number(calc.data[0].installment_amount);

        const loan = await supabaseClient.from("bank_loans").insert({
            user_id: bankSelectedApplication.user_id,
            application_id: bankSelectedApplication.id,
            loan_type: bankSelectedApplication.application_type,
            principal_amount: amount,
            interest_percent: interest,
            total_amount: total,
            installments_count: installments,
            installment_amount: installment,
            first_due_date: firstDueDate,
            purpose: bankSelectedApplication.purpose || null,
            note: $("bankApprovalNote").value.trim() || null
        }).select("id").single();

        if (loan.error) return alert(loan.error.message);

        const dueDates = [];
        const start = firstDueDate ? new Date(`${firstDueDate}T12:00:00`) : new Date();
        for (let i = 0; i < installments; i++) {
            const d = new Date(start);
            d.setMonth(d.getMonth() + i);
            dueDates.push(d.toISOString().slice(0, 10));
        }

        const payments = dueDates.map((date, i) => ({
            loan_id: loan.data.id,
            user_id: bankSelectedApplication.user_id,
            installment_number: i + 1,
            amount: i === installments - 1 ? Math.round((total - installment * (installments - 1)) * 100) / 100 : installment,
            due_date: date,
            status: "unpaid"
        }));

        const paymentResult = await supabaseClient.from("bank_installment_payments").insert(payments);
        if (paymentResult.error) {
            await supabaseClient.from("bank_loans").delete().eq("id", loan.data.id);
            return alert(paymentResult.error.message);
        }

        const applicationUpdate = await supabaseClient.from("bank_applications").update({
            status: "approved",
            admin_note: $("bankApprovalNote").value.trim() || "Wniosek zaakceptowany.",
            decided_at: new Date().toISOString()
        }).eq("id", bankSelectedApplication.id);

        if (applicationUpdate.error) return alert(applicationUpdate.error.message);

        closeBankApproval();
        await loadBankAdminApplications();
        await loadBankAdminLoans();
        alert(`Zobowiązanie utworzone. Łącznie: ${bankMoney(total)}, rata: ${bankMoney(installment)}.`);
    }

    async function rejectBankApplication() {
        if (!isAdmin() || !bankSelectedApplication) return;
        if (!(await confirmBankAdminPassword())) return;
        const note = prompt("Powód odrzucenia wniosku:", "Wniosek odrzucony przez bank.");
        if (note === null) return;
        const { error } = await supabaseClient.from("bank_applications").update({
            status: "rejected",
            admin_note: note.trim() || "Wniosek odrzucony.",
            decided_at: new Date().toISOString()
        }).eq("id", bankSelectedApplication.id);
        if (error) return alert(error.message);
        closeBankApproval();
        await loadBankAdminApplications();
    }


async function deleteBankLoan(id) {
    if (!isAdmin()) return;
    if (!confirm("Usunąć to zobowiązanie razem z harmonogramem rat? Tej operacji nie można cofnąć.")) return;

    const payments = await supabaseClient
        .from("bank_installment_payments")
        .delete()
        .eq("loan_id", id);
    if (payments.error) {
        alert(payments.error.message);
        return;
    }

    const loan = await supabaseClient
        .from("bank_loans")
        .delete()
        .eq("id", id);
    if (loan.error) {
        alert(loan.error.message);
        return;
    }

    await loadBankAdminLoans();
    await loadBankAdminApplications();
    alert("Zobowiązanie zostało usunięte.");
}

    async function loadBankAdminLoans() {
        const box = $("bankAdminLoansContent");
        if (!box) return;
        if (!selectedPlayer) {
            box.innerHTML = `<p class="muted">Wybierz gracza w głównym wyborze administratora.</p>`;
            return;
        }
        const { data, error } = await supabaseClient.from("bank_loans").select("*").eq("user_id", selectedPlayer.id).order("created_at", { ascending: false });
        if (error) return box.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
        if (!data?.length) return box.innerHTML = `<p class="muted">Ten gracz nie ma zobowiązań.</p>`;
        box.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Rodzaj</th><th>Kwota</th><th>Oprocentowanie</th><th>Do spłaty</th><th>Raty</th><th>Rata</th><th>Spłacono</th><th>Status</th><th>Akcje</th></tr></thead><tbody>${data.map(l => `<tr><td>${bankTypeLabel(l.loan_type)}</td><td>${bankMoney(l.principal_amount)}</td><td>${Number(l.interest_percent).toFixed(2)}%</td><td>${bankMoney(l.total_amount)}</td><td>${l.installments_count}</td><td>${bankMoney(l.installment_amount)}</td><td>${bankMoney(l.paid_amount)}</td><td>${bankStatusLabel(l.status)}</td><td><button class="danger" onclick="deleteBankLoan('${l.id}')">🗑️ Usuń</button></td></tr>`).join("")}</tbody></table></div>`;
    }

    function openBank() {
        ensureBankPage();
        hideAllPages();
        $("bankPage").classList.remove("hidden");
        loadMyBankData();
    }

    async function initBankModule() {
        ensureBankPage();
        if (isAdmin()) {
            ensureBankAdminCard();
            await loadBankAdminApplications();
            await loadBankAdminLoans();
        }
    }

    window.openBank = openBank;
    window.submitBankApplication = submitBankApplication;
    window.saveBankInfo = saveBankInfo;
    window.openBankApproval = openBankApproval;
    window.closeBankApproval = closeBankApproval;
    window.recalculateBankApproval = recalculateBankApproval;
    window.approveBankApplication = approveBankApplication;
    window.rejectBankApplication = rejectBankApplication;
    window.deleteBankLoan = deleteBankLoan;

    const originalBankOpenAdmin = window.openAdmin;
    if (typeof originalBankOpenAdmin === "function") {
        window.openAdmin = async function () {
            await originalBankOpenAdmin();
            ensureBankAdminCard();
            await loadBankAdminApplications();
            await loadBankAdminLoans();
        };
    }

    const originalBankLoadSelectedPlayer = window.loadSelectedPlayer;
    if (typeof originalBankLoadSelectedPlayer === "function") {
        window.loadSelectedPlayer = async function () {
            await originalBankLoadSelectedPlayer();
            if (isAdmin()) {
                ensureBankAdminCard();
                await loadBankAdminLoans();
            }
        };
    }

    const originalBankShowApp = window.showApp;
    if (typeof originalBankShowApp === "function") {
        window.showApp = async function () {
            await originalBankShowApp();
            await initBankModule();
        };
    }

    ensureBankPage();
    initBankModule();
})();
