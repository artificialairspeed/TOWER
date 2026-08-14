/**
 * Example usage of openHTMLTab function
 * 
 * This example demonstrates how to use the openHTMLTab function
 * to open generated HTML content in a new browser tab.
 * 
 * Task: 15.4
 * Requirements: 10.5, 13.3
 */

import { openHTMLTab } from './artifactGeneration';

/**
 * Example 1: Open a simple HTML notification
 */
export function example1_SimpleNotification() {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Deployment Notification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 { color: #333; }
        .info { margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>Deployment Notification</h1>
      <div class="info"><strong>Application:</strong> Crew Portal</div>
      <div class="info"><strong>Environment:</strong> PROD</div>
      <div class="info"><strong>Date:</strong> March 15, 2025</div>
    </body>
    </html>
  `;
  
  const success = openHTMLTab(htmlContent);
  
  if (success) {
    console.log('HTML notification opened successfully');
  } else {
    console.log('Failed to open HTML notification - popup may be blocked');
    alert('Please allow pop-ups to view the HTML notification');
  }
}

/**
 * Example 2: Open generated deployment notification with error handling
 */
export function example2_WithErrorHandling(htmlString: string) {
  try {
    const opened = openHTMLTab(htmlString);
    
    if (!opened) {
      // Popup was blocked - inform user
      return {
        success: false,
        message: 'Popup blocked. Please allow pop-ups for this site to view HTML notifications.'
      };
    }
    
    return {
      success: true,
      message: 'HTML notification opened in new tab'
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to open HTML notification: ${error}`
    };
  }
}

/**
 * Example 3: Open multiple HTML notifications sequentially
 * 
 * This demonstrates the recommended approach from Requirement 13.1:
 * opening HTML tabs one at a time with 500ms intervals.
 */
export async function example3_MultipleNotifications(htmlStrings: string[]) {
  const results: Array<{ index: number; success: boolean }> = [];
  
  for (let i = 0; i < htmlStrings.length; i++) {
    const success = openHTMLTab(htmlStrings[i]);
    results.push({ index: i, success });
    
    // Wait 500ms before opening next tab (per Requirement 13.1)
    if (i < htmlStrings.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Check if any popups were blocked
  const blockedCount = results.filter(r => !r.success).length;
  
  if (blockedCount > 0) {
    console.warn(`${blockedCount} HTML notification(s) blocked. Please allow popups.`);
  }
  
  return results;
}

/**
 * Example 4: Integration with artifact generation workflow
 */
export async function example4_ArtifactGenerationWorkflow(
  deploymentForms: Array<{ name: string; htmlContent: string }>
) {
  console.log(`Opening ${deploymentForms.length} HTML notifications...`);
  
  const results = [];
  
  for (const form of deploymentForms) {
    const success = openHTMLTab(form.htmlContent);
    
    results.push({
      formName: form.name,
      htmlOpened: success
    });
    
    // Sequential delivery with 500ms intervals (Requirement 13.1)
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  const successCount = results.filter(r => r.htmlOpened).length;
  console.log(`Opened ${successCount} of ${deploymentForms.length} HTML notifications`);
  
  // Check for popup blocks
  const blockedForms = results.filter(r => !r.htmlOpened);
  if (blockedForms.length > 0) {
    console.warn('Some HTML notifications were blocked:');
    blockedForms.forEach(f => console.warn(`  - ${f.formName}`));
    alert('Please allow pop-ups to view all HTML notifications');
  }
  
  return results;
}
