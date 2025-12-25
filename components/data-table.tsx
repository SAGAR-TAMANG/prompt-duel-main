"use client"
import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconCopy,
  IconDotsVertical,
  IconExternalLink,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import useGetDuels from "@/hooks/use-get-duels"

// --- 1. NEW SCHEMA DEFINITION ---
export const schema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(), // "Active", "Draft", "Concluded"
  total_votes: z.number(),
  win_rate: z.object({
    winner: z.string().nullable(), // "A" or "B"
    percentage: z.number(),
    delta: z.number(),
  }),
  models: z.string(), // "GPT-4o vs Claude 3.5"
  created_at: z.string(),
  public_link: z.string(),
})

// Drag Handle Component
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent cursor-grab active:cursor-grabbing"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// --- 2. UPDATED COLUMNS ---
const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    size: 40,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    size: 40,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Duel Name",
    cell: ({ row }) => {
      // This triggers the Drawer
      return <TableCellViewer item={row.original} />
    },
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge 
          variant={status === "Active" ? "default" : "secondary"} 
          className={`px-1.5 ${status === "Active" ? "bg-green-600 hover:bg-green-700" : ""}`}
        >
          {status === "Active" && <IconLoader className="mr-1 size-3 animate-spin" />}
          {status === "Concluded" && <IconCircleCheckFilled className="mr-1 size-3" />}
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "total_votes",
    header: "Total Votes",
    cell: ({ row }) => (
      <div className="font-medium text-center">{row.original.total_votes}</div>
    ),
  },
  {
    accessorKey: "win_rate",
    header: "Win Rate (Δ)",
    cell: ({ row }) => {
      const { winner, percentage } = row.original.win_rate
      // Calculate width for Prompt A (Blue) vs Prompt B (Orange)
      // If winner is A, percentage is A's share. If winner is B, percentage is B's share.
      const winPct = percentage || 50
      const leftWidth = winner === "A" ? winPct : (100 - winPct)
      
      return (
        <div className="flex flex-col gap-1 w-32">
          <div className="flex text-xs justify-between text-muted-foreground">
            <span className={winner === "A" ? "font-bold text-slate-300" : ""}>A</span>
            <span className={winner === "B" ? "font-bold text-slate-700" : ""}>B</span>
          </div>
          <div className="h-2 w-full flex rounded-full overflow-hidden bg-muted">
             <div style={{ width: `${leftWidth}%` }} className="bg-slate-300" />
             <div className="flex-1 bg-slate-700" />
          </div>
          <div className="text-[10px] text-center text-muted-foreground">
             {winner ? `${winner} +${row.original.win_rate.delta}%` : "Tie"}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "models",
    header: "Models Used",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
        {row.original.models}
      </Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {new Date(row.original.created_at).toLocaleDateString()}
      </span>
    ),
  },
  {
    id: "public_link",
    header: "Link",
    cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => {
            navigator.clipboard.writeText(row.original.public_link)
            toast.success("Link copied to clipboard!")
          }}
        >
          <IconCopy className="size-3.5" />
          <span className="sr-only">Copy Link</span>
        </Button>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)

      return (
        <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>Edit Duel</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                setShowDeleteDialog(true)
              }}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this Duel?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{row.original.name}" and all {row.original.total_votes} votes collected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                toast.success("Duel deleted")
                setShowDeleteDialog(false)
              }}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </>
      )
    },
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

// --- 3. DATA TABLE COMPONENT (UNCHANGED LOGIC, JUST PASSING NEW SCHEMA) ---
export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const {data: fetchedData, isLoading, isError} = useGetDuels();
  const [data, setData] = React.useState<z.infer<typeof schema>[]>([]);

  React.useEffect(() => {
    if (fetchedData) {
      // Map the raw DB data (Duel) to your Table Schema
      const formattedData = fetchedData.map((duel) => ({
        id: Number(duel.id),
        name: duel.name,
        // Capitalize status if needed, or pass as is
        status: duel.status.charAt(0).toUpperCase() + duel.status.slice(1), 
        
        // --- Populate the missing UI fields with placeholders or calculations ---
        total_votes: 0, // You will eventually need a separate query to count these
        win_rate: {
          winner: null,
          percentage: 0,
          delta: 0,
        },
        // Combine the contender names
        models: `${duel.contender_a_name} vs ${duel.contender_b_name}`,
        created_at: duel.created_at,
        // Generate the link based on the ID
        public_link: typeof window !== 'undefined' 
          ? `${window.location.origin}/arena/${duel.id}` 
          : `/arena/${duel.id}`,
      }));

      setData(formattedData);
    }
  }, [fetchedData]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <Tabs defaultValue="all" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="all">All Duels</TabsTrigger>
          <TabsTrigger value="active">
            Active <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">View</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id.replace("_", " ")}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">New Duel</span>
          </Button>
        </div>
      </div>
      
      <TabsContent value="all" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No duels found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        {/* Pagination controls (kept same as before) */}
        <div className="flex items-center justify-between px-4 pb-4">
           {/* ... (Kept the pagination logic for brevity) ... */}
           <div className="text-muted-foreground text-sm">
             {table.getFilteredRowModel().rows.length} row(s)
           </div>
           <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

// --- 4. DRAWER CHART CONFIG ---
const chartData = [
  { day: "Mon", votes: 12 },
  { day: "Tue", votes: 34 },
  { day: "Wed", votes: 22 },
  { day: "Thu", votes: 56 },
  { day: "Fri", votes: 89 },
  { day: "Sat", votes: 104 },
]
const chartConfig = {
  votes: {
    label: "Votes",
    color: "var(--primary)",
  },
} satisfies ChartConfig

// --- 5. UPDATED DRAWER (TABLE CELL VIEWER) ---
function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile()
  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left font-semibold">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh] lg:h-full lg:w-[400px]">
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription>
            Created on {new Date(item.created_at).toDateString()}
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex flex-col gap-6 overflow-y-auto px-4 text-sm pb-10">
          {/* VOTE VELOCITY CHART */}
          <div className="rounded-lg border p-3">
             <div className="flex items-center gap-2 mb-2">
                <IconTrendingUp className="size-4 text-green-500" />
                <span className="font-medium">Vote Velocity (Last 7 Days)</span>
             </div>
             <ChartContainer config={chartConfig} className="h-32 w-full">
                <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="day" hide />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Area
                    dataKey="votes"
                    type="monotone"
                    fill="var(--color-votes)"
                    fillOpacity={0.2}
                    stroke="var(--color-votes)"
                    strokeWidth={2}
                  />
                </AreaChart>
             </ChartContainer>
          </div>

          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="name">Duel Name</Label>
              <Input id="name" defaultValue={item.name} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Concluded">Concluded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                 <Label htmlFor="votes">Total Votes</Label>
                 <Input id="votes" value={item.total_votes} disabled className="bg-muted" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="models">Models Compared</Label>
              <Input id="models" defaultValue={item.models} />
            </div>

            <Separator />
            
            <div className="flex flex-col gap-3">
               <Label>Public Link</Label>
               <div className="flex gap-2">
                  <Input readOnly value={item.public_link} className="bg-muted text-muted-foreground" />
                  <Button size="icon" variant="outline" onClick={() => {
                     navigator.clipboard.writeText(item.public_link)
                     toast.success("Copied!")
                  }}>
                     <IconCopy className="size-4" />
                  </Button>
               </div>
            </div>
          </form>
        </div>
        
        <DrawerFooter>
          <Button onClick={() => toast.success("Changes saved!")}>Save Changes</Button>
          <Button variant="secondary" onClick={() => window.open(item.public_link, '_blank')}>
             <IconExternalLink className="mr-2 size-4" />
             View Public Page
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}