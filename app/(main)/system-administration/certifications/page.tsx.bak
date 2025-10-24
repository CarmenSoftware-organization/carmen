import { fetchCertifications } from '@/app/lib/data';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteCertification } from '@/actions/certification-actions';

export default async function Page() {
  const certifications = await fetchCertifications();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Certifications</h1>
        <Link href="/system-administration/certifications/create">
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-5" />
            <span>Create Certification</span>
          </Button>
        </Link>
      </div>
      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              {certifications?.map((certification) => (
                <div
                  key={certification.id}
                  className="mb-2 w-full rounded-md bg-white p-4"
                >
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="mb-2 flex items-center">
                        <p>{certification.name}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {certification.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <div>
                      <Link
                        href={`/system-administration/certifications/${certification.id}/edit`}
                        className="text-blue-500"
                      >
                        Edit
                      </Link>
                    </div>
                    <form action={deleteCertification.bind(null, certification.id)}>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
            <table className="hidden min-w-full text-gray-900 md:table">
              <thead className="rounded-lg text-left text-sm font-normal">
                <tr>
                  <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Description
                  </th>
                  <th scope="col" className="relative py-3 pl-6 pr-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {certifications?.map((certification) => (
                  <tr
                    key={certification.id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  >
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      {certification.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {certification.description}
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/system-administration/certifications/${certification.id}/edit`}
                          className="text-blue-500"
                        >
                          Edit
                        </Link>
                        <form action={deleteCertification.bind(null, certification.id)}>
                          <Button variant="destructive" size="sm">
                            Delete
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
