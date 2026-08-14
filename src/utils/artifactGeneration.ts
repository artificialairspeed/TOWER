/**
 * Artifact Generation Utilities
 * 
 * This module implements adapters for generating HTML, PDF, and PNG artifacts
 * from deployment form data.
 * 
 * Tasks: 15.1, 15.2, 15.3, 15.4
 * Requirements: 10.4, 10.5, 10.6, 10.7, 13.3
 */

import { toPng, toBlob } from 'html-to-image';
import type { DeploymentFormData, Theme } from '../types/models';
import { templateProvider } from './templateProvider';
import { injectTemplate } from './formatters';

/**
 * Generate HTML artifact from deployment form data
 * 
 * Loads the appropriate theme template and injects all deployment data.
 * 
 * Task: 15.1
 * Requirements: 10.4, 10.5
 * 
 * @param data - Deployment form data
 * @param theme - Selected theme (Light Mode or Dark Mode)
 * @returns Complete HTML string ready for rendering or conversion
 * @throws Error if template loading fails or injection fails
 */
export async function generateHTML(
  data: DeploymentFormData,
  theme: Theme
): Promise<string> {
  try {
    // Ensure templates are loaded
    if (!templateProvider.isLoaded()) {
      await templateProvider.initialize();
    }

    // Convert theme format from display ("Light Mode") to internal ("light")
    const themeKey = theme === 'Light Mode' ? 'light' : 'dark';
    const template = templateProvider.getTemplate(themeKey);

    // Inject deployment data into template
    const htmlString = injectTemplate(template, data);

    return htmlString;
  } catch (error) {
    throw new Error(
      `Failed to generate HTML artifact: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generate PNG artifact from HTML element
 * 
 * Uses html-to-image to convert HTML element to PNG format and trigger download.
 * 
 * Task: 15.3
 * Requirements: 10.7
 * 
 * @param htmlString - Complete HTML string to convert
 * @param fileName - Desired file name (without extension)
 * @returns Promise that resolves when PNG generation completes
 * @throws Error if PNG generation fails
 */
export async function generatePNG(
  htmlString: string,
  fileName: string
): Promise<void> {
  try {
    // Create a temporary container element
    const container = document.createElement('div');
    container.innerHTML = htmlString;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '1200px'; // Set fixed width for consistent rendering
    document.body.appendChild(container);

    try {
      // Generate PNG data URL using html-to-image
      const dataUrl = await toPng(container, {
        quality: 0.95,
        pixelRatio: 2 // Higher resolution for better quality
      });

      // Create download link and trigger download
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      // Clean up temporary element
      document.body.removeChild(container);
    }
  } catch (error) {
    throw new Error(
      `Failed to generate PNG artifact: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Render HTML to a PNG image, then both download it and open it in a new tab.
 *
 * This is the single artifact produced by the "Generate Flight Plan" action.
 * The HTML is rasterized to a PNG exactly once, and the resulting image is
 * delivered two ways:
 *   1. Downloaded automatically as `<fileName>.png`.
 *   2. Opened in a new browser tab for immediate viewing.
 *
 * The download is triggered first because an anchor-based download is not
 * subject to the browser's popup blocker, so the file is always saved even if
 * the new tab is blocked.
 *
 * A Blob object URL is used (rather than a base64 data URL) because browsers
 * reliably render blob URLs in a new tab and impose no practical size limit.
 *
 * @param htmlString - Complete HTML string to rasterize
 * @param fileName - Desired download file name (without extension)
 * @returns true if the tab opened successfully, false if the popup was blocked.
 *          Note: the file is downloaded in both cases.
 * @throws Error if PNG rendering fails (nothing is downloaded or opened)
 */
export async function openAndDownloadPNG(
  htmlString: string,
  fileName: string
): Promise<boolean> {
  // Create a temporary off-screen container to render the HTML
  const container = document.createElement('div');
  container.innerHTML = htmlString;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1200px'; // Fixed width for consistent rendering
  document.body.appendChild(container);

  try {
    // Rasterize the HTML to a PNG Blob (rendered once, reused for both outputs)
    const blob = await toBlob(container, {
      quality: 0.95,
      pixelRatio: 2, // Higher resolution for better quality
    });

    if (!blob) {
      throw new Error('PNG rendering produced no image data');
    }

    const url = URL.createObjectURL(blob);

    // 1. Trigger the automatic download (not affected by popup blockers)
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = url;
    link.click();

    // 2. Open the same image in a new tab for immediate viewing
    const newWindow = window.open(url, '_blank');
    const opened = !(
      !newWindow ||
      newWindow.closed ||
      typeof newWindow.closed === 'undefined'
    );

    // Revoke the object URL after the download and new tab have had time to
    // read the blob. The browser fetches it immediately, so this delay simply
    // avoids reclaiming the URL before those reads complete.
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);

    return opened;
  } finally {
    // Always clean up the temporary container
    document.body.removeChild(container);
  }
}

/**
 * Open HTML artifact in a new browser tab
 * 
 * Opens the generated HTML content in a new tab for immediate viewing.
 * 
 * Task: 15.4
 * Requirements: 10.5, 13.3
 * 
 * @param htmlString - Complete HTML string to display
 * @returns true if tab opened successfully, false if popup was blocked
 */
export function openHTMLTab(htmlString: string): boolean {
  try {
    // Create a Blob from the HTML string
    const blob = new Blob([htmlString], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Open in new tab
    const newWindow = window.open(url, '_blank');

    // Check if popup was blocked
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Clean up the blob URL
      URL.revokeObjectURL(url);
      return false;
    }

    // Clean up the blob URL after a short delay to allow the window to load
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    return true;
  } catch (error) {
    console.error('Failed to open HTML tab:', error);
    return false;
  }
}
