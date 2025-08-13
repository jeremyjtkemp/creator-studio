import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  getDocs, 
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from './firebase';
import { GeneratedHook, api } from './serverComm';

export interface ProjectHook {
  id: string;
  projectId: string;
  userId: string;
  text: string;
  category: 'curiosity' | 'controversial' | 'pov' | 'emotional' | 'statistical';
  estimatedEngagement: string;
  viralityScore: 'high' | 'medium' | 'low';
  variations: number;
  isUsed?: boolean;
  createdAt: any;
  updatedAt: any;
}

export type CreateProjectHookData = Omit<ProjectHook, 'id' | 'createdAt' | 'updatedAt'>;

// Get all hooks for a specific project
export async function getProjectHooks(userId: string, projectId: string): Promise<ProjectHook[]> {
  try {
    console.log('📚 Loading hooks for project:', projectId);
    
    const hooksRef = collection(db, 'hooks');
    const q = query(
      hooksRef,
      where('userId', '==', userId),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const hooks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ProjectHook[];
    
    console.log(`✅ Loaded ${hooks.length} hooks for project ${projectId}`);
    return hooks;
    
  } catch (error: any) {
    console.error('❌ Error fetching project hooks:', error);
    throw error;
  }
}

// Save generated hooks to Firestore
export async function saveProjectHooks(
  userId: string, 
  projectId: string, 
  hooks: GeneratedHook[]
): Promise<string[]> {
  try {
    console.log(`💾 Saving ${hooks.length} hooks for project ${projectId}`);
    
    const hooksRef = collection(db, 'hooks');
    const savePromises = hooks.map(hook => 
      addDoc(hooksRef, {
        userId,
        projectId,
        text: hook.text,
        category: hook.category,
        estimatedEngagement: hook.estimatedEngagement,
        viralityScore: hook.viralityScore,
        variations: hook.variations,
        isUsed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      } as CreateProjectHookData)
    );
    
    const docRefs = await Promise.all(savePromises);
    const hookIds = docRefs.map(docRef => docRef.id);
    
    console.log(`✅ Saved ${hookIds.length} hooks to Firestore`);
    return hookIds;
    
  } catch (error: any) {
    console.error('❌ Error saving hooks:', error);
    throw error;
  }
}

// Mark a hook as used
export async function markHookAsUsed(hookId: string): Promise<void> {
  try {
    const hookRef = doc(db, 'hooks', hookId);
    await updateDoc(hookRef, {
      isUsed: true,
      updatedAt: serverTimestamp()
    });
    console.log(`✅ Marked hook ${hookId} as used`);
  } catch (error) {
    console.error('❌ Error marking hook as used:', error);
    throw error;
  }
}

// Delete a hook
export async function deleteProjectHook(hookId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'hooks', hookId));
    console.log(`🗑️ Deleted hook ${hookId}`);
  } catch (error) {
    console.error('❌ Error deleting hook:', error);
    throw error;
  }
}

// Auto-generate hooks for a new project
export async function autoGenerateProjectHooks(
  userId: string,
  projectId: string,
  projectName: string,
  projectDescription: string
): Promise<ProjectHook[]> {
  try {
    console.log(`🤖 Auto-generating hooks for new project: ${projectName}`);
    
    // Call the API to generate hooks using the existing api service
    const response = await api.generateHooks({
      appDescription: projectDescription,
      projectName: projectName,
      hookCount: 10
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate hooks via API');
    }

    const hooks = response.hooks;
    
    // Save the generated hooks to Firestore
    await saveProjectHooks(userId, projectId, hooks);
    
    // Return the hooks as ProjectHooks
    const projectHooks: ProjectHook[] = hooks.map((hook: GeneratedHook, index: number) => ({
      id: `temp-${index}`, // Temporary ID
      userId,
      projectId,
      text: hook.text,
      category: hook.category,
      estimatedEngagement: hook.estimatedEngagement,
      viralityScore: hook.viralityScore,
      variations: hook.variations,
      isUsed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    console.log(`✅ Auto-generated and saved ${projectHooks.length} hooks`);
    return projectHooks;
    
  } catch (error) {
    console.error('❌ Error auto-generating hooks:', error);
    throw error;
  }
}
