/**
 * useFormManager Hook
 *
 * Manages the lifecycle of the single deployment form instance:
 * - Updating form data
 * - Clearing the form back to defaults (requires confirmation from caller)
 *
 * The application supports exactly one deployment form.
 */

import { useState, useCallback, useEffect } from 'react';
import type { DeploymentFormData } from '../types/models';
import { createDefaultForm } from '../data/formFactory';
import { loadForm, saveForm, clearForm as clearPersistedForm } from '../utils/formPersistence';

/**
 * How long to wait after the last edit before writing the form to storage.
 * Long enough to coalesce a burst of keystrokes, so typing does not stall on a
 * synchronous serialize of the whole form. A debounced write on its own would
 * lose an edit made inside this window if the page went away, so the
 * persistence effect also flushes synchronously on page teardown.
 */
const PERSIST_DEBOUNCE_MS = 400;

/**
 * Return type for useFormManager hook
 */
export interface FormManagerState {
  /** The single deployment form */
  form: DeploymentFormData;

  /** Update the form with partial updates */
  updateForm: (updates: Partial<DeploymentFormData>) => void;

  /**
   * Clear the form and start fresh with a single empty form. Also clears the
   * persisted copy so the cleared state survives a refresh. Confirmation should
   * be handled by the caller.
   */
  clearForm: () => void;
}

/**
 * Options for configuring the form manager hook.
 */
export interface UseFormManagerOptions {
  /**
   * Whether to persist the form to browser storage and rehydrate it on load so
   * data survives a page refresh. Defaults to `true`.
   */
  persist?: boolean;
}

/**
 * Custom hook for managing the deployment form instance.
 *
 * Initial state: the persisted form from a previous session if available,
 * otherwise a fresh default form.
 *
 * When persistence is enabled, the current form is written to browser storage
 * shortly after each change — and synchronously on page teardown — so a page
 * refresh restores exactly what the user had entered.
 *
 * @returns FormManagerState with the form and control methods
 */
export function useFormManager(options: UseFormManagerOptions = {}): FormManagerState {
  const { persist = true } = options;

  // Initialize from persisted storage when available, otherwise a fresh default
  // form. Rehydration is fail-safe: a corrupt payload yields null and we fall
  // back to the default.
  const [form, setForm] = useState<DeploymentFormData>(() => {
    if (persist) {
      const restored = loadForm();
      if (restored) return restored;
    }
    return createDefaultForm();
  });

  // Persist the current form whenever it changes so entered data survives a
  // page refresh. Best-effort — see formPersistence for failure handling.
  //
  // The write is debounced because `form` is replaced on every keystroke and
  // localStorage.setItem is synchronous: serializing the whole form (including
  // every change item and impact item) on each character is a visible typing
  // stall on a large form. The pending timer is cleared on unmount and before
  // each re-run, so a cleared form can never be resurrected by a stale write —
  // clearForm removes the key and then sets a fresh form, which schedules its
  // own write.
  //
  // Teardown flushes the pending write synchronously so an edit made inside the
  // debounce window is not lost to a refresh, a tab close, or (on mobile) the
  // app being backgrounded. `pagehide` covers all three, unlike `beforeunload`;
  // a hidden `visibilitychange` is the backstop for the cases where `pagehide`
  // does not fire. The effect re-runs on every `form` change, so the handler
  // always closes over the current value, and the timer is cleared before the
  // flush so the write does not happen twice.
  useEffect(() => {
    if (!persist) return;

    const timer = setTimeout(() => saveForm(form), PERSIST_DEBOUNCE_MS);

    const flush = () => {
      clearTimeout(timer);
      saveForm(form);
    };
    const flushIfHidden = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flushIfHidden);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', flushIfHidden);
    };
  }, [form, persist]);

  /**
   * Update the deployment form with partial updates, preserving all other
   * fields.
   */
  const updateForm = useCallback((updates: Partial<DeploymentFormData>) => {
    setForm((current) => ({ ...current, ...updates }));
  }, []);

  /**
   * Clear the form and start fresh with a single empty form.
   *
   * Discards the persisted copy first so the cleared state is authoritative,
   * then replaces the form with a new default. The persistence effect re-saves
   * this fresh form, so a subsequent refresh restores the empty form rather
   * than the cleared data.
   *
   * Note: Confirmation should be handled by the caller before invoking this.
   */
  const clearForm = useCallback(() => {
    if (persist) {
      clearPersistedForm();
    }
    setForm(createDefaultForm());
  }, [persist]);

  return {
    form,
    updateForm,
    clearForm,
  };
}
