# Shopify SEO Auto-Optimizer

Automatically generates SEO-optimized product descriptions for your Shopify store.

## Quick Start

### 1. Get Shopify API Token

1. Go to [Shopify Admin](https://msreadshop.com/admin) → Settings → Apps and sales channels
2. Click **Develop apps** → **Create an app**
3. Name it "SEO Optimizer"
4. Configure Admin API scopes:
   - `products_read`
   - `products_write`
5. Click **Install app**
6. **Copy the access token** (shown once only)

### 2. Run the Script

```bash
# Set environment variables
export SHOPIFY_ACCESS_TOKEN="shpat_xxxxxxxxxxxxxxxxxxxx"
export SHOPIFY_STORE_URL="msreadshop.myshopify.com"

# Run once (for testing)
node shopify-seo-automation.js --once --dry-run

# Run continuously (polls every 60 seconds)
node shopify-seo-automation.js
```

## Options

| Flag | Description |
|------|-------------|
| `--once` | Run once and exit (don't poll) |
| `--dry-run` | Show what would be updated without making changes |

## Output Format

The script updates product descriptions with:

```
<p>Description</p>
<ul>
  [Original specs from product]
</ul>

<details>
  <summary><strong>Read More</strong></summary>
  
  [SEO-optimized content]
  - Product description
  - Perfect For (occasions)
  - Key Features
  - Styling Tips
  - Care Instructions
  - SEO keywords
  
</details>
```

## Features

- ✅ Preserves original product specs
- ✅ SEO content in collapsible "Read More" section
- ✅ UK 12 to UK 24 sizing
- ✅ Auto-detects product type (kurung, dress, kurti)
- ✅ Keyword-rich content for Malaysian fashion market
- ✅ Dry-run mode for safe testing

## Cron Job (Optional)

To run automatically every hour:

```bash
# Add to crontab
crontab -e

# Add line:
0 * * * * cd /Users/scottchue/.openclaw/workspace && SHOPIFY_ACCESS_TOKEN="shpat_xxx" SHOPIFY_STORE_URL="msreadshop.myshopify.com" node shopify-seo-automation.js --once >> seo.log 2>&1
```

## Troubleshooting

**"SHOPIFY_ACCESS_TOKEN not set"**
- Make sure you exported the token before running

**"Failed to parse response"**
- Check your store URL is correct
- Verify API token has correct scopes

**Products not updating**
- Run with `--dry-run` first to see what's happening
- Check `seo.log` for errors
