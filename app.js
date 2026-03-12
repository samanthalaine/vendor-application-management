const applications = [
  {
    id: 1,
    vendor: "Oak & Honey Bakery",
    applicantName: "Emma Sullivan",
    tags: ["Food Vendor", "Bakery", "Local"],
    applicationName: "Spring Artisan Market",
    paymentStatus: "Paid",
    status: "Awaiting decision",
    submitted: "2026-01-18",
  },
  {
    id: 2,
    vendor: "Blue Fern Pottery",
    applicantName: "Marcus Delgado",
    tags: ["Handmade", "Ceramics", "Artisan"],
    applicationName: "Downtown Makers Festival",
    paymentStatus: "Paid",
    status: "Approved",
    submitted: "2026-01-17",
  },
  {
    id: 3,
    vendor: "Evergreen Candle Co.",
    applicantName: "Sophia Chen",
    tags: ["Home Goods", "Handmade", "Eco-Friendly"],
    applicationName: "Holiday Gift Expo",
    paymentStatus: "Paid",
    status: "Waitlisted",
    submitted: "2026-01-16",
  },
  {
    id: 4,
    vendor: "North Market Coffee",
    applicantName: "Daniel Carter",
    tags: ["Food Vendor", "Coffee", "Local"],
    applicationName: "Spring Artisan Market",
    paymentStatus: "Paid",
    status: "Approved",
    submitted: "2026-01-15",
  },
  {
    id: 5,
    vendor: "Golden Meadow Soapworks",
    applicantName: "Hannah Brooks",
    tags: ["Bath & Body", "Handmade", "Organic"],
    applicationName: "Downtown Makers Festival",
    paymentStatus: "Not Paid",
    status: "Rejected",
    submitted: "2026-01-14",
  },
  {
    id: 6,
    vendor: "Riverbend Leather",
    applicantName: "Lucas Ramirez",
    tags: ["Leather Goods", "Handcrafted", "Accessories"],
    applicationName: "Fall Craft Fair",
    paymentStatus: "Paid",
    status: "Awaiting decision",
    submitted: "2026-01-13",
  },
  {
    id: 7,
    vendor: "Bloom & Branch Floral",
    applicantName: "Isabella Torres",
    tags: ["Florals", "Decor", "Local"],
    applicationName: "Spring Garden Festival",
    paymentStatus: "Paid",
    status: "Approved",
    submitted: "2026-01-12",
  },
  {
    id: 8,
    vendor: "Copper Kettle Caramels",
    applicantName: "Nathan Gallagher",
    tags: ["Food Vendor", "Sweets", "Small Batch"],
    applicationName: "Holiday Gift Expo",
    paymentStatus: "Not Paid",
    status: "Awaiting decision",
    submitted: "2026-01-11",
  },
  {
    id: 9,
    vendor: "Willow Lane Textiles",
    applicantName: "Olivia Patel",
    tags: ["Textiles", "Handmade", "Sustainable"],
    applicationName: "Downtown Makers Festival",
    paymentStatus: "Paid",
    status: "Waitlisted",
    submitted: "2026-01-10",
  },
  {
    id: 10,
    vendor: "Maple Street Woodworks",
    applicantName: "Ethan Walker",
    tags: ["Woodworking", "Furniture", "Handcrafted"],
    applicationName: "Fall Craft Fair",
    paymentStatus: "Paid",
    status: "Approved",
    submitted: "2026-01-09",
  },
];

let filteredApplications = [...applications];
let selectedRowIds = [];
let sortDirection = "asc";
let isLoading = true;

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

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function updateClearButton() {
  const hasText = $("#searchInput").val().trim().length > 0;
  $("#clearSearch").toggleClass("hidden", !hasText);
}

function isMobileFilters() {
  return window.innerWidth <= 480;
}

function getStatusClass(status) {
  switch (status) {
    case "Approved":
      return "status-approved";
    case "Waitlisted":
      return "status-waitlisted";
    case "Rejected":
      return "status-rejected";
    default:
      return "status-awaiting";
  }
}

function sortApplications(data) {
  return [...data].sort((a, b) => {
    const nameA = a.vendor.toLowerCase();
    const nameB = b.vendor.toLowerCase();

    if (sortDirection === "asc") {
      return nameA.localeCompare(nameB);
    }

    return nameB.localeCompare(nameA);
  });
}

/* -----------------------------
   Filter panel helpers
----------------------------- */

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
   Bulk action / loading helpers
----------------------------- */

function renderBulkActionBar() {
  const count = selectedRowIds.length;

  $("#selectedCount").text(`${count} selected`);
  $("#bulkActionBar").toggleClass("hidden", count === 0);

  const allVisibleIds = filteredApplications.map((app) => app.id);
  const allVisibleSelected =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((id) => selectedRowIds.includes(id));

  $("#selectAllRows").prop("checked", allVisibleSelected);
}

function renderLoadingState() {
  $("#tableLoadingState").removeClass("hidden");
  $(".desktop-table").addClass("hidden");
  $("#mobileCards").addClass("hidden");
  $(".pagination").addClass("hidden");
}

function hideLoadingState() {
  $("#tableLoadingState").addClass("hidden");
  $(".desktop-table").removeClass("hidden");
  $(".pagination").removeClass("hidden");
  $("#mobileCards").removeClass("hidden");
}

/* -----------------------------
   Rendering
----------------------------- */

function renderEmptyState() {
  hideLoadingState();

  $("#applicationTableBody").html(`
    <tr>
      <td colspan="8">
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
  renderBulkActionBar();
}

function renderTable(data) {
  if (isLoading) {
    renderLoadingState();
    return;
  }

  hideLoadingState();

  if (data.length === 0) {
    renderEmptyState();
    return;
  }

  const sortedData = sortApplications(data);

  const rows = sortedData
    .map(
      (app) => `
      <tr>
        <td class="checkbox-col">
          <input
            type="checkbox"
            class="row-checkbox"
            data-id="${app.id}"
            aria-label="Select ${app.vendor}"
            ${selectedRowIds.includes(app.id) ? "checked" : ""}
          />
        </td>

        <td>
          <div class="business-cell">
            <div class="business-avatar">${getInitials(app.vendor)}</div>
            <div>
              <div class="linkish-text">${app.vendor}</div>
              <div class="secondary-text">${app.applicantName}</div>
            </div>
          </div>
        </td>

        <td>
          <div class="tag-list">
            ${app.tags
              .map((tag) => `<span class="tag-pill">${tag}</span>`)
              .join("")}
          </div>
        </td>

        <td>
          <span class="linkish-text">${app.applicationName}</span>
        </td>

        <td>${app.paymentStatus}</td>

        <td>
          <select
            class="status-select ${getStatusClass(app.status)}"
            data-id="${app.id}"
            aria-label="Update status for ${app.vendor}"
          >
            <option value="Awaiting decision" ${app.status === "Awaiting decision" ? "selected" : ""}>Awaiting decision</option>
            <option value="Approved" ${app.status === "Approved" ? "selected" : ""}>Approved</option>
            <option value="Waitlisted" ${app.status === "Waitlisted" ? "selected" : ""}>Waitlisted</option>
            <option value="Rejected" ${app.status === "Rejected" ? "selected" : ""}>Rejected</option>
          </select>
        </td>

        <td>${formatDate(app.submitted)}</td>

        <td>
          <button
            class="menu-btn view-btn"
            data-id="${app.id}"
            aria-label="View actions for ${app.vendor}"
          >
            •••
          </button>
        </td>
      </tr>
    `,
    )
    .join("");

  $("#applicationTableBody").html(rows);

  const mobileCards = sortedData
    .map(
      (app) => `
      <article class="mobile-card">
        <div class="mobile-card-top">
          <input
            type="checkbox"
            class="row-checkbox"
            data-id="${app.id}"
            aria-label="Select ${app.vendor}"
            ${selectedRowIds.includes(app.id) ? "checked" : ""}
          />
          <h3>${app.vendor}</h3>
        </div>
        <p class="mobile-meta">${app.applicantName}</p>
        <p class="mobile-meta"><strong>Application:</strong> ${app.applicationName}</p>
        <p class="mobile-meta"><strong>Payment:</strong> ${app.paymentStatus}</p>
        <p class="mobile-meta"><strong>Status:</strong> ${app.status}</p>
        <p class="mobile-meta"><strong>Date:</strong> ${formatDate(app.submitted)}</p>
        <div class="tag-list mobile-tag-list">
          ${app.tags.map((tag) => `<span class="tag-pill">${tag}</span>`).join("")}
        </div>
        <div class="row-actions">
          <button class="action-btn view-btn" data-id="${app.id}">View</button>
        </div>
      </article>
    `,
    )
    .join("");

  $("#mobileCards").html(mobileCards);
  $("#resultsCount").text(
    `${sortedData.length} result${sortedData.length === 1 ? "" : "s"}`,
  );
  renderBulkActionBar();
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
      app.applicantName.toLowerCase().includes(searchValue) ||
      app.applicationName.toLowerCase().includes(searchValue) ||
      app.tags.some((tag) => tag.toLowerCase().includes(searchValue));

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(app.status);

    const matchesPaymentStatus =
      selectedPaymentStatuses.length === 0 ||
      selectedPaymentStatuses.includes(app.paymentStatus);

    let matchesApplicationType = true;

    if (applicationType === "reviewed") {
      matchesApplicationType = app.status !== "Awaiting decision";
    } else if (applicationType === "submitted") {
      matchesApplicationType = app.status === "Awaiting decision";
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPaymentStatus &&
      matchesApplicationType
    );
  });

  selectedRowIds = selectedRowIds.filter((id) =>
    filteredApplications.some((app) => app.id === id),
  );

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
    <p><strong>Business:</strong> ${app.vendor}</p>
    <p><strong>Applicant:</strong> ${app.applicantName}</p>
    <p><strong>Application:</strong> ${app.applicationName}</p>
    <p><strong>Tags:</strong> ${app.tags.join(", ")}</p>
    <p><strong>Payment status:</strong> ${app.paymentStatus}</p>
    <p><strong>Status:</strong> ${app.status}</p>
    <p><strong>Submitted:</strong> ${formatDate(app.submitted)}</p>
    <p class="muted-text">This quick-view panel helps organizers review details without leaving the table.</p>
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

  setTimeout(() => {
    isLoading = false;
    renderTable(filteredApplications);
  }, 700);

  $("#searchInput").on("input", function () {
    updateClearButton();
    debouncedApplyFilters();
  });

  $("#clearSearch").on("click", function () {
    $("#searchInput").val("");
    updateClearButton();
    applyFilters();
    $("#searchInput").focus();
  });

  $("#filterToggle").on("click", function () {
    const isExpanded = $(this).attr("aria-expanded") === "true";

    if (isExpanded) {
      closeFilterPanel(false);
    } else {
      openFilterPanel();
    }
  });

  $("#closeFilterPanel").on("click", function () {
    closeFilterPanel();
  });

  $("#applicationType").on("change", function () {
    applyFilters();
  });

  $(document).on("change", ".status-checkbox, .payment-checkbox", function () {
    applyFilters();
  });

  $("#clearFilters").on("click", function () {
    $("#applicationType").val("");
    $(".status-checkbox").prop("checked", false);
    $(".payment-checkbox").prop("checked", false);
    applyFilters();
  });

  $(document).on("mousedown", function (event) {
    const panelIsOpen = !$("#filterPanel").hasClass("hidden");
    const clickedInsidePanel =
      $(event.target).closest("#filterPanel").length > 0;
    const clickedToggle = $(event.target).closest("#filterToggle").length > 0;

    if (panelIsOpen && !clickedInsidePanel && !clickedToggle) {
      closeFilterPanel(false);
    }
  });

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

  $("#sortBusinessBtn").on("click", function () {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
    renderTable(filteredApplications);
  });

  $(document).on("change", ".row-checkbox", function () {
    const id = Number($(this).data("id"));

    if ($(this).is(":checked")) {
      if (!selectedRowIds.includes(id)) {
        selectedRowIds.push(id);
      }
    } else {
      selectedRowIds = selectedRowIds.filter((rowId) => rowId !== id);
    }

    renderBulkActionBar();
  });

  $("#selectAllRows").on("change", function () {
    const visibleIds = filteredApplications.map((app) => app.id);

    if ($(this).is(":checked")) {
      selectedRowIds = [...new Set([...selectedRowIds, ...visibleIds])];
    } else {
      selectedRowIds = selectedRowIds.filter((id) => !visibleIds.includes(id));
    }

    renderTable(filteredApplications);
  });

  $("#bulkClearBtn").on("click", function () {
    selectedRowIds = [];
    renderTable(filteredApplications);
  });

  $("#bulkApproveBtn").on("click", function () {
    applications.forEach((app) => {
      if (selectedRowIds.includes(app.id)) {
        app.status = "Approved";
      }
    });

    applyFilters();
  });

  $(document).on("click", ".view-btn", function () {
    openModal($(this).data("id"));
  });

  $(document).on("change", ".status-select", function () {
    const id = Number($(this).data("id"));
    const newStatus = $(this).val();

    const item = applications.find((app) => app.id === id);
    if (item) {
      item.status = newStatus;
      applyFilters();
    }
  });

  $("#closeModal").on("click", closeModal);

  $("#detailsModal").on("click", function (event) {
    if (event.target.id === "detailsModal") {
      closeModal();
    }
  });

  $(document).on("keydown", function (event) {
    if (event.key === "Escape") {
      closeModal();

      if (!$("#filterPanel").hasClass("hidden")) {
        closeFilterPanel(false);
      }
    }
  });

  $(window).on("resize", function () {
    if ($("#filterPanel").hasClass("hidden")) {
      $("body").css("overflow", "");
    } else if (!isMobileFilters()) {
      $("body").css("overflow", "");
      $("#filterPanel").attr("aria-modal", "false");
    }
  });
});
