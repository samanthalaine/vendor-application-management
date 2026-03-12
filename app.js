const applications = [
  {
    id: 1,
    vendor: "Oak & Honey Bakery",
    email: "hello@oakhoney.com",
    event: "Spring Market",
    category: "Food",
    status: "Awaiting",
    paymentStatus: "Paid",
    submitted: "2026-02-03",
  },
  {
    id: 2,
    vendor: "Blue Fern Studio",
    email: "team@bluefern.com",
    event: "Summer Festival",
    category: "Art",
    status: "Approved",
    paymentStatus: "Paid",
    submitted: "2026-02-02",
  },
  {
    id: 3,
    vendor: "North Market Goods",
    email: "sales@northmarket.com",
    event: "Holiday Expo",
    category: "Retail",
    status: "Waitlisted",
    paymentStatus: "Not paid",
    submitted: "2026-01-28",
  },
  {
    id: 4,
    vendor: "Spark Event Services",
    email: "contact@sparkevents.com",
    event: "Spring Market",
    category: "Services",
    status: "Rejected",
    paymentStatus: "Not paid",
    submitted: "2026-01-25",
  },
  {
    id: 5,
    vendor: "Golden Skillet",
    email: "info@goldenskillet.com",
    event: "Summer Festival",
    category: "Food",
    status: "Approved",
    paymentStatus: "Paid",
    submitted: "2026-02-01",
  },
  {
    id: 6,
    vendor: "Fern & Thread",
    email: "hi@fernthread.com",
    event: "Holiday Expo",
    category: "Retail",
    status: "Withdrawn",
    paymentStatus: "Not paid",
    submitted: "2026-01-20",
  },
];

let filteredApplications = [...applications];

/* -----------------------------
   Helpers
----------------------------- */

function debounce(fn, delay = 300) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function updateClearButton() {
  const hasText = $("#searchInput").val().trim().length > 0;
  $("#clearSearch").toggleClass("hidden", !hasText);
}

function isMobileFilters() {
  return window.innerWidth <= 480;
}

function closeFilterPanel(returnFocus = true) {
  $("#filterPanel").addClass("hidden");
  $("#filterToggle").attr("aria-expanded", "false").removeClass("is-open");
  $("#filterChevron").text("⌄");

  if (isMobileFilters()) {
    $("body").css("overflow", "");
    $("#filterPanel").attr("aria-modal", "false");
  }

  if (returnFocus) {
    $("#filterToggle").focus();
  }
}

function openFilterPanel() {
  $("#filterPanel").removeClass("hidden");
  $("#filterToggle").attr("aria-expanded", "true").addClass("is-open");
  $("#filterChevron").text("⌃");

  if (isMobileFilters()) {
    $("body").css("overflow", "hidden");
    $("#filterPanel").attr("aria-modal", "true");
  }

  const firstFocusable = $("#filterPanel")
    .find('select, input[type="checkbox"], button')
    .filter(":visible")
    .first();

  if (firstFocusable.length) {
    firstFocusable.focus();
  } else {
    $(".filter-panel-inner").focus();
  }
}

/* -----------------------------
   Rendering
----------------------------- */

function renderEmptyState() {
  $("#applicationTableBody").html(`
    <tr>
      <td colspan="6">
        <div class="empty-state">
          <strong>No applications found</strong>
          <p class="muted-text">Try adjusting your search or filters.</p>
        </div>
      </td>
    </tr>
  `);

  $("#mobileCards").html(`
    <div class="mobile-card empty-state-card">
      <strong>No applications found</strong>
      <p class="muted-text">Try adjusting your search or filters.</p>
    </div>
  `);

  $("#resultsCount").text("0 results");
}

function renderTable(data) {
  if (data.length === 0) {
    renderEmptyState();
    return;
  }

  const rows = data
    .map(
      (app) => `
      <tr>
        <td>
          <strong>${app.vendor}</strong><br />
          <span class="muted-text">${app.email}</span>
        </td>
        <td>${app.event}</td>
        <td>${app.category}</td>
        <td><span class="badge ${app.status}">${app.status}</span></td>
        <td>${formatDate(app.submitted)}</td>
        <td>
          <div class="row-actions">
            <button class="action-btn view-btn" data-id="${app.id}">View</button>
            <button class="action-btn approve-btn" data-id="${app.id}">Approve</button>
          </div>
        </td>
      </tr>
    `,
    )
    .join("");

  $("#applicationTableBody").html(rows);

  const mobileCards = data
    .map(
      (app) => `
      <article class="mobile-card">
        <h3>${app.vendor}</h3>
        <p class="mobile-meta">${app.email}</p>
        <p class="mobile-meta"><strong>Event:</strong> ${app.event}</p>
        <p class="mobile-meta"><strong>Category:</strong> ${app.category}</p>
        <p class="mobile-meta"><strong>Status:</strong> <span class="badge ${app.status}">${app.status}</span></p>
        <p class="mobile-meta"><strong>Payment:</strong> ${app.paymentStatus}</p>
        <p class="mobile-meta"><strong>Submitted:</strong> ${formatDate(app.submitted)}</p>
        <div class="row-actions">
          <button class="action-btn view-btn" data-id="${app.id}">View</button>
          <button class="action-btn approve-btn" data-id="${app.id}">Approve</button>
        </div>
      </article>
    `,
    )
    .join("");

  $("#mobileCards").html(mobileCards);
  $("#resultsCount").text(
    `${data.length} result${data.length === 1 ? "" : "s"}`,
  );
}

/* -----------------------------
   Filtering
----------------------------- */

function applyFilters() {
  const searchValue = $("#searchInput").val().trim().toLowerCase();
  const applicationType = $("#applicationType").val();

  const selectedStatuses = $(".status-checkbox:checked")
    .map(function () {
      return $(this).val();
    })
    .get();

  const selectedPaymentStatuses = $(".payment-checkbox:checked")
    .map(function () {
      return $(this).val();
    })
    .get();

  filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.vendor.toLowerCase().includes(searchValue) ||
      app.email.toLowerCase().includes(searchValue) ||
      app.event.toLowerCase().includes(searchValue) ||
      app.category.toLowerCase().includes(searchValue);

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(app.status);

    const matchesPaymentStatus =
      selectedPaymentStatuses.length === 0 ||
      selectedPaymentStatuses.includes(app.paymentStatus);

    let matchesApplicationType = true;

    if (applicationType === "reviewed") {
      matchesApplicationType = app.status !== "Awaiting";
    } else if (applicationType === "submitted") {
      matchesApplicationType = app.status === "Awaiting";
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPaymentStatus &&
      matchesApplicationType
    );
  });

  renderTable(filteredApplications);
}

const debouncedApplyFilters = debounce(function () {
  applyFilters();
}, 250);

/* -----------------------------
   Modal
----------------------------- */

function openModal(appId) {
  const app = applications.find((item) => item.id === Number(appId));
  if (!app) return;

  $("#modalBody").html(`
    <p><strong>Vendor:</strong> ${app.vendor}</p>
    <p><strong>Email:</strong> ${app.email}</p>
    <p><strong>Event:</strong> ${app.event}</p>
    <p><strong>Category:</strong> ${app.category}</p>
    <p><strong>Status:</strong> ${app.status}</p>
    <p><strong>Payment status:</strong> ${app.paymentStatus}</p>
    <p><strong>Submitted:</strong> ${formatDate(app.submitted)}</p>
    <p class="muted-text">This quick-view panel helps organizers review details without losing table context.</p>
  `);

  $("#detailsModal").removeClass("hidden");
  $("#closeModal").focus();
}

function closeModal() {
  $("#detailsModal").addClass("hidden");
}

/* -----------------------------
   Event bindings
----------------------------- */

$(document).ready(function () {
  renderTable(filteredApplications);
  updateClearButton();

  // Search input: update clear button + debounce filtering
  $("#searchInput").on("input", function () {
    updateClearButton();
    debouncedApplyFilters();
  });

  // Clear search input
  $("#clearSearch").on("click", function () {
    $("#searchInput").val("");
    updateClearButton();
    applyFilters();
    $("#searchInput").focus();
  });

  // Filter toggle
  $("#filterToggle").on("click", function () {
    const isExpanded = $(this).attr("aria-expanded") === "true";

    if (isExpanded) {
      closeFilterPanel(false);
    } else {
      openFilterPanel();
    }
  });

  // Mobile close button
  $("#closeFilterPanel").on("click", function () {
    closeFilterPanel();
  });

  // Auto-apply filters
  $("#applicationType").on("change", function () {
    applyFilters();
  });

  $(document).on("change", ".status-checkbox, .payment-checkbox", function () {
    applyFilters();
  });

  // Click outside filter panel to dismiss
  $(document).on("mousedown", function (event) {
    const panelIsOpen = !$("#filterPanel").hasClass("hidden");
    const clickedInsidePanel =
      $(event.target).closest("#filterPanel").length > 0;
    const clickedToggle = $(event.target).closest("#filterToggle").length > 0;

    if (panelIsOpen && !clickedInsidePanel && !clickedToggle) {
      closeFilterPanel(false);
    }
  });

  // Keyboard support inside filter panel
  $("#filterPanel").on("keydown", function (event) {
    if (event.key === "Escape") {
      closeFilterPanel();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = $("#filterPanel")
      .find('select, input[type="checkbox"], button')
      .filter(":visible");

    if (!focusable.length) return;

    const first = focusable.first()[0];
    const last = focusable.last()[0];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Modal open
  $(document).on("click", ".view-btn", function () {
    openModal($(this).data("id"));
  });

  // Approve button
  $(document).on("click", ".approve-btn", function () {
    const id = Number($(this).data("id"));
    const item = applications.find((app) => app.id === id);

    if (item) {
      item.status = "Approved";
      applyFilters();
    }
  });

  // Close modal button
  $("#closeModal").on("click", closeModal);

  // Close modal by clicking overlay
  $("#detailsModal").on("click", function (event) {
    if (event.target.id === "detailsModal") {
      closeModal();
    }
  });

  // Global Escape handling
  $(document).on("keydown", function (event) {
    if (event.key === "Escape") {
      closeModal();

      if (!$("#filterPanel").hasClass("hidden")) {
        closeFilterPanel(false);
      }
    }
  });

  // Reset body overflow if window is resized while filters are open
  $(window).on("resize", function () {
    if ($("#filterPanel").hasClass("hidden")) {
      $("body").css("overflow", "");
    } else if (!isMobileFilters()) {
      $("body").css("overflow", "");
      $("#filterPanel").attr("aria-modal", "false");
    }
  });
});
