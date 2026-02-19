# Enable GitHub Pages

Follow these steps to publish your documentation site:

## 1. Go to Repository Settings

Visit: https://github.com/gpad1234/Startup-One-Wally-Clean/settings/pages

## 2. Configure GitHub Pages

1. Under **"Build and deployment"** section:
   - **Source:** Deploy from a branch
   - **Branch:** `main`
   - **Folder:** `/docs`

2. Click **Save**

## 3. Wait for Deployment

- GitHub will build your site automatically
- This takes 1-2 minutes
- You'll see a green checkmark when ready

## 4. Access Your Documentation

Your documentation will be live at:

**https://gpad1234.github.io/Startup-One-Wally-Clean/**

## 5. Verify

Open the URL above and you should see:
- ✅ WALLY Ontology Editor homepage
- ✅ Navigation links to Features, Getting Started, etc.
- ✅ Beautiful Cayman theme applied
- ✅ Live demo badge linking to http://161.35.239.151

## Troubleshooting

If the site doesn't appear:

1. Check **Actions** tab on GitHub for build status
2. Ensure `docs/_config.yml` exists
3. Verify branch is `main` and folder is `/docs`
4. Try **Re-run jobs** in Actions if build failed

## Auto-Updates

Every time you push changes to the `docs/` folder on the `main` branch, GitHub will automatically rebuild and deploy your documentation site!

## Custom Domain (Optional)

To use a custom domain:

1. Go to Settings → Pages
2. Enter your custom domain (e.g., `wally-docs.yoursite.com`)
3. Add DNS record: `CNAME` pointing to `gpad1234.github.io`
4. Wait for DNS propagation (~24 hours)

---

**Documentation Structure:**
```
docs/
├── _config.yml          # Jekyll configuration
├── index.md             # Homepage ✅
├── features.md          # Features documentation ✅
├── getting-started.md   # Setup guide ✅
├── development.md       # Developer guide ✅
├── deployment.md        # Deployment guide ✅
├── architecture.md      # Technical architecture ✅
└── README.md            # This guide ✅
```

All ready to go! Just enable GitHub Pages in repository settings.
