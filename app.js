let filteredApplications = [...applications];
let selectedRowIds = [];
let sortDirection = "asc";
let isLoading = true;

function renderCurrentTable() {
  renderTable({
    data: filteredApplications,
    selectedRowIds,
    filteredApplications,
    sortDirection,
    isLoading,
  });
}

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
    filteredApplications.some((app) => app.id === id),
  );

  renderCurrentTable();
}

$(document).ready(function () {
  renderCurrentTable();
  updateClearButton();

  initSearch(applyFilters);
  initFilters(applyFilters);

  setTimeout(() => {
    isLoading = false;
    renderCurrentTable();
  }, 700);

  $("#sortBusinessBtn").on("click", function () {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
    renderCurrentTable();
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

    renderCurrentTable();
  });

  $("#selectAllRows").on("change", function () {
    const visibleIds = filteredApplications.map((app) => app.id);

    if ($(this).is(":checked")) {
      selectedRowIds = [...new Set([...selectedRowIds, ...visibleIds])];
    } else {
      selectedRowIds = selectedRowIds.filter(
        (id) => !visibleIds.includes(id),
      );
    }

    renderCurrentTable();
  });

  $("#bulkClearBtn").on("click", function () {
    selectedRowIds = [];
    renderCurrentTable();
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
