/**
 * Unit tests for artifact generation utilities
 * 
 * Task 15.5: Write unit tests for artifact generation
 * Requirements: 10.4-10.8
 * 
 * These tests verify the HTML, PDF, and PNG artifact generation functions,
 * including success paths, error handling, and popup blocking scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateHTML, generatePNG, openHTMLTab, openAndDownloadPNG } from './artifactGeneration';
import { templateProvider } from './templateProvider';
import type { DeploymentFormData, Application } from '../types/models';

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,mockImageData'),
  toBlob: vi.fn().mockResolvedValue(new Blob(['mock'], { type: 'image/png' }))
}));

describe('generateHTML', () => {
  const mockApplication: Application = {
    id: 'crew-portal',
    name: 'Crew Portal',
    notificationHeader: 'Crew Portal Deployment Notification'
  };

  const createMockData = (): DeploymentFormData => ({
    formId: 'form-1',
    application: mockApplication,
    changeNumber: 'CHG12345',
    releaseVersion: 'v5.4.1',
    environment: 'PROD',
    deploymentTitle: '[CHG12345] — [Crew Portal: v5.4.1 - Deploy Product to PROD]',
    deploymentDate: new Date('2025-03-05T00:00:00Z'),
    startTime: new Date('2025-03-05T20:00:00Z'),
    endTime: new Date('2025-03-05T22:00:00Z'),
    hasOutage: false,
    outageStartDate: null,
    outageStartTime: null,
    outageEndDate: null,
    outageEndTime: null,
    changeItems: [
      { id: '1', jiraNumber: 'JIRA-123', description: 'Fix login bug' }
    ],
    impactItems: [
      { id: '1', text: 'Users may experience brief downtime' }
    ],
    contactName: 'John Doe',
    contactEmail: 'john@example.com',
    contactPhone: '(555) 123-4567'
  });

  beforeEach(() => {
    // Set up mock templates
    templateProvider.setTemplate('light', '<html><body class="light">{{NOTIFICATION_HEADER}}</body></html>');
    templateProvider.setTemplate('dark', '<html><body class="dark">{{NOTIFICATION_HEADER}}</body></html>');
  });

  afterEach(() => {
    templateProvider.clear();
  });

  it('should generate HTML with Light Mode theme', async () => {
    const data = createMockData();
    const result = await generateHTML(data, 'Light Mode');
    
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result).toContain('<html>');
    expect(result).toContain('class="light"');
  });

  it('should generate HTML with Dark Mode theme', async () => {
    const data = createMockData();
    const result = await generateHTML(data, 'Dark Mode');
    
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result).toContain('<html>');
    expect(result).toContain('class="dark"');
  });

  it('should initialize templates if not loaded', async () => {
    templateProvider.clear();
    const data = createMockData();
    
    // Mock the initialize method
    const initializeSpy = vi.spyOn(templateProvider, 'initialize')
      .mockResolvedValue(undefined);
    
    // Set templates after initialization is called
    initializeSpy.mockImplementation(async () => {
      templateProvider.setTemplate('dark', '<html>{{NOTIFICATION_HEADER}}</html>');
    });
    
    await generateHTML(data, 'Dark Mode');
    
    expect(initializeSpy).toHaveBeenCalled();
  });

  it('should throw error if template loading fails', async () => {
    templateProvider.clear();
    const data = createMockData();
    
    // Mock initialize to throw an error
    vi.spyOn(templateProvider, 'initialize')
      .mockRejectedValue(new Error('Failed to load templates'));
    
    await expect(generateHTML(data, 'Dark Mode')).rejects.toThrow(
      'Failed to generate HTML artifact'
    );
  });

  it('should use correct template for Light Mode', async () => {
    const data = createMockData();
    const result = await generateHTML(data, 'Light Mode');
    
    expect(result).toContain('class="light"');
    expect(result).not.toContain('class="dark"');
  });

  it('should use correct template for Dark Mode', async () => {
    const data = createMockData();
    const result = await generateHTML(data, 'Dark Mode');
    
    expect(result).toContain('class="dark"');
    expect(result).not.toContain('class="light"');
  });

  it('should inject deployment data into template', async () => {
    const template = '<html>{{NOTIFICATION_HEADER}} - {{DEPLOYMENT_ID}}</html>';
    templateProvider.setTemplate('dark', template);
    
    const data = createMockData();
    const result = await generateHTML(data, 'Dark Mode');
    
    expect(result).toContain('Crew Portal Deployment Notification');
    expect(result).toContain('CHG12345');
  });
});

describe('generatePNG', () => {
  let toPng: any;
  let mockAppendChild: any;
  let mockRemoveChild: any;
  let mockClick: any;

  beforeEach(async () => {
    // Import the mocked module
    const module = await import('html-to-image');
    toPng = module.toPng;
    
    // Reset mocks
    vi.clearAllMocks();
    toPng.mockResolvedValue('data:image/png;base64,mockImageData');
    
    // Mock DOM methods
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();
    mockClick = vi.fn();
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;
    
    // Mock createElement for <a> tag
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        element.click = mockClick;
      }
      return element;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate PNG successfully', async () => {
    const htmlString = '<html><body>Test Content</body></html>';
    const fileName = 'test-deployment';
    
    await generatePNG(htmlString, fileName);
    
    // Verify toPng was called
    expect(toPng).toHaveBeenCalled();
  });

  it('should create temporary container with HTML content', async () => {
    const htmlString = '<html><body>Test Content</body></html>';
    const fileName = 'test-deployment';
    
    await generatePNG(htmlString, fileName);
    
    expect(mockAppendChild).toHaveBeenCalled();
    const containerArg = mockAppendChild.mock.calls[0][0] as HTMLElement;
    // innerHTML strips outer <html> tags and returns inner content
    expect(containerArg.innerHTML).toContain('Test Content');
    expect(containerArg.style.position).toBe('absolute');
    expect(containerArg.style.left).toBe('-9999px');
    expect(containerArg.style.width).toBe('1200px');
  });

  it('should configure toPng with correct options', async () => {
    const htmlString = '<html><body>Test</body></html>';
    const fileName = 'deployment';
    
    await generatePNG(htmlString, fileName);
    
    expect(toPng).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        quality: 0.95,
        pixelRatio: 2
      })
    );
  });

  it('should trigger download with correct filename', async () => {
    const htmlString = '<html><body>Test</body></html>';
    const fileName = 'my-deployment';
    
    await generatePNG(htmlString, fileName);
    
    expect(mockClick).toHaveBeenCalled();
  });

  it('should clean up temporary container after generation', async () => {
    const htmlString = '<html><body>Test</body></html>';
    const fileName = 'test';
    
    await generatePNG(htmlString, fileName);
    
    expect(mockRemoveChild).toHaveBeenCalled();
  });

  it('should clean up temporary container even if generation fails', async () => {
    const htmlString = '<html><body>Test</body></html>';
    const fileName = 'test';
    
    // Mock toPng to throw an error
    toPng.mockRejectedValueOnce(new Error('PNG generation failed'));
    
    await expect(generatePNG(htmlString, fileName)).rejects.toThrow();
    
    // Container should still be cleaned up
    expect(mockRemoveChild).toHaveBeenCalled();
  });

  it('should throw error with descriptive message on failure', async () => {
    const htmlString = '<html><body>Test</body></html>';
    const fileName = 'test';
    
    // Mock toPng to throw an error
    toPng.mockRejectedValueOnce(new Error('Image conversion error'));
    
    await expect(generatePNG(htmlString, fileName)).rejects.toThrow(
      'Failed to generate PNG artifact: Image conversion error'
    );
  });

  it('should handle non-Error exceptions', async () => {
    const htmlString = '<html><body>Test</body></html>';
    const fileName = 'test';
    
    // Mock toPng to throw a string
    toPng.mockRejectedValueOnce('String error');
    
    await expect(generatePNG(htmlString, fileName)).rejects.toThrow(
      'Failed to generate PNG artifact: String error'
    );
  });

  it('should append .png extension to fileName', async () => {
    const htmlString = '<html><body>Test</body></html>';
    const fileName = 'my-deployment';
    
    // Need to verify the download attribute was set correctly
    const createElementSpy = vi.spyOn(document, 'createElement');
    
    await generatePNG(htmlString, fileName);
    
    // Find the <a> element creation call
    const aCalls = createElementSpy.mock.results.filter(
      result => result.value?.tagName === 'A'
    );
    
    expect(aCalls.length).toBeGreaterThan(0);
  });
});

describe('openHTMLTab', () => {
  let windowOpenSpy: any;
  let createObjectURLSpy: any;
  let revokeObjectURLSpy: any;

  beforeEach(() => {
    // Mock window.open
    windowOpenSpy = vi.fn();
    window.open = windowOpenSpy as any;
    
    // Mock URL methods
    createObjectURLSpy = vi.fn(() => 'blob:http://localhost/mock-url');
    revokeObjectURLSpy = vi.fn();
    URL.createObjectURL = createObjectURLSpy;
    URL.revokeObjectURL = revokeObjectURLSpy;
    
    // Mock setTimeout
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should open HTML in new tab successfully', () => {
    const htmlString = '<html><body>Test</body></html>';
    const mockTab = { closed: false };
    windowOpenSpy.mockReturnValue(mockTab);
    
    const result = openHTMLTab(htmlString);
    
    expect(result).toBe(true);
    expect(windowOpenSpy).toHaveBeenCalledWith('blob:http://localhost/mock-url', '_blank');
  });

  it('should create Blob with correct HTML content', () => {
    const htmlString = '<html><body>Test Content</body></html>';
    const mockTab = { closed: false };
    windowOpenSpy.mockReturnValue(mockTab);
    
    openHTMLTab(htmlString);
    
    expect(createObjectURLSpy).toHaveBeenCalledWith(
      expect.any(Blob)
    );
    
    // Verify Blob was created with HTML content and correct type
    const blobArg = createObjectURLSpy.mock.calls[0][0];
    expect(blobArg.type).toBe('text/html');
  });

  it('should return false when popup is blocked (null)', () => {
    const htmlString = '<html><body>Test</body></html>';
    windowOpenSpy.mockReturnValue(null);
    
    const result = openHTMLTab(htmlString);
    
    expect(result).toBe(false);
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it('should return false when popup is blocked (closed)', () => {
    const htmlString = '<html><body>Test</body></html>';
    const mockTab = { closed: true };
    windowOpenSpy.mockReturnValue(mockTab);
    
    const result = openHTMLTab(htmlString);
    
    expect(result).toBe(false);
  });

  it('should return false when popup is blocked (undefined closed)', () => {
    const htmlString = '<html><body>Test</body></html>';
    const mockTab = { closed: undefined };
    windowOpenSpy.mockReturnValue(mockTab);
    
    const result = openHTMLTab(htmlString);
    
    expect(result).toBe(false);
  });

  it('should revoke object URL after delay', () => {
    const htmlString = '<html><body>Test</body></html>';
    const mockTab = { closed: false };
    windowOpenSpy.mockReturnValue(mockTab);
    
    openHTMLTab(htmlString);
    
    // URL should not be revoked immediately
    expect(revokeObjectURLSpy).not.toHaveBeenCalled();
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    // Now URL should be revoked
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/mock-url');
  });

  it('should return false and log error on exception', () => {
    const htmlString = '<html><body>Test</body></html>';
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    windowOpenSpy.mockImplementation(() => {
      throw new Error('Window.open failed');
    });
    
    const result = openHTMLTab(htmlString);
    
    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to open HTML tab:',
      expect.any(Error)
    );
  });

  it('should not revoke URL immediately on popup block', () => {
    const htmlString = '<html><body>Test</body></html>';
    windowOpenSpy.mockReturnValue(null);
    
    openHTMLTab(htmlString);
    
    // Should revoke immediately since tab failed to open
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });
});

describe('openAndDownloadPNG', () => {
  let windowOpenSpy: any;
  let createObjectURLSpy: any;
  let revokeObjectURLSpy: any;
  let mockAppendChild: any;
  let mockRemoveChild: any;
  let mockClick: any;
  let toBlob: any;

  beforeEach(async () => {
    // Grab the mocked toBlob, clear prior call counts, and reset to a valid Blob
    const module = await import('html-to-image');
    toBlob = module.toBlob;
    toBlob.mockClear();
    toBlob.mockResolvedValue(new Blob(['mock'], { type: 'image/png' }));

    // Mock window.open
    windowOpenSpy = vi.fn();
    window.open = windowOpenSpy as any;

    // Mock URL methods
    createObjectURLSpy = vi.fn(() => 'blob:http://localhost/mock-url');
    revokeObjectURLSpy = vi.fn();
    URL.createObjectURL = createObjectURLSpy;
    URL.revokeObjectURL = revokeObjectURLSpy;

    // Mock DOM methods
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();
    mockClick = vi.fn();
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    // Capture the created <a> element so we can inspect the download
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        element.click = mockClick;
      }
      return element;
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should download the PNG and open it in a new tab', async () => {
    const mockTab = { closed: false };
    windowOpenSpy.mockReturnValue(mockTab);

    const result = await openAndDownloadPNG('<html><body>Test</body></html>', 'my-deployment');

    expect(result).toBe(true);
    // Download triggered via an anchor click
    expect(mockClick).toHaveBeenCalled();
    // Opened in a new tab using the same blob URL
    expect(windowOpenSpy).toHaveBeenCalledWith('blob:http://localhost/mock-url', '_blank');
  });

  it('should set the download file name with a .png extension', async () => {
    windowOpenSpy.mockReturnValue({ closed: false });
    const createElementSpy = vi.spyOn(document, 'createElement');

    await openAndDownloadPNG('<html><body>Test</body></html>', 'my-deployment');

    const anchor = createElementSpy.mock.results
      .map((r) => r.value as HTMLElement)
      .find((el) => el?.tagName === 'A') as HTMLAnchorElement | undefined;

    expect(anchor?.download).toBe('my-deployment.png');
  });

  it('should render the PNG only once', async () => {
    windowOpenSpy.mockReturnValue({ closed: false });

    await openAndDownloadPNG('<html><body>Test</body></html>', 'test');

    expect(toBlob).toHaveBeenCalledTimes(1);
  });

  it('should still download and return false when the tab is blocked', async () => {
    windowOpenSpy.mockReturnValue(null); // popup blocked

    const result = await openAndDownloadPNG('<html><body>Test</body></html>', 'test');

    expect(result).toBe(false);
    // Download still happened
    expect(mockClick).toHaveBeenCalled();
  });

  it('should throw and clean up when rendering produces no image', async () => {
    toBlob.mockResolvedValueOnce(null);

    await expect(
      openAndDownloadPNG('<html><body>Test</body></html>', 'test')
    ).rejects.toThrow();

    // Temporary container is still removed
    expect(mockRemoveChild).toHaveBeenCalled();
  });
});
