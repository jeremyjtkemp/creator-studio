import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useProjects } from '@/lib/project-context'
import { useAssets } from '@/lib/assets-context'
import { migrateHookVisualsToAssets } from '@/lib/migrate-hook-visuals'
import { RefreshCw, Database } from 'lucide-react'

export function MigrateAssetsButton() {
  const { user } = useAuth()
  const { currentProject } = useProjects()
  const { refreshAssets } = useAssets()
  const [migrating, setMigrating] = useState(false)

  const handleMigration = async () => {
    if (!user || !currentProject) {
      alert('Please ensure you have a project selected')
      return
    }

    if (!confirm('This will migrate your existing hook visuals to the assets collection. Continue?')) {
      return
    }

    setMigrating(true)
    try {
      console.log('🔄 Starting migration...')
      await migrateHookVisualsToAssets(user.uid, currentProject.id)
      console.log('✅ Migration completed')
      
      // Refresh assets to show migrated items
      refreshAssets()
      
      alert('Migration completed successfully! Your assets should now appear.')
    } catch (error: any) {
      console.error('❌ Migration failed:', error)
      alert(`Migration failed: ${error.message}`)
    } finally {
      setMigrating(false)
    }
  }

  if (!user || !currentProject) {
    return null
  }

  return (
    <Button 
      onClick={handleMigration}
      disabled={migrating}
      variant="outline"
      size="sm"
      className="flex items-center space-x-2"
    >
      {migrating ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : (
        <Database className="w-4 h-4" />
      )}
      <span>{migrating ? 'Migrating...' : 'Migrate Old Assets'}</span>
    </Button>
  )
}
