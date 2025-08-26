/**
 * Minimal fix for the specific sequence diagram issues
 * Only fixes the actual problems without breaking anything else
 */

export function fixSequenceMinimal(content: string): string {
  let fixed = content
  
  // Only fix the specific known issues:
  
  // 1. Fix "Publish: OrderCreated  par Event Processing"
  fixed = fixed.replace(/:\s*"Publish:\s*OrderCreated\s+par\s+Event\s+Processing"/g, ': "Publish: OrderCreated"\n    par Event Processing')
  
  // 2. Fix "Cart cleared  and" pattern
  fixed = fixed.replace(/:\s*"([^"]+?)\s\s+and"/g, ': "$1"\n    and')
  
  // 3. Fix "Validate order  par Check Inventory"
  fixed = fixed.replace(/:\s*"Validate\s+order\s+par\s+Check\s+Inventory"/g, ': "Validate order"\n    par Check Inventory')
  
  // 4. Fix "Items available  and Process Payment"
  fixed = fixed.replace(/:\s*"Items\s+available\s+and\s+Process\s+Payment"/g, ': "Items available"\n    and Process Payment')
  
  // 5. Ensure 'end' keyword is on its own line after "Inventory updated"
  fixed = fixed.replace(/"Inventory\s+updated"\s*\n\s*end/g, '"Inventory updated"\n    end')
  
  // 6. Ensure 'end' keyword is on its own line after "Payment success"
  fixed = fixed.replace(/"Payment\s+success"\s*\n\s*end/g, '"Payment success"\n    end')
  
  // If still having issues with end keyword placement
  // This is a more general fix but only for the specific case where end follows a closing quote
  fixed = fixed.replace(/"\s*\n\s*end\s+([A-Z])/g, '"\n    end\n    $1')
  
  return fixed
}