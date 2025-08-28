import { createCertification } from '@/actions/certification-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Page() {
  return (
    <form action={createCertification}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Name
          </label>
          <Input id="name" name="name" required />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="mb-2 block text-sm font-medium">
            Description
          </label>
          <Textarea id="description" name="description" />
        </div>
        <div className="mb-4">
          <label htmlFor="icon_url" className="mb-2 block text-sm font-medium">
            Icon URL
          </label>
          <Input id="icon_url" name="icon_url" />
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button type="submit">Create Certification</Button>
        </div>
      </div>
    </form>
  );
}
