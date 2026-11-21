/* ASM 2027 site engine — renders pages from window.ASM_DATA */
(function () {
  "use strict";

  var U = window.ASM_URL || function (p) { return p || ""; };

  var D = window.ASM_DATA;
  if (!D) return;

  var doc = document;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function person(id) { return byId(D.people, id); }
  function session(id) { return byId(D.sessions, id); }
  function lecture(id) { return byId(D.lectures, id); }
  function day(id) { return byId(D.days, id); }

  function surnameSort(a, b) {
    return a.name.split(" ").pop().localeCompare(b.name.split(" ").pop());
  }

  function typeLabel(type) {
    return {
      symposium: "Symposium", workshop: "Workshop", "pre-conference": "Pre-conference workshop",
      session: "Session", event: "Ceremony"
    }[type] || "Session";
  }

  function facilitatorIds(s) {
    return (s.facilitatorIds || []).filter(function (id) { return (s.moderatorIds || []).indexOf(id) === -1; });
  }

  function hasPerson(p) { return !!(p && (p.bio || (p.lectureIds && p.lectureIds.length) || personSessions(p.id).length)); }
  function hasSession(s) { return !!(s && (s.summary || (s.lectureIds && s.lectureIds.length) || (s.points && s.points.length) || (s.moderatorIds && s.moderatorIds.length))); }
  function hasLecture(l) { return !!(l && l.abstract); }

  function pageName() { return doc.body.getAttribute("data-page"); }

  /* Session links stay on the programme page when possible and otherwise
     point back to it, so moderators/lectures on the session and faculty
     pages can always be traced to the timetable. */
  function sessionHref(id) {
    return (pageName() === "programme" ? "" : "programme.html") + "#s-" + id;
  }

  function sessionPage(s) {
    if (!s) return null;
    if (s.id === "epos") return { href: "e-posters.html", label: "ePoster gallery and evaluation details" };
    if (s.id === "fpap") return { href: "e-posters.html#free-paper", label: "Free Paper Presentation and the Day 1 evaluation" };
    if (s.id === "fprj") return { href: "formal-project-prize.html", label: "Formal Project Prize session details and abstracts" };
    return null;
  }

  function sessionAbstracts(s) {
    if (!s) return null;
    if (s.id === "epos") return { href: "e-posters.html", list: D.eposters || [] };
    if (s.id === "fpap") return { href: "e-posters.html#free-paper", list: [] };
    if (s.id === "fprj") return { href: "formal-project-prize.html", list: D.formalProjectAbstracts || [] };
    return null;
  }

  function personSessions(id) {
    return D.sessions.filter(function (s) {
      return (s.moderatorIds || []).indexOf(id) !== -1 || (s.facilitatorIds || []).indexOf(id) !== -1;
    });
  }

  function personLink(id) {
    var p = person(id);
    if (!p) return "";
    var text = esc(p.name);
    if (!hasPerson(p)) return text;
    return '<a href="#p-' + esc(p.id.replace(/^p-/, "")) + '">' + text + "</a>";
  }

  function personLinks(ids) {
    return (ids || []).map(personLink).filter(Boolean).join(", ");
  }

  function lectureLink(l) {
    if (!l) return "";
    var text = esc(l.title);
    if (!hasLecture(l)) return text;
    return '<a href="#l-' + esc(l.id) + '">' + text + "</a>";
  }

  function sessionLink(s) {
    var text = esc(s.title);
    if (!hasSession(s)) return text;
    return '<a href="#s-' + esc(s.id) + '">' + text + "</a>";
  }

  /* Home ---------------------------------------------------------------- */
  function renderWelcome() {
    var host = doc.getElementById("welcomeContent");
    if (!host) return;
    host.innerHTML = D.welcome.paragraphs.map(function (p) {
      return "<p>" + esc(p) + "</p>";
    }).join("") + '<div class="signature-row">' + D.welcome.signatories.map(function (s) {
      return '<div class="signature"><img src="' + esc(U(s.image)) + '" alt="">' +
        '<div class="signature-copy"><strong>' + esc(s.name) + "</strong><span>" + esc(s.role) + "<br>" + esc(s.org) + "</span></div></div>";
    }).join("") + "</div>";
  }

  function renderDates() {
    var host = doc.getElementById("keyDatesContent");
    if (!host) return;
    host.innerHTML = '<ol class="timeline">' + D.dates.map(function (d) {
      return '<li data-date="' + esc(d.date) + '"><time datetime="' + esc(d.date) + '">' + esc(d.label) +
        "</time><strong>" + esc(d.title) + "</strong>" +
        (d.detail ? "<span>" + esc(d.detail) + "</span>" : "") + "</li>";
    }).join("") + "</ol>";
  }

  function sponsorCards(list) {
    return (list || D.sponsors).filter(function (s) { return s.category !== "Exhibitor"; }).map(function (s) {
      var inner = s.logo
        ? '<img src="' + esc(U(s.logo)) + '" alt="' + esc(s.name) + '">'
        : '<span class="sponsor-wordmark">' + esc(s.name) + "</span>";
      var tag = s.url ? 'a href="' + esc(s.url) + '" target="_blank" rel="noopener"' : "div";
      var close = s.url ? "a" : "div";
      return "<" + tag + ' class="logo-slot logo-slot--filled">' + inner +
        "<small>" + esc(s.category) + "</small></" + close + ">";
    }).join("");
  }

  function renderSponsorGrid() {
    var host = doc.getElementById("sponsorGrid");
    if (host) host.innerHTML = '<div class="logo-grid logo-grid--sponsors">' + sponsorCards() + "</div>";
  }

  function renderFacts() {
    var host = doc.getElementById("factsContent");
    if (!host) return;
    var m = D.meta;
    var icons = {
      date: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
      pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
      cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>',
      globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>'
    };
    var facts = [
      { icon: "date", label: "Dates", value: m.dateLabel, sub: "Saturday \u2013 Sunday" },
      { icon: "pin", label: "Venue", value: m.venueName, sub: "Wan Chai, Hong Kong" },
      { icon: "cap", label: "Pre-conference", value: m.preConferenceDate, sub: "Friday \u00b7 Workshops" },
      { icon: "globe", label: "Language", value: m.language, sub: "" }
    ];
    host.innerHTML = facts.map(function (f) {
      return '<dl class="fact"><dt><span class="fact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        icons[f.icon] + "</svg></span>" + f.label + "</dt><dd>" + esc(f.value) +
        (f.sub ? '<br><span class="muted" style="font-weight:400;font-size:13px">' + esc(f.sub) + "</span>" : "") + "</dd></dl>";
    }).join("");
  }

  function renderVenue() {
    var host = doc.getElementById("venueContent");
    if (!host) return;
    var m = D.meta;
    host.innerHTML = '<p><strong style="font-size:17px;color:#0e4e77">' + esc(m.venueName) + ", Hong Kong</strong><br>" +
      esc(m.venueAddress) + "</p>" +
      "<p>Tel: " + esc(m.venueTel) + '<br>Website: <a href="https://www.hopewellhotel.com" target="_blank" rel="noopener">' + esc(m.venueWebsite) + "</a></p>" +
      '<p class="muted" style="font-size:14px">Pre-conference workshops on ' + esc(m.preConferenceDate) + " will be held in " + esc(m.preConferenceVenue) + ".</p>" +
      '<a class="btn btn-secondary" href="meeting-information.html">Meeting information</a>';
  }

  /* ePosters ----------------------------------------------------------- */
  var eposterFilter = { q: "", category: "All" };

  function eposterMatch(e) {
    if (eposterFilter.category !== "All" && e.category !== eposterFilter.category) return false;
    var q = eposterFilter.q.toLowerCase();
    if (!q) return true;
    return [e.number, e.title, e.authors, e.presenter, e.affiliation, e.category, (e.keywords || []).join(" ")]
      .join(" ").toLowerCase().indexOf(q) !== -1;
  }

  function eposterCard(e) {
    return '<article class="eposter-card" data-theme="' + esc(e.theme) + '">' +
      '<a class="eposter-card-link" href="#e-' + esc(e.id) + '">' +
        '<span class="eposter-number">' + esc(e.number) + "</span>" +
        "<h3>" + esc(e.title) + "</h3>" +
        '<p class="eposter-authors">' + esc(e.authors) + "</p>" +
        '<p class="eposter-aff">' + esc(e.affiliation) + "</p>" +
        '<span class="eposter-chip">' + esc(e.category) + "</span>" +
        (e.pdf ? '<span class="eposter-badge eposter-badge--pdf">PDF ePoster</span>' : "") +
      "</a></article>";
  }

  function paintEposters() {
    var grid = doc.getElementById("eposterGrid");
    if (!grid) return;
    var list = D.eposters.filter(eposterMatch);
    grid.innerHTML = list.map(eposterCard).join("");
    var empty = doc.getElementById("eposterEmpty");
    if (empty) {
      empty.hidden = list.length > 0;
      empty.textContent = D.eposters.length ? "No ePosters match your search." : "ePosters will be published here once accepted.";
    }
    var count = doc.getElementById("eposterCount");
    if (count) count.textContent = D.eposters.length ? list.length + (list.length === 1 ? " ePoster" : " ePosters") +
      (eposterFilter.category === "All" ? "" : " in " + eposterFilter.category) : "Gallery opens " + (D.meta.eposterGalleryDate || "22 October 2027");
  }

  function renderEposters() {
    var info = D.eposterInfo;
    var m = D.meta;
    var lede = doc.getElementById("eposterLede");
    if (lede) lede.textContent = D.eposterGalleryIntro;
    var open = doc.getElementById("eposterOpen");
    if (open) open.textContent = m.abstractOpen;
    var deadline = doc.getElementById("eposterDeadline");
    if (deadline) deadline.textContent = m.abstractDeadline;
    var fileDeadline = doc.getElementById("eposterFileDeadline");
    if (fileDeadline) fileDeadline.textContent = m.eposterFileDeadline;
    var galleryDate = doc.getElementById("eposterGalleryDate");
    if (galleryDate) galleryDate.textContent = m.eposterGalleryDate;

    var formats = doc.getElementById("eposterFormats");
    if (formats) formats.innerHTML = info.formats.map(function (f, i) {
      return '<div class="format-card"><span class="format-num">0' + (i + 1) + "</span><h3>" + esc(f.name) + "</h3><p>" + esc(f.detail) + "</p></div>";
    }).join("");

    var dateRows = [
      { label: "Abstract submission opens", date: m.abstractOpen, note: "Choose ePoster only or Free Paper consideration" },
      { label: "Abstract submission deadline", date: m.abstractDeadline, note: "Abstract and preferred format" },
      { label: "Notification of acceptance", date: m.notification, note: "Final format confirmed by email" },
      { label: "ePoster file deadline", date: m.eposterFileDeadline, note: "PDF upload through the submission portal" },
      { label: "ePoster gallery opens", date: m.eposterGalleryDate, note: "Website and event app" },
      { label: "ePoster Evaluation Session", date: m.eposterEvaluationDate || "30 October 2027", note: (m.eposterEvaluationTime || "14:00–15:30") + " · " + (m.eposterEvaluationVenue || "Pre-function area") },
      { label: "Free Paper Presentation", date: m.freePaperDate || "31 October 2027", note: (m.freePaperTime || "11:00–12:30") + " · " + (m.freePaperVenue || "Salon 1–2") },
      { label: "On-site ePoster viewing", date: m.eposterOnsite, note: "Digital lounges and app" }
    ];
    var dates = doc.getElementById("eposterDates");
    if (dates) dates.innerHTML = dateRows.map(function (d) {
      return "<tr><td>" + esc(d.label) + "</td><td><strong>" + esc(d.date) + "</strong></td><td>" + esc(d.note) + "</td></tr>";
    }).join("");

    var steps = doc.getElementById("eposterSteps");
    if (steps) steps.innerHTML = info.steps.map(function (s) {
      return '<li><strong>' + esc(s.title) + "</strong><span>" + esc(s.text) + "</span></li>";
    }).join("");

    var specs = doc.getElementById("eposterSpecs");
    if (specs) specs.innerHTML = info.specs.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");

    var awards = doc.getElementById("eposterAwards");
    if (awards) awards.innerHTML = info.awards.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");

    var sessionInfo = doc.getElementById("eposterSessionInfo");
    if (sessionInfo) {
      var evalSession = session("epos");
      var freeSession = session("fpap");
      sessionInfo.innerHTML =
        (evalSession ? '<div class="session-panel">' + sessionPanel(evalSession) + "</div>" : "") +
        (freeSession ? '<div class="session-panel">' + sessionPanel(freeSession) + "</div>" : "");
    }

    var chips = doc.getElementById("eposterFilters");
    if (chips) {
      var cats = ["All"].concat(info.categories);
      chips.innerHTML = cats.map(function (c) {
        return '<button type="button" class="chip" data-cat="' + esc(c) + '" aria-pressed="' + (c === "All" ? "true" : "false") + '">' + esc(c) + "</button>";
      }).join("");
      chips.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-cat]");
        if (!btn) return;
        eposterFilter.category = btn.getAttribute("data-cat");
        chips.querySelectorAll(".chip").forEach(function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        paintEposters();
      });
    }
    var search = doc.getElementById("eposterSearch");
    if (search) {
      search.addEventListener("input", function () {
        eposterFilter.q = search.value.trim();
        paintEposters();
      });
    }
    paintEposters();
  }

  function openEposter(id) {
    var e = D.eposters.filter(function (x) { return x.id === id; })[0];
    if (!e) return;
    var html = '<span class="detail-type">' + esc(e.number) + " &middot; " + esc(e.category) + "</span>" +
      "<h2>" + esc(e.title) + "</h2>" +
      '<p class="modal-meta"><strong>' + esc(e.authors) + "</strong><br>" + esc(e.affiliation) + "</p>" +
      '<p class="modal-meta"><strong>Presenter:</strong> ' + esc(e.presenter) + "</p>" +
      (e.pdf
        ? '<div class="modal-pdf">' +
            '<iframe src="' + esc(U(e.pdf)) + '#view=FitH" title="PDF ePoster: ' + esc(e.title) + '" loading="lazy"></iframe>' +
            '<p class="modal-pdf-link"><a href="' + esc(U(e.pdf)) + '" target="_blank" rel="noopener">Open PDF ePoster in a new tab</a></p>' +
          '</div>'
        : "") +
      "<h3>Abstract</h3><p>" + esc(e.abstract) + "</p>" +
      '<p class="modal-meta"><strong>Keywords:</strong> ' + esc((e.keywords || []).join(", ")) + "</p>" +
      (e.award ? '<p class="modal-meta"><strong>Award:</strong> ' + esc(e.award) + "</p>" : "") +
      '<p class="modal-meta"><strong>Cite this ePoster:</strong> ' + esc(e.authors) + ". " + esc(e.title) +
      ". ASM 2027 ePoster " + esc(e.number) + ".</p>";
    showModal(html);
  }

  /* Submission and programme information -------------------------------- */
  function fillList(id, items) {
    var host = doc.getElementById(id);
    if (!host) return;
    host.innerHTML = (items || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
  }

  function dateRows(kind) {
    var m = D.meta;
    var rows = [
      { label: "Submission opens", date: m.abstractOpen, note: "Choose ePoster only or Free Paper consideration" },
      { label: "Abstract deadline", date: m.abstractDeadline, note: "Main call closes" },
      { label: "Notification of acceptance", date: m.notification, note: "By email to the presenting author" },
      { label: "Presenting author registration deadline", date: m.presentingDeadline, note: "Required to remain in the programme" }
    ];
    if (kind === "overview" || kind === "eposter") {
      rows.push({ label: "ePoster file deadline", date: m.eposterFileDeadline, note: "Upload the single-page PDF" });
      rows.push({ label: "ePoster gallery opens", date: m.eposterGalleryDate, note: "Website and event app" });
    }
    if (kind === "overview" || kind === "free") {
      rows.push({ label: "ePoster Evaluation Session", date: m.eposterEvaluationDate || "30 October 2027", note: (m.eposterEvaluationTime || "14:00–15:30") + " · " + (m.eposterEvaluationVenue || "Pre-function area") });
      rows.push({ label: "Free Paper Presentation", date: m.freePaperDate || "31 October 2027", note: (m.freePaperTime || "11:00–12:30") + " · " + (m.freePaperVenue || "Salon 1–2") });
    }
    return rows;
  }

  function paintDateTable(id, rows) {
    var tbody = doc.getElementById(id);
    if (!tbody) return;
    tbody.innerHTML = rows.map(function (r) {
      return "<tr><td>" + esc(r.label) + "</td><td><strong>" + esc(r.date) + "</strong></td><td>" + esc(r.note) + "</td></tr>";
    }).join("");
  }

  function sessionPanel(s) {
    if (!s) return "";
    var d = day(s.day);
    var href = sessionHref(s.id);
    return '<span class="detail-type">' + esc(typeLabel(s.type)) + "</span>" +
      '<h2><a href="' + esc(href) + '">' + esc(s.title) + "</a></h2>" +
      '<p class="modal-meta">' + esc(d ? d.long : "") + " &middot; " + esc(s.time) + " &middot; " + esc(s.room) + "</p>" +
      (s.moderatorIds.length ? '<p class="modal-meta"><strong>Moderators:</strong> ' + personLinks(s.moderatorIds) + "</p>" : "") +
      (s.summary ? "<p>" + esc(s.summary) + "</p>" : "") +
      '<p class="session-back"><a href="' + esc(href) + '">View this session in the programme &rarr;</a></p>';
  }

  function renderSubmission() {
    var info = D.submissionInfo, m = D.meta;
    var lede = doc.getElementById("submissionLede");
    if (lede) lede.textContent = info.intro;
    var notice = doc.getElementById("submissionNotice");
    if (notice) notice.innerHTML = "<strong>The submission portal is not yet open.</strong> Submissions open on <strong>" +
      esc(m.abstractOpen) + "</strong>; the deadline is <strong>" + esc(m.abstractDeadline) + "</strong>.";
    var open = doc.getElementById("submissionOpen");
    if (open) open.textContent = m.abstractOpen;
    var btn = doc.getElementById("submissionBtn");
    if (btn) btn.textContent = "Online submission \u2014 opens " + m.abstractOpen;

    paintDateTable("submissionDates", dateRows("overview"));
    fillList("submissionReview", info.sharedReview);
    fillList("submissionGuidelines", info.sharedGuidelines);
  }

  function renderCallFree() {
    var info = D.freePaperInfo, m = D.meta;
    var lede = doc.getElementById("callFreeLede");
    if (lede) lede.textContent = info.intro;
    var open = doc.getElementById("callFreeOpen");
    if (open) open.textContent = m.abstractOpen;
    var deadline = doc.getElementById("callFreeDeadline");
    if (deadline) deadline.textContent = m.abstractDeadline;
    fillList("callFreeFormat", info.format);
    fillList("callFreeEligibility", info.eligibility);
    fillList("callFreeReview", info.review);
    fillList("callFreePrizes", info.prizes);
    fillList("callFreeGuidelines", D.submissionInfo.sharedGuidelines);
    paintDateTable("callFreeDates", dateRows("free"));
  }

  function renderCallEposter() {
    var info = D.eposterInfo, m = D.meta;
    var lede = doc.getElementById("callEposterLede");
    if (lede) lede.textContent = info.intro;
    var open = doc.getElementById("callEposterOpen");
    if (open) open.textContent = m.abstractOpen;
    var deadline = doc.getElementById("callEposterDeadline");
    if (deadline) deadline.textContent = m.abstractDeadline;
    var formats = doc.getElementById("callEposterFormats");
    if (formats) formats.innerHTML = info.formats.map(function (f, i) {
      return '<div class="format-card"><span class="format-num">0' + (i + 1) + "</span><h3>" + esc(f.name) + "</h3><p>" + esc(f.detail) + "</p></div>";
    }).join("");
    var steps = doc.getElementById("callEposterSteps");
    if (steps) steps.innerHTML = info.steps.map(function (s) {
      return '<li><strong>' + esc(s.title) + "</strong><span>" + esc(s.text) + "</span></li>";
    }).join("");
    var freeInfo = D.freePaperInfo;
    var freeIntro = doc.getElementById("callCombinedFreePaperIntro");
    if (freeIntro) freeIntro.textContent = freeInfo.intro;
    fillList("callCombinedFreePaperFormat", freeInfo.format);
    fillList("callCombinedFreePaperReview", freeInfo.review);
    fillList("callCombinedFreePaperPrizes", freeInfo.prizes);
    fillList("callEposterSpecs", info.specs);
    fillList("callEposterAwards", info.awards);
    fillList("callEposterGuidelines", D.submissionInfo.sharedGuidelines);
    fillList("callEposterReviewCriteria", D.submissionInfo.sharedReview);
    var submitBtn = doc.getElementById("callEposterSubmitBtn");
    if (submitBtn) submitBtn.textContent = "Online submission \u2014 opens " + m.abstractOpen;
    paintDateTable("callEposterDates", dateRows("eposter"));
  }

  function presentationAbstracts(list) {
    if (!list || !list.length) {
      return '<p class="muted">Accepted abstracts will be published here.</p>';
    }
    return list.map(function (a) {
      var paragraphs = String(a.abstract || "").split(/\n\s*\n/).filter(Boolean).map(function (t) {
        return "<p>" + esc(t) + "</p>";
      }).join("");
      return '<article class="abstract-item" id="' + esc(a.id) + '">' +
        '<span class="abstract-num">' + esc(a.number) + "</span>" +
        "<h3>" + esc(a.title) + "</h3>" +
        '<p class="abstract-authors"><strong>' + esc(a.authors) + "</strong></p>" +
        '<p class="abstract-aff">' + esc(a.affiliation) + "</p>" +
        '<div class="abstract-text">' + paragraphs + "</div>" +
        '<p class="abstract-presenter"><strong>Presenting author:</strong> ' + esc(a.presenter) + "</p>" +
      "</article>";
    }).join("");
  }

  function renderCallFormalProject() {
    var info = D.formalProjectCallInfo;
    var call = D.formalProjectCall || {};
    var lede = doc.getElementById("callFormalLede");
    if (lede) lede.textContent = info.intro;
    fillList("formalCallEligibility", info.eligibility);
    fillList("formalCallProcess", info.process);
    fillList("formalCallNotes", info.notes);
    paintDateTable("formalCallDates", (call.dates || []).map(function (d) {
      return { label: d.label, date: d.date, note: d.note };
    }));
    var contact = doc.getElementById("formalCallContact");
    if (contact && call.contact) contact.textContent = call.contact;
  }

  function renderFormalProject() {
    var info = D.formalProjectInfo;
    var s = session("fprj");
    var lede = doc.getElementById("formalProjectLede");
    if (lede) lede.textContent = info.intro;
    var panel = doc.getElementById("formalProjectSessionInfo");
    if (panel) panel.innerHTML = sessionPanel(s);
    fillList("formalProjectJudging", info.judging);
    fillList("formalProjectPrizes", info.prizes);
    var abstracts = doc.getElementById("formalProjectAbstracts");
    if (abstracts) abstracts.innerHTML = presentationAbstracts(D.formalProjectAbstracts);
  }

  /* Abstracts ----------------------------------------------------------- */
  function renderAbstracts() {
    var m = D.meta;
    var lede = doc.getElementById("abstractLede");
    if (lede) lede.textContent = "The call for abstracts opens on " + m.abstractOpen + " and closes on " + m.abstractDeadline + ".";
    var notice = doc.getElementById("abstractNotice");
    if (notice) notice.innerHTML = "<strong>The submission portal is not yet open.</strong> Submissions open on <strong>" +
      esc(m.abstractOpen) + "</strong>; the deadline is <strong>" + esc(m.abstractDeadline) + "</strong>.";
    var tbody = doc.getElementById("abstractDates");
    if (tbody) {
      var rows = [
        ["Abstract submission opens", m.abstractOpen, "Same day as registration opens"],
        ["Abstract submission deadline", m.abstractDeadline, "Main call closes"],
        ["Notification of acceptance", m.notification, "By email to presenting authors"],
        ["Presenting author registration deadline", m.presentingDeadline, "Required to remain in the programme"],
        ["ePoster file deadline", m.eposterFileDeadline, "For all accepted ePosters"],
        ["ePoster gallery opens", m.eposterGalleryDate, "Website and event app"]
      ];
      tbody.innerHTML = rows.map(function (r) {
        return "<tr><td>" + esc(r[0]) + "</td><td><strong>" + esc(r[1]) + "</strong></td><td>" + esc(r[2]) + "</td></tr>";
      }).join("");
    }
  }

  /* Meeting information ------------------------------------------------ */
  function renderMeetingInfo() {
    var m = D.meta;
    var lede = doc.getElementById("meetingLede");
    if (lede) lede.textContent = "Venue, travel and practical details for " + m.shortName + " at " + m.venueName + ", Wan Chai.";
    var when = doc.getElementById("meetingWhenWhere");
    if (when) when.innerHTML = "The Annual Scientific Meeting in Anaesthesiology " + esc(m.year) + " (" + esc(m.shortName) +
      ") and its Exhibition will be held on <strong>" + esc(m.dateLabel) + "</strong> at the <strong>" + esc(m.venueName) +
      "</strong>. Pre-conference workshops will be held on <strong>" + esc(m.preConferenceDate) + "</strong> in " + esc(m.preConferenceVenue) + ".";
    var venue = doc.getElementById("meetingVenue");
    if (venue) venue.innerHTML = "<p><strong>" + esc(m.venueBuilding) + "</strong><br>" + esc(m.venueName) + "</p>" +
      '<table class="venue-details">' +
        "<tr><th>Address:</th><td>" + esc(m.venueStreet) + "</td></tr>" +
        "<tr><th>Tel:</th><td>" + esc(m.venueTel) + "</td></tr>" +
        '<tr><th>Website:</th><td><a href="https://' + esc(m.venueWebsite) + '" target="_blank" rel="noopener">' + esc(m.venueWebsite) + "</a></td></tr>" +
      "</table>" +
      "<p><strong>How to go to " + esc(m.venueName) + "</strong><br>Please view the <a href=\"https://maps.google.com/?q=" +
      encodeURIComponent(m.venueName + ", " + m.venueAddress) + '" target="_blank" rel="noopener">location map</a>.</p>';
    var pre = doc.getElementById("preConferenceInfo");
    if (pre) pre.innerHTML = "The pre-conference workshops will be held on <strong>" + esc(m.preConferenceDate) +
      "</strong> in <strong>" + esc(m.preConferenceVenue) + "</strong>. The pre-conference programme includes PBL Workshops 1 and 2. Registration for these workshops is separate from the main meeting and places are limited.";
    var sec = doc.getElementById("secretariatInfo");
    if (sec) sec.innerHTML = "Meeting secretariat details are available on the <a href=\"contact-us.html\">Contact Us</a> page.";
  }

  /* Committees --------------------------------------------------------- */
  function renderCommittee() {
    var host = doc.getElementById("committeeContent");
    if (!host) return;
    var c = D.committee;
    function block(label, names) {
      return '<p><span class="subheader3">' + label + "</span><br>" + names + "</p>";
    }
    host.innerHTML = '<div class="committee-list">' +
      block("Chairperson", esc(c.chairperson.name)) +
      block("Vice-Chairperson", esc(c.vice.name)) +
      block("Organising Committee", c.members.map(function (m) { return esc(m.name); }).join("<br>")) +
      (c.subcommittees || []).map(function (s) {
        var names = Array.isArray(s.members) ? s.members.map(esc).join("<br>") : esc(s.members).replace(/\n/g, "<br>");
        return block(s.name, names);
      }).join("") +
      block("Treasurer", esc(c.treasurer.name)) +
      block("Honorary Advisors", c.advisors.map(function (a) { return esc(a.name); }).join("<br>")) +
      "</div>";
  }

  /* Modal -------------------------------------------------------------- */
  var dialog = null;

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = doc.createElement("dialog");
    dialog.className = "detail-modal";
    dialog.setAttribute("aria-label", "Details");
    dialog.innerHTML = '<button class="modal-close" type="button" aria-label="Close details">&times;</button><div class="modal-body" id="modalBody"></div>';
    doc.body.appendChild(dialog);
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) closeModal();
    });
    dialog.querySelector(".modal-close").addEventListener("click", closeModal);
    dialog.addEventListener("close", function () {
      if (/^#(s-|p-|l-|e-)/.test(window.location.hash)) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    });
    return dialog;
  }

  function closeModal() {
    if (dialog && dialog.open) dialog.close();
    else if (/^#(s-|p-|l-)/.test(window.location.hash)) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  function showModal(html) {
    var d = ensureDialog();
    doc.getElementById("modalBody").innerHTML = html;
    if (!d.open) d.showModal();
    d.scrollTop = 0;
    doc.getElementById("modalBody").scrollTop = 0;
  }

  function sessionMeta(s) {
    var d = day(s.day);
    return (d ? d.long : "") + " &middot; " + esc(s.time) + " &middot; " + esc(s.room);
  }

  function lectureList(s) {
    var list = (s.lectureIds || []).map(lecture).filter(Boolean);
    if (!list.length) return "";
    return "<h3>Lectures</h3><ol class=\"modal-lectures\">" + list.map(function (l) {
      return "<li><strong>" + lectureLink(l) + "</strong><span>" + personLink(l.speakerId) + "</span></li>";
    }).join("") + "</ol>";
  }

  function openSession(id) {
    var s = session(id);
    if (!s || !hasSession(s)) return;
    var detail = sessionPage(s);
    var abstracts = sessionAbstracts(s);
    var html = '<span class="detail-type">' + esc(typeLabel(s.type)) + "</span>" +
      "<h2>" + esc(s.title) + "</h2>" +
      '<p class="modal-meta">' + sessionMeta(s) + "</p>" +
      (s.moderatorIds.length ? '<p class="modal-meta"><strong>Moderators:</strong> ' + personLinks(s.moderatorIds) + "</p>" : "") +
      (facilitatorIds(s).length ? '<p class="modal-meta"><strong>Facilitators:</strong> ' + personLinks(facilitatorIds(s)) + "</p>" : "") +
      (s.summary ? "<p>" + esc(s.summary) + "</p>" : "") +
      lectureList(s) +
      (s.points && s.points.length ? "<h3>Workshop outline</h3><ul>" + s.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>" : "") +
      (abstracts && abstracts.list.length ? "<h3>Abstracts</h3><ol class=\"modal-lectures\">" + abstracts.list.map(function (a) {
        return "<li><strong><a href=\"" + esc(abstracts.href) + "#" + esc(a.id) + "\">" +
          esc(a.number) + " &middot; " + esc(a.title) + "</a></strong><span>" + esc(a.authors) + "</span></li>";
      }).join("") + "</ol>" : "") +
      (detail ? '<p class="modal-meta"><a href="' + esc(detail.href) + '">' + esc(detail.label) + " &rarr;</a></p>" : "");
    showModal(html);
  }

  function openPerson(id) {
    var p = person(id.indexOf("p-") === 0 ? id : "p-" + id);
    if (!p || !hasPerson(p)) return;
    var lectures = (p.lectureIds || []).map(lecture).filter(Boolean);
    var programme = personSessions(p.id).map(function (s) {
      var roles = [];
      if ((s.moderatorIds || []).indexOf(p.id) !== -1) roles.push("Moderator");
      if ((s.facilitatorIds || []).indexOf(p.id) !== -1) roles.push("Facilitator");
      var d = day(s.day);
      return "<li><strong><a href=\"" + esc(sessionHref(s.id)) + "\">" + esc(s.title) + "</a></strong><span>" +
        esc(roles.join(" & ")) + " &middot; " + esc(d ? d.long : "") + " &middot; " +
        esc(s.time) + " &middot; " + esc(s.room) + "</span></li>";
    }).join("");
    var html = "<h2>" + esc(p.name) + "</h2>" +
      '<p class="modal-meta">' + esc(p.role) + (p.ocRole ? " &middot; " + esc(p.ocRole) : "") +
      "<br>" + esc(p.affiliation) + " &middot; " + esc(p.country) + "</p>" +
      (p.bio ? "<h3>Biography</h3><p>" + esc(p.bio) + "</p>" : "") +
      (programme ? "<h3>Programme</h3><ol class=\"modal-lectures\">" + programme + "</ol>" : "") +
      (lectures.length ? "<h3>Lectures</h3><ol class=\"modal-lectures\">" + lectures.map(function (l) {
        var s = session(l.sessionId);
        return "<li><strong>" + lectureLink(l) + "</strong><span>" +
          (s ? '<a href="' + esc(sessionHref(s.id)) + '">' + esc(s.title) + "</a> &middot; " + esc(s.time) : "") + "</span></li>";
      }).join("") + "</ol>" : "");
    showModal(html);
  }

  function openLecture(id) {
    var l = lecture(id);
    if (!l || !hasLecture(l)) return;
    var s = session(l.sessionId);
    var p = person(l.speakerId);
    var html = "<h2>" + esc(l.title) + "</h2>" +
      '<p class="modal-meta">' + (p ? personLink(p.id) + (p.country ? " (" + esc(p.country) + ")" : "") : "") +
      (s ? "<br>" + sessionLink(s) + " &middot; " + esc(s.time) + " &middot; " + esc(s.room) : "") + "</p>" +
      "<h3>Abstract</h3><p>" + esc(l.abstract) + "</p>";
    showModal(html);
  }

  function openFromHash() {
    var h = window.location.hash.slice(1);
    if (h.indexOf("s-") === 0) { openSession(h.slice(2)); return true; }
    if (h.indexOf("p-") === 0) { openPerson(h.slice(2)); return true; }
    if (h.indexOf("l-") === 0) { openLecture(h.slice(2)); return true; }
    if (h.indexOf("e-") === 0) { openEposter(h.slice(2)); return true; }
    return false;
  }

  /* Page content is rendered after the browser has handled the initial
     anchor, so scroll to plain anchors (for example an abstract id) once the
     target exists. */
  function scrollToHashTarget() {
    var h = window.location.hash.slice(1);
    if (!h) return false;
    var target = doc.getElementById(h);
    if (!target) return false;
    window.requestAnimationFrame(function () {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    });
    return true;
  }

  /* Faculty ------------------------------------------------------------ */
  function facultyList(people) {
    return '<div class="faculty-grid">' + people.map(function (p) {
      var inner = "<strong>" + esc(p.name) + "</strong><span>" + esc(p.affiliation) + "</span>";
      if (!hasPerson(p)) return '<div class="fac-card">' + inner + "</div>";
      return '<a class="fac-card" href="#p-' + esc(p.id.replace(/^p-/, "")) + '">' + inner + "</a>";
    }).join("") + "</div>";
  }

  function renderFaculty() {
    var host = doc.getElementById("facultyContent");
    if (!host) return;
    if (!D.people.length) {
      host.innerHTML = '<p class="muted">Faculty will be published here once confirmed.</p>';
      return;
    }
    var intl = D.people.filter(function (p) { return p.role === "International faculty"; }).sort(surnameSort);
    var local = D.people.filter(function (p) { return p.role === "Local faculty"; }).sort(surnameSort);
    var facIds = {};
    D.sessions.forEach(function (s) { s.facilitatorIds.forEach(function (id) { facIds[id] = 1; }); });
    var facs = D.people.filter(function (p) { return facIds[p.id]; }).sort(surnameSort);
    var judges = D.people.filter(function (p) { return p.role === "Judge"; }).sort(surnameSort);
    var oc = D.people.filter(function (p) { return p.role === "Organising Committee"; }).sort(surnameSort);

    function section(id, title, list) {
      return '<h2 class="subheader1" id="' + id + '">' + title + "</h2>" + facultyList(list);
    }

    host.innerHTML = '<p class="lede">Select a name to view the biography and lectures. Lecture titles open the abstract.</p>' +
      '<div class="fac-jump"><a href="#intl">International faculty</a><a href="#local">Local faculty</a><a href="#facilitators">Workshop facilitators</a><a href="#judges">Judges</a><a href="#oc">Organising Committee</a></div>' +
      section("intl", "International Faculty", intl) +
      section("local", "Local Faculty", local) +
      section("facilitators", "Workshop Facilitators", facs) +
      section("judges", "Judges", judges) +
      section("oc", "Organising Committee", oc);
  }

  /* Programme ---------------------------------------------------------- */
  function sessionCell(s) {
    var lectures = s.lectureIds.map(function (id) { return lecture(id); }).filter(Boolean);
    var lectureHtml = lectures.length ? '<ul class="cell-lectures">' + lectures.map(function (l) {
      return "<li>" + lectureLink(l) + "<span>" + personLink(l.speakerId) + "</span></li>";
    }).join("") + "</ul>" : "";
    return '<span class="topic">' + sessionLink(s) + "</span>" +
      (s.moderatorIds.length ? '<span class="room">Moderator: ' + personLinks(s.moderatorIds) + "</span>" : "") +
      (facilitatorIds(s).length ? '<span class="room">Facilitators: ' + personLinks(facilitatorIds(s)) + "</span>" : "") +
      lectureHtml;
  }

  function dayTable(d) {
    var list = D.sessions.filter(function (s) { return s.day === d.id; });
    if (d.id === "day0") {
      return '<div class="table-wrap"><table class="table01"><thead><tr><th>Time</th><th>Workshop</th><th>Moderators</th></tr></thead><tbody>' +
        list.map(function (s) {
          return "<tr><td>" + esc(s.time) + '</td><td><span class="topic">' + sessionLink(s) + "</span></td><td>" + personLinks(s.moderatorIds) + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    }

    var slots = [];
    list.forEach(function (s) {
      var key = s.start + "-" + s.end;
      var slot = slots.filter(function (x) { return x.key === key; })[0];
      if (!slot) { slot = { key: key, start: s.start, end: s.end, time: s.time, items: [] }; slots.push(slot); }
      slot.items.push(s);
    });
    slots.sort(function (a, b) { return String(a.start).localeCompare(String(b.start)); });

    var rooms = [
      { label: "Crystal Court II", match: ["Crystal Court II"] },
      { label: "Crystal Court I", match: ["Crystal Court I"] },
      { label: "Salon 1–2", match: ["Salon 1–2", "Salon 1", "Salon 2"] },
      { label: "Salon 3–4", match: ["Salon 3–4", "Salon 3", "Salon 4"] },
      { label: "Pre-function", match: ["Pre-function area"] }
    ];
    var rows = "";
    slots.forEach(function (slot) {
      var single = slot.items.length === 1;
      if (single) {
        rows += '<tr><td class="time">' + esc(slot.time) + '</td><td colspan="5">' + sessionCell(slot.items[0]) + "</td></tr>";
        return;
      }
      rows += '<tr><td class="time">' + esc(slot.time) + "</td>";
      rooms.forEach(function (room) {
        var s = slot.items.filter(function (x) { return room.match.indexOf(x.room) !== -1; })[0];
        if (s) rows += "<td>" + sessionCell(s) + "</td>";
        else rows += '<td class="none">&mdash;</td>';
      });
      rows += "</tr>";
      if (slot.end === "10:30") rows += '<tr><td class="time">10:30&ndash;11:00</td><td colspan="5" class="break">Break &amp; Healthcare Industry Exhibition</td></tr>';
      if (slot.end === "15:30") rows += '<tr><td class="time">15:30&ndash;16:00</td><td colspan="5" class="break">Break &amp; Healthcare Industry Symposium</td></tr>';
    });

    return '<div class="table-wrap"><table class="program-table"><thead><tr><th>Time</th>' +
      rooms.map(function (r) { return "<th>" + r.label + "</th>"; }).join("") + "</tr></thead><tbody>" + rows + "</tbody></table></div>";
  }

  function renderProgramme() {
    var host = doc.getElementById("programmeContent");
    if (!host) return;
    host.innerHTML =
      '<div class="prog-toolbar"><span>Programme</span><a href="asm2027.ics" download>Add to calendar</a></div>' +
      '<div class="prog-tabs" role="group" aria-label="Choose a programme day">' +
        D.days.map(function (d, i) {
          return '<a class="prog-tab' + (i === 1 ? " is-active" : "") + '" href="#' + esc(d.id) + '" data-day="' + esc(d.id) + '"' +
            (i === 1 ? ' aria-current="true"' : "") + ">" + esc(d.label) + "<small>" + esc(d.title) + "</small></a>";
        }).join("") + "</div>" +
      D.days.map(function (d, i) {
        return '<section class="prog-day' + (i === 1 ? " is-active" : "") + '" id="' + esc(d.id) + '">' +
          '<h2 class="day-head" id="' + esc(d.id) + '-title">' + esc(d.long) + "</h2>" +
          '<p class="venue-line">Venue: ' + esc(d.venue) +
          (d.id === "day0" ? "" : ' &middot; <a href="meeting-information.html#floorplans">Floor plans</a>') + "</p>" +
          dayTable(d) + "</section>";
      }).join("");
  }

  /* Registration ------------------------------------------------------- */
  function renderFees() {
    var info = D.registrationInfo || {};
    var intro = doc.getElementById("registrationIntro");
    if (intro) intro.textContent = info.intro || "";
    var notes = doc.getElementById("registrationFeeNotes");
    if (notes) {
      notes.innerHTML = (info.feeNotes || []).map(function (n) {
        var m = n.match(/^([*#1])\s*(.*)$/);
        return m ? "<sup>" + esc(m[1]) + "</sup> " + esc(m[2]) : esc(n);
      }).join("<br>");
    }
    fillList("registrationIncludes", info.includes);
    var nursingIntro = doc.getElementById("nursingIntro");
    if (nursingIntro) nursingIntro.textContent = info.nursingIntro || "";
    var workshopIntro = doc.getElementById("workshopIntro");
    if (workshopIntro) workshopIntro.textContent = info.workshopIntro || "";
    var workshopFootnote = doc.getElementById("workshopFootnote");
    if (workshopFootnote) workshopFootnote.textContent = info.workshopFootnote || "";
    var dinnerNote = doc.getElementById("dinnerNote");
    if (dinnerNote) dinnerNote.textContent = info.dinnerNote || "";
    var paymentIntro = doc.getElementById("paymentIntro");
    if (paymentIntro) paymentIntro.textContent = (info.payment || {}).intro || "";
    var paymentMethods = doc.getElementById("paymentMethods");
    if (paymentMethods) {
      paymentMethods.innerHTML = ((info.payment || {}).methods || []).map(function (m) {
        var i = m.indexOf(":");
        return i > 0 ? "<li><strong>" + esc(m.slice(0, i + 1)) + "</strong>" + esc(m.slice(i + 1)) + "</li>" : "<li>" + esc(m) + "</li>";
      }).join("");
    }
    var paymentConfirmation = doc.getElementById("paymentConfirmation");
    if (paymentConfirmation) paymentConfirmation.textContent = (info.payment || {}).confirmation || "";
    var cancellationIntro = doc.getElementById("cancellationIntro");
    if (cancellationIntro) cancellationIntro.textContent = (info.cancellation || {}).intro || "";
    var cancellationRows = doc.getElementById("cancellationRows");
    if (cancellationRows) {
      cancellationRows.innerHTML = ((info.cancellation || {}).rows || []).map(function (r) {
        return "<tr><td>" + esc(r.date) + "</td><td>" + esc(r.refund) + "</td></tr>";
      }).join("");
    }
    var cancellationNote = doc.getElementById("cancellationNote");
    if (cancellationNote) cancellationNote.textContent = (info.cancellation || {}).note || "";
    var regButton = doc.getElementById("registrationButton");
    if (regButton) regButton.textContent = "Online registration \u2014 opens " + D.meta.registrationOpen;

    var host = doc.getElementById("feeContent");
    if (host) {
      host.innerHTML = '<div class="table-wrap"><table class="table01"><thead><tr><th>Registration category</th>' +
        "<th>Early-bird<br>(on/before " + esc(D.meta.earlyBirdDeadline) + ")</th><th>Regular<br>(after " + esc(D.meta.earlyBirdDeadline) + ")</th><th>Day rate</th></tr></thead><tbody>" +
        D.fees.symposium.map(function (f) {
          return "<tr><td><strong>" + esc(f.category) + "</strong></td><td class=\"num\">HK$" + esc(f.early) +
            "</td><td class=\"num\">HK$" + esc(f.regular) + "</td><td class=\"num\">" +
            (f.day === "\u2014" ? "&mdash;" : "HK$" + esc(f.day)) + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    }

    var nursing = doc.getElementById("nursingContent");
    if (nursing) {
      nursing.innerHTML = '<div class="table-wrap"><table class="table01" style="max-width:640px"><thead><tr><th>Category</th><th>Fee</th></tr></thead><tbody>' +
        D.fees.nursing.map(function (f) { return "<tr><td>" + esc(f.category) + '</td><td class="num">HK$' + esc(f.fee) + "</td></tr>"; }).join("") +
        "</tbody></table></div>";
    }

    var dinner = doc.getElementById("dinnerContent");
    if (dinner) {
      var t = D.fees.dinner;
      dinner.innerHTML = "<p><strong>Date:</strong> " + esc(t.date) + "<br><strong>Time:</strong> " + esc(t.time) +
        "<br><strong>Venue:</strong> " + esc(t.venue) + "</p>";
    }

    var ws = doc.getElementById("workshopFeeContent");
    if (ws) {
      var list = D.sessions.filter(function (s) { return s.type === "workshop" || s.type === "pre-conference"; });
      var quota = D.fees.workshopQuota || 30;
      ws.innerHTML = '<div class="table-wrap"><table class="table01"><thead><tr><th>Workshop</th><th>Date</th><th>Time</th><th>Quota</th></tr></thead><tbody>' +
        list.map(function (s) {
          var label = hasSession(s)
            ? '<a href="programme.html#s-' + esc(s.id) + '">' + esc(s.title) + "</a>"
            : esc(s.title);
          return "<tr><td>" + label + "</td><td>" +
            esc(day(s.day).long) + "</td><td>" + esc(s.time) + '</td><td class="num">' + esc(String(quota)) + " people</td></tr>";
        }).join("") + "</tbody></table></div>";
    }
  }

  /* Accreditation ------------------------------------------------------ */
  function renderAccreditation() {
    var host = doc.getElementById("accreditationContent");
    if (!host) return;
    var info = D.accreditationInfo || {};
    var intro = doc.getElementById("accreditationIntro");
    if (intro) intro.textContent = info.intro || "";
    if (!D.accreditation.length) {
      host.innerHTML = '<p class="muted">Accreditation details will be published here once confirmed.</p>';
      return;
    }
    host.innerHTML = '<div class="table-wrap"><table class="table01"><thead><tr><th>College / Association</th><th>Whole meeting</th><th>Day 1</th><th>Day 2</th><th>Category</th></tr></thead><tbody>' +
      D.accreditation.map(function (a) {
        return "<tr><td>" + esc(a.body) + '</td><td class="num">' + esc(a.whole) + '</td><td class="num">' + esc(a.day1) +
          '</td><td class="num">' + esc(a.day2) + '</td><td class="note">' + esc(a.category) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  /* Sponsorship -------------------------------------------------------- */
  function sponsorCard(s) {
    var inner = s.logo
      ? '<img src="' + esc(U(s.logo)) + '" alt="' + esc(s.name) + '">'
      : '<span class="sponsor-wordmark">' + esc(s.name) + "</span>";
    var body = "<strong>" + esc(s.name) + "</strong>";
    if (s.logo) body = inner + body;
    if (s.url) return '<a class="sponsor-cat" href="' + esc(s.url) + '" target="_blank" rel="noopener">' + body + "</a>";
    return '<div class="sponsor-cat">' + body + "</div>";
  }

  function renderPackages() {
    var info = D.sponsorshipInfo || {};
    var lede = doc.getElementById("sponsorshipLede");
    if (lede) lede.textContent = info.lede || "";
    var intro = doc.getElementById("sponsorshipIntro");
    if (intro) intro.innerHTML = (info.intro || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    /* The sponsorship package PDF is only published in the data build. */
    var pdf = doc.getElementById("sponsorshipPdf");
    if (pdf) pdf.style.display = "none";
    fillList("sponsorshipWhy", info.whyPartner);
    fillList("sponsorshipExhibitionBullets", info.exhibitionBullets);
    var packagesNote = doc.getElementById("sponsorshipPackagesNote");
    if (packagesNote) packagesNote.textContent = info.packagesNote || "";
    var exhibitionIntro = doc.getElementById("sponsorshipExhibitionIntro");
    if (exhibitionIntro) exhibitionIntro.textContent = info.exhibitionIntro || "";
    var floorplanNote = doc.getElementById("sponsorshipFloorplanNote");
    if (floorplanNote) floorplanNote.textContent = info.floorplanNote || "";
    var enquiries = doc.getElementById("sponsorshipEnquiries");
    if (enquiries) enquiries.textContent = info.enquiries || "";

    var host = doc.getElementById("packagesContent");
    if (host) {
      if (!D.packages || !D.packages.length) {
        host.innerHTML = '<p class="muted">The 2027 sponsorship packages will be published here once confirmed.</p>';
      } else {
        host.innerHTML = '<div class="table-wrap"><table class="table01"><thead><tr><th>Package</th><th>Inclusions</th><th>Investment (HK$)</th></tr></thead><tbody>' +
          D.packages.map(function (p) {
            return "<tr><td><strong>" + esc(p.name) + "</strong></td><td>" + esc(p.includes) + '</td><td class="num">' + esc(p.price) + "</td></tr>";
          }).join("") + "</tbody></table></div>";
      }
    }
  }

  function renderSponsorPage() {
    var host = doc.getElementById("sponsorContent");
    if (!host) return;
    var order = ["Lunch Symposium", "Lecture / Workshop", "Exhibitor"];
    var groups = order.map(function (name) {
      return { name: name, items: D.sponsors.filter(function (s) { return s.category === name; }) };
    }).filter(function (g) { return g.items.length; });

    if (!groups.length) {
      host.innerHTML = '<p class="muted">Sponsors and exhibitors will be listed here once confirmed.</p>';
      return;
    }

    host.innerHTML = groups.map(function (g) {
      if (g.name === "Exhibitor") {
        return '<h2 class="subheader1">Exhibitors</h2>' +
          '<ul class="exhibitor-list">' + g.items.map(function (s) {
            return "<li>" + (s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + "</a>" : esc(s.name)) + "</li>";
          }).join("") + "</ul>";
      }
      return '<h2 class="subheader1">' + esc(g.name) + ' Sponsors</h2>' +
        '<div class="sponsor-cats">' + g.items.map(sponsorCard).join("") + "</div>";
    }).join("");
  }

  /* Contact ------------------------------------------------------------ */
  var ICONS = {
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    user: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/>',
    fax: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01"/>'
  };

  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[name] || "") + "</svg>";
  }

  function renderContact() {
    var host = doc.getElementById("contactContent");
    if (!host) return;
    var c = D.contact;
    host.innerHTML =
      '<div class="contact-grid"><div>' +
        '<div class="contact-card"><h2 class="subheader1" style="margin-top:0">Correspondence</h2><ul class="contact-list">' +
          "<li>" + icon("mail") + "<span><strong>General enquiries</strong><a href=\"mailto:" + esc(c.generalEmail) + "\">" + esc(c.generalEmail) + "</a></span></li>" +
          "<li>" + icon("mail") + "<span><strong>Chairperson</strong><a href=\"mailto:" + esc(c.chairEmail) + "\">" + esc(c.chairEmail) + "</a></span></li>" +
        "</ul></div>" +
        '<div class="contact-card" style="margin-top:18px"><h2 class="subheader1" style="margin-top:0">Meeting Secretariat</h2>' +
          '<ul class="contact-list">' +
          "<li>" + icon("building") + "<span><strong>Details</strong>Secretariat details will be published once confirmed.</span></li>" +
        "</ul></div>" +
        '<div class="contact-card" style="margin-top:18px"><h2 class="subheader1" style="margin-top:0">Chairperson, ASM 2027</h2>' +
          '<ul class="contact-list"><li>' + icon("user") + "<span><strong>Name</strong>" + esc(c.chairName) + "</span></li>" +
          "<li>" + icon("mail") + "<span><strong>Email</strong><a href=\"mailto:" + esc(c.chairEmail) + "\">" + esc(c.chairEmail) + "</a></span></li></ul></div>" +
      "</div>" +
      '<div><div class="venue-photo">' +
        '<iframe src="https://www.google.com/maps/embed?origin=mfe&amp;pb=!1m3!2m1!1sHopewell+Hotel,+15+Kennedy+Road,+Wan+Chai,+Hong+Kong!6i16" title="Google map showing Hopewell Hotel, 15 Kennedy Road, Wan Chai" style="display:block;width:100%;aspect-ratio:800/520;border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>' +
      '</div>' +
        '<div class="card card--soft" style="margin-top:18px"><h3>Before you write</h3><p class="muted" style="font-size:14px">Many questions are answered on the programme and registration pages.</p><ul class="checklist" style="font-size:14px">' +
        '<li><a href="call-for-eposter.html">Call for Submission</a></li><li><a href="registration.html">Registration and workshops</a></li>' +
        '<li><a href="sponsorship-exhibition.html">Sponsorship package</a></li><li><a href="meeting-information.html">Venue and travel</a></li></ul></div></div></div>';
  }

  /* Boot --------------------------------------------------------------- */
  function syncGlobal() {
    var m = D.meta;
    var bannerStrongs = doc.querySelectorAll(".banner-meta > div > strong");
    if (bannerStrongs[0]) bannerStrongs[0].textContent = m.dateLabel;
    if (bannerStrongs[1]) bannerStrongs[1].textContent = m.venueShort;

    var deadlines = doc.querySelectorAll(".counterbar .box1 .deadline");
    if (deadlines[0]) deadlines[0].textContent = m.abstractDeadline;
    if (deadlines[1]) deadlines[1].textContent = m.earlyBirdDeadline;
    var ep = doc.querySelector(".counterbar .btn5 span");
    if (ep) ep.textContent = m.eprogrammeAvailable;

    var homeEp = { programmeEposterDate: m.eposterGalleryDate, abstractEposterDeadline: m.eposterFileDeadline };
    Object.keys(homeEp).forEach(function (id) {
      var node = doc.getElementById(id);
      if (node) node.textContent = homeEp[id];
    });
    var submitBtn = doc.getElementById("abstractSubmitBtn");
    if (submitBtn) submitBtn.textContent = "Online submission \u2014 opens " + m.abstractOpen;

    doc.querySelectorAll(".footer-bottom p").forEach(function (p) {
      if (p.textContent.indexOf("Copyright") !== -1) {
        p.innerHTML = p.innerHTML.replace(/&copy;\s*\d{4}/, "&copy; " + m.year);
      }
    });

    if (doc.body.getAttribute("data-page") === "registration") {
      var lede = doc.querySelector(".page-intro .lede");
      if (lede) lede.textContent = "Registration opens on " + m.registrationOpen + ". The early-bird deadline is " + m.earlyBirdDeadline + ".";
      var notice = doc.querySelector(".page-body .notice--amber p");
      if (notice) notice.innerHTML = "<strong>Registration is not yet open.</strong> Online registration opens on <strong>" +
        esc(m.registrationOpen) + "</strong>; the early-bird deadline is <strong>" + esc(m.earlyBirdDeadline) + "</strong>.";
    }
  }

  var page = doc.body.getAttribute("data-page");
  if (page === "home") { renderWelcome(); }
  if (page === "committees") renderCommittee();
  if (page === "faculty") renderFaculty();
  if (page === "programme") renderProgramme();
  if (page === "registration") renderFees();
  if (page === "accreditation") renderAccreditation();
  if (page === "sponsorship") renderPackages();
  if (page === "sponsors") renderSponsorPage();
  if (page === "contact") renderContact();
  if (page === "abstracts") renderAbstracts();
  if (page === "meeting") renderMeetingInfo();
  if (page === "eposters") renderEposters();
  if (page === "submission") renderSubmission();
  if (page === "call-free") renderCallFree();
  if (page === "call-eposter") renderCallEposter();
  if (page === "call-formal-project") renderCallFormalProject();
  if (page === "formal-project") renderFormalProject();
  syncGlobal();

  if (page === "sponsorship" && window.location.hash) {
    var anchorTarget = doc.getElementById(window.location.hash.slice(1));
    if (anchorTarget) {
      window.requestAnimationFrame(function () {
        anchorTarget.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }
  } else if (!/^#(s-|p-|l-|e-)/.test(window.location.hash)) {
    scrollToHashTarget();
  }

  /* Detail overlays are available everywhere: session and faculty pages
     contain person/session/abstract links too, not just the programme. */
  ensureDialog();
  openFromHash();
  window.addEventListener("hashchange", function () {
    if (!openFromHash()) {
      closeModal();
      if (!/^#(s-|p-|l-|e-)/.test(window.location.hash)) scrollToHashTarget();
    }
  });
})();
