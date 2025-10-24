import { fetchCertificationById } from '@/app/lib/data';
import { updateCertification } from '@/actions/certification-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const certification = await fetchCertificationById(id);

  if (!certification) {
    return (
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <p className="text-sm text-gray-500">Certification not found.</p>
      </div>
    );
  }

  const updateCertificationWithId = updateCertification.bind(null, id);

  return (
    <form action={updateCertificationWithId}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Name
          </label>
          <Input id="name" name="name" defaultValue={certification.name} required />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="mb-2 block text-sm font-medium">
            Description
          </label>
          <Textarea id="description" name="description" defaultValue={certification.description} />
        </div>
        <div className="mb-4">
          <label htmlFor="issuer" className="mb-2 block text-sm font-medium">
            Issuer
          </label>
          <Input id="issuer" name="issuer" defaultValue={certification.issuer} />
        </div>
        <div className="mb-4">
          <label htmlFor="validityPeriod" className="mb-2 block text-sm font-medium">
            Validity Period
          </label>
          <Input id="validityPeriod" name="validityPeriod" defaultValue={certification.validityPeriod} />
        </div>
        <div className="mb-4">
          <label htmlFor="requiredDocuments" className="mb-2 block text-sm font-medium">
            Required Documents
          </label>
          <Textarea id="requiredDocuments" name="requiredDocuments" defaultValue={certification.requiredDocuments} />
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button type="submit">Update Certification</Button>
        </div>
      </div>
    </form>
  );
}
