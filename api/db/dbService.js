const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const dbPath = path.join(__dirname, 'data', 'laurent_agency.db');
const db = new sqlite3.Database(dbPath);

// User Authentication
const authService = {
    async registerUser(userData) {
        const { email, password, full_name, phone } = userData;
        const passwordHash = await bcrypt.hash(password, 10);
        
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (email, password_hash, full_name, phone) 
                 VALUES (?, ?, ?, ?)`,
                [email, passwordHash, full_name, phone],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    },

    async loginUser(email, password) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE email = ?',
                [email],
                async (err, user) => {
                    if (err) reject(err);
                    if (!user) reject(new Error('User not found'));
                    
                    const isValid = await bcrypt.compare(password, user.password_hash);
                    if (!isValid) reject(new Error('Invalid password'));
                    
                    // Update last login
                    db.run(
                        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
                        [user.id]
                    );
                    
                    // Generate JWT token
                    const token = jwt.sign(
                        { userId: user.id, email: user.email },
                        process.env.JWT_SECRET || 'your-secret-key',
                        { expiresIn: '24h' }
                    );
                    
                    resolve({ user, token });
                }
            );
        });
    }
};

// Customer Profile Management
const profileService = {
    async getProfile(userId) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT u.*, cp.* 
                 FROM users u 
                 LEFT JOIN customer_profiles cp ON u.id = cp.user_id 
                 WHERE u.id = ?`,
                [userId],
                (err, profile) => {
                    if (err) reject(err);
                    else resolve(profile);
                }
            );
        });
    },

    async updateProfile(userId, profileData) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT OR REPLACE INTO customer_profiles 
                 (user_id, address, city, state, zip_code, date_of_birth, occupation, annual_income, marital_status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    profileData.address,
                    profileData.city,
                    profileData.state,
                    profileData.zip_code,
                    profileData.date_of_birth,
                    profileData.occupation,
                    profileData.annual_income,
                    profileData.marital_status
                ],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }
};

// Policy Management
const policyService = {
    async getPolicies(userId) {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM insurance_policies WHERE user_id = ?',
                [userId],
                (err, policies) => {
                    if (err) reject(err);
                    else resolve(policies);
                }
            );
        });
    },

    async createPolicy(policyData) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO insurance_policies 
                 (user_id, policy_type, policy_number, start_date, end_date, premium_amount, coverage_amount)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    policyData.user_id,
                    policyData.policy_type,
                    policyData.policy_number,
                    policyData.start_date,
                    policyData.end_date,
                    policyData.premium_amount,
                    policyData.coverage_amount
                ],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }
};

// Claims Management
const claimsService = {
    async getClaims(userId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT c.*, p.policy_type, p.policy_number 
                 FROM claims c 
                 JOIN insurance_policies p ON c.policy_id = p.id 
                 WHERE c.user_id = ?`,
                [userId],
                (err, claims) => {
                    if (err) reject(err);
                    else resolve(claims);
                }
            );
        });
    },

    async createClaim(claimData) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO claims 
                 (user_id, policy_id, claim_date, description, amount)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    claimData.user_id,
                    claimData.policy_id,
                    claimData.claim_date,
                    claimData.description,
                    claimData.amount
                ],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }
};

// Document Management
const documentService = {
    async getDocuments(userId) {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM documents WHERE user_id = ?',
                [userId],
                (err, documents) => {
                    if (err) reject(err);
                    else resolve(documents);
                }
            );
        });
    },

    async addDocument(documentData) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO documents 
                 (user_id, document_type, file_path)
                 VALUES (?, ?, ?)`,
                [
                    documentData.user_id,
                    documentData.document_type,
                    documentData.file_path
                ],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }
};

// Audit Logging
const auditService = {
    async logAction(userId, action, details, ipAddress) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO audit_log 
                 (user_id, action, details, ip_address)
                 VALUES (?, ?, ?, ?)`,
                [userId, action, details, ipAddress],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }
};

module.exports = {
    authService,
    profileService,
    policyService,
    claimsService,
    documentService,
    auditService
}; 