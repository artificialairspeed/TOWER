/**
 * TemplateProvider class for loading and caching the single Flight Plan HTML template.
 * Requirements: 8.2, 9.1, 9.2, 9.3, 9.4, 10.2
 */

const TEMPLATE_PATH = '/templates/flight-plan.html';

class TemplateProvider {
  private template: string | null = null;
  private loadingPromise: Promise<void> | null = null;

  /**
   * Initialize the template provider by loading the single template.
   * This should be called early in the application lifecycle.
   *
   * @returns Promise that resolves when the template is loaded
   */
  async initialize(): Promise<void> {
    if (this.template !== null) {
      return; // Already loaded (Req 9.4)
    }

    if (this.loadingPromise) {
      return this.loadingPromise; // Loading in progress
    }

    // On failure, reset the cached loadingPromise to null so a subsequent
    // initialize() call starts a fresh attempt without requiring a full
    // page reload. A successful load leaves the template cached, making
    // subsequent initialize() calls a no-op. (Req 9.3)
    this.loadingPromise = this.loadTemplate().catch((err) => {
      this.loadingPromise = null;
      throw err;
    });
    return this.loadingPromise;
  }

  /**
   * Get the Flight Plan HTML template.
   * The template must be initialized before calling this method.
   *
   * @returns The HTML template string
   * @throws Error if the template hasn't been loaded
   */
  getTemplate(): string {
    if (this.template === null) {
      throw new Error('Template not loaded. Call initialize() first.');
    }

    return this.template;
  }

  /**
   * Check if the template is loaded.
   *
   * @returns true if the template is loaded, false otherwise
   */
  isLoaded(): boolean {
    return this.template !== null;
  }

  /**
   * Load the Flight Plan HTML template from the public/templates directory
   * and cache it in memory.
   */
  private async loadTemplate(): Promise<void> {
    this.template = await this.loadTemplateAsync(TEMPLATE_PATH);
  }

  /**
   * Asynchronously load a template file using fetch.
   * The request is aborted if it does not complete within 5 seconds, and a
   * timeout error identifying the template path is thrown.
   *
   * @param path - The path to the template file
   * @returns Promise with the template content as a string
   * @throws Error on timeout (>5s), non-2xx response, or network failure
   */
  private async loadTemplateAsync(path: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(path, { signal: controller.signal });

      if (!response.ok) {
        throw new Error(`Failed to load template from ${path}: ${response.status}`);
      }

      return await response.text();
    } catch (err) {
      if (controller.signal.aborted) {
        throw new Error(`Timed out loading template from ${path} after 5000ms`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

}

// Export a singleton instance
export const templateProvider = new TemplateProvider();
