import { Clock, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const UpcomingMeeting = ({ meeting }) => {
  return (
    <Card className="bg-card text-card-foreground">
      <CardContent className="p-4 space-y-4">
        {/* 'Coming Up' row */}
        <div className="flex items-center text-muted-foreground">
          <Clock className="w-4 h-4 mr-2" />
          <span>Coming Up</span>
        </div>

        {/* Meeting title & time */}
        <div>
          <h3 className="text-lg font-semibold">{meeting.title}</h3>
          <p className="text-sm text-muted-foreground">
            {meeting.startTime} - {meeting.endTime} · in {meeting.startsIn}
          </p>
        </div>

        {/* Stats (no avatars) */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {meeting.invitedCount} invited · {meeting.acceptedCount} accepted
          </span>
        </div>

        {/* Context box */}
        {meeting.context && (
          <div className="bg-muted p-3 rounded-md">
            <h4 className="text-sm font-medium mb-1">Context:</h4>
            <p className="text-sm text-muted-foreground">{meeting.context}</p>
          </div>
        )}
      </CardContent>

      {/* Join button */}
      <CardFooter>
        <Button className="w-full" onClick={() => console.log("Joining meeting...")}>
          Join meeting
          <ArrowUpRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default UpcomingMeeting
