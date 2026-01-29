# MongoDB Connection Fix

## Issue
The backend was throwing a 500 error when trying to register users due to MongoDB connection issues.

## Root Causes
1. MongoDB might not be running
2. Connection string might be incorrect
3. Missing error handling for database operations
4. No connection verification on startup

## Fixes Applied

### 1. **Improved MongoDB Client Initialization** ✅
- Added connection pooling settings
- Added timeout configurations
- Better error handling

### 2. **Startup Connection Check** ✅
- Added `@app.on_event("startup")` to verify MongoDB connection
- Tests connection with `ping` command
- Logs connection status

### 3. **Better Error Handling** ✅
- Wrapped database operations in try-catch blocks
- Added specific error messages for database errors
- Proper HTTPException responses

### 4. **Connection Settings** ✅
- `serverSelectionTimeoutMS=5000` - Timeout for server selection
- `connectTimeoutMS=5000` - Connection timeout
- `socketTimeoutMS=5000` - Socket timeout
- `maxPoolSize=50` - Maximum connection pool size
- `minPoolSize=10` - Minimum connection pool size

## How to Verify MongoDB is Running

### On macOS (using Homebrew):
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB if not running
brew services start mongodb-community

# Or if using MongoDB Atlas, verify connection string
```

### On Linux:
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB if not running
sudo systemctl start mongod
```

### Test MongoDB Connection:
```bash
# Using mongosh (MongoDB Shell)
mongosh mongodb://localhost:27017

# Or test connection
mongosh "mongodb://localhost:27017/spareparts_hub"
```

## Environment Variables

Make sure your `.env` file has:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=spareparts_hub
```

For MongoDB Atlas (cloud):
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=spareparts_hub
```

## Testing

After starting MongoDB, restart your backend server:
```bash
cd app/backend
source env/bin/activate  # or .venv/bin/activate
uvicorn server:app --reload
```

You should see:
```
INFO: MongoDB client initialized. URL: mongodb://localhost:27017, Database: spareparts_hub
INFO: MongoDB connection established successfully
```

## Common Issues

1. **MongoDB not running**: Start MongoDB service
2. **Wrong connection string**: Check MONGO_URL in .env
3. **Firewall blocking**: Ensure port 27017 is open
4. **Authentication required**: Add username:password to connection string

---

**The MongoDB connection issues should now be resolved with better error handling and connection verification!**
