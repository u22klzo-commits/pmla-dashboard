
import { getSearches } from "@/actions/searches"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchCalendar } from "@/components/calendar/search-calendar"

export default async function CalendarPage() {
    const searches = await getSearches()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Operation Calendar</h2>
            </div>
            <Card className="p-4">
                <SearchCalendar searches={searches} />
            </Card>
        </div>
    )
}
