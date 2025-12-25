"use client"

import * as React from "react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  IconLoader, 
  IconPlayerPlay, 
  IconTrash, 
  IconUser, 
  IconCpu, 
  IconArrowLeft, 
  IconPlus
} from "@tabler/icons-react"
import { toast } from "sonner"
import { Duel } from "@/types/duels"
import { createDuelTurn, deleteDuelTurn, getDuelTurns } from "@/lib/turns"
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger,
  DrawerFooter
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// --- Markdown Component (Static) ---
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

interface ArenaEditorProps {
  duel: Duel
}

export function ArenaEditor({ duel }: ArenaEditorProps) {
  const queryClient = useQueryClient()
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // --- State ---
  const [userInput, setUserInput] = React.useState("")
  const [responseA, setResponseA] = React.useState("")
  const [responseB, setResponseB] = React.useState("")
  const [open, setOpen] = React.useState(false) // Drawer state
  
  // --- Simulation State ---
  // We store the "visible" text here. When not streaming, this matches the DB data.
  const [streamedContent, setStreamedContent] = React.useState<Record<string, { a: string, b: string }>>({})
  const [isStreaming, setIsStreaming] = React.useState(false)

  // --- Data Fetching ---
  const { data: turns = [], isLoading } = useQuery({
    queryKey: ["duel-turns", duel.id],
    queryFn: () => getDuelTurns(duel.id),
  })

  // Initialize streamedContent with existing data when it loads
  React.useEffect(() => {
    if (turns.length > 0 && !isStreaming) {
       const initial: Record<string, { a: string, b: string }> = {}
       turns.forEach(t => {
         initial[t.id] = { a: t.response_a, b: t.response_b }
       })
       setStreamedContent(initial)
    }
  }, [turns, isStreaming])

  // --- The Token Simulator ---
  const simulateStreaming = async (turnId: string, fullA: string, fullB: string) => {
    setIsStreaming(true)
    
    // 1. Initialize empty state for this turn
    setStreamedContent(prev => ({
        ...prev,
        [turnId]: { a: "", b: "" }
    }))

    // Split text into "tokens" (words)
    const tokensA = fullA.split(" ")
    const tokensB = fullB.split(" ")
    
    const maxLen = Math.max(tokensA.length, tokensB.length)
    let currentA = ""
    let currentB = ""

    // 2. Loop through tokens
    for (let i = 0; i < maxLen; i++) {
        // Append tokens if they exist
        if (i < tokensA.length) currentA += (i > 0 ? " " : "") + tokensA[i]
        if (i < tokensB.length) currentB += (i > 0 ? " " : "") + tokensB[i]

        // Update state
        setStreamedContent(prev => ({
            ...prev,
            [turnId]: { a: currentA, b: currentB }
        }))

        // Auto scroll
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })

        // Random "network" delay (The "AI" feel)
        await new Promise(r => setTimeout(r, Math.random() * 50 + 30))
    }

    setIsStreaming(false)
  }

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: createDuelTurn,
    onSuccess: async (newTurn) => {
      // 1. Clear inputs immediately
      setUserInput("")
      setResponseA("")
      setResponseB("")
      
      // 2. Add the new turn to cache immediately (Optimistic-ish)
      queryClient.setQueryData(["duel-turns", duel.id], (old: any) => [...(old || []), newTurn])
      
      // 3. Trigger the simulation on the NEW turn
      await simulateStreaming(newTurn.id, newTurn.response_a, newTurn.response_b)

      toast.success("Turn saved")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteDuelTurn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["duel-turns", duel.id] })
      toast.success("Turn deleted")
    },
  })

  const handleSaveTurn = () => {
    if (!userInput.trim() || !responseA.trim() || !responseB.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    createMutation.mutate({
      duel_id: duel.id,
      turn_order: turns.length + 1,
      user_input: userInput,
      response_a: responseA,
      response_b: responseB,
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <IconArrowLeft className="size-5" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold tracking-tight">{duel.name}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                 <div className="size-2 rounded-full bg-blue-500" /> {duel.contender_a_name}
              </span>
              <span className="text-muted-foreground/40">vs</span>
              <span className="flex items-center gap-1">
                 <div className="size-2 rounded-full bg-orange-500" /> {duel.contender_b_name}
              </span>
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">{duel.status}</Badge>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 pb-[400px]">
        {isLoading ? (
          <div className="flex justify-center py-20"><IconLoader className="animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="flex flex-col gap-10">
            {turns.map((turn, index) => {
              // Get content from simulation state OR fallback to DB data
              const contentA = streamedContent[turn.id]?.a ?? turn.response_a
              const contentB = streamedContent[turn.id]?.b ?? turn.response_b

              return (
                <div key={turn.id} className="group flex flex-col gap-6">
                  
                  {/* USER BUBBLE */}
                  <div className="flex justify-end pl-12">
                     <div className="flex flex-col items-end gap-2 max-w-2xl">
                        <div className="rounded-2xl rounded-tr-sm bg-primary px-5 py-3 text-primary-foreground shadow-sm">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{turn.user_input}</p>
                        </div>
                        <div className="flex items-center gap-2 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Turn {index + 1}</span>
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-4 w-4 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteMutation.mutate(turn.id)}
                          >
                            <IconTrash className="size-3" />
                          </Button>
                        </div>
                     </div>
                     <Avatar className="ml-3 mt-1 h-8 w-8 border bg-background">
                        <AvatarFallback><IconUser className="size-4 text-muted-foreground" /></AvatarFallback>
                     </Avatar>
                  </div>

                  {/* AI RESPONSE ROW */}
                  <div className="flex gap-4 pr-4 md:pr-12">
                     <div className="flex-shrink-0 mt-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm">
                          <IconCpu className="size-4 text-muted-foreground" />
                        </div>
                     </div>
                     
                     <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border/40 -ml-[0.5px]" />

                          {/* Model A */}
                          <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-2 mb-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span className="text-xs font-medium text-muted-foreground uppercase">{duel.contender_a_name}</span>
                             </div>
                             <MarkdownText content={contentA} />
                          </div>

                          {/* Model B */}
                          <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-2 mb-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                <span className="text-xs font-medium text-muted-foreground uppercase">{duel.contender_b_name}</span>
                             </div>
                             <MarkdownText content={contentB} />
                          </div>
                        </div>
                     </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}
        <div ref={scrollRef} />
      </main>

      {/* DRAWER COMPONENT */}
      <Drawer open={open} onOpenChange={setOpen}>
        
        {/* The Floating Action Button (Trigger) */}
        <DrawerTrigger asChild>
          <Button 
            size="icon" 
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-xl z-30 transition-transform hover:scale-105"
          >
            <IconPlus className="size-6" />
          </Button>
        </DrawerTrigger>

        <DrawerContent>
           <div className="mx-auto w-full max-w-5xl overflow-y-scroll">
            <DrawerHeader>
              <DrawerTitle className="text-center text-muted-foreground font-normal">Add New Turn</DrawerTitle>
            </DrawerHeader>
            
            <div className="p-4 md:p-6 overflow-y-auto max-h-[85vh]">
              <div className="flex flex-col gap-4">
                
                {/* User Input */}
                <div className="relative">
                  <Textarea 
                    placeholder="Enter user prompt..." 
                    className="min-h-[80px] max-h-[200px] resize-none rounded-xl border-muted-foreground/20 bg-muted/30 px-4 py-3 text-sm"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                </div>

                {/* Model Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Model A */}
                  <div className="group relative rounded-xl border border-muted-foreground/20 bg-background transition-colors focus-within:border-blue-500/50">
                    <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-medium text-muted-foreground uppercase">{duel.contender_a_name}</span>
                    </div>
                    <Textarea 
                      placeholder="Paste Model A output..." 
                      className="min-h-[200px] max-h-[300px] w-full resize-y border-0 bg-transparent pt-8 text-xs font-mono focus-visible:ring-0"
                      value={responseA}
                      onChange={(e) => setResponseA(e.target.value)}
                    />
                  </div>

                  {/* Model B */}
                  <div className="group relative rounded-xl border border-muted-foreground/20 bg-background transition-colors focus-within:border-orange-500/50">
                    <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        <span className="text-[10px] font-medium text-muted-foreground uppercase">{duel.contender_b_name}</span>
                    </div>
                    <Textarea 
                      placeholder="Paste Model B output..." 
                      className="min-h-[200px] max-h-[300px] w-full resize-y border-0 bg-transparent pt-8 text-xs font-mono focus-visible:ring-0"
                      value={responseB}
                      onChange={(e) => setResponseB(e.target.value)}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSaveTurn} 
                    disabled={createMutation.isPending} 
                    className="rounded-full px-8 w-full md:w-auto"
                  >
                    {createMutation.isPending ? <IconLoader className="mr-2 size-4 animate-spin" /> : <IconPlayerPlay className="mr-2 size-4 fill-current" />}
                    Run Turn
                  </Button>
                </div>

              </div>
            </div>
            {/* Spacer for bottom safe area on mobile */}
            <DrawerFooter className="pt-0" />
           </div>
        </DrawerContent>
      </Drawer>
      
    </div>
  )
}