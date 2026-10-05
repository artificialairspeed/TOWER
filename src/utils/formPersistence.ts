/**
 * Form Persistence
 *
 * Persists the user's in-progress deployment form to the browser so that
 * entered data survives a full page refresh (and browser restart). Rehydration
 * is fail-safe: any corrupt, unparseable, or schema-mismatched stored value is
 * discarded in favour of a fresh default form rather than crashing the app.
 *
 * Only the actual form field data is persisted — transient UI state (validation
 * errors, dialog open state) is intentionally excluded.
 *
 * `Date` fields (startDateTime / endDateTime) do not survive a JSON
 * stringify/parse round-trip as `Date` instances, so they are explicitly
 * reconstructed on load.
 */

import type { DeploymentFormData } from '../types/models';

/** localStorage key under which the form payload is stored. */
const STORAGE_KEY = 'tower:deployment-form';

/**
 * Schema version for the persisted payload. Bump this whenever the shape of
 * DeploymentFormData changes in a backwards-incompatible way; older payloads
 * are then discarded on load instead of being rehydrated into a stale shape.
 *
 * Version 2 holds a single form (`form`). Earlier versions stored an array of
 * forms and are discarded on load.
 */
const STORAGE_VERSION = 2;

interface PersistedPayload {
  version: number;
  form: DeploymentFormData;
}

/**
 * Guards access to localStorage. It can throw or be absent (private browsing,
 * disabled storage, non-browser environments), so every access is defensive.
 */
function isStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage != null;
  } catch {
    return false;
  }
}

/**
 * Persist the current form. Best-effort: a failure (e.g. QuotaExceededError,
 * serialization error, or disabled storage) is swallowed with a warning so
 * persistence never breaks the editing experience.
 */
export function saveForm(form: DeploymentFormData): void {
  if (!isStorageAvailable()) return;

  try {
    const payload: PersistedPayload = { version: STORAGE_VERSION, form };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to persist deployment form:', error);
  }
}

/**
 * Remove any persisted form. Used when the user clears/starts a new form so a
 * subsequent refresh does not restore the discarded data.
 */
export function clearForm(): void {
  if (!isStorageAvailable()) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear persisted deployment form:', error);
  }
}

/**
 * Load the previously persisted form, or `null` when there is nothing valid to
 * restore. Any corrupt or incompatible payload is discarded (and the stored
 * value removed) so the caller falls back to a fresh default form.
 */
export function loadForm(): DeploymentFormData | null {
  if (!isStorageAvailable()) return null;

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to read persisted deployment form:', error);
    return null;
  }

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedPayload> | null;

    // Reject anything that isn't the expected versioned shape (this also
    // discards legacy multi-form payloads from earlier versions).
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.version !== STORAGE_VERSION) {
      clearForm();
      return null;
    }

    const revived = reviveForm(parsed.form);

    // If the form fails revival, treat the payload as corrupt rather than
    // silently restoring broken data.
    if (revived === null) {
      clearForm();
      return null;
    }

    return revived;
  } catch (error) {
    console.warn('Failed to parse persisted deployment form; discarding:', error);
    clearForm();
    return null;
  }
}

/**
 * Reconstruct a persisted form, reviving its Date fields. Returns `null` when
 * the entry is not a usable form, signalling corruption to the caller.
 *
 * Every field the UI dereferences without a guard is checked here, because a
 * payload that rehydrates with (say) `changeItems: undefined` throws during
 * render and the bad value is re-read on every reload — a blank page with no
 * way out. Fields the UI already treats as optional (`application`,
 * `environment`) are not checked.
 */
function reviveForm(raw: unknown): DeploymentFormData | null {
  if (!raw || typeof raw !== 'object') return null;

  const form = raw as Record<string, unknown>;

  if (typeof form.formId !== 'string') return null;
  if (typeof form.changeNumber !== 'string') return null;
  if (typeof form.releaseVersion !== 'string') return null;
  if (typeof form.contactName !== 'string') return null;
  if (typeof form.contactEmail !== 'string') return null;
  if (typeof form.contactPhone !== 'string') return null;
  if (typeof form.hasOutage !== 'boolean') return null;
  if (!isValidChangeItemList(form.changeItems)) return null;

  const startDateTime = reviveDate(form.startDateTime);
  const endDateTime = reviveDate(form.endDateTime);
  if (!startDateTime || !endDateTime) return null;

  // Spread the stored fields, then overwrite the two date fields with genuine
  // Date instances (JSON restores them as ISO strings).
  return {
    ...(form as unknown as DeploymentFormData),
    startDateTime,
    endDateTime,
  };
}

/**
 * Verify a stored value is a list of change items the UI can render: each item
 * needs the three strings the rows bind to and an array of impact items whose
 * entries carry an id and text.
 */
function isValidChangeItemList(value: unknown): boolean {
  if (!Array.isArray(value)) return false;

  return value.every((item) => {
    if (!item || typeof item !== 'object') return false;

    const changeItem = item as Record<string, unknown>;
    if (typeof changeItem.id !== 'string') return false;
    if (typeof changeItem.jiraNumber !== 'string') return false;
    if (typeof changeItem.description !== 'string') return false;
    if (!Array.isArray(changeItem.impactItems)) return false;

    return changeItem.impactItems.every((impact) => {
      if (!impact || typeof impact !== 'object') return false;

      const impactItem = impact as Record<string, unknown>;
      return typeof impactItem.id === 'string' && typeof impactItem.text === 'string';
    });
  });
}

/**
 * Convert a stored value (ISO string from JSON, or an actual Date) into a valid
 * Date, or `null` if it cannot be parsed into one.
 */
function reviveDate(value: unknown): Date | null {
  if (typeof value !== 'string' && !(value instanceof Date)) return null;

  const date = new Date(value as string | Date);
  return Number.isNaN(date.getTime()) ? null : date;
}
