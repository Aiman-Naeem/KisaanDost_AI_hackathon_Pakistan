# KisaanDost_AI_hackathon_Pakistan
This is a project for Fakistan's first AI Hackathon by Alkhidmat Foundation in collaboration with Alibaba cloud.

## Day 5 Backend Switchover

When the backend is ready for integration, follow these steps to switch from mock data to real API calls:

### Step 1: Update the API Base URL
Edit `frontend/.env` and replace the placeholder URL with your backend's address:

```env
# For local development:
API_BASE_URL=http://localhost:3000

# For ngrok tunnel (if using):
API_BASE_URL=https://abc123.ngrok.io

# For local IP access from phone:
API_BASE_URL=http://192.168.1.100:3000
```

### Step 2: Disable Mock Mode
In `frontend/services/api.ts`, change the `USE_MOCK` constant from `true` to `false`:

```typescript
const USE_MOCK = false;  // Switch to real backend
```

### Step 3: Restart the Expo Dev Server
**⚠️ Important:** Environment variables are read at Expo startup time, not hot-reloaded.
You **must** restart the dev server for changes to take effect:

```bash
cd frontend
# Stop the current Expo server (Ctrl+C)
npm start
```

Then reload the app on your device/emulator.

### Verification
- Check the console log on app startup: `[api.ts] Configured API_BASE_URL: <your-url>`
- Confirm Voice Assistant and Marketplace features connect to your backend
- Monitor network requests in your backend logs

See `kisaandost-api-contract.md` for the full API contract and endpoint specifications.

