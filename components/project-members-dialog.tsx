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
import { Label } from '@/components/ui/label';
import { getAllUsers, getProjectMembers, addProjectMember } from '@/lib/api';
import { RiGroupLine } from '@remixicon/react';

interface User {
  id: string;
  username: string;
}

interface Member {
  memberId: string;
  role: string;
  username: string;
}

export function ProjectMembersDialog({ projectId }: { projectId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('WRITER');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      Promise.all([getAllUsers(), getProjectMembers(projectId)])
        .then(([allUsers, projectMembers]) => {
          setUsers(allUsers);
          setMembers(projectMembers);
        })
        .catch(console.error);
    }
  }, [projectId, open]);

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      await addProjectMember(projectId, selectedUserId, selectedRole);
      const updatedMembers = await getProjectMembers(projectId);
      setMembers(updatedMembers);
      setSelectedUserId('');
    } catch (err) {
      console.error('Failed to add member:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <RiGroupLine className="w-4 h-4" />
          Manage Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Project Members</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Add New Member</Label>
            <div className="flex gap-2">
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select a user...</option>
                {users
                  .filter((u) => !members.some((m) => m.memberId === u.id))
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
              </select>
              <select
                className="flex h-10 w-[120px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="WRITER">Writer</option>
                <option value="MODERATOR">Moderator</option>
              </select>
              <Button onClick={handleAddMember} disabled={loading || !selectedUserId}>
                Add
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Current Members</Label>
            <div className="border rounded-md divide-y max-h-[200px] overflow-auto">
              {members.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No members found.
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.memberId} className="flex justify-between items-center p-3 text-sm">
                    <span className="font-medium">{member.username}</span>
                    <span className="text-[10px] bg-secondary px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                      {member.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
