-- Carmen ERP Database Initialization
-- This script creates the basic database structure for Carmen ERP system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS procurement;
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS vendors;
CREATE SCHEMA IF NOT EXISTS products;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS finance;

-- Create basic audit trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users and authentication
CREATE TABLE IF NOT EXISTS users.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff',
    department VARCHAR(100),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger for users
CREATE TRIGGER set_timestamp_users
    BEFORE UPDATE ON users.users
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

-- Vendors
CREATE TABLE IF NOT EXISTS vendors.vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(100),
    payment_terms VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_of_measure VARCHAR(50),
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Requests
CREATE TABLE IF NOT EXISTS procurement.purchase_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pr_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    requested_by UUID REFERENCES users.users(id),
    department VARCHAR(100),
    total_amount DECIMAL(12,2) DEFAULT 0,
    requested_date DATE NOT NULL,
    required_date DATE,
    approved_by UUID REFERENCES users.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS procurement.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id UUID REFERENCES vendors.vendors(id),
    purchase_request_id UUID REFERENCES procurement.purchase_requests(id),
    status VARCHAR(50) DEFAULT 'draft',
    total_amount DECIMAL(12,2) DEFAULT 0,
    order_date DATE NOT NULL,
    expected_delivery DATE,
    created_by UUID REFERENCES users.users(id),
    approved_by UUID REFERENCES users.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Items
CREATE TABLE IF NOT EXISTS inventory.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products.products(id),
    location VARCHAR(100),
    quantity_on_hand DECIMAL(10,2) DEFAULT 0,
    reserved_quantity DECIMAL(10,2) DEFAULT 0,
    reorder_level DECIMAL(10,2),
    max_stock_level DECIMAL(10,2),
    last_counted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, location)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users.users(role);
CREATE INDEX IF NOT EXISTS idx_vendors_active ON vendors.vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products.products(category);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON procurement.purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON procurement.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_inventory_product_location ON inventory.inventory_items(product_id, location);

-- Insert some sample data for testing
INSERT INTO users.users (email, password_hash, first_name, last_name, role, department) VALUES
('admin@carmen.com', crypt('admin123', gen_salt('bf')), 'System', 'Admin', 'admin', 'IT'),
('chef@carmen.com', crypt('chef123', gen_salt('bf')), 'Head', 'Chef', 'chef', 'Kitchen'),
('purchaser@carmen.com', crypt('purchase123', gen_salt('bf')), 'Purchase', 'Manager', 'purchasing-staff', 'Procurement')
ON CONFLICT (email) DO NOTHING;

INSERT INTO vendors.vendors (company_name, contact_person, email, phone) VALUES
('Food Supplies Co', 'John Smith', 'john@foodsupplies.com', '+1-555-0101'),
('Fresh Produce Ltd', 'Mary Johnson', 'mary@freshproduce.com', '+1-555-0102'),
('Kitchen Equipment Inc', 'Bob Wilson', 'bob@kitchenequip.com', '+1-555-0103')
ON CONFLICT DO NOTHING;

INSERT INTO products.products (sku, name, description, category, unit_of_measure, cost_price, selling_price) VALUES
('FOOD-001', 'Tomatoes', 'Fresh Roma Tomatoes', 'Produce', 'kg', 2.50, 4.00),
('FOOD-002', 'Chicken Breast', 'Boneless Chicken Breast', 'Meat', 'kg', 8.00, 12.00),
('EQUIP-001', 'Chef Knife', '8-inch Professional Chef Knife', 'Kitchen Equipment', 'piece', 45.00, 75.00)
ON CONFLICT (sku) DO NOTHING;

COMMENT ON DATABASE carmen IS 'Carmen ERP System Database';
COMMENT ON SCHEMA procurement IS 'Purchase requests, orders, and procurement workflows';
COMMENT ON SCHEMA inventory IS 'Stock management and inventory tracking';
COMMENT ON SCHEMA vendors IS 'Vendor profiles and supplier management';
COMMENT ON SCHEMA products IS 'Product catalog and specifications';
COMMENT ON SCHEMA users IS 'User management and authentication';
COMMENT ON SCHEMA finance IS 'Financial transactions and accounting';