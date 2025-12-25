"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { IconPlus, IconLoader } from "@tabler/icons-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createDuel } from "@/lib/duels"

interface CreateDuelDialogProps {
  children?: React.ReactNode // Allow custom trigger button
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateDuelDialog({ children, ...props }: CreateDuelDialogProps) {
  const [name, setName] = React.useState("")
  const [isOpen, setIsOpen] = React.useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  // React Query Mutation for creating the duel
  const mutation = useMutation({
    mutationFn: createDuel,
    onSuccess: (data) => {
      toast.success("Duel created!")
      setIsOpen(false)
      setName("")
      
      // 1. Invalidate list so dashboard updates
      queryClient.invalidateQueries({ queryKey: ["get-duels"] })
      
      // 2. Redirect to the new Editor Page
      router.push(`/arena/${data.id}`) 
    },
    onError: (error) => {
      toast.error("Failed to create duel. Please try again.")
      console.error(error)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    mutation.mutate({
      name: name,
      // Defaults that make the page look populated immediately
      contender_a_name: "Prompt A", 
      contender_b_name: "Prompt B",
      status: "draft" 
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <IconPlus className="mr-2 size-4" />
            New Duel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Name your Duel</DialogTitle>
            <DialogDescription>
              Give this experiment a name. You can change this later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="name" className="text-left">
                Duel Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. email-agent-v1/v2"
                className="col-span-3"
                autoFocus
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={mutation.isPending || !name.trim()}
            >
              {mutation.isPending && (
                <IconLoader className="mr-2 size-4 animate-spin" />
              )}
              Create & Enter Arena
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}