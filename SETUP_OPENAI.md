# OpenAI Hook Generation Setup

## 🚀 Quick Setup

### 1. Add Your OpenAI API Key

Create or update `server/.env.local` with your OpenAI API key:

```bash
# OpenAI Configuration
OPENAI_API_KEY=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

# Your existing environment variables...
DATABASE_URL=...
FIREBASE_PROJECT_ID=...
# etc.
```

### 2. Start Your Servers

```bash
# Terminal 1 - Start the API server
cd server
pnpm dev

# Terminal 2 - Start the UI
cd ui
pnpm dev
```

### 3. Test Hook Generation

1. Go to **Video Creator** page
2. Select or create a project with a description
3. Click **"Generate 10 AI Hooks"** button
4. Watch as OpenAI generates viral hooks based on your project!

## 🎯 What's Implemented

### ✅ Features Working Now:
- **Real OpenAI Integration**: Uses GPT-4o-mini for cost-effective hook generation
- **Project-Aware Hooks**: Generates hooks based on your project's description and name
- **5 Hook Categories**: Curiosity, Controversial, POV, Emotional, Statistical
- **Smart Fallbacks**: If OpenAI fails, falls back to template-based hooks
- **Visual Hook Selection**: Shows engagement metrics and virality scores
- **Copy to Clipboard**: Easy sharing of generated hooks
- **Error Handling**: Clear feedback if something goes wrong

### 🎨 UI Integration:
- **VideoCreator Page**: Hook generation integrated into main workflow
- **Real-time Updates**: Project description automatically used for generation
- **Visual Feedback**: Loading states, success/error messages
- **Hook Selection**: Click to select hooks for use in videos

## 💰 Cost Information

- **Model Used**: GPT-4o-mini (most cost-effective)
- **Cost per Generation**: ~$0.001 for 10 hooks
- **Monthly Estimate**: $1-5 for typical usage
- **Fallback Protection**: If API fails, uses template-based hooks

## 🔧 Technical Details

### Files Created/Modified:
- `server/src/lib/ai-service.ts` - OpenAI integration
- `server/src/api.ts` - Hook generation endpoint
- `ui/src/lib/serverComm.ts` - API communication
- `ui/src/components/HookTextGenerator.tsx` - New hook UI component
- `ui/src/pages/VideoCreator.tsx` - Integrated hook generation

### API Endpoint:
```
POST /api/v1/protected/hooks/generate
{
  "appDescription": "Your app description",
  "projectName": "Your project name",
  "hookCount": 10
}
```

## 🧪 Testing the Feature

1. **Create a Project** with a good description:
   ```
   "A fitness tracking app that helps users build consistent workout habits with personalized plans, progress tracking, and social challenges"
   ```

2. **Generate Hooks** - Should produce hooks like:
   - "This fitness app changed my life in 30 days..."
   - "Personal trainers hate this $5/month secret"
   - "POV: You finally found the perfect workout app"

3. **Verify Categorization** - Hooks should be tagged as:
   - Curiosity, Controversial, POV, Emotional, Statistical

## 🚨 Troubleshooting

### Common Issues:

**"Failed to generate hooks"**
- Check your OpenAI API key is correct
- Verify you have billing set up on OpenAI account
- Check server console for detailed error messages

**API Key Error**
- Make sure the key starts with `sk-proj-` or `sk-`
- Ensure no extra spaces in `.env.local`
- Restart the server after adding the key

**Fallback Hooks Showing**
- This means OpenAI API failed but fallback is working
- Check network connection and OpenAI status
- Templates will still generate relevant hooks

## 🎉 Success!

If everything is working, you should see:
- ✅ "Generated 10 viral hooks!" success message
- ✅ Hooks categorized with engagement scores
- ✅ Ability to select and copy hooks
- ✅ Project-specific hook content

The feature is now ready for creating viral TikTok hooks at scale! 🚀
