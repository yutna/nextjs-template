# E2E Test Scenarios

Source: `docs/tasks/data-grid/00-specifications.md`

## Reference host route and selector contract

- Validation examples use the reference host resource `operations`.
- Reference list route: `/[locale]/(private)/operations`
- Reference detail route: `/[locale]/(private)/operations/[id]`
- Host implementations should substitute the real module prefix while keeping the
  selector grammar `<module>-<component>-<element>`.

## Feature: Grid query lifecycle

### Scenario: Load the first page from resolved route state

- **Priority:** `@must`
- **Route:** `/[locale]/(private)/operations?page=1&pageSize=25&sort=createdAt.desc&density=compact`
- **Preconditions:** Seeded operations dataset with at least 25 rows
- **Steps:**
  1. Navigate to the route for locale `en`.
  2. Assert `[data-testid="operations-data-grid-table"]` is visible.
  3. Assert `[data-testid="operations-data-grid-row-1"]` is visible.
  4. Repeat the scenario for locale `th`.
- **Assertions:**
  - [ ] `[data-testid="operations-data-grid-table"]` renders rows for the requested page
  - [ ] `[data-testid="operations-data-grid-density"]` reflects compact density
  - [ ] `[data-testid="operations-data-grid-pagination-current"]` shows page `1`
- **Locale coverage:** `en`, `th`

### Scenario: Show an empty state when no rows match

- **Priority:** `@must`
- **Route:** `/[locale]/(private)/operations?search=no-matching-record`
- **Preconditions:** No record matches the search term
- **Steps:**
  1. Navigate to the route for locale `en`.
  2. Assert `[data-testid="operations-data-grid-empty"]` is visible.
  3. Repeat the scenario for locale `th`.
- **Assertions:**
  - [ ] `[data-testid="operations-data-grid-empty"]` is visible
  - [ ] `[data-testid="operations-data-grid-row-1"]` is not visible
- **Locale coverage:** `en`, `th`

### Scenario: Retry after a failed page load

- **Priority:** `@must`
- **Route:** `/[locale]/(private)/operations`
- **Preconditions:** The first data request is forced to fail once
- **Steps:**
  1. Navigate to the route for locale `en`.
  2. Click `[data-testid="operations-data-grid-retry"]`.
  3. Repeat the scenario for locale `th`.
- **Assertions:**
  - [ ] `[data-testid="operations-data-grid-error"]` appears before retry
  - [ ] `[data-testid="operations-data-grid-table"]` appears after retry succeeds
- **Locale coverage:** `en`, `th`

### Scenario: Refresh the dataset when sort, filter, search, view, or density changes

- **Priority:** `@must`
- **Route:** `/[locale]/(private)/operations`
- **Preconditions:** Seeded operations dataset and at least one saved view
- **Steps:**
  1. Navigate to the route for locale `en`.
  2. Fill `[data-testid="operations-data-grid-global-search"]` with `urgent`.
  3. Click `[data-testid="operations-data-grid-sort-created-at"]`.
  4. Select `[data-testid="operations-data-grid-view-select"]` option `audit`.
  5. Repeat the scenario for locale `th`.
- **Assertions:**
  - [ ] The URL query updates for search, sort, and view
  - [ ] `[data-testid="operations-data-grid-loading"]` appears during refresh
  - [ ] `[data-testid="operations-data-grid-table"]` shows updated rows
- **Locale coverage:** `en`, `th`

### Scenario: Append more rows during infinite scroll

- **Priority:** `@could`
- **Route:** `/[locale]/(private)/operations?mode=infinite`
- **Preconditions:** Infinite-scroll mode is enabled and more rows exist
- **Steps:**
  1. Navigate to the route for locale `en`.
  2. Scroll until `[data-testid="operations-data-grid-load-more-sentinel"]` intersects.
- **Assertions:**
  - [ ] `[data-testid="operations-data-grid-row-51"]` appears after append
- **Locale coverage:** optional

## Feature: Grid view customization and persistence

### Scenario: Save a named view

- **Priority:** `@should`
- **Route:** `/[locale]/(private)/operations`
- **Preconditions:** The user can save named views
- **Steps:**
  1. Navigate to locale `en`.
  2. Click `[data-testid="operations-data-grid-column-visibility-toggle"]`.
  3. Drag `[data-testid="operations-data-grid-column-resize-handle-status"]`.
  4. Click `[data-testid="operations-data-grid-save-view"]`.
  5. Fill `[data-testid="operations-data-grid-view-name"]` with `My compact view`.
  6. Submit `[data-testid="operations-data-grid-save-view-submit"]`.
- **Assertions:**
  - [ ] `[data-testid="operations-data-grid-view-dirty"]` appears before save
  - [ ] `[data-testid="operations-data-grid-view-select"]` includes `My compact view`
- **Locale coverage:** `en`

### Scenario: Reset to the default view

- **Priority:** `@should`
- **Route:** `/[locale]/(private)/operations`
- **Preconditions:** The current grid view is dirty
- **Steps:**
  1. Navigate to locale `en`.
  2. Click `[data-testid="operations-data-grid-reset-view"]`.
- **Assertions:**
  - [ ] `[data-testid="operations-data-grid-view-dirty"]` is not visible
  - [ ] Default column visibility is restored
- **Locale coverage:** `en`

## Feature: Detail and editing lifecycle

### Scenario: Open canonical row detail from the list

- **Priority:** `@should`
- **Route:** `/[locale]/(private)/operations`
- **Preconditions:** At least one row is visible
- **Steps:**
  1. Navigate to locale `en`.
  2. Click `[data-testid="operations-data-grid-row-open-1"]`.
- **Assertions:**
  - [ ] The app navigates to `/en/operations/1` or the host-equivalent detail route
  - [ ] `[data-testid="operations-detail-page"]` is visible
- **Locale coverage:** `en`

### Scenario: Show validation errors during row editing

- **Priority:** `@should`
- **Route:** `/[locale]/(private)/operations/1`
- **Preconditions:** Row editing is enabled
- **Steps:**
  1. Navigate to locale `en`.
  2. Click `[data-testid="operations-detail-edit"]`.
  3. Clear `[data-testid="operations-edit-required-field"]`.
  4. Submit `[data-testid="operations-edit-submit"]`.
- **Assertions:**
  - [ ] `[data-testid="operations-edit-validation-summary"]` is visible
  - [ ] `[data-testid="operations-edit-form"]` remains visible
- **Locale coverage:** `en`

## Feature: Export lifecycle

### Scenario: Complete a synchronous CSV export

- **Priority:** `@should`
- **Route:** `/[locale]/(private)/operations`
- **Preconditions:** The filtered dataset is within synchronous export limits
- **Steps:**
  1. Navigate to locale `en`.
  2. Click `[data-testid="operations-data-grid-export-csv"]`.
- **Assertions:**
  - [ ] The CSV download starts
  - [ ] `[data-testid="operations-data-grid-export-status"]` reports completion
- **Locale coverage:** `en`

### Scenario: Queue a large export job

- **Priority:** `@should`
- **Route:** `/[locale]/(private)/operations`
- **Preconditions:** The dataset exceeds synchronous export limits
- **Steps:**
  1. Navigate to locale `en`.
  2. Click `[data-testid="operations-data-grid-export-xlsx"]` or `[data-testid="operations-data-grid-export-pdf"]`.
- **Assertions:**
  - [ ] `[data-testid="operations-data-grid-export-status"]` reports queued state
  - [ ] A job identifier or status link is visible
- **Locale coverage:** `en`
