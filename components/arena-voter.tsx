"use client"

import * as React from "react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useMutation, useQuery } from "@tanstack/react-query"
import { 
  IconLoader, 
  IconUser, 
  IconCpu, 
  IconThumbUp, 
  IconThumbDown, 
  IconTrophy,
  IconShare
} from "@tabler/icons-react"
import { toast } from "sonner"
import { Duel } from "@/types/duels"
import { getDuelTurns, voteDuelTurn } from "@/lib/turns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// --- Reusing your Markdown Component ---
const MarkdownText = ({ content }: { content: string }) => {
  return (
    <div className="prose prose-neutral dark:prose-invert prose-sm max-w-none break-words leading-relaxed">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, inline, className, children, ...props}: any) {
            return !inline ? (
              <div className="relative my-4 rounded-md bg-muted/50 p-4 font-mono text-xs">
                <code {...props} className="bg-transparent p-0">{children}</code>
              </div>
            ) : (
              <code {...props} className="rounded bg-muted px-1 py-0.5 font-mono text-sm font-semibold">{children}</code>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

interface ArenaVoterProps {
  duel: Duel
}

export function ArenaVoter({ duel }: ArenaVoterProps) {
  // --- Data Fetching ---
  const { data: turns = [], isLoading } = useQuery({
    queryKey: ["duel-turns-public", duel.id],
    queryFn: () => getDuelTurns(duel.id),
  })

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-4 md:px-6 py-3 backdrop-blur-md">
        <div className="flex flex-col">
           <h1 className="text-sm font-semibold tracking-tight">{duel.name}</h1>
           <p className="text-xs text-muted-foreground">Public Arena • Cast your vote</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              toast.success("Link copied!")
           }}>
              <IconShare className="mr-2 size-3" />
              Share
           </Button>
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 pb-20">
        {isLoading ? (
          <div className="flex justify-center py-20"><IconLoader className="animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="flex flex-col gap-16">
            {turns.map((turn, index) => (
              <TurnItem key={turn.id} turn={turn} index={index} duel={duel} />
            ))}
            
            {/* End of Duel Message */}
            {turns.length > 0 && (
               <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
                  <IconTrophy className="size-8 text-yellow-500/50" />
                  <p className="text-sm">You have reached the end of the duel.</p>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// --- Individual Turn Component (Handles Voting Logic) ---
function TurnItem({ turn, index, duel }: { turn: any, index: number, duel: Duel }) {
  // Track local voting state to prevent spam/double voting
  // We use a simple object: { a: 'like' | 'dislike' | null, b: ... }
  const [userVote, setUserVote] = React.useState<{ 
    a: 'like' | 'dislike' | null, 
    b: 'like' | 'dislike' | null 
  }>({ a: null, b: null })

  // Check localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(`vote_${turn.id}`)
    if (stored) {
      setUserVote(JSON.parse(stored))
    }
  }, [turn.id])

  const voteMutation = useMutation({
    mutationFn: ({ type }: { type: 'likes_a' | 'dislikes_a' | 'likes_b' | 'dislikes_b' }) => 
      voteDuelTurn(turn.id, type),
    onSuccess: (_, variables) => {
      // Update local state
      const side = variables.type.endsWith('_a') ? 'a' : 'b'
      const action = variables.type.startsWith('like') ? 'like' : 'dislike'
      
      const newState = { ...userVote, [side]: action }
      setUserVote(newState)
      
      // Save to localStorage
      localStorage.setItem(`vote_${turn.id}`, JSON.stringify(newState))
      toast.success("Vote recorded")
    },
    onError: () => {
      toast.error("Failed to vote. Try again.")
    }
  })

  const handleVote = (side: 'a' | 'b', action: 'like' | 'dislike') => {
    // Prevent voting if already voted on this side
    if (userVote[side]) return

    const type = `${action === 'like' ? 'likes' : 'dislikes'}_${side}` as any
    voteMutation.mutate({ type })
  }

  return (
    <div className="group flex flex-col gap-6">
      
      {/* USER BUBBLE */}
      <div className="flex justify-end pl-8 md:pl-20">
          <div className="flex flex-col items-end gap-2 max-w-2xl">
            <div className="rounded-2xl rounded-tr-sm bg-primary px-5 py-3 text-primary-foreground shadow-sm">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{turn.user_input}</p>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium pr-1">Turn {index + 1}</span>
          </div>
          <Avatar className="ml-3 mt-1 h-8 w-8 border bg-background">
            <AvatarFallback><IconUser className="size-4 text-muted-foreground" /></AvatarFallback>
          </Avatar>
      </div>

      {/* AI RESPONSE ROW */}
      <div className="flex gap-3 md:gap-4">
          <div className="flex-shrink-0 mt-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm">
              <IconCpu className="size-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border/40 -ml-[0.5px]" />

              {/* Model A */}
              <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase">{duel.contender_a_name}</span>
                  </div>
                  <MarkdownText content={turn.response_a} />
                  
                  {/* Vote Buttons A */}
                  <div className="flex gap-2 mt-2">
                     <VoteButton 
                       icon={<IconThumbUp className="size-4" />} 
                       active={userVote.a === 'like'}
                       onClick={() => handleVote('a', 'like')}
                       label="Helpful"
                     />
                     <VoteButton 
                       icon={<IconThumbDown className="size-4" />} 
                       active={userVote.a === 'dislike'}
                       onClick={() => handleVote('a', 'dislike')}
                       label="Bad"
                     />
                  </div>
              </div>

              {/* Model B */}
              <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase">{duel.contender_b_name}</span>
                  </div>
                  <MarkdownText content={turn.response_b} />

                  {/* Vote Buttons B */}
                  <div className="flex gap-2 mt-2">
                     <VoteButton 
                       icon={<IconThumbUp className="size-4" />} 
                       active={userVote.b === 'like'}
                       onClick={() => handleVote('b', 'like')}
                       label="Helpful"
                     />
                     <VoteButton 
                       icon={<IconThumbDown className="size-4" />} 
                       active={userVote.b === 'dislike'}
                       onClick={() => handleVote('b', 'dislike')}
                       label="Bad"
                     />
                  </div>
              </div>
            </div>
          </div>
      </div>

    </div>
  )
}

function VoteButton({ icon, active, onClick, label }: { icon: React.ReactNode, active: boolean, onClick: () => void, label: string }) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onClick}
      disabled={active} // Disable once voted to prevent spam
      className={cn(
        "h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-muted",
        active && "bg-muted text-foreground font-medium opacity-100"
      )}
    >
      {icon}
      {active && <span className="ml-2 text-xs">{label}</span>}
    </Button>
  )
}