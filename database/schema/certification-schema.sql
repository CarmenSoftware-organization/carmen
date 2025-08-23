-- Certification Management Database Schema

-- Certifications
-- Stores information about each certification
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon_url VARCHAR(1024),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Vendor Certifications
-- Many-to-many relationship between vendors and certifications
CREATE TABLE vendor_certifications (
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  certification_id UUID NOT NULL REFERENCES certifications(id),
  certificate_number VARCHAR(255),
  issue_date DATE,
  expiry_date DATE,
  document_url VARCHAR(1024),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (vendor_id, certification_id)
);

-- Product Certifications
-- Many-to-many relationship between products and certifications
CREATE TABLE product_certifications (
  product_id UUID NOT NULL REFERENCES products(id),
  certification_id UUID NOT NULL REFERENCES certifications(id),
  certificate_number VARCHAR(255),
  issue_date DATE,
  expiry_date DATE,
  document_url VARCHAR(1024),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product_id, certification_id)
);
