"use client"

import * as React from "react"

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
import { RiFileLine, RiArrowRightSLine, RiFolderLine } from "@remixicon/react"

type TreeItem = {
  name: string,
  type: 'document' | 'folder',
  id: string
} | TreeItem[]

const data: { tree: TreeItem[] } = {
  tree: [
    { name: 'Story-1', type: 'folder', id: 'aa549ee4-f37d-48f0-b1b0-05495cfb19e8' },
    [
      { name: 'Story-2', type: 'folder', id: '2ac053df-7c6a-486d-a8f1-83368162d200' },
      { name: 'document1', type: 'document', id: 'cccdb7ec-828b-4242-b004-62cb2c4fd48a' },
      { name: 'document2', type: 'document', id: 'cccdb7ec-828b-4242-b004-62cb2c4fd48a' },
      [{ name: 'Sub-Story1', type: 'folder', id: 'cccdb7ec-828b-4242-b004-62cb2c4fd48a' },
        { name: 'document3dddd', type: 'document', id: 'cccdb7ec-828b-4242-b004-62cb2c4fd48a' }]
    ]
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>idek at this point smth</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/*  */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Documents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.tree.map((item, index) => (
                <Tree key={index} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

function Tree({ item }: { item: TreeItem | TreeItem[] }) {
  const [treeItem, ...items] = Array.isArray(item) ? item : [item]
  const {name, type, id} = treeItem;

  if (!items.length && treeItem.type !== 'folder') {
    return (
      <SidebarMenuButton
        className="data-[active=true]:bg-transparent"
        value={id}
      >
        <RiFileLine />
        {treeItem.name}
      </SidebarMenuButton>
    )
  }
  else if (type == 'folder') {
    return <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={name === "components" || name === "ui"}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton value={id}>
            {!items.length ? <div className="w-4 h-4"/> : <RiArrowRightSLine className="transition-transform" />}
            <RiFolderLine />
            {name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
          {!items.length ? null :
            <CollapsibleContent>
              <SidebarMenuSub>
                {items.map((subItem, index) => (
                  <Tree key={index} item={subItem} />
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          }
      </Collapsible>
    </SidebarMenuItem>
  }
}
