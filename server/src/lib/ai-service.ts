import OpenAI from 'openai';
import { getEnv } from './env';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: getEnv('OPENAI_API_KEY'),
});

export interface GeneratedHook {
  text: string;
  category: 'curiosity' | 'controversial' | 'pov' | 'emotional' | 'statistical';
  estimatedEngagement: string;
  viralityScore: 'high' | 'medium' | 'low';
  variations: number;
}

export async function generateAIHooks(
  appDescription: string,
  projectName?: string,
  hookCount: number = 10
): Promise<GeneratedHook[]> {
  try {
    console.log('🤖 Generating AI hooks with OpenAI...');
    console.log('📱 App:', projectName || 'Unknown app');
    console.log('📝 Description:', appDescription.substring(0, 100) + '...');

    const prompt = `
Generate ${hookCount} viral TikTok hook texts for a mobile app called "${projectName || 'this app'}" with this description:
"${appDescription}"

Create hooks across these categories (distribute evenly):
1. Curiosity-driven hooks (make people want to know more)
2. Controversial/contrarian hooks (challenge common beliefs)  
3. POV (Point of View) hooks (use "POV:" format)
4. Emotional transformation hooks (before/after, life changes)
5. Statistical/results-driven hooks (use specific numbers/percentages)

Requirements for each hook:
- Maximum 15 words
- Start strong with attention-grabbing first 3 words
- Use specific, believable details (not generic)
- Match TikTok's casual, authentic tone
- Avoid clichés and overused phrases
- Include emotional triggers or curiosity gaps

Return ONLY a valid JSON array with this exact format:
[
  {
    "text": "This productivity app saved me 3 hours daily...",
    "category": "curiosity",
    "estimatedEngagement": "94%",
    "viralityScore": "high",
    "variations": 8
  }
]

Categories must be exactly: "curiosity", "controversial", "pov", "emotional", or "statistical"
Virality scores must be exactly: "high", "medium", or "low"
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the cheaper, faster model for this task
      messages: [
        {
          role: "system",
          content: "You are a viral content creator specializing in TikTok hooks. Generate authentic, engaging hooks that drive high engagement. Always return valid JSON."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.8, // Higher creativity
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    console.log('✅ OpenAI raw response:', content);

    // Clean up the response - sometimes AI adds markdown formatting
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Parse the JSON response
    const hooks = JSON.parse(cleanContent) as GeneratedHook[];
    
    // Validate the response
    if (!Array.isArray(hooks) || hooks.length === 0) {
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate each hook
    const validHooks = hooks.filter(hook => 
      hook.text && 
      hook.category && 
      ['curiosity', 'controversial', 'pov', 'emotional', 'statistical'].includes(hook.category) &&
      ['high', 'medium', 'low'].includes(hook.viralityScore)
    );

    if (validHooks.length === 0) {
      throw new Error('No valid hooks generated');
    }

    console.log(`✅ Generated ${validHooks.length} valid hooks`);
    
    // Ensure we have the right number of hooks
    return validHooks.slice(0, hookCount);

  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    
    // Fallback to template-based hooks if AI fails
    console.log('🔄 Falling back to template-based hooks...');
    return generateFallbackHooks(appDescription, projectName, hookCount);
  }
}

// Fallback function using templates (for when AI is unavailable)
function generateFallbackHooks(
  appDescription: string, 
  projectName?: string, 
  count: number = 10
): GeneratedHook[] {
  console.log('🔧 Using fallback hook generation');
  
  const appType = inferAppType(appDescription);
  const appTypeFormatted = appType.replace(' app', '');
  
  const templates = [
    { 
      template: `This ${appTypeFormatted} app changed my life in 30 days...`, 
      category: "curiosity" as const,
      engagement: "96%",
      virality: "high" as const,
      variations: 12
    },
    { 
      template: `Developers hate this $5/month ${appTypeFormatted} secret`, 
      category: "controversial" as const,
      engagement: "94%",
      virality: "high" as const,
      variations: 8
    },
    { 
      template: `POV: You finally found the perfect ${appTypeFormatted} app`, 
      category: "pov" as const,
      engagement: "89%",
      virality: "medium" as const,
      variations: 6
    },
    { 
      template: `I was skeptical until this ${appTypeFormatted} app proved me wrong`, 
      category: "emotional" as const,
      engagement: "92%",
      virality: "high" as const,
      variations: 9
    },
    { 
      template: `95% improvement in productivity with this ${appTypeFormatted} app`, 
      category: "statistical" as const,
      engagement: "88%",
      virality: "medium" as const,
      variations: 4
    },
    { 
      template: `Why I deleted every other ${appTypeFormatted} app for this one`, 
      category: "curiosity" as const,
      engagement: "91%",
      virality: "high" as const,
      variations: 7
    },
    { 
      template: `Personal trainers hate this free ${appTypeFormatted} app`, 
      category: "controversial" as const,
      engagement: "93%",
      virality: "high" as const,
      variations: 5
    },
    { 
      template: `POV: Your fitness journey just got 10x easier`, 
      category: "pov" as const,
      engagement: "87%",
      virality: "medium" as const,
      variations: 6
    },
    { 
      template: `The ${appTypeFormatted} app that made me love working out again`, 
      category: "emotional" as const,
      engagement: "90%",
      virality: "high" as const,
      variations: 8
    },
    { 
      template: `From 0 to 10k steps daily in 2 weeks using this app`, 
      category: "statistical" as const,
      engagement: "86%",
      virality: "medium" as const,
      variations: 3
    },
  ];

  return templates.slice(0, count).map((template) => ({
    text: template.template,
    category: template.category,
    estimatedEngagement: template.engagement,
    viralityScore: template.virality,
    variations: template.variations,
  }));
}

function inferAppType(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes('fitness') || desc.includes('workout') || desc.includes('exercise') || desc.includes('health')) return 'fitness app';
  if (desc.includes('productivity') || desc.includes('task') || desc.includes('todo') || desc.includes('organize')) return 'productivity app';
  if (desc.includes('finance') || desc.includes('budget') || desc.includes('money') || desc.includes('banking')) return 'finance app';
  if (desc.includes('social') || desc.includes('chat') || desc.includes('messaging') || desc.includes('dating')) return 'social app';
  if (desc.includes('education') || desc.includes('learning') || desc.includes('study') || desc.includes('course')) return 'learning app';
  if (desc.includes('food') || desc.includes('recipe') || desc.includes('cooking') || desc.includes('nutrition')) return 'food app';
  if (desc.includes('travel') || desc.includes('trip') || desc.includes('hotel') || desc.includes('booking')) return 'travel app';
  if (desc.includes('music') || desc.includes('audio') || desc.includes('podcast') || desc.includes('streaming')) return 'music app';
  if (desc.includes('photo') || desc.includes('camera') || desc.includes('image') || desc.includes('video editing')) return 'photo app';
  if (desc.includes('game') || desc.includes('gaming') || desc.includes('puzzle') || desc.includes('entertainment')) return 'gaming app';
  return 'app';
}
