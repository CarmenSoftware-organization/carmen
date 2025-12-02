"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import { generatePOQRCode, downloadPOQRCode } from '@/lib/utils/qr-code';
import { cn } from '@/lib/utils';

interface QRCodeSectionProps {
  orderNumber: string;
  className?: string;
}

export default function QRCodeSection({ orderNumber, className }: QRCodeSectionProps) {
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generateQR = async () => {
      if (!orderNumber) return;

      setIsGenerating(true);
      try {
        const qrImage = await generatePOQRCode(orderNumber, {
          width: 200,
          margin: 2,
          errorCorrectionLevel: 'M',
        });
        setQrCodeImage(qrImage);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    generateQR();
  }, [orderNumber]);

  const handleDownload = async () => {
    try {
      await downloadPOQRCode(orderNumber, `${orderNumber}-QR.png`, {
        width: 400,
        margin: 4,
      });
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            <CardTitle className="text-lg">Mobile Receiving</CardTitle>
          </div>
        </div>
        <CardDescription>
          Scan this QR code with the mobile app to quickly receive goods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border-2 border-dashed">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Generating QR code...</p>
            </div>
          ) : qrCodeImage ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={qrCodeImage}
                alt={`QR Code for ${orderNumber}`}
                className="w-48 h-48 rounded-md bg-white p-2"
              />
              <div className="text-center">
                <p className="text-sm font-medium">{orderNumber}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Scan to receive goods on mobile
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8">
              <p className="text-sm text-muted-foreground">Unable to generate QR code</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!qrCodeImage}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyOrderNumber}
            disabled={!orderNumber}
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy PO Number
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            How to use:
          </h4>
          <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>Open the Carmen mobile app</li>
            <li>Go to Receiving section</li>
            <li>Tap "Scan PO" button</li>
            <li>Point camera at this QR code</li>
            <li>Goods receipt will be created automatically</li>
          </ol>
        </div>

        {/* Mobile App Link */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Don't have the mobile app?{' '}
            <a href="/mobile-app" className="text-primary hover:underline">
              Get it here
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
