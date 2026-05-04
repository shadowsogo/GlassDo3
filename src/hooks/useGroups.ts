import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  join_code: string;
  leader_id: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: { display_name: string };
}

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    if (!user) { setGroups([]); setLoading(false); return; }
    
    // Get groups where user is a member
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id);

    if (memberships && memberships.length > 0) {
      const groupIds = memberships.map(m => m.group_id);
      const { data } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);
      setGroups(data || []);
    } else {
      setGroups([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const createGroup = useCallback(async (name: string, description: string) => {
    if (!user) return;
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data, error } = await supabase
      .from('groups')
      .insert({ name, description, join_code: joinCode, leader_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    
    // Add creator as leader member
    await supabase
      .from('group_members')
      .insert({ group_id: data.id, user_id: user.id, role: 'leader' });

    await fetchGroups();
    return data;
  }, [user, fetchGroups]);

  const joinGroup = useCallback(async (joinCode: string) => {
    const { data, error } = await supabase.rpc('join_group_by_code', { _join_code: joinCode });
    if (error) throw error;
    await fetchGroups();
    return data;
  }, [fetchGroups]);

  const getGroupMembers = useCallback(async (groupId: string): Promise<GroupMember[]> => {
    const { data: members } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId);
    
    if (!members) return [];

    // Fetch profiles for members
    const userIds = members.map(m => m.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', userIds);

    return members.map(m => ({
      ...m,
      profile: profiles?.find(p => p.user_id === m.user_id),
    }));
  }, []);

  const leaveGroup = useCallback(async (groupId: string) => {
    if (!user) return;
    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id);
    await fetchGroups();
  }, [user, fetchGroups]);

  const deleteGroup = useCallback(async (groupId: string) => {
    await supabase.from('groups').delete().eq('id', groupId);
    await fetchGroups();
  }, [fetchGroups]);

  return { groups, loading, createGroup, joinGroup, getGroupMembers, leaveGroup, deleteGroup, refetch: fetchGroups };
}
