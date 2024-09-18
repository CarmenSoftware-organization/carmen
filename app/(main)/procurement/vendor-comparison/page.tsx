import { VendorComparisonComponent } from '@/app/(main)/procurement/purchase-requests/components/vendor-comparison';

export default function VendorComparisonPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Vendor Comparison</h1>
      <VendorComparisonComponent />
    </div>
  );
}