/**
 * Artifact Generation Utilities
 *
 * This module implements the adapter for rendering a PNG artifact from
 * deployment form data.
 *
 * Features:
 * - Lazy loading of the html-to-image library
 * - Dynamic imports to reduce initial bundle size
 *
 * Tasks: 15.1, 15.2, 15.3, 15.4, 22.2 (Performance optimization)
 * Requirements: 10.4, 10.5, 10.6, 10.7, 13.3
 */

// Lazy-load html-to-image library on first use
let html2imageModule: { toPng?: any; toBlob?: any } | null = null;

async function loadHtml2Image() {
  if (!html2imageModule) {
    const module = await import('html-to-image');
    html2imageModule = module;
  }
  return html2imageModule;
}

/**
 * Render HTML to a PNG image and open it in a new browser tab.
 *
 * This is the single artifact produced by the "Generate Flight Plan" action.
 * The HTML is rasterized to a PNG exactly once and the resulting image is
 * opened for viewing. Nothing is written to disk — the user saves the image
 * from the tab if they want a file.
 *
 * A Blob object URL is used (rather than a base64 data URL) because browsers
 * reliably render blob URLs in a new tab and impose no practical size limit.
 *
 * @param htmlString - Complete HTML string to rasterize
 * @returns true if the tab opened successfully, false if the popup was blocked
 * @throws Error if PNG rendering fails (nothing is opened)
 */
export async function openPNGInNewTab(htmlString: string): Promise<boolean> {
  // Lazy load html-to-image library (22.2: Performance optimization)
  const { toBlob } = await loadHtml2Image();

  // Render the full HTML document inside an offscreen iframe so the template's
  // own styles and embedded fonts apply. This is more reliable than parsing the
  // markup into the host document.
  //
  // The iframe is an oversized sandbox, not a measurement: the template's body
  // is `width: fit-content`, so the captured width comes from the card itself
  // rather than from these dimensions.
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.left = '-9999px';
  iframe.style.width = '1148px';
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

    // Rasterize the iframe body to a PNG Blob.
    //
    // pixelRatio is the single biggest lever on sharpness: html-to-image
    // rasterizes the DOM (serialized into an SVG <foreignObject>) onto a
    // canvas sized width*pixelRatio, so the browser lays text out natively at
    // that resolution — this is true detail, not interpolated upscaling.
    //
    // We oversample to at least 3x, and higher on HiDPI displays, so the
    // artifact stays crisp when zoomed or viewed on a Retina screen. A flat
    // dark card of mostly text compresses well, so the larger dimensions cost
    // little file size. (quality only applies to lossy formats and is ignored
    // for PNG, but is kept harmless for the JPEG/WebP code paths.)
    const pixelRatio = Math.max(3, Math.ceil(window.devicePixelRatio || 1) * 2);
    const blob = await toBlob(iframeBody, {
      quality: 1,
      pixelRatio,
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
