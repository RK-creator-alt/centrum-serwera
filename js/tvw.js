/* =====================================================
   TVW / REDAKCJA
===================================================== */

(function () {
    "use strict";

    const TVW_PAGE_ID = "tvwPage";
    let tvwCategories = [];
    let tvwArticles = [];
    let tvwVideos = [];
    let tvwInterviews = [];
    let tvwEvents = [];
    let tvwSubmissions = [];

    function currentAuthorName() {
        return currentProfile?.minecraft_nick ||
            currentProfile?.display_name ||
            currentProfile?.username ||
            currentUser?.email ||
            "Redakcja";
    }

    function canEditTVW() {
        return !!currentProfile &&
            (currentProfile.role === "admin" || currentProfile.role === "redaktor");
    }

    function isAdminTVW() {
        return !!currentProfile && currentProfile.role === "admin";
    }

    function addPageToNavigation() {
        if (Array.isArray(pages) && !pages.includes(TVW_PAGE_ID)) {
            pages.push(TVW_PAGE_ID);
        }
    }

    function ensureTVWPage() {
        let page = $(TVW_PAGE_ID);
        if (!page) {
            page = document.createElement("div");
            page.id = TVW_PAGE_ID;
            page.className = "hidden";
            const taxPage = $("taxRulesPage");
            if (taxPage?.parentNode) {
                taxPage.parentNode.insertBefore(page, taxPage);
            } else {
                $("app")?.appendChild(page);
            }
        }
        addPageToNavigation();
        return page;
    }

    function inputValue(id) {
        return $(id)?.value?.trim() || "";
    }

    function setFormValue(id, value) {
        const el = $(id);
        if (el) el.value = value ?? "";
    }

    function tvwCard(title, body, extra = "") {
        return `
            <div class="card" style="margin-bottom:18px;">
                <div class="section-title">
                    <h3 style="margin:0;">${escapeHtml(title)}</h3>
                    ${extra}
                </div>
                ${body}
            </div>
        `;
    }

    function statusLabel(status) {
        if (status === "published") return "Opublikowany";
        if (status === "draft") return "Szkic";
        if (status === "new") return "Nowe";
        if (status === "in_progress") return "W trakcie";
        if (status === "accepted") return "Zaakceptowane";
        if (status === "rejected") return "Odrzucone";
        return status || "-";
    }

    async function loadTVWData() {
        const [categories, articles, videos, interviews, events, submissions] = await Promise.all([
            supabaseClient.from("tvw_categories").select("*").order("name"),
            supabaseClient.from("tvw_articles").select("*").order("created_at", { ascending: false }),
            supabaseClient.from("tvw_videos").select("*").order("created_at", { ascending: false }),
            supabaseClient.from("tvw_interviews").select("*").order("created_at", { ascending: false }),
            supabaseClient.from("tvw_events").select("*").order("event_date", { ascending: true }).order("event_time", { ascending: true }),
            canEditTVW()
                ? supabaseClient.from("tvw_submissions").select("*").order("created_at", { ascending: false })
                : supabaseClient.from("tvw_submissions").select("*").eq("user_id", currentUser.id).order("created_at", { ascending: false })
        ]);

        const errors = [categories, articles, videos, interviews, events, submissions]
            .filter(r => r.error)
            .map(r => r.error.message);

        if (errors.length) {
            console.error("TVW load:", errors);
        }

        tvwCategories = categories.data || [];
        tvwArticles = articles.data || [];
        tvwVideos = videos.data || [];
        tvwInterviews = interviews.data || [];
        tvwEvents = events.data || [];
        tvwSubmissions = submissions.data || [];
    }

    function categoryName(id) {
        return tvwCategories.find(c => String(c.id) === String(id))?.name || "Bez kategorii";
    }

    function tvwMediaImage(url, alt, className = "tvw-thumbnail") {
        if (!url) return "";
        return `<img class="${className}" src="${escapeHtml(url)}" alt="${escapeHtml(alt || "")}" loading="lazy">`;
    }

    function renderCollapsedItems(items, renderer, label) {
        if (!items.length) return "";
        return `
            <details class="tvw-collapsed-list">
                <summary>📚 Pokaż pozostałe ${escapeHtml(label)} (${items.length})</summary>
                <div style="margin-top:12px;">${items.map(renderer).join("")}</div>
            </details>
        `;
    }

    function renderPublicArticles(rows = tvwArticles.filter(a => a.status === "published")) {
        if (!rows.length) {
            return `<p class="muted">Brak opublikowanych artykułów.</p>`;
        }

        const [latest, ...older] = rows;
        const renderArticle = a => `
            <article class="tvw-item">
                <div class="muted" style="font-size:13px;">${escapeHtml(categoryName(a.category_id))} · ${datePL(a.published_at || a.created_at)}</div>
                <h3>${escapeHtml(a.title)}</h3>
                ${tvwMediaImage(a.cover_url, a.title)}
                <div class="muted" style="margin-bottom:10px;">Autor: ${escapeHtml(a.author_name || "Redakcja")}</div>
                <div style="white-space:pre-wrap;line-height:1.7;">${escapeHtml(a.content)}</div>
            </article>
        `;

        return `
            ${renderArticle(latest)}
            ${renderCollapsedItems(older, renderArticle, "starszych artykułów")}
        `;
    }

    function renderPublicVideos() {
        const rows = tvwVideos.filter(v => v.status === "published");
        if (!rows.length) return `<p class="muted">Brak opublikowanych materiałów TVW.</p>`;

        const [latest, ...older] = rows;
        const renderVideo = v => `
            <article class="tvw-item">
                <h3>${escapeHtml(v.title)}</h3>
                <div class="muted">${datePL(v.published_at || v.created_at)} · ${escapeHtml(v.author_name || "TVW")}</div>
                ${tvwMediaImage(v.thumbnail_url, v.title, "tvw-thumbnail tvw-video-thumbnail")}
                <p style="white-space:pre-wrap;">${escapeHtml(v.description || "")}</p>
                ${v.video_url ? `<a class="primary" href="${escapeHtml(v.video_url)}" target="_blank" rel="noopener">▶ Otwórz materiał</a>` : ""}
            </article>
        `;

        return `
            ${renderVideo(latest)}
            ${renderCollapsedItems(older, renderVideo, "starszych materiałów TVW")}
        `;
    }

    function renderPublicInterviews() {
        const rows = tvwInterviews.filter(i => i.status === "published");
        if (!rows.length) return `<p class="muted">Brak opublikowanych wywiadów.</p>`;

        const [latest, ...older] = rows;
        const renderInterview = i => `
            <article class="tvw-item">
                <div class="muted">Wywiad · ${datePL(i.published_at || i.created_at)}</div>
                <h3>${escapeHtml(i.title)}</h3>
                <p><strong>${escapeHtml(i.person || "Gość")}</strong>${i.person_role ? ` · ${escapeHtml(i.person_role)}` : ""}</p>
                <div style="white-space:pre-wrap;line-height:1.7;">${escapeHtml(i.content || "")}</div>
            </article>
        `;

        return `
            ${renderInterview(latest)}
            ${renderCollapsedItems(older, renderInterview, "starszych wywiadów")}
        `;
    }

    function renderPublicEvents() {
        const rows = tvwEvents.filter(e => e.status === "published");
        if (!rows.length) return `<p class="muted">Brak opublikowanych wydarzeń.</p>`;
        return rows.map(e => `
            <article class="tvw-item">
                <h3>${escapeHtml(e.title)}</h3>
                <div class="muted">${datePL(e.event_date)}${e.event_time ? ` · ${escapeHtml(e.event_time)}` : ""}${e.location ? ` · ${escapeHtml(e.location)}` : ""}</div>
                <p style="white-space:pre-wrap;">${escapeHtml(e.description || "")}</p>
            </article>
        `).join("");
    }

    function renderSubmissions() {
        if (!canEditTVW()) {
            return tvwSubmissions.length
                ? tvwSubmissions.map(s => `
                    <div style="padding:12px 0;border-bottom:1px solid rgba(148,163,184,.15);">
                        <strong>${escapeHtml(s.title)}</strong>
                        <div class="muted">${statusLabel(s.status)} · ${datePL(s.created_at)}</div>
                    </div>
                  `).join("")
                : `<p class="muted">Nie wysłałeś jeszcze żadnego zgłoszenia.</p>`;
        }

        if (!tvwSubmissions.length) return `<p class="muted">Brak zgłoszeń.</p>`;
        return tvwSubmissions.map(s => `
            <div class="card" style="padding:14px;margin:12px 0;">
                <strong>${escapeHtml(s.title)}</strong>
                <div class="muted">${escapeHtml(s.user_name || "Gracz")} · ${datePL(s.created_at)}</div>
                <p style="white-space:pre-wrap;">${escapeHtml(s.content || "")}</p>
                ${s.link ? `<a href="${escapeHtml(s.link)}" target="_blank" rel="noopener">🔗 Link</a>` : ""}
                <div class="form-grid" style="margin-top:10px;">
                    <div class="field">
                        <label>Status</label>
                        <select id="submissionStatus_${s.id}">
                            <option value="new" ${s.status === "new" ? "selected" : ""}>Nowe</option>
                            <option value="in_progress" ${s.status === "in_progress" ? "selected" : ""}>W trakcie</option>
                            <option value="accepted" ${s.status === "accepted" ? "selected" : ""}>Zaakceptowane</option>
                            <option value="rejected" ${s.status === "rejected" ? "selected" : ""}>Odrzucone</option>
                            <option value="published" ${s.status === "published" ? "selected" : ""}>Opublikowane</option>
                        </select>
                    </div>
                    <div class="field">
                        <label>Notatka redakcji</label>
                        <input id="submissionNote_${s.id}" value="${escapeHtml(s.admin_note || "")}">
                    </div>
                </div>
                <div class="form-actions">
                    <button class="primary" onclick="updateTVWSubmission(${s.id})">💾 Zapisz</button>
                    ${isAdminTVW() ? `<button onclick="deleteTVWSubmission(${s.id})">🗑️ Usuń</button>` : ""}
                </div>
            </div>
        `).join("");
    }

    function renderPublicPage() {
        const page = ensureTVWPage();
        const editorPanel = canEditTVW() ? renderEditorPanel() : "";

        page.innerHTML = `
            <button class="back" onclick="goHome()">← Wróć</button>
            <div class="card">
                <h1>📺 TVW / Redakcja</h1>
                <p class="muted">Wiadomości serwera, materiały TVW, wywiady, wydarzenia i zgłoszenia mieszkańców.</p>
                <div class="grid" style="margin-top:18px;">
                    <div class="module"><div class="module-icon">📰</div><div class="module-title">Aktualności</div><div class="module-desc">Najnowsze artykuły redakcji.</div></div>
                    <div class="module"><div class="module-icon">🎥</div><div class="module-title">TVW</div><div class="module-desc">Materiały wideo i reportaże.</div></div>
                    <div class="module"><div class="module-icon">🎙️</div><div class="module-title">Wywiady</div><div class="module-desc">Rozmowy z mieszkańcami i władzami.</div></div>
                    <div class="module"><div class="module-icon">📅</div><div class="module-title">Wydarzenia</div><div class="module-desc">Zapowiedzi wydarzeń na serwerze.</div></div>
                </div>
            </div>

            ${tvwArticles.some(a => a.featured && a.status === "published") ? tvwCard("⭐ Polecane", renderPublicArticles(tvwArticles.filter(a => a.featured && a.status === "published"))) : ""}
            ${tvwCard("📰 Aktualności", renderPublicArticles())}
            ${tvwCard("🎥 Materiały TVW", renderPublicVideos())}
            ${tvwCard("🎙️ Wywiady", renderPublicInterviews())}
            ${tvwCard("📅 Wydarzenia", renderPublicEvents())}

            <div class="card">
                <h2>📩 Zgłoś materiał redakcji</h2>
                <p class="muted">Masz temat, informację albo gotowy materiał? Wyślij go redakcji.</p>
                <div class="form-grid">
                    <div class="field"><label>Tytuł</label><input id="tvwSubmissionTitle" placeholder="Tytuł zgłoszenia"></div>
                    <div class="field"><label>Link (opcjonalnie)</label><input id="tvwSubmissionLink" placeholder="https://..."></div>
                </div>
                <br>
                <div class="field"><label>Treść / opis</label><textarea id="tvwSubmissionContent" rows="6" placeholder="Opisz temat lub materiał"></textarea></div>
                <div class="form-actions"><button class="primary" onclick="submitTVWMaterial()">📨 Wyślij zgłoszenie</button></div>
            </div>

            <div class="card">
                <h2>📥 Moje zgłoszenia</h2>
                ${renderSubmissions()}
            </div>

            ${editorPanel}
        `;
    }

    function categoryOptions(selected = "") {
        return `<option value="">-- wybierz kategorię --</option>` + tvwCategories.map(c =>
            `<option value="${c.id}" ${String(c.id) === String(selected) ? "selected" : ""}>${escapeHtml(c.name)}</option>`
        ).join("");
    }

    function renderEditorPanel() {
        const articleRows = tvwArticles.filter(a => isAdminTVW() || a.author_id === currentUser.id);
        const videoRows = tvwVideos.filter(v => isAdminTVW() || v.author_id === currentUser.id);
        const interviewRows = tvwInterviews.filter(i => isAdminTVW() || i.author_id === currentUser.id);
        const eventRows = tvwEvents.filter(e => isAdminTVW() || e.created_by === currentUser.id);

        return `
            <div class="card" style="border:1px solid rgba(59,130,246,.35);">
                <h2>🖊️ Panel redakcji</h2>
                <p class="muted">${isAdminTVW() ? "Administrator może zarządzać wszystkimi materiałami." : "Masz rangę redaktora. Możesz tworzyć i publikować materiały."}</p>

                <div class="admin-section-heading">📰 Nowy artykuł</div>
                <input type="hidden" id="tvwArticleId">
                <div class="form-grid">
                    <div class="field"><label>Tytuł</label><input id="tvwArticleTitle"></div>
                    <div class="field"><label>Kategoria</label><select id="tvwArticleCategory">${categoryOptions()}</select></div>
                    <div class="field"><label>URL zdjęcia</label><input id="tvwArticleCover" placeholder="https://..."></div>
                    <div class="field"><label>Status</label><select id="tvwArticleStatus"><option value="draft">Szkic</option><option value="published">Opublikowany</option></select></div>
                    <div class="field"><label>Wyróżniony</label><select id="tvwArticleFeatured"><option value="false">Nie</option><option value="true">Tak</option></select></div>
                </div>
                <br>
                <div class="field"><label>Treść</label><textarea id="tvwArticleContent" rows="10"></textarea></div>
                <div class="form-actions"><button class="primary" onclick="saveTVWArticle()">💾 Zapisz artykuł</button><button onclick="resetTVWArticleForm()">Wyczyść</button></div>

                <div class="admin-section-heading">🎥 Nowy materiał TVW</div>
                <input type="hidden" id="tvwVideoId">
                <div class="form-grid">
                    <div class="field"><label>Tytuł</label><input id="tvwVideoTitle"></div>
                    <div class="field"><label>Link do filmu</label><input id="tvwVideoUrl" placeholder="https://..."></div>
                    <div class="field"><label>Miniatura</label><input id="tvwVideoThumb" placeholder="https://..."></div>
                    <div class="field"><label>Status</label><select id="tvwVideoStatus"><option value="draft">Szkic</option><option value="published">Opublikowany</option></select></div>
                    <div class="field"><label>Wyróżniony</label><select id="tvwVideoFeatured"><option value="false">Nie</option><option value="true">Tak</option></select></div>
                </div>
                <br>
                <div class="field"><label>Opis</label><textarea id="tvwVideoDescription" rows="6"></textarea></div>
                <div class="form-actions"><button class="primary" onclick="saveTVWVideo()">💾 Zapisz materiał</button><button onclick="resetTVWVideoForm()">Wyczyść</button></div>

                <div class="admin-section-heading">🎙️ Nowy wywiad</div>
                <input type="hidden" id="tvwInterviewId">
                <div class="form-grid">
                    <div class="field"><label>Tytuł</label><input id="tvwInterviewTitle"></div>
                    <div class="field"><label>Rozmówca</label><input id="tvwInterviewPerson"></div>
                    <div class="field"><label>Funkcja</label><input id="tvwInterviewRole"></div>
                    <div class="field"><label>Status</label><select id="tvwInterviewStatus"><option value="draft">Szkic</option><option value="published">Opublikowany</option></select></div>
                </div>
                <br>
                <div class="field"><label>Treść wywiadu</label><textarea id="tvwInterviewContent" rows="10"></textarea></div>
                <div class="form-actions"><button class="primary" onclick="saveTVWInterview()">💾 Zapisz wywiad</button><button onclick="resetTVWInterviewForm()">Wyczyść</button></div>

                <div class="admin-section-heading">📅 Nowe wydarzenie</div>
                <input type="hidden" id="tvwEventId">
                <div class="form-grid">
                    <div class="field"><label>Nazwa</label><input id="tvwEventTitle"></div>
                    <div class="field"><label>Data</label><input id="tvwEventDate" type="date"></div>
                    <div class="field"><label>Godzina</label><input id="tvwEventTime" type="time"></div>
                    <div class="field"><label>Miejsce</label><input id="tvwEventLocation"></div>
                    <div class="field"><label>Status</label><select id="tvwEventStatus"><option value="draft">Szkic</option><option value="published">Opublikowane</option></select></div>
                </div>
                <br>
                <div class="field"><label>Opis</label><textarea id="tvwEventDescription" rows="6"></textarea></div>
                <div class="form-actions"><button class="primary" onclick="saveTVWEvent()">💾 Zapisz wydarzenie</button><button onclick="resetTVWEventForm()">Wyczyść</button></div>

                <div class="admin-section-heading">🗂️ Kategorie</div>
                <div class="form-grid">
                    <div class="field"><label>Nowa kategoria</label><input id="tvwNewCategory" placeholder="np. Sport"></div>
                </div>
                <div class="form-actions"><button class="primary" onclick="addTVWCategory()">➕ Dodaj kategorię</button></div>
                <div class="muted">${tvwCategories.map(c => escapeHtml(c.name)).join(" · ") || "Brak kategorii"}</div>

                <div class="admin-section-heading">📚 Moje / zarządzane artykuły</div>
                ${articleRows.length ? articleRows.map(a => `
                    <div class="card" style="padding:12px;margin:10px 0;">
                        <strong>${escapeHtml(a.title)}</strong><div class="muted">${statusLabel(a.status)} · ${datePL(a.created_at)}</div>
                        <div class="form-actions"><button onclick="editTVWArticle(${a.id})">✏️ Edytuj</button><button onclick="deleteTVWArticle(${a.id})">🗑️ Usuń</button></div>
                    </div>
                `).join("") : `<p class="muted">Brak artykułów.</p>`}

                <div class="admin-section-heading">🎥 Materiały TVW</div>
                ${videoRows.length ? videoRows.map(v => `
                    <div class="card" style="padding:12px;margin:10px 0;"><strong>${escapeHtml(v.title)}</strong><div class="muted">${statusLabel(v.status)} · ${datePL(v.created_at)}</div>
                        <div class="form-actions"><button onclick="editTVWVideo(${v.id})">✏️ Edytuj</button><button onclick="deleteTVWVideo(${v.id})">🗑️ Usuń</button></div></div>
                `).join("") : `<p class="muted">Brak materiałów.</p>`}

                <div class="admin-section-heading">🎙️ Wywiady</div>
                ${interviewRows.length ? interviewRows.map(i => `
                    <div class="card" style="padding:12px;margin:10px 0;"><strong>${escapeHtml(i.title)}</strong><div class="muted">${statusLabel(i.status)} · ${datePL(i.created_at)}</div>
                        <div class="form-actions"><button onclick="editTVWInterview(${i.id})">✏️ Edytuj</button><button onclick="deleteTVWInterview(${i.id})">🗑️ Usuń</button></div></div>
                `).join("") : `<p class="muted">Brak wywiadów.</p>`}

                <div class="admin-section-heading">📅 Wydarzenia</div>
                ${eventRows.length ? eventRows.map(e => `
                    <div class="card" style="padding:12px;margin:10px 0;"><strong>${escapeHtml(e.title)}</strong><div class="muted">${statusLabel(e.status)} · ${datePL(e.event_date)}</div>
                        <div class="form-actions"><button onclick="editTVWEvent(${e.id})">✏️ Edytuj</button><button onclick="deleteTVWEvent(${e.id})">🗑️ Usuń</button></div></div>
                `).join("") : `<p class="muted">Brak wydarzeń.</p>`}

                <div class="admin-section-heading">📥 Zgłoszenia mieszkańców</div>
                ${renderSubmissions()}
            </div>
        `;
    }

    function openTVW() {
        addPageToNavigation();
        hideAllPages();
        const page = ensureTVWPage();
        page.classList.remove("hidden");
        page.innerHTML = `<div class="card"><p class="muted">Ładowanie modułu TVW...</p></div>`;
        loadTVWData().then(renderPublicPage).catch(err => {
            console.error(err);
            page.innerHTML = `<button class="back" onclick="goHome()">← Wróć</button><div class="card"><p class="muted">Nie udało się załadować modułu TVW: ${escapeHtml(err.message || err)}</p></div>`;
        });
    }

    async function submitTVWMaterial() {
        const title = inputValue("tvwSubmissionTitle");
        const content = inputValue("tvwSubmissionContent");
        const link = inputValue("tvwSubmissionLink");
        if (!title || !content) return alert("Podaj tytuł i treść zgłoszenia.");

        const { error } = await supabaseClient.from("tvw_submissions").insert({
            user_id: currentUser.id,
            user_name: currentAuthorName(),
            title,
            content,
            link: link || null,
            status: "new"
        });
        if (error) return alert(error.message);
        alert("Zgłoszenie zostało wysłane do redakcji.");
        openTVW();
    }

    async function saveTVWArticle() {
        if (!canEditTVW()) return alert("Nie masz uprawnień redaktora.");
        const id = inputValue("tvwArticleId");
        const title = inputValue("tvwArticleTitle");
        const content = inputValue("tvwArticleContent");
        if (!title || !content) return alert("Tytuł i treść są wymagane.");

        const payload = {
            title,
            content,
            category_id: inputValue("tvwArticleCategory") || null,
            cover_url: inputValue("tvwArticleCover") || null,
            status: inputValue("tvwArticleStatus") || "draft",
            author_id: currentUser.id,
            author_name: currentAuthorName(),
            published_at: inputValue("tvwArticleStatus") === "published" ? new Date().toISOString() : null,
            featured: inputValue("tvwArticleFeatured") === "true",
            updated_at: new Date().toISOString()
        };
        const query = id
            ? supabaseClient.from("tvw_articles").update(payload).eq("id", id)
            : supabaseClient.from("tvw_articles").insert(payload);
        const { error } = await query;
        if (error) return alert(error.message);
        openTVW();
    }

    function resetTVWArticleForm() {
        ["tvwArticleId","tvwArticleTitle","tvwArticleCover","tvwArticleContent"].forEach(id => setFormValue(id, ""));
        setFormValue("tvwArticleCategory", "");
        setFormValue("tvwArticleStatus", "draft");
        setFormValue("tvwArticleFeatured", "false");
    }

    function editTVWArticle(id) {
        const a = tvwArticles.find(x => x.id === id); if (!a) return;
        setFormValue("tvwArticleId", a.id); setFormValue("tvwArticleTitle", a.title); setFormValue("tvwArticleContent", a.content);
        setFormValue("tvwArticleCategory", a.category_id); setFormValue("tvwArticleCover", a.cover_url); setFormValue("tvwArticleStatus", a.status); setFormValue("tvwArticleFeatured", a.featured ? "true" : "false");
        document.getElementById("tvwArticleTitle")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    async function deleteTVWArticle(id) {
        if (!confirm("Usunąć artykuł?")) return;
        const { error } = await supabaseClient.from("tvw_articles").delete().eq("id", id);
        if (error) return alert(error.message); openTVW();
    }

    async function saveTVWVideo() {
        if (!canEditTVW()) return alert("Nie masz uprawnień redaktora.");
        const id = inputValue("tvwVideoId"); const title = inputValue("tvwVideoTitle");
        if (!title) return alert("Podaj tytuł materiału.");
        const payload = { title, description: inputValue("tvwVideoDescription"), video_url: inputValue("tvwVideoUrl") || null, thumbnail_url: inputValue("tvwVideoThumb") || null, status: inputValue("tvwVideoStatus") || "draft", featured: inputValue("tvwVideoFeatured") === "true", author_id: currentUser.id, author_name: currentAuthorName(), published_at: inputValue("tvwVideoStatus") === "published" ? new Date().toISOString() : null, updated_at: new Date().toISOString() };
        const { error } = id ? await supabaseClient.from("tvw_videos").update(payload).eq("id", id) : await supabaseClient.from("tvw_videos").insert(payload);
        if (error) return alert(error.message); openTVW();
    }

    function resetTVWVideoForm() { ["tvwVideoId","tvwVideoTitle","tvwVideoUrl","tvwVideoThumb","tvwVideoDescription"].forEach(id => setFormValue(id, "")); setFormValue("tvwVideoStatus", "draft"); setFormValue("tvwVideoFeatured", "false"); }
    function editTVWVideo(id) { const v = tvwVideos.find(x => x.id === id); if (!v) return; setFormValue("tvwVideoId",v.id);setFormValue("tvwVideoTitle",v.title);setFormValue("tvwVideoUrl",v.video_url);setFormValue("tvwVideoThumb",v.thumbnail_url);setFormValue("tvwVideoDescription",v.description);setFormValue("tvwVideoStatus",v.status);setFormValue("tvwVideoFeatured",v.featured ? "true" : "false"); document.getElementById("tvwVideoTitle")?.scrollIntoView({behavior:"smooth",block:"center"}); }
    async function deleteTVWVideo(id) { if (!confirm("Usunąć materiał TVW?")) return; const {error}=await supabaseClient.from("tvw_videos").delete().eq("id",id); if(error)return alert(error.message); openTVW(); }

    async function saveTVWInterview() {
        if (!canEditTVW()) return alert("Nie masz uprawnień redaktora.");
        const id = inputValue("tvwInterviewId"); const title=inputValue("tvwInterviewTitle"); const person=inputValue("tvwInterviewPerson"); const content=inputValue("tvwInterviewContent");
        if(!title||!person||!content)return alert("Tytuł, rozmówca i treść są wymagane.");
        const payload={title,person,person_role:inputValue("tvwInterviewRole")||null,content,status:inputValue("tvwInterviewStatus")||"draft",author_id:currentUser.id,author_name:currentAuthorName(),published_at:inputValue("tvwInterviewStatus")==="published"?new Date().toISOString():null,updated_at:new Date().toISOString()};
        const {error}=id?await supabaseClient.from("tvw_interviews").update(payload).eq("id",id):await supabaseClient.from("tvw_interviews").insert(payload);if(error)return alert(error.message);openTVW();
    }
    function resetTVWInterviewForm(){["tvwInterviewId","tvwInterviewTitle","tvwInterviewPerson","tvwInterviewRole","tvwInterviewContent"].forEach(id=>setFormValue(id,""));setFormValue("tvwInterviewStatus","draft");}
    function editTVWInterview(id){const i=tvwInterviews.find(x=>x.id===id);if(!i)return;setFormValue("tvwInterviewId",i.id);setFormValue("tvwInterviewTitle",i.title);setFormValue("tvwInterviewPerson",i.person);setFormValue("tvwInterviewRole",i.person_role);setFormValue("tvwInterviewContent",i.content);setFormValue("tvwInterviewStatus",i.status);document.getElementById("tvwInterviewTitle")?.scrollIntoView({behavior:"smooth",block:"center"});}
    async function deleteTVWInterview(id){if(!confirm("Usunąć wywiad?"))return;const{error}=await supabaseClient.from("tvw_interviews").delete().eq("id",id);if(error)return alert(error.message);openTVW();}

    async function saveTVWEvent(){
        if(!canEditTVW())return alert("Nie masz uprawnień redaktora.");
        const id=inputValue("tvwEventId");const title=inputValue("tvwEventTitle");const date=inputValue("tvwEventDate");
        if(!title||!date)return alert("Nazwa i data są wymagane.");
        const payload={title,event_date:date,event_time:inputValue("tvwEventTime")||null,location:inputValue("tvwEventLocation")||null,description:inputValue("tvwEventDescription"),status:inputValue("tvwEventStatus")||"draft",created_by:currentUser.id,updated_at:new Date().toISOString()};
        const{error}=id?await supabaseClient.from("tvw_events").update(payload).eq("id",id):await supabaseClient.from("tvw_events").insert(payload);if(error)return alert(error.message);openTVW();
    }
    function resetTVWEventForm(){["tvwEventId","tvwEventTitle","tvwEventDate","tvwEventTime","tvwEventLocation","tvwEventDescription"].forEach(id=>setFormValue(id,""));setFormValue("tvwEventStatus","draft");}
    function editTVWEvent(id){const e=tvwEvents.find(x=>x.id===id);if(!e)return;setFormValue("tvwEventId",e.id);setFormValue("tvwEventTitle",e.title);setFormValue("tvwEventDate",e.event_date);setFormValue("tvwEventTime",e.event_time);setFormValue("tvwEventLocation",e.location);setFormValue("tvwEventDescription",e.description);setFormValue("tvwEventStatus",e.status);document.getElementById("tvwEventTitle")?.scrollIntoView({behavior:"smooth",block:"center"});}
    async function deleteTVWEvent(id){if(!confirm("Usunąć wydarzenie?"))return;const{error}=await supabaseClient.from("tvw_events").delete().eq("id",id);if(error)return alert(error.message);openTVW();}

    async function addTVWCategory(){
        if(!canEditTVW())return alert("Nie masz uprawnień redaktora.");
        const name=inputValue("tvwNewCategory");if(!name)return alert("Podaj nazwę kategorii.");
        const{error}=await supabaseClient.from("tvw_categories").insert({name,created_by:currentUser.id});if(error)return alert(error.message);openTVW();
    }

    async function updateTVWSubmission(id){
        if(!canEditTVW())return;
        const status=$("submissionStatus_"+id)?.value;const admin_note=$("submissionNote_"+id)?.value?.trim()||null;
        const{error}=await supabaseClient.from("tvw_submissions").update({status,admin_note,decided_by:currentUser.id,updated_at:new Date().toISOString()}).eq("id",id);if(error)return alert(error.message);openTVW();
    }
    async function deleteTVWSubmission(id){if(!isAdminTVW())return;if(!confirm("Usunąć zgłoszenie?"))return;const{error}=await supabaseClient.from("tvw_submissions").delete().eq("id",id);if(error)return alert(error.message);openTVW();}

    async function saveTVWPlayerRole() {
        if (!isAdminTVW()) return alert("Tylko administrator może zmieniać rangi.");
        if (!selectedPlayer) return alert("Najpierw wybierz gracza.");
        const role = $("adminPlayerRole")?.value;
        if (!role) return;
        const { error } = await supabaseClient.from("profiles").update({ role }).eq("id", selectedPlayer.id);
        if (error) return alert(error.message);
        selectedPlayer.role = role;
        const local = players.find(p => p.id === selectedPlayer.id);
        if (local) local.role = role;
        updateAdminRoleUI();
        alert(role === "redaktor" ? "Nadano rangę redaktora." : "Odebrano rangę redaktora.");
    }

    function updateAdminRoleUI() {
        const box = $("adminRoleStatus");
        const select = $("adminPlayerRole");
        if (!box || !select) return;
        if (!selectedPlayer) {
            box.textContent = "Najpierw wybierz gracza.";
            select.value = "player";
            return;
        }
        box.innerHTML = `Aktualna ranga: <strong>${escapeHtml(selectedPlayer.role || "player")}</strong>`;
        select.value = selectedPlayer.role === "redaktor" ? "redaktor" : "player";
    }

    function injectAdminRoleCard() {
        const info = $("selectedPlayerInfo");
        if (!info || $("adminRoleCard")) return;
        const card = document.createElement("div");
        card.id = "adminRoleCard";
        card.className = "card";
        card.style.marginTop = "14px";
        card.innerHTML = `
            <h3>🖊️ Ranga redaktora</h3>
            <p id="adminRoleStatus" class="muted">Najpierw wybierz gracza.</p>
            <div class="form-grid">
                <div class="field">
                    <label>Ranga</label>
                    <select id="adminPlayerRole">
                        <option value="player">Gracz</option>
                        <option value="redaktor">Redaktor</option>
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button class="primary" onclick="saveTVWPlayerRole()">💾 Zapisz rangę</button>
            </div>
        `;
        info.parentNode.insertBefore(card, info.nextSibling);
        updateAdminRoleUI();
    }

    function enhanceAdminRoleHook() {
        injectAdminRoleCard();
        if (typeof loadSelectedPlayer === "function" && !window.__tvwWrappedLoadSelectedPlayer) {
            const original = window.loadSelectedPlayer;
            window.loadSelectedPlayer = async function () {
                await original();
                updateAdminRoleUI();
            };
            window.__tvwWrappedLoadSelectedPlayer = true;
        }
    }

    window.openTVW = openTVW;
    window.openTvw = openTVW;
    window.submitTVWMaterial = submitTVWMaterial;
    window.saveTVWArticle = saveTVWArticle;
    window.resetTVWArticleForm = resetTVWArticleForm;
    window.editTVWArticle = editTVWArticle;
    window.deleteTVWArticle = deleteTVWArticle;
    window.saveTVWVideo = saveTVWVideo;
    window.resetTVWVideoForm = resetTVWVideoForm;
    window.editTVWVideo = editTVWVideo;
    window.deleteTVWVideo = deleteTVWVideo;
    window.saveTVWInterview = saveTVWInterview;
    window.resetTVWInterviewForm = resetTVWInterviewForm;
    window.editTVWInterview = editTVWInterview;
    window.deleteTVWInterview = deleteTVWInterview;
    window.saveTVWEvent = saveTVWEvent;
    window.resetTVWEventForm = resetTVWEventForm;
    window.editTVWEvent = editTVWEvent;
    window.deleteTVWEvent = deleteTVWEvent;
    window.addTVWCategory = addTVWCategory;
    window.updateTVWSubmission = updateTVWSubmission;
    window.deleteTVWSubmission = deleteTVWSubmission;
    window.saveTVWPlayerRole = saveTVWPlayerRole;

    function initTVW() {
        ensureTVWPage();
        enhanceAdminRoleHook();
        const originalOpenAdmin = window.openAdmin;
        if (typeof originalOpenAdmin === "function" && !window.__tvwWrappedOpenAdmin) {
            window.openAdmin = async function () {
                await originalOpenAdmin();
                injectAdminRoleCard();
                updateAdminRoleUI();
            };
            window.__tvwWrappedOpenAdmin = true;
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initTVW);
    } else {
        initTVW();
    }
})();
