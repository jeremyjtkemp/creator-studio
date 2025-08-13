import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Asset, AssetType, getProjectAssets, uploadAsset, deleteAsset, CreateAssetData } from './assets'
import { useAuth } from './auth-context'
import { useProjects } from './project-context'
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore'
import { db } from './firebase'

type AssetsContextType = {
  assets: Record<AssetType, Asset[]>
  allAssets: Asset[]
  loadingAssets: boolean
  uploadingAsset: boolean
  uploadAssetFile: (file: File, assetData: CreateAssetData) => Promise<void>
  deleteAssetById: (assetId: string) => Promise<void>
  refreshAssets: () => void
  getAssetsByType: (type: AssetType) => Asset[]
  getTotalAssetsCount: () => number
}

const AssetsContext = createContext<AssetsContextType | undefined>(undefined)

export function AssetsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { currentProject } = useProjects()
  const [assets, setAssets] = useState<Record<AssetType, Asset[]>>({
    'hook-visual': [],
    'demo-video': [],
    'image': [],
    'music': [],
    'other': []
  })
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [uploadingAsset, setUploadingAsset] = useState(false)

  const fetchAssets = useCallback(async () => {
    if (!user || !currentProject) {
      console.log('🚫 No user or project for assets fetch')
      setAssets({
        'hook-visual': [],
        'demo-video': [],
        'image': [],
        'music': [],
        'other': []
      })
      setLoadingAssets(false)
      return
    }

    console.log('🔄 Fetching assets for:', { userId: user.uid, projectId: currentProject.id })
    setLoadingAssets(true)
    try {
      const projectAssets = await getProjectAssets(user.uid, currentProject.id)
      console.log('✅ Assets fetched:', projectAssets)
      setAssets(projectAssets)
    } catch (error) {
      console.error('❌ Failed to fetch assets:', error)
      setAssets({
        'hook-visual': [],
        'demo-video': [],
        'image': [],
        'music': [],
        'other': []
      })
    } finally {
      setLoadingAssets(false)
    }
  }, [user, currentProject])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  // Real-time listener for assets
  useEffect(() => {
    if (!user || !currentProject) return

    const assetsRef = collection(db, 'assets')
    const q = query(
      assetsRef,
      where('userId', '==', user.uid),
      where('projectId', '==', currentProject.id),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedAssets = snapshot.docs.map(doc => ({
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

      updatedAssets.forEach(asset => {
        if (groupedAssets[asset.type]) {
          groupedAssets[asset.type].push(asset)
        } else {
          groupedAssets.other.push(asset)
        }
      })

      setAssets(groupedAssets)
    }, (error) => {
      console.error("Error listening to assets:", error)
    })

    return () => unsubscribe()
  }, [user, currentProject])

  const uploadAssetFile = async (file: File, assetData: CreateAssetData) => {
    if (!user || !currentProject) {
      throw new Error('User or project not available')
    }

    setUploadingAsset(true)
    try {
      await uploadAsset(user.uid, currentProject.id, file, assetData)
      console.log('Asset uploaded successfully')
    } catch (error) {
      console.error('Failed to upload asset:', error)
      throw error
    } finally {
      setUploadingAsset(false)
    }
  }

  const deleteAssetById = async (assetId: string) => {
    try {
      await deleteAsset(assetId)
      console.log('Asset deleted successfully')
    } catch (error) {
      console.error('Failed to delete asset:', error)
      throw error
    }
  }

  const refreshAssets = () => {
    fetchAssets()
  }

  const getAssetsByType = (type: AssetType): Asset[] => {
    return assets[type] || []
  }

  const getTotalAssetsCount = (): number => {
    return Object.values(assets).reduce((total, typeAssets) => total + typeAssets.length, 0)
  }

  const allAssets = Object.values(assets).flat()

  return (
    <AssetsContext.Provider
      value={{
        assets,
        allAssets,
        loadingAssets,
        uploadingAsset,
        uploadAssetFile,
        deleteAssetById,
        refreshAssets,
        getAssetsByType,
        getTotalAssetsCount
      }}
    >
      {children}
    </AssetsContext.Provider>
  )
}

export const useAssets = () => {
  const context = useContext(AssetsContext)
  if (context === undefined) {
    throw new Error('useAssets must be used within an AssetsProvider')
  }
  return context
}
