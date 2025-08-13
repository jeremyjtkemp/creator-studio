import { db } from './firebase'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import type { HookVisual } from './hook-visuals'

// Migrate hook visuals to the unified assets collection
export async function migrateHookVisualsToAssets(userId: string, projectId: string): Promise<void> {
  try {
    console.log('🔄 Migrating hook visuals to assets collection...')

    // Get existing hook visuals
    const hookVisualsRef = collection(db, 'hookVisuals')
    const q = query(
      hookVisualsRef,
      where('userId', '==', userId),
      where('projectId', '==', projectId)
    )

    const snapshot = await getDocs(q)
    const hookVisuals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HookVisual[]

    console.log(`📊 Found ${hookVisuals.length} hook visuals to migrate`)

    // Migrate each hook visual to assets collection
    const assetsRef = collection(db, 'assets')
    
    for (const hookVisual of hookVisuals) {
      const assetData = {
        userId: hookVisual.userId,
        projectId: hookVisual.projectId,
        type: 'hook-visual' as const,
        name: hookVisual.name,
        fileName: hookVisual.fileName,
        fileSize: hookVisual.fileSize,
        duration: hookVisual.duration,
        thumbnailUrl: hookVisual.thumbnailUrl,
        downloadUrl: hookVisual.videoUrl,
        storagePath: hookVisual.storagePath,
        tags: ['hook', 'migrated'],
        metadata: {
          migratedFrom: 'hookVisuals',
          originalId: hookVisual.id
        },
        createdAt: hookVisual.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await addDoc(assetsRef, assetData)
      console.log(`✅ Migrated hook visual: ${hookVisual.name}`)
    }

    console.log('🎉 Migration completed successfully')
  } catch (error: any) {
    console.error('❌ Error migrating hook visuals:', error)
    throw error
  }
}
