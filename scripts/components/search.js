function updateClearButton() {
  const hasText = $("#searchInput").val().trim().length > 0;
  $("#clearSearch").toggleClass("hidden", !hasText);
}

function getSearchValue() {
  return $("#searchInput").val().trim().toLowerCase();
}

function initSearch(onSearchChange) {
  const debouncedSearch = debounce(function () {
    onSearchChange();
  }, 250);

  $("#searchInput").on("input", function () {
    updateClearButton();
    debouncedSearch();
  });

  $("#clearSearch").on("click", function () {
    $("#searchInput").val("");
    updateClearButton();
    onSearchChange();
    $("#searchInput").focus();
  });
}
