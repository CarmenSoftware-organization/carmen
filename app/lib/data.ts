import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchCertifications() {
  noStore();
  try {
    const data = await sql`SELECT * FROM certifications`;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch certifications.');
  }
}

export async function fetchCertificationById(id: string) {
  noStore();
  try {
    const data = await sql`SELECT * FROM certifications WHERE id = ${id}`;
    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch certification.');
  }
}

export async function fetchPurchaseRequests() {
  noStore();
  try {
    // This is a simplified query. In a real application, you would likely
    // have a more complex query that joins multiple tables to get all the
    // required data.
    const data = await sql`
      SELECT
        pr.id,
        pr.status,
        pr.request_date,
        pr.total_amount,
        u.name as requested_by,
        v.name as vendor_name,
        (SELECT json_agg(c.*) FROM vendor_certifications vc JOIN certifications c ON vc.certification_id = c.id WHERE vc.vendor_id = v.id) as vendor_certifications,
        (SELECT json_agg(c.*) FROM product_certifications pc JOIN certifications c ON pc.certification_id = c.id WHERE pc.product_id = pri.product_id) as product_certifications
      FROM purchase_requests pr
      JOIN users u ON pr.requested_by = u.id
      LEFT JOIN vendors v ON pr.vendor_id = v.id
      LEFT JOIN purchase_request_items pri ON pri.purchase_request_id = pr.id
    `;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch purchase requests.');
  }
}

import { unstable_noStore as noStore } from 'next/cache';

export async function fetchCertifications() {
  noStore();
  try {
    const data = await sql`SELECT * FROM certifications`;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch certifications.');
  }
}

export async function fetchCertificationById(id: string) {
  noStore();
  try {
    const data = await sql`SELECT * FROM certifications WHERE id = ${id}`;
    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch certification.');
  }
}

import { unstable_noStore as noStore } from 'next/cache';

export async function fetchCertifications() {
  noStore();
  try {
    const data = await sql`SELECT * FROM certifications`;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch certifications.');
  }
}
