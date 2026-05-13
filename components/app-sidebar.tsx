"use client"

import * as React from "react"
import { useState, useEffect } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar"
import { RiFileLine, RiArrowRightSLine, RiFolderLine, RiAddLine } from "@remixicon/react"
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
import { getMyProjects, createProject, createDocument, getProjectDocuments } from "@/lib/api"
import { useParams } from "next/navigation"

type TreeItem = {
  name: string,
  type: 'document' | 'folder',
  id: string,
  children?: TreeItem[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams()
  const projectId = params.projectId as string
  const [projects, setProjects] = useState<any[]>([])
  const [documents, setDocuments] = useState<TreeItem[]>([])
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [newDocName, setNewDocName] = useState("")

  const fetchProjects = async () => {
    try {
      const data = await getMyProjects()
      setProjects(data)
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id)
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    }
  }

  const fetchDocuments = async (pid: string) => {
    try {
      const data = await getProjectDocuments(pid)
      // Map API documents to TreeItem format
      const mappedDocs: TreeItem[] = data.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: 'document',
      }))
      setDocuments(mappedDocs)
    } catch (error) {
      console.error("Failed to fetch documents:", error)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (projectId) {
      fetchDocuments(projectId)
    } else {
      setDocuments([])
    }
  }, [projectId])

  const handleCreateProject = async () => {
    const name = prompt("Enter project name:")
    if (!name) return
    try {
      await createProject({ name })
      alert("Project created successfully")
      fetchProjects()
    } catch (error: any) {
      alert("Failed to create project: " + error.message)
    }
  }

  const handleCreateDocument = async () => {
    if (!selectedProjectId || !newDocName) {
      alert("Please select a project and enter a name")
      return
    }
    try {
      await createDocument({ projectId: selectedProjectId, name: newDocName })
      alert("Document created successfully")
      setIsDocDialogOpen(false)
      setNewDocName("")
      // If we are currently in the project we just added a document to, refresh the list
      if (selectedProjectId === projectId) {
        fetchDocuments(projectId)
      }
    } catch (error: any) {
      alert("Failed to create document: " + error.message)
    }
  }

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>idek at this point smth</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleCreateProject}>
                  <RiAddLine />
                  <span>Create Project</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Dialog open={isDocDialogOpen} onOpenChange={(open) => {
                  setIsDocDialogOpen(open)
                  if (open) fetchProjects()
                }}>
                  <DialogTrigger asChild>
                    <SidebarMenuButton>
                      <RiFileLine />
                      <span>Create Document</span>
                    </SidebarMenuButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Document</DialogTitle>
                      <DialogDescription>
                        Select a project and enter the document name.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="project">Project</Label>
                        <select
                          id="project"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={selectedProjectId}
                          onChange={(e) => setSelectedProjectId(e.target.value)}
                        >
                          <option value="" disabled>Select a project</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="name">Document Name</Label>
                        <Input
                          id="name"
                          value={newDocName}
                          onChange={(e) => setNewDocName(e.target.value)}
                          placeholder="Chapter 1..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateDocument}>Create Document</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Documents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {documents.length > 0 ? (
                documents.map((item, index) => (
                  <Tree key={index} item={item} />
                ))
              ) : (
                <div className="px-4 py-2 text-xs text-gray-400">
                  {projectId ? 'No documents found' : 'Select a project to see documents'}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

function Tree({ item }: { item: TreeItem }) {
  const {name, type, id, children} = item;

  if (type !== 'folder') {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          className="data-[active=true]:bg-transparent"
          value={id}
        >
          <RiFileLine />
          {name}
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={name === "components" || name === "ui"}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton value={id}>
            {!children?.length ? <div className="w-4 h-4"/> : <RiArrowRightSLine className="transition-transform" />}
            <RiFolderLine />
            {name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
          {!children?.length ? null :
            <CollapsibleContent>
              <SidebarMenuSub>
                {children.map((subItem, index) => (
                  <Tree key={index} item={subItem} />
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          }
      </Collapsible>
    </SidebarMenuItem>
  )
}
