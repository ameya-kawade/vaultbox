import { useAuth } from "@/features/login/context/auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRightIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"
import UpcomingMeeting from "../components/UpcomingMeeting"

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const upcomingMeeting = {
    title: "AI Exploration Sync",
    startTime: "11:00",
    endTime: "11:30",
    startsIn: "2 minutes",
    participants: [
      // Avatars removed in the component, so these can stay or be removed
      { name: "User 1", avatar: "/placeholder.svg" },
      { name: "User 2", avatar: "/placeholder.svg" },
      { name: "User 3", avatar: "/placeholder.svg" },
    ],
    invitedCount: 5,
    acceptedCount: 3,
    context:
      "The last meeting emphasized AI's role in digital applications, showcasing its capacity to streamline processes and improve user experiences with personalized suggestions.",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">
          This is your VaultBox dashboard. Explore your vaults and recent activities below.
        </p>
      </div>

      {/* Top row of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Vaults */}
        <Card className="bg-card text-card-foreground hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Your Vaults</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access and manage your secure vaults here.
            </p>
            <Button
              variant="ghost"
              className="w-full mt-4 justify-between"
              onClick={() => navigate("/vaults")}
            >
              Go to Vaults
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Manage Keys */}
        <Card className="bg-card text-card-foreground hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Manage Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View and regenerate your VaultBox keys.
            </p>
            <Button
              variant="ghost"
              className="w-full mt-4 justify-between"
              onClick={() => navigate("/keys")}
            >
              Go to Keys
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Meeting */}
        <UpcomingMeeting meeting={upcomingMeeting} />
      </div>

      {/* Second row of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <Card className="bg-card text-card-foreground hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Message 1 from John</li>
              <li>Message 2 from Jane</li>
              <li>Message 3 from ChatGPT</li>
            </ul>
            <Button
              variant="ghost"
              className="w-full mt-4 justify-between"
              onClick={() => navigate("/messages")}
            >
              View All
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Shortcuts */}
        <Card className="bg-card text-card-foreground hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <Button variant="outline" onClick={() => navigate("/search")}>
                Quick Search
              </Button>
              <Button variant="outline" onClick={() => navigate("/video")}>
                Start Video Meeting
              </Button>
              <Button variant="outline" onClick={() => navigate("/settings")}>
                Go to Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third row of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-card text-card-foreground hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>New feature release next week!</li>
              <li>Scheduled maintenance on Friday.</li>
            </ul>
            <Button
              variant="ghost"
              className="w-full mt-4 justify-between"
              onClick={() => navigate("/announcements")}
            >
              View All
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
