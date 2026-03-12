let filteredApplications = [...applications];
let selectedRowIds = [];
let sortDirection = "asc";
let isLoading = true;

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

  const sortedData = sortApplications(data, sortDirection);

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
            class="menu-btn"
            type="button"
            aria-label="More actions for ${app.vendor}"
          >
            •••
          </button>
        </td>
      </tr>
    `
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
          ${app.tags
            .map((tag) => `<span class="tag-pill">${tag}</span>`)
            .join("")}
        </div>
      </article>
    `
    )
    .join("");

  $("#mobileCards").html(mobileCards);

  $("#resultsCount").text(
    `${sortedData.length} result${sortedData.length === 1 ? "" : "s"}`
  );

  renderBulkActionBar();
}

/* -----------------------------
   Filtering
----------------------------- */

function applyFilters() {
  const searchValue = getSearchValue();
  const { applicationType, selectedStatuses, selectedPaymentStatuses } =
    getFilterValues();

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
    filteredApplications.some((app) => app.id === id)
  );

  renderTable(filteredApplications);
}

/* -----------------------------
   Event bindings
----------------------------- */

$(document).ready(function () {
  renderTable(filteredApplications);
  updateClearButton();

  initSearch(applyFilters);
  initFilters(applyFilters);

  setTimeout(() => {
    isLoading = false;
    renderTable(filteredApplications);
  }, 700);

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

  $(document).on("change", ".status-select", function () {
    const id = Number($(this).data("id"));
    const newStatus = $(this).val();

    const item = applications.find((app) => app.id === id);
    if (item) {
      item.status = newStatus;
      applyFilters();
    }
  });
});
