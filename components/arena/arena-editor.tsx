"use client"

import * as React from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { IconLoader, IconPlayerPlay, IconTrash, IconUser, IconRobot, IconArrowLeft } from "@tabler/icons-react"
import { toast } from "sonner"
import { Duel } from "@/types/duels"
import { createDuelTurn, deleteDuelTurn, getDuelTurns } from "@/lib/turns"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

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

  // --- Data Fetching ---
  const { data: turns = [], isLoading } = useQuery({
    queryKey: ["duel-turns", duel.id],
    queryFn: () => getDuelTurns(duel.id),
  })

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: createDuelTurn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["duel-turns", duel.id] })
      setUserInput("")
      setResponseA("")
      setResponseB("")
      toast.success("Turn saved!")
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
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
    // Reduced max-width for a cleaner, more focused reading pane
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-[40vh]">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/dashboard" 
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <IconArrowLeft className="mr-1 size-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight">{duel.name}</h1>
                <Badge variant="outline" className="font-normal capitalize">{duel.status}</Badge>
            </div>
          <p className="text-sm text-muted-foreground">
            Editor Mode • <span className="font-medium text-foreground">{duel.contender_a_name}</span> vs <span className="font-medium text-foreground">{duel.contender_b_name}</span>
          </p>
        </div>
      </div>

      <Separator className="my-2" />

      {/* --- HISTORY LIST --- */}
      <div className="flex flex-col gap-12 py-4">
        {isLoading ? (
          <div className="flex justify-center p-10"><IconLoader className="animate-spin text-muted-foreground" /></div>
        ) : (
          turns.map((turn, index) => (
            <div key={turn.id} className="flex flex-col gap-6 group relative">
              {/* Turn label and delete action */}
              <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Turn {index + 1}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive h-6 w-6 transition-opacity"
                    onClick={() => deleteMutation.mutate(turn.id)}
                  >
                    <IconTrash className="size-3.5" />
                    <span className="sr-only">Delete turn</span>
                  </Button>
              </div>

              {/* User Bubble */}
              <div className="flex gap-4">
                 <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground"><IconUser className="size-4" /></AvatarFallback>
                 </Avatar>
                 <div className="flex-1">
                    {/* Standardized bubble style: primary background for user */}
                    <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap shadow-sm w-fit max-w-prose">
                       {turn.user_input}
                    </div>
                 </div>
              </div>

              {/* Split AI Responses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-12">
                 {/* Contender A - Minimalist Card with subtle indicator */}
                 <ResponseCard 
                   name={duel.contender_a_name} 
                   content={turn.response_a}
                   indicatorColor="bg-blue-500/70" // Subtle colored bar indicator
                 />

                 {/* Contender B */}
                 <ResponseCard 
                   name={duel.contender_b_name} 
                   content={turn.response_b}
                   indicatorColor="bg-orange-500/70"
                 />
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- NEW TURN EDITOR (Grounded at bottom) --- */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur z-10 p-4">
        <div className="max-w-4xl mx-auto">
           <div className="flex flex-col gap-4">
              
              {/* User Input */}
              <div className="space-y-2">
                 <Label htmlFor="userInput" className="text-xs font-medium text-muted-foreground uppercase">User Prompt</Label>
                 <Textarea 
                   id="userInput"
                   placeholder="Type next prompt..." 
                   className="min-h-[60px] resize-y"
                   value={userInput}
                   onChange={(e) => setUserInput(e.target.value)}
                 />
              </div>

              {/* Split Response Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="respA" className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
                        {/* Subtle color indicator next to label */}
                        <div className="size-2 rounded-full bg-blue-500/70" />
                        {duel.contender_a_name} Output
                    </Label>
                    <Textarea 
                      id="respA"
                      placeholder="Paste output..."
                      className="min-h-[120px] font-mono text-xs"
                      value={responseA}
                      onChange={(e) => setResponseA(e.target.value)}
                    />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="respB" className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase">
                        <div className="size-2 rounded-full bg-orange-500/70" />
                        {duel.contender_b_name} Output
                    </Label>
                    <Textarea 
                      id="respB"
                      placeholder="Paste output..."
                      className="min-h-[120px] font-mono text-xs"
                      value={responseB}
                      onChange={(e) => setResponseB(e.target.value)}
                    />
                 </div>
              </div>

              <Button onClick={handleSaveTurn} disabled={createMutation.isPending} className="w-full md:w-auto md:self-end">
                {createMutation.isPending ? <IconLoader className="mr-2 size-4 animate-spin" /> : <IconPlayerPlay className="mr-2 size-4 fill-current" />}
                Save Turn
              </Button>
           </div>
        </div>
      </div>
      
      {/* Invisible element to scroll to, pushed up by pb */}
      <div ref={scrollRef} className="h-10" />
    </div>
  )
}

// Helper component for the AI response cards to keep things clean
function ResponseCard({ name, content, indicatorColor }: { name: string, content: string, indicatorColor: string }) {
  return (
    <Card className="shadow-sm relative overflow-hidden border bg-card text-card-foreground">
      {/* Thin colored indicator bar on the left */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", indicatorColor)} />
      <CardHeader className="pb-2 pl-5 pt-4">
        <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
            <IconRobot className="size-4" />
            {name}
        </div>
      </CardHeader>
      <CardContent className="pl-5 text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </CardContent>
    </Card>
  )
}