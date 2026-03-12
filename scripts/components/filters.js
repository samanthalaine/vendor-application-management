function isMobileFilters() {
  return window.innerWidth <= 480;
}

function closeFilterPanel(returnFocus = true) {
  $("#filterPanel").addClass("hidden");
  $("#filterToggle")
    .attr("aria-expanded", "false")
    .removeClass("is-open");
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
  $("#filterToggle")
    .attr("aria-expanded", "true")
    .addClass("is-open");
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

function getFilterValues() {
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

  return {
    applicationType,
    selectedStatuses,
    selectedPaymentStatuses,
  };
}

function resetFilterControls() {
  $("#applicationType").val("");
  $(".status-checkbox").prop("checked", false);
  $(".payment-checkbox").prop("checked", false);
}

function initFilters(onFilterChange) {
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
    onFilterChange();
  });

  $(document).on("change", ".status-checkbox, .payment-checkbox", function () {
    onFilterChange();
  });

  $("#clearFilters").on("click", function () {
    resetFilterControls();
    onFilterChange();
  });

  $(document).on("mousedown", function (event) {
    const panelIsOpen = !$("#filterPanel").hasClass("hidden");
    const clickedInsidePanel = $(event.target).closest("#filterPanel").length > 0;
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

  $(window).on("resize", function () {
    if ($("#filterPanel").hasClass("hidden")) {
      $("body").css("overflow", "");
    } else if (!isMobileFilters()) {
      $("body").css("overflow", "");
      $("#filterPanel").attr("aria-modal", "false");
    }
  });
}
