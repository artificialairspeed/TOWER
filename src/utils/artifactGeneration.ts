/**
 * Artifact Generation Utilities
 * 
 * This module implements adapters for generating HTML, PDF, and PNG artifacts
 * from deployment form data.
 * 
 * Features:
 * - Lazy loading of html2pdf.js and html-to-image libraries
 * - Dynamic imports to reduce initial bundle size
 * 
 * Tasks: 15.1, 15.2, 15.3, 15.4, 22.2 (Performance optimization)
 * Requirements: 10.4, 10.5, 10.6, 10.7, 13.3
 */

import type { DeploymentFormData, Theme } from '../types/models';
import { templateProvider } from './templateProvider';
import { injectTemplate } from './formatters';

// Lazy-load html-to-image library on first use
let html2imageModule: { toPng?: any; toBlob?: any } | null = null;

async function loadHtml2Image() {
  if (!html2imageModule) {
    const module = await import('html-to-image');
    html2imageModule = module;
  }
  return html2imageModule;
}

// Lazy-load html2pdf.js library on first use
let html2pdfModule: any = null;

async function loadHtml2PDF() {
  if (!html2pdfModule) {
    const module = await import('html2pdf.js');
    html2pdfModule = module.default;
  }
  return html2pdfModule;
}

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
 * Creates an off-screen container element suitable for html-to-image rendering.
 *
 * The templates are full HTML documents (with <!DOCTYPE>, <html>, <head>,
 * <style>, and <body> elements). When assigned directly to `element.innerHTML`,
 * the browser strips the structural tags and, critically, discards the <style>
 * block inside <head>. This causes the rendered PNG to lose all styling.
 *
 * This helper uses DOMParser to correctly parse the full HTML document, then
 * extracts the <style> elements and <body> content and injects them both into
 * the rendering container so that css styles are preserved during rasterization.
 *
 * @param htmlString - Complete HTML document string
 * @returns A positioned, fixed-width div element ready for html-to-image
 */
function createRenderContainer(htmlString: string): HTMLDivElement {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1148px'; // Matches template: 1100px card + 24px padding on each side
  container.style.padding = '0';
  container.style.margin = '0';
  container.style.lineHeight = '1';

  // Parse the full HTML document to extract styles and body content
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  // Extract all <style> elements from the parsed document
  // This includes styles from both <head> and <body>
  const styles = doc.querySelectorAll('style');
  styles.forEach((style) => {
    // Clone the style element to preserve its content
    const clonedStyle = style.cloneNode(true) as HTMLStyleElement;
    container.appendChild(clonedStyle);
  });

  // Extract the <body> content and wrap it properly
  if (doc.body && doc.body.innerHTML.trim()) {
    // Create a wrapper that preserves body structure and styling context
    const bodyWrapper = document.createElement('div');
    bodyWrapper.innerHTML = doc.body.innerHTML;
    
    // Apply body-level CSS classes if present
    if (doc.body.className) {
      bodyWrapper.className = doc.body.className;
    }
    
    // Apply critical body styles directly from the document's CSS if we can infer them
    // This ensures the content is visible even if the styles reference missing elements
    const bodyStyle = doc.body.getAttribute('style');
    if (bodyStyle) {
      bodyWrapper.setAttribute('style', bodyStyle);
    }
    
    container.appendChild(bodyWrapper);
  } else if (doc.documentElement) {
    // Fallback: if body is empty or missing, try using the entire document element
    const wrapper = document.createElement('div');
    // Only include visible content, excluding html/body tags
    const allContent = Array.from(doc.documentElement.childNodes)
      .map(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const elem = node as Element;
          if (elem.tagName.toLowerCase() !== 'html' && elem.tagName.toLowerCase() !== 'body') {
            return elem.outerHTML;
          }
          // For body, use innerHTML
          if (elem.tagName.toLowerCase() === 'body') {
            return elem.innerHTML;
          }
        }
        return node.textContent || '';
      })
      .join('');
    
    if (allContent.trim()) {
      wrapper.innerHTML = allContent;
      container.appendChild(wrapper);
    }
  } else {
    // Last fallback: use the raw string as-is
    const wrapper = document.createElement('div');
    wrapper.innerHTML = htmlString;
    container.appendChild(wrapper);
  }

  return container;
}

/**
 * Generate PNG artifact from HTML element
 * 
 * Uses html-to-image to convert HTML element to PNG format and trigger download.
 * Lazy loads html-to-image on first use.
 * 
 * Task: 15.3, 22.2 (Performance optimization)
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
    // Lazy load html-to-image library (22.2: Performance optimization)
    const { toPng } = await loadHtml2Image();
    
    // Create a temporary container element and populate it with the full
    // HTML document content (styles + body) so html-to-image can render it.
    const container = createRenderContainer(htmlString);
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
  _fileName: string
): Promise<boolean> {
  // Lazy load html-to-image library (22.2: Performance optimization)
  const { toBlob } = await loadHtml2Image();
  
  // Create a temporary iframe with the full HTML document to ensure all styles
  // and scripts are properly rendered. This is more reliable than DOM parsing.
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '1148px'; // Matches template: 1100px card + 24px padding on each side
  container.style.padding = '0';
  container.style.margin = '0';
  container.style.lineHeight = '1';
  
  // Create an iframe and set its document to the HTML content
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.width = '1148px'; // Matches template: 1100px card + 24px padding on each side
  iframe.style.height = '1600px';
  iframe.style.border = 'none';
  iframe.style.padding = '0';
  iframe.style.margin = '0';
  
  document.body.appendChild(iframe);
  
  try {
    // Write the HTML to the iframe document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Could not access iframe document');
    }
    
    // Open, write, and close the document to properly render it
    iframeDoc.open();
    iframeDoc.write(htmlString);
    iframeDoc.close();
    
    // Wait for the iframe content to fully render
    await new Promise(resolve => {
      iframe.onload = resolve;
      // Also resolve after a short delay in case onload doesn't fire
      setTimeout(resolve, 1000);
    });

    // Get the body element from the iframe
    const iframeBody = iframeDoc.body;
    if (!iframeBody) {
      throw new Error('Iframe body not found');
    }

    // Rasterize the iframe body to a PNG Blob
    const blob = await toBlob(iframeBody, {
      quality: 0.95,
      pixelRatio: 2, // Higher resolution for better quality
    });

    if (!blob) {
      throw new Error('PNG rendering produced no image data');
    }

    const url = URL.createObjectURL(blob);

    // Open the PNG in a new tab for viewing (no download)
    const newWindow = window.open(url, '_blank');
    const opened = !(
      !newWindow ||
      newWindow.closed ||
      typeof newWindow.closed === 'undefined'
    );

    // Revoke the object URL after the new tab has had time to read the blob.
    // Using 30 seconds to be safe across various network conditions.
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 30000);

    return opened;
  } finally {
    // Always clean up the iframe
    document.body.removeChild(iframe);
  }
}

/**
 * Open HTML artifact in a new browser tab
 * 
 * Opens the generated HTML content in a new tab for immediate viewing.
 * 
 * Task: 15.4, 22.2 (Performance optimization)
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

    // Clean up the blob URL after a longer delay to ensure the page has fully loaded
    // and cached the content. Most modern browsers load pages quickly, but we use
    // a generous timeout to ensure the blob data is read into the new window's DOM.
    // The actual cleanup happens when the user closes the tab anyway.
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 30000); // 30 seconds should be plenty for any network condition

    return true;
  } catch (error) {
    console.error('Failed to open HTML tab:', error);
    return false;
  }
}

/**
 * Generate PDF artifact from HTML string
 * 
 * Uses html2pdf.js to convert HTML to PDF format and trigger download.
 * Lazy loads html2pdf.js on first use.
 * 
 * Task: 15.2, 22.2 (Performance optimization)
 * Requirements: 10.6
 * 
 * @param htmlString - Complete HTML string to convert
 * @param fileName - Desired file name (without extension)
 * @returns Promise that resolves when PDF generation completes
 * @throws Error if PDF generation fails
 */
export async function generatePDF(
  htmlString: string,
  fileName: string
): Promise<void> {
  try {
    // Lazy load html2pdf.js library (22.2: Performance optimization)
    const html2pdf = await loadHtml2PDF();
    
    // Create a temporary container for PDF generation
    const container = document.createElement('div');
    container.innerHTML = htmlString;
    document.body.appendChild(container);

    try {
      // Generate PDF using html2pdf
      const element = container.querySelector('body') || container;
      
      const opt = {
        margin: 10,
        filename: `${fileName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
      };

      await html2pdf().set(opt).from(element).save();
    } finally {
      // Clean up temporary element
      document.body.removeChild(container);
    }
  } catch (error) {
    throw new Error(
      `Failed to generate PDF artifact: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
