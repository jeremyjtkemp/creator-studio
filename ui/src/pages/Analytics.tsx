import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Heart, 
  Target,
  Calendar,
  Plus
} from 'lucide-react'

export function Analytics() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Performance Analytics</h1>
            <p className="text-muted-foreground">Track your video performance and optimize content strategy</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" disabled>
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 days
            </Button>
            <Button variant="outline" disabled>
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-muted flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-muted-foreground" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">No Analytics Data Yet</h2>
          <p className="text-muted-foreground mb-8">
            Start creating and publishing videos to see performance insights, hook analytics, and creator leaderboards.
          </p>

          {/* Metrics Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center p-4 opacity-50">
              <Eye className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-lg font-bold">--</div>
              <div className="text-xs text-muted-foreground">Total Views</div>
            </Card>
            
            <Card className="text-center p-4 opacity-50">
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-lg font-bold">--</div>
              <div className="text-xs text-muted-foreground">Engagement</div>
            </Card>
            
            <Card className="text-center p-4 opacity-50">
              <Target className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-lg font-bold">--</div>
              <div className="text-xs text-muted-foreground">Best Hook</div>
            </Card>
            
            <Card className="text-center p-4 opacity-50">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="text-lg font-bold">--</div>
              <div className="text-xs text-muted-foreground">Growth</div>
            </Card>
          </div>

          <Button size="lg" disabled>
            <Plus className="w-5 h-5 mr-2" />
            Create Videos to See Analytics
          </Button>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-dashed">
            <h3 className="font-medium mb-2">What you'll track:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>• Video performance metrics</div>
              <div>• Hook effectiveness scores</div>
              <div>• Creator leaderboards</div>
              <div>• Trend analysis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}