# 🔐 Environment Variables Documentation

This document explains all environment variables required to run the Skill2Career application and how to configure them for different environments.

---

## 📋 Table of Contents

- [Quick Setup](#quick-setup)
- [Flask & Security](#flask--security)
- [Database Configuration](#database-configuration)
- [AI Integration](#ai-integration)
- [Environment Profiles](#environment-profiles)
- [Secrets Management](#secrets-management)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Setup

### Step 1: Copy Template

```bash
cd backend
cp .env.example .env
```

### Step 2: Generate Secrets

```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate JWT_SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate ADMIN_KEY (for admin endpoints)
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 3: Obtain API Keys

- **MongoDB URI**: Get from [MongoDB Atlas](https://cloud.mongodb.com)
- **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Step 4: Populate .env

Edit `.env` file with your values:

```bash
SECRET_KEY=your_generated_secret_key
JWT_SECRET_KEY=your_generated_jwt_secret
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
GEMINI_API_KEY=your_gemini_api_key
```

### Step 5: Test Connection

```bash
python -c "from config import Config; print('✅ Config loaded successfully')"
```

---

## 🔧 Flask & Security

### SECRET_KEY

**Purpose**: Used by Flask for session management and CSRF protection.

**Type**: String (alphanumeric)

**Required**: Yes

**Generation**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Example**:
```
SECRET_KEY=xG-4K_9jL2pQ8mR5wN1oT6vZ3bC
```

**Security Notes**:
- Must be unique per environment
- Use strong random values
- Never use default or predictable values
- Rotate regularly (requires re-authentication of all users)

---

### JWT_SECRET_KEY

**Purpose**: Used to sign and verify JWT authentication tokens.

**Type**: String (alphanumeric, min 32 characters recommended)

**Required**: Yes

**Generation**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Example**:
```
JWT_SECRET_KEY=hG-8K_2jL5pQ1mR9wN4oT7vZ6bC
```

**Security Notes**:
- Critical for authentication security
- If compromised, tokens can be forged
- Rotate to invalidate all existing tokens
- Use different key per environment
- Min 32 characters recommended

### JWT Token Expiry (Optional)

**Configuration in config.py**:
```python
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
```

**Note**: Currently hardcoded; can be made configurable via env var.

---

### FLASK_ENV

**Purpose**: Determines Flask's execution mode (development/production).

**Type**: String

**Required**: No (default: development)

**Valid Values**:
- `development`: Debug mode on, auto-reload enabled, detailed error pages
- `production`: Debug mode off, error handling strict, no auto-reload

**Example**:
```
FLASK_ENV=development
```

**Behavior**:
- **Development**: 
  - Debug mode enabled
  - Auto-reloading on file changes
  - Detailed error messages
  - CORS: Allow all localhost:* origins
- **Production**:
  - Debug mode disabled
  - Strict error handling
  - CORS: Restricted to allowed origins
  - Performance optimizations

---

### ADMIN_KEY (Optional)

**Purpose**: Secure admin endpoints like viewing all users/messages.

**Type**: String (strong random)

**Required**: No (default: "zalak-portfolio-admin-secure")

**Generation**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Example**:
```
ADMIN_KEY=9_xQ5K2mL8pR1jN7oT4vZ6wC3
```

**Usage**:
```bash
# In request headers
curl -H "x-admin-key: 9_xQ5K2mL8pR1jN7oT4vZ6wC3" \
     http://localhost:5000/api/admin/users
```

**Security Notes**:
- Must be different from SECRET_KEY and JWT_SECRET_KEY
- Store securely; never hardcode in frontend
- Rotate periodically
- Consider using header-based auth or OAuth for admin panel in production

---

## 📊 Database Configuration

### MONGO_URI

**Purpose**: Connection string to MongoDB Atlas cluster.

**Type**: String (URI format)

**Required**: Yes (for production; optional for in-memory fallback mode)

**Format**:
```
mongodb+srv://username:password@cluster.mongodb.net/
```

**Steps to Get**:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign in to your account
3. Navigate to **Database Clusters**
4. Click **Connect** button
5. Choose **Drivers** → **Python**
6. Copy the connection string
7. Replace `<username>`, `<password>`, and `<password>` placeholders

**Example**:
```
MONGO_URI=mongodb+srv://zalakdoshi_app:MyP@ssw0rd@cluster0.abc123.mongodb.net/
```

**Important Notes**:
- URL must be encoded (special chars become %XX)
- If password has special characters, URL-encode them:
  - `@` → `%40`
  - `:` → `%3A`
  - `/` → `%2F`
- Include the full cluster URL with `/` at the end
- Can be left empty for in-memory development mode

**Testing Connection**:
```bash
python
>>> from config import Config
>>> from pymongo import MongoClient
>>> client = MongoClient(Config.MONGO_URI)
>>> client.admin.command('ping')
{'ok': 1.0}
```

---

### MONGO_DB_NAME

**Purpose**: Database name within MongoDB cluster.

**Type**: String

**Required**: No (default: "skill2career")

**Example**:
```
MONGO_DB_NAME=skill2career
```

**Common Values**:
- `skill2career` (production/development)
- `skill2career_dev` (development only)
- `skill2career_test` (testing)

**Note**: Database is auto-created if it doesn't exist.

---

### MongoDB Connection Troubleshooting

#### Connection Timeout
```
Error: Timeout waiting for server...
```
**Solution**:
- Check internet connection
- Verify IP is whitelisted in MongoDB Atlas (Security → IP Whitelist)
- Add `0.0.0.0/0` for development (NOT recommended for production)

#### Authentication Failed
```
Error: authentication failed
```
**Solution**:
- Verify username and password are correct
- Check for special characters (must be URL-encoded)
- Confirm user exists in MongoDB Atlas → Database Access

#### Invalid Connection String
```
Error: Invalid URI...
```
**Solution**:
- Ensure format is `mongodb+srv://...`
- Check for trailing `/`
- Copy directly from MongoDB Atlas connection string

---

## 🤖 AI Integration

### GEMINI_API_KEY

**Purpose**: API key for Google Gemini AI integration (career guidance, resume review).

**Type**: String

**Required**: Yes (for AI features; optional otherwise)

**Steps to Get**:

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click **Create API Key**
4. Copy the key (starts with `AIzaSy...`)
5. Paste into `.env`

**Example**:
```
GEMINI_API_KEY=AIzaSyAg5ZsWY9U-q80YnSujad26Iq81s5KE_Jg
```

**Rate Limits**:
- Free tier: 60 requests per minute
- Paid tier: Higher limits (varies by plan)

**Features Using This Key**:
- AI Career Recommendations
- Interview Preparation
- Resume Review
- AI Mentor Chat
- Personalized Guidance

**Handling Missing Key**:
- Backend gracefully degrades if key is missing
- AI features will return appropriate error messages
- Core recommendation engine still works

**Testing**:
```bash
python -c "import google.generativeai as genai; print('✅ Gemini API available')"
```

**Cost**:
- Free tier: 0 cost
- Paid tier: Based on token usage (very affordable)

---

## 🌍 Environment Profiles

### Development Environment

```bash
# .env.development
FLASK_ENV=development
SECRET_KEY=dev-secret-key-can-be-simple
JWT_SECRET_KEY=dev-jwt-secret-key-can-be-simple
MONGO_URI=         # Leave empty for in-memory mode
GEMINI_API_KEY=    # Leave empty (optional for dev)
```

**Characteristics**:
- Debug mode enabled
- Auto-reload on file changes
- In-memory database (no persistence)
- Detailed error pages
- All CORS origins allowed

### Staging Environment

```bash
# .env.staging
FLASK_ENV=production
SECRET_KEY=<strong-random-key>
JWT_SECRET_KEY=<strong-random-key>
MONGO_URI=mongodb+srv://staging_user:pass@staging-cluster.mongodb.net/
MONGO_DB_NAME=skill2career_staging
GEMINI_API_KEY=<actual-api-key>
```

**Characteristics**:
- Production-like setup
- Real MongoDB connection
- Debug mode off
- Restricted CORS

### Production Environment

```bash
# .env.production (on production server only)
FLASK_ENV=production
SECRET_KEY=<very-strong-random-key>
JWT_SECRET_KEY=<very-strong-random-key>
MONGO_URI=mongodb+srv://prod_user:secure_pass@prod-cluster.mongodb.net/
MONGO_DB_NAME=skill2career
GEMINI_API_KEY=<production-api-key>
ADMIN_KEY=<production-admin-key>
ALLOWED_ORIGINS=https://skill2career.vercel.app,https://www.skill2career.com
```

**Characteristics**:
- Production settings
- Security hardened
- Monitoring enabled
- Backup enabled
- High availability setup

---

## 🔐 Secrets Management

### Best Practices

1. **Never Commit .env**
   ```bash
   # Ensure .env is in .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use .env.example as Template**
   ```bash
   # Commit this to repo (without values)
   git add .env.example
   git commit -m "docs: Add .env.example template"
   ```

3. **Generate Strong Secrets**
   ```bash
   # Use cryptographically secure generation
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

4. **Separate Keys by Environment**
   - Development: Can be less strict
   - Production: Use strongest encryption
   - Staging: Similar to production

5. **Use Secrets Manager** (Production)
   - Vercel: Environment Variables dashboard
   - AWS: Secrets Manager
   - Azure: Key Vault
   - GCP: Secret Manager

### Secret Rotation

1. **Generate new SECRET_KEY**: All sessions invalidated
2. **Generate new JWT_SECRET_KEY**: All tokens invalidated (users re-login)
3. **Rotate ADMIN_KEY**: Update all admin scripts

---

## ❓ Troubleshooting

### "No module named 'config'"

**Cause**: Config file not found or path issue

**Solution**:
```bash
# Ensure you're in backend directory
cd backend

# Verify config.py exists
ls -la config.py
```

### "KeyError: 'MONGO_URI'"

**Cause**: Environment variable not loaded

**Solution**:
```bash
# Verify .env file exists
ls -la .env

# Check .env has correct format
cat .env

# Reload Flask app
python app.py
```

### "MONGO_CONNECTED = False"

**Cause**: MongoDB connection failed (normal with empty MONGO_URI)

**Solutions**:
```bash
# Option 1: Use in-memory mode (development)
# Leave MONGO_URI empty in .env

# Option 2: Fix MongoDB connection
# - Verify MONGO_URI is correct
# - Check IP whitelist in MongoDB Atlas
# - Test connection: mongosh "your-connection-string"
```

### "Invalid GEMINI_API_KEY"

**Cause**: Wrong or expired API key

**Solution**:
```bash
# Generate new key from https://aistudio.google.com/app/apikey
# Update GEMINI_API_KEY in .env
# Restart backend
```

### "CORS blocked by browser"

**Cause**: Frontend origin not in allowed list

**Solution**:
```bash
# Check ALLOWED_ORIGINS (if configured)
# Add your frontend URL:
# ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

---

## 📝 Environment Variables Checklist

### Required (Production)

- [ ] `SECRET_KEY` - Generated random key
- [ ] `JWT_SECRET_KEY` - Generated random key
- [ ] `MONGO_URI` - MongoDB connection string
- [ ] `MONGO_DB_NAME` - Database name
- [ ] `GEMINI_API_KEY` - Gemini API key
- [ ] `FLASK_ENV` - Set to "production"

### Optional (With Defaults)

- [ ] `ADMIN_KEY` - Custom admin key
- [ ] `ALLOWED_ORIGINS` - Restricted CORS origins
- [ ] `PORT` - Server port (default: 5000)

### Development Only

- [ ] `MONGO_URI` - Can be empty for in-memory mode
- [ ] `GEMINI_API_KEY` - Can be empty (features disabled)

---

## 🔗 Related Documentation

- [Backend README](../backend/README.md) - Backend setup and configuration
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)

---

## 📧 Support

If you encounter issues with environment setup, please:

1. Check this documentation
2. Review troubleshooting section
3. Check `.env.example` format
4. Open GitHub issue with `.env.example` content (no actual values)

---

**Last Updated**: October 2024
