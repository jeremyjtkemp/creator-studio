import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { HookVisual, getProjectHookVisuals, uploadHookVisual, deleteHookVisual, CreateHookVisualData } from './hook-visuals'
import { useAuth } from './auth-context'
import { useProjects } from './project-context'
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore'
import { db } from './firebase'

type HookVisualsContextType = {
  hookVisuals: HookVisual[]
  loadingHookVisuals: boolean
  uploadingHookVisual: boolean
  uploadHookVisualFile: (file: File, visualData: CreateHookVisualData) => Promise<void>
  deleteHookVisualById: (hookVisualId: string) => Promise<void>
  refreshHookVisuals: () => void
}

const HookVisualsContext = createContext<HookVisualsContextType | undefined>(undefined)

export function HookVisualsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { currentProject } = useProjects()
  const [hookVisuals, setHookVisuals] = useState<HookVisual[]>([])
  const [loadingHookVisuals, setLoadingHookVisuals] = useState(false)
  const [uploadingHookVisual, setUploadingHookVisual] = useState(false)

  const fetchHookVisuals = useCallback(async () => {
    if (!user || !currentProject) {
      setHookVisuals([])
      setLoadingHookVisuals(false)
      return
    }

    setLoadingHookVisuals(true)
    try {
      const projectHookVisuals = await getProjectHookVisuals(user.uid, currentProject.id)
      setHookVisuals(projectHookVisuals)
    } catch (error) {
      console.error('Failed to fetch hook visuals:', error)
      setHookVisuals([])
    } finally {
      setLoadingHookVisuals(false)
    }
  }, [user, currentProject])

  useEffect(() => {
    fetchHookVisuals()
  }, [fetchHookVisuals])

  // Real-time listener for hook visuals
  useEffect(() => {
    if (!user || !currentProject) return

    const hookVisualsRef = collection(db, 'hookVisuals')
    const q = query(
      hookVisualsRef,
      where('userId', '==', user.uid),
      where('projectId', '==', currentProject.id),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedHookVisuals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HookVisual[]
      setHookVisuals(updatedHookVisuals)
    }, (error) => {
      console.error("Error listening to hook visuals:", error)
    })

    return () => unsubscribe()
  }, [user, currentProject])

  const uploadHookVisualFile = async (file: File, visualData: CreateHookVisualData) => {
    if (!user || !currentProject) {
      throw new Error('User or project not available')
    }

    setUploadingHookVisual(true)
    try {
      await uploadHookVisual(user.uid, currentProject.id, file, visualData)
      console.log('Hook visual uploaded successfully')
    } catch (error) {
      console.error('Failed to upload hook visual:', error)
      throw error
    } finally {
      setUploadingHookVisual(false)
    }
  }

  const deleteHookVisualById = async (hookVisualId: string) => {
    try {
      await deleteHookVisual(hookVisualId)
      console.log('Hook visual deleted successfully')
    } catch (error) {
      console.error('Failed to delete hook visual:', error)
      throw error
    }
  }

  const refreshHookVisuals = () => {
    fetchHookVisuals()
  }

  return (
    <HookVisualsContext.Provider
      value={{
        hookVisuals,
        loadingHookVisuals,
        uploadingHookVisual,
        uploadHookVisualFile,
        deleteHookVisualById,
        refreshHookVisuals
      }}
    >
      {children}
    </HookVisualsContext.Provider>
  )
}

export const useHookVisuals = () => {
  const context = useContext(HookVisualsContext)
  if (context === undefined) {
    throw new Error('useHookVisuals must be used within a HookVisualsProvider')
  }
  return context
}
