require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const { 
    authService, 
    profileService, 
    policyService, 
    claimsService, 
    documentService,
    auditService 
} = require('./db/dbService');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const userId = await authService.registerUser(req.body);
        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Protected routes
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const profile = await profileService.getProfile(req.user.userId);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        await profileService.updateProfile(req.user.userId, req.body);
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/policies', authenticateToken, async (req, res) => {
    try {
        const policies = await policyService.getPolicies(req.user.userId);
        res.json(policies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/policies', authenticateToken, async (req, res) => {
    try {
        const policyData = { ...req.body, user_id: req.user.userId };
        const policyId = await policyService.createPolicy(policyData);
        res.status(201).json({ message: 'Policy created successfully', policyId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/claims', authenticateToken, async (req, res) => {
    try {
        const claims = await claimsService.getClaims(req.user.userId);
        res.json(claims);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/claims', authenticateToken, async (req, res) => {
    try {
        const claimData = { ...req.body, user_id: req.user.userId };
        const claimId = await claimsService.createClaim(claimData);
        res.status(201).json({ message: 'Claim created successfully', claimId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/documents', authenticateToken, async (req, res) => {
    try {
        const documents = await documentService.getDocuments(req.user.userId);
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/documents', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const documentData = {
            user_id: req.user.userId,
            document_type: req.body.document_type,
            file_path: req.file.path
        };
        const documentId = await documentService.addDocument(documentData);
        res.status(201).json({ message: 'Document uploaded successfully', documentId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 