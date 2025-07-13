// Clear corrupted browser cache for SDLC platform
// Run this in browser console if you encounter "Unexpected end of JSON input" errors

function clearSDLCCache() {
  console.log('🧹 Clearing SDLC browser cache...')
  
  let cleared = 0
  
  // Clear localStorage items related to SDLC
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key && (key.includes('sdlc-cache') || key.includes('integrationConfigs'))) {
      try {
        localStorage.removeItem(key)
        cleared++
        console.log(`✅ Removed: ${key}`)
      } catch (error) {
        console.warn(`⚠️ Failed to remove: ${key}`, error)
      }
    }
  }
  
  // Clear sessionStorage items
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i)
    if (key && key.includes('sdlc')) {
      try {
        sessionStorage.removeItem(key)
        cleared++
        console.log(`✅ Removed from session: ${key}`)
      } catch (error) {
        console.warn(`⚠️ Failed to remove from session: ${key}`, error)
      }
    }
  }
  
  console.log(`🎯 Cache cleared! Removed ${cleared} items.`)
  console.log('🔄 Please refresh the page to continue.')
  
  return cleared
}

// Auto-run if this script is executed
if (typeof window !== 'undefined') {
  console.log('🚀 SDLC Cache Cleaner loaded. Run clearSDLCCache() to clear corrupted cache.')
} 