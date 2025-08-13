# Shotstack Integration Setup

## 🎬 Current Status: Ready for Testing!

Your Shotstack integration is now fully implemented with your sandbox credentials:

- **Environment**: Sandbox (Free for video editing)
- **Owner ID**: `p4onozror8` 
- **API Key**: `2ZlpmYQuGL3oELJc6fcywbHKauKNKPwrp2BrsuZf`

## 🚀 What's Implemented:

### ✅ Core Video Editing (FREE in Sandbox)
- **Video Composition State Management**: Centralized state for all video elements
- **Shotstack Service**: API integration for video rendering  
- **JSON Template Generation**: Converts your data to Shotstack format
- **Single Video Export**: Combine hook + demo clips + text + music
- **Batch Export**: Generate 10 variations with different music tracks
- **Real-time Progress Tracking**: Monitor render status and progress

### 🎯 What Each Stage Does:
1. **Hook Stage**: Select hook video/visual + generate AI text + customize text appearance
2. **Demo Stage**: Upload demo clips + arrange in timeline sequence
3. **Music Stage**: Select background music with volume/timing controls
4. **Export Stage**: Generate single video or batch export 10 variations

## 🧩 How the Video Assembly Works:

Your video composition gets converted to this Shotstack JSON structure:

```json
{
  "timeline": {
    "background": "#000000",
    "tracks": [
      {
        "clips": [
          {
            "asset": { "type": "video", "src": "hook-video-url" },
            "start": 0,
            "length": 5
          }
        ]
      },
      {
        "clips": [
          {
            "asset": { "type": "video", "src": "demo-clip-url" },
            "start": 5,
            "length": 10
          }
        ]
      },
      {
        "clips": [
          {
            "asset": { 
              "type": "title", 
              "text": "This fitness app changed my life...",
              "style": "chunk"
            },
            "start": 0,
            "length": 15,
            "position": "top"
          }
        ]
      },
      {
        "clips": [
          {
            "asset": { 
              "type": "audio", 
              "src": "music-url",
              "volume": 0.75
            },
            "start": 0,
            "length": 15
          }
        ]
      }
    ]
  },
  "output": {
    "format": "mp4",
    "aspectRatio": "9:16",
    "size": {
      "width": 1080,
      "height": 1920
    }
  }
}
```

## 🎬 Testing Your Integration:

1. **Create/Select a Project**
2. **Hook Stage**: 
   - Upload a hook video or use existing
   - Generate hook text with AI
   - Customize text size, position, duration
3. **Demo Stage**:
   - Upload demo clips showing your app
   - Select clips to add to timeline
   - See clips arranged in sequence
4. **Music Stage**:
   - Upload background music to global library
   - Select music and adjust volume/timing
5. **Export Stage**:
   - Review video composition summary
   - Click "Export Single Video" to test
   - Monitor progress as Shotstack renders
   - Download completed video

## 🚨 Important Notes:

### Sandbox Limitations:
- ✅ **Video editing is FREE** in sandbox
- ❌ **AI features cost money** (text-to-speech, auto captions)
- ✅ **All core functionality works** for testing

### Shotstack API Notes:
- **Output Config**: Use either `resolution` OR `size`, not both (they conflict)
- **Size Property**: Gives precise control over dimensions (recommended)
- **Resolution Property**: Uses predefined sizes ('hd', 'sd') - conflicts with size

### Production Migration:
When ready for production:
1. Get production API key from Shotstack
2. Update `shotstack-service.ts` with production credentials
3. Change `SHOTSTACK_STAGE` from 'stage' to 'v1'

## 💡 Next Steps (AI Features - Later):

### Phase 2: AI Voice Over
```javascript
// Generate AI voice from hook text
const voiceResponse = await fetch('https://api.shotstack.io/create/v1/assets', {
  body: JSON.stringify({
    provider: 'shotstack',
    options: {
      type: 'audio',
      text: "This fitness app changed my life in 30 days",
      voice: 'female'
    }
  })
});
```

### Phase 3: Auto Captions
```javascript
// Auto-generate subtitles from voice over
{
  "asset": {
    "type": "title",
    "text": "[AUTO-GENERATED FROM AUDIO]",
    "style": "subtitle-style"
  }
}
```

## 🎯 Expected Results:

- **Video Duration**: 15-60 seconds (TikTok optimized)
- **Format**: MP4, 9:16 aspect ratio (1080x1920)
- **Render Time**: ~30-90 seconds in sandbox
- **Output Quality**: HD for testing, scalable for production

Your Creator Studio can now generate professional TikTok-style videos programmatically! 🚀

## 🔧 Troubleshooting:

**Export Button Disabled?**
- Ensure you have at least hook text OR demo clips
- Check that all required fields are filled

**Render Fails?**
- Check browser console for Shotstack API errors
- Verify video file URLs are accessible
- Ensure assets are properly uploaded to Firebase

**Long Render Times?**
- Sandbox can be slower than production
- Complex videos take longer to process
- Monitor progress bar for status updates

The integration is ready for testing! 🎉
