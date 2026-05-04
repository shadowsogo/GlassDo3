import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGroups, GroupMember } from '@/hooks/useGroups';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sparkles, Plus, LogIn, Users, Crown, Copy, Trash2, LogOut, ArrowLeft, Eye } from 'lucide-react';
import { toast } from 'sonner';

const Groups = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { groups, loading, createGroup, joinGroup, getGroupMembers, leaveGroup, deleteGroup } = useGroups();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="text-primary animate-pulse" size={48} />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleCreate = async () => {
    try {
      const group = await createGroup(name, description);
      toast.success(`Group created! Join code: ${group?.join_code}`);
      setName(''); setDescription(''); setCreateOpen(false);
    } catch (err: unknown) {
      toast.error(err.message);
    }
  };

  const handleJoin = async () => {
    try {
      await joinGroup(joinCode.toUpperCase());
      toast.success('Joined group successfully!');
      setJoinCode(''); setJoinOpen(false);
    } catch (err: unknown) {
      toast.error(err.message || 'Invalid join code');
    }
  };

  const handleViewMembers = async (groupId: string) => {
    if (selectedGroup === groupId) { setSelectedGroup(null); return; }
    const m = await getGroupMembers(groupId);
    setMembers(m);
    setSelectedGroup(groupId);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Join code copied!');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="relative z-10 min-h-screen p-4 md:p-6 lg:p-8 max-w-[1000px] mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-foreground">
              <ArrowLeft size={20} />
            </Button>
            <Users className="text-primary" size={28} />
            <h1 className="font-display text-3xl font-bold glow-text text-foreground">Groups</h1>
          </div>
          <div className="flex gap-2">
            <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="glass border-white/10 text-foreground gap-2">
                  <LogIn size={16} /> Join
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-strong border-white/10 text-foreground">
                <DialogHeader>
                  <DialogTitle className="font-display glow-text">Join a Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label className="text-foreground/70 text-xs mb-1.5 block">Join Code</Label>
                    <Input
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value)}
                      placeholder="Enter group code"
                      className="glass border-white/10 text-foreground placeholder:text-muted-foreground uppercase"
                      onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    />
                  </div>
                  <Button onClick={handleJoin} className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-display">
                    Join Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="glass border-primary/30 hover:bg-primary/20 text-primary-foreground gap-2 font-display font-semibold">
                  <Plus size={16} /> Create
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-strong border-white/10 text-foreground">
                <DialogHeader>
                  <DialogTitle className="font-display glow-text">Create Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label className="text-foreground/70 text-xs mb-1.5 block">Group Name</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Team Alpha"
                      className="glass border-white/10 text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="text-foreground/70 text-xs mb-1.5 block">Description</Label>
                    <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this group about?"
                      className="glass border-white/10 text-foreground placeholder:text-muted-foreground" />
                  </div>
                  <Button onClick={handleCreate} className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-display">
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {groups.length === 0 ? (
          <div className="glass-strong rounded-2xl p-12 text-center">
            <Users className="mx-auto text-muted-foreground mb-4" size={48} />
            <h2 className="font-display text-xl text-foreground mb-2">No groups yet</h2>
            <p className="text-muted-foreground">Create a group or join one with a code</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map(group => (
              <div key={group.id} className="glass-strong rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-lg font-semibold text-foreground">{group.name}</h3>
                      {group.leader_id === user.id && (
                        <Crown size={16} className="text-yellow-400" />
                      )}
                    </div>
                    {group.description && <p className="text-sm text-muted-foreground mb-2">{group.description}</p>}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono bg-white/5 px-2 py-1 rounded">
                        Code: {group.join_code}
                      </span>
                      <button onClick={() => copyCode(group.join_code)} className="text-muted-foreground hover:text-primary">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/groups/${group.id}`)}
                      className="text-primary hover:bg-primary/10 gap-1">
                      <Eye size={14} /> View Tasks
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleViewMembers(group.id)}
                      className="text-muted-foreground hover:text-foreground gap-1">
                      <Users size={14} /> Members
                    </Button>
                    {group.leader_id === user.id ? (
                      <Button size="sm" variant="ghost" onClick={() => { deleteGroup(group.id); toast.success('Group deleted'); }}
                        className="text-destructive hover:bg-destructive/10">
                        <Trash2 size={14} />
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => { leaveGroup(group.id); toast.success('Left group'); }}
                        className="text-muted-foreground hover:text-destructive">
                        <LogOut size={14} />
                      </Button>
                    )}
                  </div>
                </div>

                {selectedGroup === group.id && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Members</h4>
                    <div className="space-y-2">
                      {members.map(m => (
                        <div key={m.id} className="flex items-center gap-2 text-sm">
                          {m.role === 'leader' && <Crown size={12} className="text-yellow-400" />}
                          <span className="text-foreground">{m.profile?.display_name || 'Unknown'}</span>
                          <span className="text-muted-foreground text-xs">({m.role})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;
