import { db, storage, auth } from './firebase'
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
  deleteObject,
} from 'firebase/storage'

export type HookVisual = {
  id: string
  userId: string
  projectId: string
  name: string
  fileName: string
  fileSize: number
  duration: number | null
  thumbnailUrl: string | null
  videoUrl: string
  storagePath: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type CreateHookVisualData = {
  name: string
  fileName: string
  fileSize: number
  duration?: number
  thumbnailUrl?: string
}

// Get all hook visuals for a project
export async function getProjectHookVisuals(userId: string, projectId: string): Promise<HookVisual[]> {
  try {
    console.log('Fetching hook visuals for project:', projectId)

    const hookVisualsRef = collection(db, 'hookVisuals')
    const q = query(
      hookVisualsRef,
      where('userId', '==', userId),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    console.log('Found', snapshot.docs.length, 'hook visuals')

    const hookVisuals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HookVisual[]

    console.log('Hook visuals:', hookVisuals)
    return hookVisuals
  } catch (error: any) {
    console.error('Error fetching hook visuals:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    throw error
  }
}

// Upload a hook visual file
export async function uploadHookVisual(
  userId: string,
  projectId: string,
  file: File,
  visualData: CreateHookVisualData
): Promise<string> {
  try {
    console.log('🔥 Uploading hook visual to Firebase Storage...')
    console.log('📁 User ID:', userId)
    console.log('📂 Project ID:', projectId)
    console.log('📄 File:', file.name, file.size, 'bytes')
    console.log('🌐 Firebase config:', storage.app.options)
    console.log('🔐 Auth state:', auth.currentUser ? 'Authenticated' : 'Not authenticated')
    console.log('👤 Current user:', auth.currentUser?.uid)

    // Create storage path
    const timestamp = Date.now()
    const storagePath = `hookVisuals/${userId}/${projectId}/${timestamp}_${file.name}`
    const storageRef = ref(storage, storagePath)

    // Upload file to Firebase Storage
    console.log('Uploading to storage path:', storagePath)
    const uploadResult = await uploadBytes(storageRef, file)
    console.log('File uploaded successfully')

    // Get download URL
    const videoUrl = await getDownloadURL(uploadResult.ref)
    console.log('Download URL:', videoUrl)

    // Save metadata to Firestore
    const hookVisualsRef = collection(db, 'hookVisuals')
    const docData = {
      ...visualData,
      userId,
      projectId,
      videoUrl,
      storagePath,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    console.log('Saving metadata to Firestore:', docData)
    const docRef = await addDoc(hookVisualsRef, docData)
    console.log('Hook visual document created with ID:', docRef.id)

    return docRef.id
  } catch (error: any) {
    console.error('Error uploading hook visual:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    throw error
  }
}

// Delete a hook visual
export async function deleteHookVisual(hookVisualId: string): Promise<void> {
  try {
    console.log('Deleting hook visual:', hookVisualId)

    // Get the document to find storage path
    const hookVisualRef = doc(db, 'hookVisuals', hookVisualId)
    
    // Delete from Firestore first
    await deleteDoc(hookVisualRef)
    console.log('Hook visual document deleted')

    // Note: We could also delete from storage, but for now we'll keep files
    // to avoid data loss in case of accidental deletion
    
  } catch (error: any) {
    console.error('Error deleting hook visual:', error)
    throw error
  }
}

// Helper function to validate video file
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 100 * 1024 * 1024 // 100MB
  const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime']

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a video file (MP4, MOV, or AVI)'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 100MB'
    }
  }

  return { valid: true }
}

// Helper function to get video duration (client-side)
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    
    video.onerror = () => {
      reject(new Error('Failed to load video metadata'))
    }
    
    video.src = URL.createObjectURL(file)
  })
}

// Helper function to generate thumbnail (client-side)
export function generateThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    video.onloadedmetadata = () => {
      // Set canvas size to video dimensions
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Seek to 1 second or 10% of video, whichever is smaller
      video.currentTime = Math.min(1, video.duration * 0.1)
    }
    
    video.onseeked = () => {
      if (ctx) {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0)
        
        // Convert to data URL
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8)
        
        // Clean up
        window.URL.revokeObjectURL(video.src)
        resolve(thumbnailUrl)
      } else {
        reject(new Error('Failed to get canvas context'))
      }
    }
    
    video.onerror = () => {
      reject(new Error('Failed to load video'))
    }
    
    video.src = URL.createObjectURL(file)
  })
}
