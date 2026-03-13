function renderBulkActionBar(selectedRowIds, filteredApplications) {
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

function renderEmptyState(selectedRowIds, filteredApplications) {
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
  renderBulkActionBar(selectedRowIds, filteredApplications);
}

function renderTable({
  data,
  selectedRowIds,
  filteredApplications,
  sortDirection,
  isLoading,
}) {
  if (isLoading) {
    renderLoadingState();
    return;
  }

  hideLoadingState();

  if (data.length === 0) {
    renderEmptyState(selectedRowIds, filteredApplications);
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

  renderBulkActionBar(selectedRowIds, filteredApplications);
}
