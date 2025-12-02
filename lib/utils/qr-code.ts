/**
 * QR Code Generation Utilities
 *
 * Utilities for generating QR codes for Purchase Orders to enable
 * mobile scanning workflow with the cmobile receiving app.
 */

import QRCode from 'qrcode';

/**
 * QR Code format prefix for different entity types
 */
export const QR_CODE_PREFIX = {
  PURCHASE_ORDER: 'PO',
  GOODS_RECEIVED_NOTE: 'GRN',
  PRODUCT: 'PROD',
  LOCATION: 'LOC',
} as const;

/**
 * QR Code generation options
 */
export interface QRCodeOptions {
  /**
   * Error correction level
   * - L: Low (~7% can be restored)
   * - M: Medium (~15% can be restored) - Default
   * - Q: Quartile (~25% can be restored)
   * - H: High (~30% can be restored)
   */
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';

  /**
   * Image width and height in pixels
   * Default: 300
   */
  width?: number;

  /**
   * Margin around QR code in modules (4 minimum recommended)
   * Default: 4
   */
  margin?: number;

  /**
   * Image format
   * Default: 'image/png'
   */
  type?: 'image/png' | 'image/jpeg' | 'image/webp';
}

/**
 * Generate QR code value for a Purchase Order
 * Format: "PO:{orderNumber}"
 *
 * @param orderNumber - Purchase order number (e.g., "PO-2025-0001")
 * @returns QR code value string
 *
 * @example
 * ```ts
 * const qrValue = generatePOQRValue("PO-2025-0001");
 * // Returns: "PO:PO-2025-0001"
 * ```
 */
export function generatePOQRValue(orderNumber: string): string {
  if (!orderNumber || orderNumber.trim() === '') {
    throw new Error('Order number is required');
  }

  return `${QR_CODE_PREFIX.PURCHASE_ORDER}:${orderNumber}`;
}

/**
 * Parse QR code value to extract entity type and ID
 *
 * @param qrValue - QR code value (e.g., "PO:PO-2025-0001")
 * @returns Object with entity type and ID
 *
 * @example
 * ```ts
 * const parsed = parseQRValue("PO:PO-2025-0001");
 * // Returns: { type: "PO", id: "PO-2025-0001" }
 * ```
 */
export function parseQRValue(qrValue: string): { type: string; id: string } | null {
  if (!qrValue || !qrValue.includes(':')) {
    return null;
  }

  const [type, id] = qrValue.split(':', 2);

  if (!type || !id) {
    return null;
  }

  return { type, id };
}

/**
 * Validate if QR code value is for a Purchase Order
 *
 * @param qrValue - QR code value
 * @returns true if valid PO QR code
 */
export function isPOQRCode(qrValue: string): boolean {
  const parsed = parseQRValue(qrValue);
  return parsed?.type === QR_CODE_PREFIX.PURCHASE_ORDER;
}

/**
 * Generate QR code image as base64 data URL for a Purchase Order
 *
 * @param orderNumber - Purchase order number
 * @param options - QR code generation options
 * @returns Promise resolving to base64 data URL (e.g., "data:image/png;base64,...")
 *
 * @example
 * ```ts
 * const qrImage = await generatePOQRCode("PO-2025-0001");
 * // Use in img tag: <img src={qrImage} alt="PO QR Code" />
 * ```
 */
export async function generatePOQRCode(
  orderNumber: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const qrValue = generatePOQRValue(orderNumber);

  const {
    errorCorrectionLevel = 'M',
    width = 300,
    margin = 4,
    type = 'image/png',
  } = options;

  try {
    const qrCodeDataURL = await QRCode.toDataURL(qrValue, {
      errorCorrectionLevel,
      width,
      margin,
      type,
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code as Canvas element (for client-side use)
 *
 * @param orderNumber - Purchase order number
 * @param canvas - HTML canvas element
 * @param options - QR code generation options
 * @returns Promise resolving when QR code is drawn on canvas
 *
 * @example
 * ```tsx
 * const canvasRef = useRef<HTMLCanvasElement>(null);
 *
 * useEffect(() => {
 *   if (canvasRef.current) {
 *     generatePOQRCodeCanvas("PO-2025-0001", canvasRef.current);
 *   }
 * }, []);
 *
 * return <canvas ref={canvasRef} />;
 * ```
 */
export async function generatePOQRCodeCanvas(
  orderNumber: string,
  canvas: HTMLCanvasElement,
  options: QRCodeOptions = {}
): Promise<void> {
  const qrValue = generatePOQRValue(orderNumber);

  const {
    errorCorrectionLevel = 'M',
    width = 300,
    margin = 4,
  } = options;

  try {
    await QRCode.toCanvas(canvas, qrValue, {
      errorCorrectionLevel,
      width,
      margin,
    });
  } catch (error) {
    console.error('Error generating QR code on canvas:', error);
    throw new Error(`Failed to generate QR code on canvas: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download QR code as PNG file
 *
 * @param orderNumber - Purchase order number
 * @param filename - Download filename (default: "PO-{orderNumber}-QR.png")
 * @param options - QR code generation options
 *
 * @example
 * ```tsx
 * <Button onClick={() => downloadPOQRCode("PO-2025-0001")}>
 *   Download QR Code
 * </Button>
 * ```
 */
export async function downloadPOQRCode(
  orderNumber: string,
  filename?: string,
  options: QRCodeOptions = {}
): Promise<void> {
  const qrCodeDataURL = await generatePOQRCode(orderNumber, options);

  // Create download link
  const link = document.createElement('a');
  link.href = qrCodeDataURL;
  link.download = filename || `${orderNumber}-QR.png`;

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate multiple QR codes for a batch of Purchase Orders
 *
 * @param orderNumbers - Array of purchase order numbers
 * @param options - QR code generation options
 * @returns Promise resolving to array of objects with orderNumber and qrCode
 *
 * @example
 * ```ts
 * const qrCodes = await generateBatchPOQRCodes([
 *   "PO-2025-0001",
 *   "PO-2025-0002",
 *   "PO-2025-0003"
 * ]);
 * ```
 */
export async function generateBatchPOQRCodes(
  orderNumbers: string[],
  options: QRCodeOptions = {}
): Promise<Array<{ orderNumber: string; qrCode: string; qrValue: string }>> {
  const results = await Promise.all(
    orderNumbers.map(async (orderNumber) => {
      try {
        const qrCode = await generatePOQRCode(orderNumber, options);
        const qrValue = generatePOQRValue(orderNumber);

        return {
          orderNumber,
          qrCode,
          qrValue,
        };
      } catch (error) {
        console.error(`Error generating QR code for ${orderNumber}:`, error);
        throw error;
      }
    })
  );

  return results;
}
