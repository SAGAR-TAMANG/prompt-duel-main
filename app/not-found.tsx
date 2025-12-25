import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconFileAlert } from "@tabler/icons-react"

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-background text-foreground">
      {/* Icon Container */}
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        <IconFileAlert className="size-10 text-muted-foreground" />
      </div>

      {/* Text Content */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
          Page not found
        </h1>
        <p className="text-muted-foreground max-w-125 text-center">
          Sorry, we couldn&apos;t find the duel you&apos;re looking for. It might have been deleted or the link is incorrect.
        </p>
      </div>

      {/* Action Button */}
      <Button asChild variant="default" size="lg">
        <Link href="/dashboard">
          Return to Arena
        </Link>
      </Button>
    </div>
  )
}