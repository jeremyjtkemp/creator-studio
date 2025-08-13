import { db, storage } from './firebase'
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  doc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'

export type AssetType = 'hook-visual' | 'demo-video' | 'image' | 'music' | 'other'

export type Asset = {
  id: string
  userId: string
  projectId: string
  type: AssetType
  name: string
  fileName: string
  fileSize: number
  duration?: number
  thumbnailUrl?: string
  downloadUrl: string
  storagePath: string
  tags: string[]
  metadata: Record<string, any>
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type CreateAssetData = {
  type: AssetType
  name: string
  fileName: string
  fileSize: number
  duration?: number
  thumbnailUrl?: string
  tags?: string[]
  metadata?: Record<string, any>
}

// Get all assets for a project grouped by type
export async function getProjectAssets(userId: string, projectId: string): Promise<Record<AssetType, Asset[]>> {
  try {
    console.log('📁 Fetching all assets for project:', projectId)

    const assetsRef = collection(db, 'assets')
    const q = query(
      assetsRef,
      where('userId', '==', userId),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    console.log('Found', snapshot.docs.length, 'project-specific assets')

    const assets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Asset[]

    // Group assets by type
    const groupedAssets: Record<AssetType, Asset[]> = {
      'hook-visual': [],
      'demo-video': [],
      'image': [],
      'music': [],
      'other': []
    }

    assets.forEach(asset => {
      if (groupedAssets[asset.type]) {
        groupedAssets[asset.type].push(asset)
      } else {
        groupedAssets.other.push(asset)
      }
    })

    console.log('📊 Project assets by type:', Object.fromEntries(
      Object.entries(groupedAssets).map(([type, assets]) => [type, assets.length])
    ))

    return groupedAssets
  } catch (error: any) {
    console.error('Error fetching project assets:', error)
    throw error
  }
}

// Get global music assets (accessible across all projects)
export async function getGlobalMusicAssets(userId: string): Promise<Asset[]> {
  try {
    console.log('🎵 Fetching global music assets for user:', userId)

    const assetsRef = collection(db, 'assets')
    const q = query(
      assetsRef,
      where('userId', '==', userId),
      where('type', '==', 'music'),
      where('projectId', '==', null), // Global assets have no projectId
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    console.log('Found', snapshot.docs.length, 'global music assets')

    const musicAssets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Asset[]

    return musicAssets
  } catch (error: any) {
    console.error('Error fetching global music assets:', error)
    throw error
  }
}

// Get combined assets (project-specific + global music)
export async function getCombinedAssets(userId: string, projectId: string): Promise<Record<AssetType, Asset[]>> {
  try {
    const [projectAssets, globalMusic] = await Promise.all([
      getProjectAssets(userId, projectId),
      getGlobalMusicAssets(userId)
    ])

    // Combine project music with global music
    const combinedAssets = {
      ...projectAssets,
      music: [...(projectAssets.music || []), ...globalMusic]
    }

    console.log('🎼 Combined music assets:', combinedAssets.music.length)
    return combinedAssets
  } catch (error: any) {
    console.error('Error fetching combined assets:', error)
    throw error
  }
}

// Upload an asset file
export async function uploadAsset(
  userId: string,
  projectId: string | null,
  file: File,
  assetData: CreateAssetData
): Promise<string> {
  try {
    console.log('📤 Uploading asset to Firebase Storage...')
    console.log('📂 Type:', assetData.type)
    console.log('📄 File:', file.name, file.size, 'bytes')
    console.log('🌍 Global:', projectId === null)

    // Create storage path - global assets go to a global folder
    const timestamp = Date.now()
    const basePath = projectId ? `assets/${userId}/${projectId}` : `assets/${userId}/global`
    const storagePath = `${basePath}/${assetData.type}_${timestamp}_${file.name}`
    const storageRef = ref(storage, storagePath)

    console.log('📍 Storage path:', storagePath)

    // Upload file to Firebase Storage
    const uploadResult = await uploadBytes(storageRef, file)
    console.log('✅ File uploaded successfully')

    // Get download URL
    const downloadUrl = await getDownloadURL(uploadResult.ref)
    console.log('🔗 Download URL generated')

    // Save metadata to Firestore
    const assetsRef = collection(db, 'assets')
    const docData = {
      ...assetData,
      userId,
      projectId, // Can be null for global assets
      downloadUrl,
      storagePath,
      tags: assetData.tags || [],
      metadata: assetData.metadata || {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    console.log('💾 Saving metadata to Firestore')
    const docRef = await addDoc(assetsRef, docData)
    console.log('✅ Asset document created with ID:', docRef.id)

    return docRef.id
  } catch (error: any) {
    console.error('❌ Error uploading asset:', error)
    throw error
  }
}

// Upload global music asset (accessible across all projects)
export async function uploadGlobalMusicAsset(
  userId: string,
  file: File,
  assetData: Omit<CreateAssetData, 'type'>
): Promise<string> {
  return uploadAsset(userId, null, file, {
    ...assetData,
    type: 'music'
  })
}

// Delete an asset
export async function deleteAsset(assetId: string): Promise<void> {
  try {
    console.log('🗑️ Deleting asset:', assetId)
    
    // First, get the asset document to retrieve storage path
    const assetRef = doc(db, 'assets', assetId)
    const assetDoc = await getDoc(assetRef)
    
    if (!assetDoc.exists()) {
      throw new Error('Asset not found')
    }
    
    const assetData = assetDoc.data()
    console.log('📄 Asset data retrieved:', {
      name: assetData.name,
      type: assetData.type,
      storagePath: assetData.storagePath
    })
    
    // Delete the file from Firebase Storage if storage path exists
    if (assetData.storagePath) {
      try {
        console.log('🗂️ Deleting file from storage:', assetData.storagePath)
        const storageRef = ref(storage, assetData.storagePath)
        await deleteObject(storageRef)
        console.log('✅ File deleted from storage')
      } catch (storageError: any) {
        // Don't fail the entire operation if storage deletion fails
        console.warn('⚠️ Failed to delete file from storage (continuing):', storageError.message)
      }
    }
    
    // Delete the document from Firestore
    await deleteDoc(assetRef)
    console.log('✅ Asset document deleted from Firestore')
    
    console.log('🎉 Asset deleted successfully')
  } catch (error: any) {
    console.error('❌ Error deleting asset:', error)
    throw error
  }
}

// Helper function to get asset type from file
export function getAssetTypeFromFile(file: File): AssetType {
  const type = file.type.toLowerCase()
  
  if (type.startsWith('video/')) {
    return 'demo-video' // Default to demo-video, can be changed by user
  } else if (type.startsWith('image/')) {
    return 'image'
  } else if (type.startsWith('audio/')) {
    return 'music'
  } else {
    return 'other'
  }
}

// Helper function to validate file based on asset type
export function validateAssetFile(file: File, assetType: AssetType): { valid: boolean; error?: string } {
  const maxSize = 200 * 1024 * 1024 // 200MB

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 200MB'
    }
  }

  switch (assetType) {
    case 'hook-visual':
    case 'demo-video':
      if (!file.type.startsWith('video/')) {
        return {
          valid: false,
          error: 'Please upload a video file for this asset type'
        }
      }
      break
    case 'image':
      if (!file.type.startsWith('image/')) {
        return {
          valid: false,
          error: 'Please upload an image file for this asset type'
        }
      }
      break
    case 'music':
      if (!file.type.startsWith('audio/')) {
        return {
          valid: false,
          error: 'Please upload an audio file for this asset type'
        }
      }
      break
  }

  return { valid: true }
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Helper function to format duration
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return 'Unknown'
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Get audio file duration
export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio')
    
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration)
    })
    
    audio.addEventListener('error', () => {
      reject(new Error('Failed to load audio file'))
    })
    
    audio.src = URL.createObjectURL(file)
  })
}

// Validate audio file for music upload
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024 // 50MB for music files
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac']

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Audio file must be less than 50MB'
    }
  }

  if (!allowedTypes.some(type => file.type.includes(type.split('/')[1]))) {
    return {
      valid: false,
      error: 'Please upload MP3, WAV, M4A, or AAC audio files'
    }
  }

  return { valid: true }
}

// Music energy/mood categories for better organization
export const MUSIC_CATEGORIES = {
  energy: ['High', 'Medium', 'Low', 'Ambient'],
  mood: ['Upbeat', 'Motivational', 'Chill', 'Epic', 'Emotional', 'Fun'],
  genre: ['Electronic', 'Hip Hop', 'Rock', 'Pop', 'Ambient', 'Cinematic']
}
