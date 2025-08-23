import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const CertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon_url: z.string().optional(),
});

const CreateCertification = CertificationSchema.omit({ id: true });

export async function createCertification(formData: FormData) {
  const { name, description, icon_url } = CreateCertification.parse({
    name: formData.get('name'),
    description: formData.get('description'),
    icon_url: formData.get('icon_url'),
  });

  await sql`
    INSERT INTO certifications (name, description, icon_url)
    VALUES (${name}, ${description}, ${icon_url})
  `;

  revalidatePath('/system-administration/certifications');
  redirect('/system-administration/certifications');
}

export async function updateCertification(id: string, formData: FormData) {
  const { name, description, icon_url } = CreateCertification.parse({
    name: formData.get('name'),
    description: formData.get('description'),
    icon_url: formData.get('icon_url'),
  });

  await sql`
    UPDATE certifications
    SET name = ${name}, description = ${description}, icon_url = ${icon_url}
    WHERE id = ${id}
  `;

  revalidatePath('/system-administration/certifications');
  redirect('/system-administration/certifications');
}

export async function deleteCertification(id: string) {
  await sql`DELETE FROM certifications WHERE id = ${id}`;
  revalidatePath('/system-administration/certifications');
}

export async function addCertificationToVendor(vendorId: string, certificationId: string, formData: FormData) {
  const { certificate_number, issue_date, expiry_date, document_url } = z.object({
    certificate_number: z.string().optional(),
    issue_date: z.string().optional(),
    expiry_date: z.string().optional(),
    document_url: z.string().optional(),
  }).parse({
    certificate_number: formData.get('certificate_number'),
    issue_date: formData.get('issue_date'),
    expiry_date: formData.get('expiry_date'),
    document_url: formData.get('document_url'),
  });

  await sql`
    INSERT INTO vendor_certifications (vendor_id, certification_id, certificate_number, issue_date, expiry_date, document_url)
    VALUES (${vendorId}, ${certificationId}, ${certificate_number}, ${issue_date}, ${expiry_date}, ${document_url})
  `;

  revalidatePath(`/vendor-management/vendors/${vendorId}`);
}

export async function removeCertificationFromVendor(vendorId: string, certificationId: string) {
  await sql`
    DELETE FROM vendor_certifications
    WHERE vendor_id = ${vendorId} AND certification_id = ${certificationId}
  `;

  revalidatePath(`/vendor-management/vendors/${vendorId}`);
}

export async function addCertificationToProduct(productId: string, certificationId: string, formData: FormData) {
  const { certificate_number, issue_date, expiry_date, document_url } = z.object({
    certificate_number: z.string().optional(),
    issue_date: z.string().optional(),
    expiry_date: z.string().optional(),
    document_url: z.string().optional(),
  }).parse({
    certificate_number: formData.get('certificate_number'),
    issue_date: formData.get('issue_date'),
    expiry_date: formData.get('expiry_date'),
    document_url: formData.get('document_url'),
  });

  await sql`
    INSERT INTO product_certifications (product_id, certification_id, certificate_number, issue_date, expiry_date, document_url)
    VALUES (${productId}, ${certificationId}, ${certificate_number}, ${issue_date}, ${expiry_date}, ${document_url})
  `;

  revalidatePath(`/product-management/products/${productId}`);
}

export async function removeCertificationFromProduct(productId: string, certificationId: string) {
  await sql`
    DELETE FROM product_certifications
    WHERE product_id = ${productId} AND certification_id = ${certificationId}
  `;

  revalidatePath(`/product-management/products/${productId}`);
}

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const CertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon_url: z.string().optional(),
});

const CreateCertification = CertificationSchema.omit({ id: true });

export async function createCertification(formData: FormData) {
  const { name, description, icon_url } = CreateCertification.parse({
    name: formData.get('name'),
    description: formData.get('description'),
    icon_url: formData.get('icon_url'),
  });

  await sql`
    INSERT INTO certifications (name, description, icon_url)
    VALUES (${name}, ${description}, ${icon_url})
  `;

  revalidatePath('/system-administration/certifications');
  redirect('/system-administration/certifications');
}

export async function updateCertification(id: string, formData: FormData) {
  const { name, description, icon_url } = CreateCertification.parse({
    name: formData.get('name'),
    description: formData.get('description'),
    icon_url: formData.get('icon_url'),
  });

  await sql`
    UPDATE certifications
    SET name = ${name}, description = ${description}, icon_url = ${icon_url}
    WHERE id = ${id}
  `;

  revalidatePath('/system-administration/certifications');
  redirect('/system-administration/certifications');
}

export async function deleteCertification(id: string) {
  await sql`DELETE FROM certifications WHERE id = ${id}`;
  revalidatePath('/system-administration/certifications');
}
