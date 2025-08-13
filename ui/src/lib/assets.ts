import { db, storage } from './firebase'
import {
  collection,
  addDoc,
  getDocs,
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
    console.log('Found', snapshot.docs.length, 'assets')

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

    console.log('📊 Assets by type:', Object.fromEntries(
      Object.entries(groupedAssets).map(([type, assets]) => [type, assets.length])
    ))

    return groupedAssets
  } catch (error: any) {
    console.error('Error fetching assets:', error)
    throw error
  }
}

// Upload an asset file
export async function uploadAsset(
  userId: string,
  projectId: string,
  file: File,
  assetData: CreateAssetData
): Promise<string> {
  try {
    console.log('📤 Uploading asset to Firebase Storage...')
    console.log('📂 Type:', assetData.type)
    console.log('📄 File:', file.name, file.size, 'bytes')

    // Create storage path (asset type stored in metadata, not path)
    const timestamp = Date.now()
    const storagePath = `assets/${userId}/${projectId}/${assetData.type}_${timestamp}_${file.name}`
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
      projectId,
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

// Delete an asset
export async function deleteAsset(assetId: string): Promise<void> {
  try {
    console.log('🗑️ Deleting asset:', assetId)
    const assetRef = doc(db, 'assets', assetId)
    await deleteDoc(assetRef)
    console.log('✅ Asset deleted successfully')
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
