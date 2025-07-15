import { useState, useEffect, useCallback } from 'react'

interface FreemiumUsage {
  dailyLimit: number
  projectsToday: number
  remainingProjects: number
  canCreateProject: boolean
  percentageUsed: number
}

interface UsageStats {
  daily_limit: number
  projects_today: number
  remaining_projects: number
  can_create_project: boolean
}

export function useFreemiumUsage() {
  const [usage, setUsage] = useState<FreemiumUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/usage/check-limit')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch usage: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        const stats: UsageStats = result.data
        
        setUsage({
          dailyLimit: stats.daily_limit,
          projectsToday: stats.projects_today,
          remainingProjects: stats.remaining_projects,
          canCreateProject: stats.can_create_project,
          percentageUsed: stats.daily_limit > 0 ? (stats.projects_today / stats.daily_limit) * 100 : 0
        })
      } else {
        throw new Error(result.error || 'Failed to fetch usage data')
      }
    } catch (err) {
      console.error('Error fetching freemium usage:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const incrementUsage = useCallback(() => {
    if (usage) {
      setUsage(prev => prev ? {
        ...prev,
        projectsToday: prev.projectsToday + 1,
        remainingProjects: Math.max(0, prev.remainingProjects - 1),
        canCreateProject: prev.remainingProjects > 1,
        percentageUsed: prev.dailyLimit > 0 ? ((prev.projectsToday + 1) / prev.dailyLimit) * 100 : 0
      } : null)
    }
  }, [usage])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  return {
    usage,
    loading,
    error,
    refetch: fetchUsage,
    incrementUsage
  }
} 