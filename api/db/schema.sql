-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Customer profiles table
CREATE TABLE IF NOT EXISTS customer_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    date_of_birth DATE,
    occupation TEXT,
    annual_income DECIMAL(10,2),
    marital_status TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insurance policies table
CREATE TABLE IF NOT EXISTS insurance_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    policy_type TEXT NOT NULL,
    policy_number TEXT UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    premium_amount DECIMAL(10,2) NOT NULL,
    coverage_amount DECIMAL(10,2),
    status TEXT DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    policy_id INTEGER NOT NULL,
    claim_date DATE NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    amount DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (policy_id) REFERENCES insurance_policies(id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
); 