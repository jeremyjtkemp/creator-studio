import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

export interface Project {
  id: string
  name: string
  icon: string
  description: string
  status: 'active' | 'draft' | 'archived'
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CreateProjectData {
  name: string
  icon: string
  description: string
  status?: 'active' | 'draft'
}

export interface UpdateProjectData {
  name?: string
  icon?: string
  description?: string
  status?: 'active' | 'draft' | 'archived'
}

// Get all projects for a user
export async function getUserProjects(userId: string): Promise<Project[]> {
  try {
    console.log('Fetching projects for user:', userId)
    
    const projectsRef = collection(db, 'projects')
    const q = query(
      projectsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
    console.log('Found', snapshot.docs.length, 'projects')
    
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[]
    
    console.log('Projects:', projects)
    return projects
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    throw error
  }
}

// Create a new project
export async function createProject(userId: string, projectData: CreateProjectData): Promise<string> {
  try {
    console.log('Creating project in Firestore...')
    console.log('User ID:', userId)
    console.log('Project data:', projectData)
    
    const projectsRef = collection(db, 'projects')
    const docData = {
      ...projectData,
      userId,
      status: projectData.status || 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    console.log('Document data to be saved:', docData)
    
    const docRef = await addDoc(projectsRef, docData)
    console.log('Document written with ID: ', docRef.id)
    
    return docRef.id
  } catch (error: any) {
    console.error('Error creating project:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    throw error
  }
}

// Update a project
export async function updateProject(projectId: string, updateData: UpdateProjectData): Promise<void> {
  try {
    const projectRef = doc(db, 'projects', projectId)
    await updateDoc(projectRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating project:', error)
    throw error
  }
}

// NOTE: Comprehensive deleteProject function is defined below after templates

// Project templates for common app types
export const PROJECT_TEMPLATES = [
  {
    name: 'Fitness App',
    icon: '💪',
    description: 'Track workouts, set goals, and monitor progress',
    category: 'Health & Fitness'
  },
  {
    name: 'Meditation App',
    icon: '🧘',
    description: 'Guided meditation and mindfulness practices',
    category: 'Health & Wellness'
  },
  {
    name: 'Learning App',
    icon: '📚',
    description: 'Educational content and skill development',
    category: 'Education'
  },
  {
    name: 'Finance App',
    icon: '💰',
    description: 'Budget tracking and financial management',
    category: 'Finance'
  },
  {
    name: 'Social App',
    icon: '📱',
    description: 'Connect and share with your community',
    category: 'Social'
  },
  {
    name: 'Gaming App',
    icon: '🎮',
    description: 'Entertainment and gaming experiences',
    category: 'Games'
  },
  {
    name: 'Productivity App',
    icon: '✅',
    description: 'Task management and productivity tools',
    category: 'Productivity'
  },
  {
    name: 'Food App',
    icon: '🍽️',
    description: 'Recipe sharing and meal planning',
    category: 'Food & Drink'
  }
]

// Delete a project and all related data
export async function deleteProject(userId: string, projectId: string): Promise<void> {
  try {
    console.log(`🗑️ Starting deletion of project ${projectId} and all related data...`)
    
    // Use a batch to ensure atomic deletion
    const batch = writeBatch(db)
    let deletionCount = 0

    // 1. Delete the project itself
    const projectRef = doc(db, 'projects', projectId)
    batch.delete(projectRef)
    deletionCount++
    console.log(`📝 Marked project for deletion`)

    // 2. Delete all hooks for this project
    const hooksQuery = query(
      collection(db, 'hooks'),
      where('userId', '==', userId),
      where('projectId', '==', projectId)
    )
    const hooksSnapshot = await getDocs(hooksQuery)
    hooksSnapshot.docs.forEach(hookDoc => {
      batch.delete(hookDoc.ref)
      deletionCount++
    })
    console.log(`🪝 Marked ${hooksSnapshot.docs.length} hooks for deletion`)

    // 3. Delete all assets for this project
    const assetsQuery = query(
      collection(db, 'assets'),
      where('userId', '==', userId),
      where('projectId', '==', projectId)
    )
    const assetsSnapshot = await getDocs(assetsQuery)
    assetsSnapshot.docs.forEach(assetDoc => {
      batch.delete(assetDoc.ref)
      deletionCount++
    })
    console.log(`🖼️ Marked ${assetsSnapshot.docs.length} assets for deletion`)

    // 4. Delete all videos for this project
    const videosQuery = query(
      collection(db, 'videos'),
      where('userId', '==', userId),
      where('projectId', '==', projectId)
    )
    const videosSnapshot = await getDocs(videosQuery)
    videosSnapshot.docs.forEach(videoDoc => {
      batch.delete(videoDoc.ref)
      deletionCount++
    })
    console.log(`🎥 Marked ${videosSnapshot.docs.length} videos for deletion`)

    // 5. Delete all hook visuals for this project
    const hookVisualsQuery = query(
      collection(db, 'hookVisuals'),
      where('userId', '==', userId),
      where('projectId', '==', projectId)
    )
    const hookVisualsSnapshot = await getDocs(hookVisualsQuery)
    hookVisualsSnapshot.docs.forEach(hookVisualDoc => {
      batch.delete(hookVisualDoc.ref)
      deletionCount++
    })
    console.log(`🎨 Marked ${hookVisualsSnapshot.docs.length} hook visuals for deletion`)

    // 6. Delete all analytics for this project
    const analyticsQuery = query(
      collection(db, 'analytics'),
      where('userId', '==', userId),
      where('projectId', '==', projectId)
    )
    const analyticsSnapshot = await getDocs(analyticsQuery)
    analyticsSnapshot.docs.forEach(analyticsDoc => {
      batch.delete(analyticsDoc.ref)
      deletionCount++
    })
    console.log(`📊 Marked ${analyticsSnapshot.docs.length} analytics records for deletion`)

    // Execute the batch deletion
    await batch.commit()
    
    console.log(`✅ Successfully deleted project and ${deletionCount} related documents`)
    
  } catch (error: any) {
    console.error('❌ Error deleting project:', error)
    throw new Error(`Failed to delete project: ${error.message}`)
  }
}
