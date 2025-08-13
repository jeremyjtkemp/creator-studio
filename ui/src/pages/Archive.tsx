import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Archive as ArchiveIcon, 
  Search, 
  Calendar,
  Star,
  Play,
  Plus
} from 'lucide-react'

export function Archive() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Video Archive</h1>
            <p className="text-muted-foreground">Browse and manage all your created videos</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" disabled>
              <Calendar className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button disabled>
              <Star className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-muted flex items-center justify-center">
            <ArchiveIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">No Videos Created Yet</h2>
          <p className="text-muted-foreground mb-8">
            Your created videos will appear here. You can search, filter, and manage all your content from this archive.
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="text-center p-4 opacity-50">
              <Search className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <h3 className="font-medium text-sm mb-1">Smart Search</h3>
              <p className="text-xs text-muted-foreground">Find videos by hook, creator, or performance</p>
            </Card>
            
            <Card className="text-center p-4 opacity-50">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <h3 className="font-medium text-sm mb-1">Performance Tiers</h3>
              <p className="text-xs text-muted-foreground">Filter by high, medium, low performers</p>
            </Card>
            
            <Card className="text-center p-4 opacity-50">
              <Play className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <h3 className="font-medium text-sm mb-1">Quick Actions</h3>
              <p className="text-xs text-muted-foreground">Preview, download, or create variations</p>
            </Card>
          </div>

          <Button size="lg" disabled>
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Video
          </Button>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              💡 Tip: All exported videos are automatically saved here with searchable tags and performance data
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}