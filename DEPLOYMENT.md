# Cadence Base - Deployment Guide

## Prerequisites

1. **Deploy Smart Contract**
   - Navigate to `contracts/` directory
   - Update `.env` with your private key and Base RPC URL
   - Run: `npx hardhat run scripts/deploy.js --network base`
   - Copy the deployed contract address

2. **Update Environment Variables**
   - Copy `frontend-vite/.env.example` to `frontend-vite/.env`
   - Set `VITE_VAULT_ADDRESS` to your deployed contract address
   - Generate a `CRON_SECRET` for Vercel cron jobs

## Vercel Deployment

### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository

### Step 2: Configure Build Settings
Vercel should auto-detect the configuration from `vercel.json`, but verify:
- **Framework Preset**: Other
- **Build Command**: `cd frontend-vite && npm run build`
- **Output Directory**: `frontend-vite/dist`
- **Install Command**: `cd frontend-vite && npm install`

### Step 3: Add Environment Variables
In Vercel Project Settings → Environment Variables, add:
- `VITE_VAULT_ADDRESS`: Your deployed vault contract address
- `CRON_SECRET`: A secure random string for cron authentication

### Step 4: Deploy
Click "Deploy" and wait for the build to complete.

### Step 5: Configure Farcaster Manifest
1. Once deployed, note your Vercel URL (e.g., `cadence-base.vercel.app`)
2. Update `frontend-vite/public/.well-known/farcaster.json`:
   - Replace all instances of `cadence-base.vercel.app` with your actual domain
3. Go to [Base Build Account Association Tool](https://www.base.dev/preview?tab=account)
4. Enter your domain and follow instructions to generate `accountAssociation` credentials
5. Update the `accountAssociation` fields in `farcaster.json`
6. Commit and push changes to trigger a new deployment

## Verification

### Test Manifest
1. Visit `https://your-domain.vercel.app/.well-known/farcaster.json`
2. Verify it returns valid JSON with your manifest

### Test Frame Metadata
1. Use [Farcaster Frame Debugger](https://warpcast.com/~/developers/frames)
2. Enter your domain URL
3. Verify all metadata is correctly displayed

### Test Mini App
1. Go to [Base Preview Tool](https://www.base.dev/preview)
2. Enter your app URL
3. Click the launch button to test the Mini App

## Post-Deployment

### Update Images
Replace the placeholder SVG images in `frontend-vite/public/` with proper PNG/JPG images:
- `icon.png` (512x512px)
- `splash.png` (1080x1920px)
- `og-image.png` (1200x630px)
- `frame-image.png` (1200x630px, aspect ratio 1.91:1)
- `screenshot1.png`, `screenshot2.png`, `screenshot3.png` (app screenshots)

### Submit to Farcaster
1. Ensure all metadata is correct
2. Test the Mini App thoroughly
3. Submit your Mini App for review via Farcaster's submission process

## Troubleshooting

### Manifest Not Found
- Verify `/.well-known/farcaster.json` is accessible
- Check Vercel rewrites in `vercel.json`
- Ensure CORS headers are set correctly

### Blank Screen
- Check browser console for errors
- Verify `VITE_VAULT_ADDRESS` is set
- Ensure wallet is connected to Base network

### Contract Errors
- Verify contract is deployed to Base
- Check contract address in `.env`
- Ensure USDC address is correct for Base network

## Support

For issues, check:
- [Farcaster Mini Apps Docs](https://miniapps.farcaster.xyz/)
- [Base Mini Apps Docs](https://docs.base.org/mini-apps/)
- [Vercel Documentation](https://vercel.com/docs)
