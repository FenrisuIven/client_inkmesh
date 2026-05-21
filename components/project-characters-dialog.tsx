'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  getProjectCharacters, 
  getAvailableCharacters, 
  linkCharacter, 
  unlinkCharacter,
  getProjectMembers 
} from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { 
  RiUserAddLine, 
  RiUserSearchLine, 
  RiUserMinusLine, 
  RiSearchLine,
  RiCheckLine
} from '@remixicon/react';

interface Character {
  id: string;
  name: string;
  ownerAuth0Id: string;
  ownerName: string | null;
}

export function ProjectCharactersDialog({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'linked' | 'available'>('linked');
  const [linked, setLinked] = useState<Character[]>([]);
  const [available, setAvailable] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToLink, setSelectedToLink] = useState<Set<string>>(new Set());
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [linkedData, availableData, members] = await Promise.all([
        getProjectCharacters(projectId),
        getAvailableCharacters(projectId),
        getProjectMembers(projectId)
      ]);
      setLinked(linkedData);
      setAvailable(availableData);
      
      const me = members.find((m: any) => m.memberId === user?.id);
      setUserRole(me?.role || null);
    } catch (err) {
      console.error('Failed to fetch character data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, projectId]);

  const handleUnlink = async (characterId: string) => {
    if (!confirm('Are you sure you want to remove this character from the project?')) return;
    
    try {
      await unlinkCharacter(projectId, characterId);
      await fetchData();
    } catch (err) {
      console.error('Failed to unlink character:', err);
    }
  };

  const handleBulkLink = async () => {
    if (selectedToLink.size === 0) return;
    setLoading(true);
    try {
      await Promise.all(
        Array.from(selectedToLink).map(id => linkCharacter(projectId, id))
      );
      setSelectedToLink(new Set());
      setActiveTab('linked');
      await fetchData();
    } catch (err) {
      console.error('Failed to link characters:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedToLink);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedToLink(newSet);
  };

  const filteredAvailable = available.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canUnlink = (character: Character) => {
    if (userRole === 'OWNER' || userRole === 'MODERATOR') return true;
    return character.ownerAuth0Id === user?.auth0Id;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <RiUserSearchLine className="w-4 h-4" />
          Manage Characters
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[500px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Project Characters</DialogTitle>
        </DialogHeader>

        <div className="flex border-b px-6">
          <button
            onClick={() => setActiveTab('linked')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'linked' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Linked ({linked.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'available' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Link New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {activeTab === 'linked' ? (
            <div className="space-y-3">
              {linked.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No characters linked to this project yet.
                </div>
              ) : (
                linked.map(char => (
                  <div key={char.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarImage src={`https://avatar.vercel.sh/${char.id}.png`} />
                        <AvatarFallback>{char.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{char.name}</div>
                        <div className="text-xs text-muted-foreground">
                          by {char.ownerName || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    {canUnlink(char) && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        onClick={() => handleUnlink(char.id)}
                      >
                        <RiUserMinusLine className="size-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full gap-4">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Search available characters..." 
                  className="pl-9 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                {filteredAvailable.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    {searchQuery ? 'No matching characters found.' : 'All your available characters are already linked.'}
                  </div>
                ) : (
                  filteredAvailable.map(char => (
                    <div 
                      key={char.id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedToLink.has(char.id) ? 'bg-primary/5 border-primary/50' : 'hover:bg-accent/50'
                      }`}
                      onClick={() => toggleSelect(char.id)}
                    >
                      <Checkbox 
                        checked={selectedToLink.has(char.id)}
                        onCheckedChange={() => toggleSelect(char.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Avatar size="sm">
                        <AvatarImage src={`https://avatar.vercel.sh/${char.id}.png`} />
                        <AvatarFallback>{char.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{char.name}</div>
                        <div className="text-xs text-muted-foreground">
                          by {char.ownerName || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {selectedToLink.size} character(s) selected
                </span>
                <Button 
                  size="sm" 
                  disabled={selectedToLink.size === 0 || loading}
                  onClick={handleBulkLink}
                  className="gap-2"
                >
                  <RiCheckLine className="size-4" />
                  {loading ? 'Linking...' : 'Add Selected'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
