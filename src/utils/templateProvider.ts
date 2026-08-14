/**
 * TemplateProvider class for loading and caching HTML templates.
 * Implements task 7.1 - Load and parse HTML templates
 * Requirements: 9.5, 9.6
 */

type Theme = 'light' | 'dark';

class TemplateProvider {
  private templates: Map<Theme, string> = new Map();
  private loadingPromise: Promise<void> | null = null;

  /**
   * Initialize the template provider by loading templates.
   * This should be called early in the application lifecycle.
   * 
   * @returns Promise that resolves when templates are loaded
   */
  async initialize(): Promise<void> {
    if (this.templates.size > 0) {
      return; // Already loaded
    }

    if (this.loadingPromise) {
      return this.loadingPromise; // Loading in progress
    }

    // On failure, reset the cached loadingPromise to null so a subsequent
    // initialize() call starts a fresh attempt without requiring a full
    // page reload. A successful load leaves templates cached, making
    // subsequent initialize() calls a no-op.
    this.loadingPromise = this.loadTemplates().catch((err) => {
      this.loadingPromise = null;
      throw err;
    });
    return this.loadingPromise;
  }

  /**
   * Get the HTML template for the specified theme.
   * Templates must be initialized before calling this method.
   * 
   * @param theme - The theme to get the template for ('light' or 'dark')
   * @returns The HTML template string
   * @throws Error if templates haven't been loaded or template not found
   */
  getTemplate(theme: Theme): string {
    const template = this.templates.get(theme);
    if (!template) {
      throw new Error(
        `Template not found for theme: ${theme}. ` +
        `Make sure to call initialize() before getTemplate().`
      );
    }

    return template;
  }

  /**
   * Check if templates are loaded.
   * 
   * @returns true if templates are loaded, false otherwise
   */
  isLoaded(): boolean {
    return this.templates.size > 0;
  }

  /**
   * Load HTML templates from the public/templates directory.
   * This method loads both light-mode.html and dark-mode.html templates
   * and caches them in memory.
   */
  private async loadTemplates(): Promise<void> {
    try {
      const [lightTemplate, darkTemplate] = await Promise.all([
        this.loadTemplateAsync('/templates/light-mode.html'),
        this.loadTemplateAsync('/templates/dark-mode.html')
      ]);
      
      this.templates.set('light', lightTemplate);
      this.templates.set('dark', darkTemplate);
    } catch (error) {
      throw new Error(`Failed to load templates: ${error}`);
    }
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

  /**
   * Manually set a template (useful for testing or dynamic template loading).
   * 
   * @param theme - The theme to set the template for
   * @param template - The HTML template string
   */
  setTemplate(theme: Theme, template: string): void {
    this.templates.set(theme, template);
  }

  /**
   * Clear all cached templates.
   */
  clear(): void {
    this.templates.clear();
    this.loadingPromise = null;
  }
}

// Export a singleton instance
export const templateProvider = new TemplateProvider();
export { TemplateProvider };
export type { Theme };
