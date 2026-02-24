import React, { useState, useEffect } from 'react'

// Shopify API helper
const SHOPIFY_DOMAIN = 'msreadshop.myshopify.com'
const API_VERSION = '2024-01'

const shopifyFetch = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('shopifyToken') || prompt('Enter your Shopify Admin API Access Token:')
  if (!token) return null
  
  localStorage.setItem('shopifyToken', token)
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': token
  }
  
  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)
  
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/${API_VERSION}/${endpoint}`, options)
  return res.json()
}

// Generate SEO description using simple template (can be enhanced with AI)
const generateSEODescription = (product) => {
  const { title, vendor = 'MS READ', product_type = '', tags = [] } = product
  
  const typeLabel = product_type || 'fashion'
  const isKurung = title.toLowerCase().includes('kurung') || title.toLowerCase().includes('baju')
  const isRaya = title.toLowerCase().includes('raya')
  
  let description = `# ${title}\n\n`
  description += `Elevate your style with our ${title}, from MS READ. `
  description += `Crafted with premium quality fabric, this piece is designed for the modern woman who values both comfort and elegance.\n\n`
  
  description += `## Perfect For\n`
  if (isRaya) description += `- Hari Raya celebrations\n`
  description += `- Wedding events\n`
  description += `- Formal gatherings\n`
  description += `- Office wear\n\n`
  
  description += `## Key Features\n`
  description += `✓ Premium quality fabric\n`
  description += `✓ Comfortable fit for plus-size figures (Size 12-22+)\n`
  description += `✓ Available in multiple sizes\n`
  description += `✓ Malaysian fashion excellence\n\n`
  
  description += `## Styling Tips\n`
  description += `Pair this piece with heels and minimal accessories for a refined look. Perfect for Raya celebrations, weddings, or formal events.\n\n`
  
  description += `## Care Instructions\n`
  description += `Gentle machine wash recommended. Do not bleach. Iron on low heat.\n\n---\n\n`
  
  description += `# ${typeLabel} Malaysia | Baju Kurung Moden | Plus Size Fashion Malaysia\n\n`
  description += `Tags: ${typeLabel}, malay fashion, plus size women, hari raya outfit, malaysian designer, MS READ`
  
  return description
}

function App() {
  const [products, setProducts] = useState([])
  const [pendingItems, setPendingItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('list') // list, approve, edit
  const [selectedItem, setSelectedItem] = useState(null)
  const [editedDescription, setEditedDescription] = useState('')
  const [message, setMessage] = useState('')

  // Load products on mount
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      // Get products with descriptions
      const data = await shopifyFetch('products.json?limit=50')
      if (data && data.products) {
        setProducts(data.products)
        
        // Find products that need SEO optimization
        // (short descriptions or missing SEO content)
        const needsSEO = data.products.filter(p => {
          const desc = p.body_html || ''
          return desc.length < 200 || !desc.includes('MS READ')
        })
        setPendingItems(needsSEO)
      }
    } catch (err) {
      setMessage('Error loading products: ' + err.message)
    }
    setLoading(false)
  }

  const generateSEO = async (product) => {
    const seo = generateSEODescription(product)
    setSelectedItem({ ...product, seoDescription: seo })
    setEditedDescription(seo)
    setView('edit')
  }

  const handleApprove = async () => {
    setLoading(true)
    try {
      await shopifyFetch(`products/${selectedItem.id}.json`, 'PUT', {
        product: {
          body_html: editedDescription
        }
      })
      setMessage(`✅ Updated ${selectedItem.title}!`)
      
      // Remove from pending
      setPendingItems(pendingItems.filter(p => p.id !== selectedItem.id))
      setView('list')
    } catch (err) {
      setMessage('Error updating: ' + err.message)
    }
    setLoading(false)
  }

  // Render views
  if (view === 'edit') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>🔍 SEO Review: {selectedItem?.title}</h1>
          <button onClick={() => setView('list')} style={styles.backBtn}>← Back</button>
        </div>
        
        <div style={styles.editContainer}>
          <div style={styles.productInfo}>
            <strong>SKU:</strong> {selectedItem?.variants?.[0]?.sku || 'N/A'}
          </div>
          
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            style={styles.textarea}
            rows={20}
          />
          
          <div style={styles.buttonRow}>
            <button onClick={() => setView('list')} style={styles.cancelBtn}>Cancel</button>
            <button onClick={handleApprove} disabled={loading} style={styles.approveBtn}>
              {loading ? 'Updating...' : '✅ Approve & Update Shopify'}
            </button>
          </div>
        </div>
        
        {message && <div style={styles.message}>{message}</div>}
      </div>
    )
  }

  // Main list view
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🛍️ Ms Read SEO Optimizer</h1>
        <button onClick={loadProducts} style={styles.refreshBtn}>🔄 Refresh</button>
      </div>
      
      {message && <div style={styles.message}>{message}</div>}
      
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{products.length}</div>
          <div>Total Products</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{pendingItems.length}</div>
          <div>Need SEO</div>
        </div>
      </div>
      
      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : (
        <div style={styles.grid}>
          {pendingItems.map(product => (
            <div key={product.id} style={styles.card}>
              <div style={styles.cardTitle}>{product.title}</div>
              <div style={styles.cardSku}>SKU: {product.variants?.[0]?.sku || 'N/A'}</div>
              <div style={styles.cardDesc}>
                {product.body_html?.replace(/<[^>]*>/g, '').slice(0, 80)}...
              </div>
              <button 
                onClick={() => generateSEO(product)}
                style={styles.generateBtn}
              >
                ✨ Generate SEO
              </button>
            </div>
          ))}
          
          {pendingItems.length === 0 && (
            <div style={styles.empty}>
              🎉 All products have SEO descriptions!
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  backBtn: {
    padding: '10px 20px',
    background: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  refreshBtn: {
    padding: '10px 20px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  stats: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    padding: '20px 40px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2196F3'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  cardSku: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '8px'
  },
  cardDesc: {
    color: '#888',
    fontSize: '13px',
    marginBottom: '16px'
  },
  generateBtn: {
    width: '100%',
    padding: '12px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  editContainer: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  productInfo: {
    marginBottom: '16px',
    padding: '12px',
    background: '#f0f0f0',
    borderRadius: '8px'
  },
  textarea: {
    width: '100%',
    padding: '16px',
    fontSize: '14px',
    fontFamily: 'monospace',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '16px',
    resize: 'vertical'
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  cancelBtn: {
    padding: '12px 24px',
    background: '#999',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  approveBtn: {
    padding: '12px 24px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  empty: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '40px',
    color: '#4CAF50',
    fontSize: '18px'
  },
  message: {
    padding: '16px',
    background: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '8px',
    marginBottom: '20px'
  }
}

export default App
