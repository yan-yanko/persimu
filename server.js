const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data storage
const DATA_DIR = path.join(__dirname, 'data');
const PERSONAS_FILE = path.join(DATA_DIR, 'personas.json');
const SIMULATIONS_FILE = path.join(DATA_DIR, 'simulations.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR);
    }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Simple authentication (replace with proper authentication in production)
    if (username === 'admin' && password === 'admin') {
        const token = jwt.sign({ username }, process.env.JWT_SECRET || 'your-secret-key');
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

// Persona routes
app.get('/api/personas', authenticateToken, async (req, res) => {
    try {
        const data = await fs.readFile(PERSONAS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.json([]);
        } else {
            throw error;
        }
    }
});

app.get('/api/personas/:id', authenticateToken, async (req, res) => {
    try {
        const data = await fs.readFile(PERSONAS_FILE, 'utf8');
        const personas = JSON.parse(data);
        const persona = personas.find(p => p.id === req.params.id);
        
        if (!persona) {
            return res.status(404).json({ error: 'Persona not found' });
        }
        
        res.json(persona);
    } catch (error) {
        throw error;
    }
});

app.post('/api/personas', authenticateToken, async (req, res) => {
    try {
        const data = await fs.readFile(PERSONAS_FILE, 'utf8');
        const personas = JSON.parse(data);
        const newPersona = {
            id: Date.now().toString(),
            ...req.body
        };
        
        personas.push(newPersona);
        await fs.writeFile(PERSONAS_FILE, JSON.stringify(personas, null, 2));
        
        res.status(201).json(newPersona);
    } catch (error) {
        throw error;
    }
});

app.put('/api/personas/:id', authenticateToken, async (req, res) => {
    try {
        const data = await fs.readFile(PERSONAS_FILE, 'utf8');
        const personas = JSON.parse(data);
        const index = personas.findIndex(p => p.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Persona not found' });
        }
        
        personas[index] = { ...personas[index], ...req.body };
        await fs.writeFile(PERSONAS_FILE, JSON.stringify(personas, null, 2));
        
        res.json(personas[index]);
    } catch (error) {
        throw error;
    }
});

app.delete('/api/personas/:id', authenticateToken, async (req, res) => {
    try {
        const data = await fs.readFile(PERSONAS_FILE, 'utf8');
        const personas = JSON.parse(data);
        const filteredPersonas = personas.filter(p => p.id !== req.params.id);
        
        if (filteredPersonas.length === personas.length) {
            return res.status(404).json({ error: 'Persona not found' });
        }
        
        await fs.writeFile(PERSONAS_FILE, JSON.stringify(filteredPersonas, null, 2));
        res.status(204).send();
    } catch (error) {
        throw error;
    }
});

// Simulation routes
app.get('/api/simulations', authenticateToken, async (req, res) => {
    try {
        const data = await fs.readFile(SIMULATIONS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.json([]);
        } else {
            throw error;
        }
    }
});

app.get('/api/simulations/:id', authenticateToken, async (req, res) => {
    try {
        const data = await fs.readFile(SIMULATIONS_FILE, 'utf8');
        const simulations = JSON.parse(data);
        const simulation = simulations.find(s => s.id === req.params.id);
        
        if (!simulation) {
            return res.status(404).json({ error: 'Simulation not found' });
        }
        
        res.json(simulation);
    } catch (error) {
        throw error;
    }
});

app.post('/api/simulations', authenticateToken, async (req, res) => {
    try {
        const data = await fs.readFile(SIMULATIONS_FILE, 'utf8');
        const simulations = JSON.parse(data);
        const newSimulation = {
            id: Date.now().toString(),
            ...req.body
        };
        
        simulations.push(newSimulation);
        await fs.writeFile(SIMULATIONS_FILE, JSON.stringify(simulations, null, 2));
        
        res.status(201).json(newSimulation);
    } catch (error) {
        throw error;
    }
});

// Language model communication
app.post('/api/language-model', authenticateToken, async (req, res) => {
    // Mock response for development
    res.json({
        response: 'This is a mock response from the language model',
        timestamp: new Date().toISOString()
    });
});

// Start server
async function startServer() {
    try {
        await ensureDataDir();
        
        // Create empty files if they don't exist
        try {
            await fs.access(PERSONAS_FILE);
        } catch {
            await fs.writeFile(PERSONAS_FILE, '[]');
        }
        
        try {
            await fs.access(SIMULATIONS_FILE);
        } catch {
            await fs.writeFile(SIMULATIONS_FILE, '[]');
        }
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer(); 