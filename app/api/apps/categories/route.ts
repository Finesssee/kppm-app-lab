import { NextRequest, NextResponse } from 'next/server'
import { getCategories } from '@/lib/db'
import { rateLimitMiddleware } from '@/lib/rate-limit'
import { generateCorrelationId, errorResponse } from '@/lib/api-error'

async function getCategoriesHandler(_request: NextRequest) {
  const correlationId = generateCorrelationId()
  
  try {
    const categories = await getCategories()
    
    // Transform to match the expected format
    const formattedCategories = categories.map(cat => ({
      id: cat.category.toLowerCase().replace(/ /g, '-'),
      name: cat.category,
      count: cat.app_count,
      // We can add icons later or store them in the database
      icon: getIconForCategory(cat.category),
    }))
    
    return NextResponse.json({
      categories: formattedCategories,
      total: formattedCategories.length,
    }, {
      headers: {
        'X-Correlation-Id': correlationId,
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    })
    
  } catch (error) {
    return errorResponse(error, correlationId)
  }
}

// Helper function to map categories to icons
function getIconForCategory(category: string): string {
  const iconMap: Record<string, string> = {
    'Image Generation': '🎨',
    'Text Generation': '📝',
    'Audio': '🎵',
    'Video': '🎬',
    'Data Analysis': '📊',
    'Utility': '🔧',
  }
  
  return iconMap[category] || '📦'
}

export const GET = rateLimitMiddleware(getCategoriesHandler)