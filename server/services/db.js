/**
 * Database Service (Mock Implementation)
 */

let mockDatabase = {
    connected: false,
    collections: {
        climateData: [],
        alerts: [],
        partners: [],
        submissions: []
    }
};

async function initializeDatabase() {
    try {
        // Simulate database connection
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        mockDatabase.connected = true;
        
        console.log('✅ Mock Database initialized successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
}

function isConnected() {
    return mockDatabase.connected;
}

function getCollection(name) {
    return mockDatabase.collections[name] || [];
}

function insertDocument(collection, document) {
    if (!mockDatabase.collections[collection]) {
        mockDatabase.collections[collection] = [];
    }
    
    const doc = {
        ...document,
        _id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString()
    };
    
    mockDatabase.collections[collection].push(doc);
    return doc;
}

function findDocuments(collection, query = {}) {
    const docs = mockDatabase.collections[collection] || [];
    
    if (Object.keys(query).length === 0) {
        return docs;
    }
    
    return docs.filter(doc => {
        return Object.entries(query).every(([key, value]) => {
            return doc[key] === value;
        });
    });
}

module.exports = {
    initializeDatabase,
    isConnected,
    getCollection,
    insertDocument,
    findDocuments
};