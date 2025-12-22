import { createClient } from '@supabase/supabase-js';
import { GeneratedSpec, SpecMetadata, StoredSpec } from '@/types/analyzer';
import { generateShareId } from './spec-generator';

// Create Supabase client with service role for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Store a generated spec in the database
 */
export async function storeSpec(
  spec: GeneratedSpec,
  userId?: string
): Promise<{ shareId: string; success: boolean; error?: string }> {
  const shareId = spec.shareId || generateShareId();

  try {
    const { error } = await supabase.from('generated_specs').insert({
      share_id: shareId,
      repo_owner: spec.metadata.repoOwner,
      repo_name: spec.metadata.repoName,
      repo_url: spec.metadata.repoUrl,
      commit_sha: spec.metadata.commitSha || null,
      spec_markdown: spec.markdown,
      spec_json: spec,
      metadata: spec.metadata,
      user_id: userId || null,
      is_public: true,
    });

    if (error) {
      console.error('Error storing spec:', error);
      return { shareId, success: false, error: error.message };
    }

    return { shareId, success: true };
  } catch (err) {
    console.error('Error storing spec:', err);
    return { shareId, success: false, error: 'Failed to store specification' };
  }
}

/**
 * Retrieve a spec by share ID
 */
export async function getSpecByShareId(shareId: string): Promise<StoredSpec | null> {
  try {
    const { data, error } = await supabase
      .from('generated_specs')
      .select('*')
      .eq('share_id', shareId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as StoredSpec;
  } catch (err) {
    console.error('Error fetching spec:', err);
    return null;
  }
}

/**
 * Increment view count for a spec
 */
export async function incrementViewCount(shareId: string): Promise<void> {
  try {
    await supabase.rpc('increment_spec_view_count', { spec_share_id: shareId });
  } catch (err) {
    console.error('Error incrementing view count:', err);
  }
}

/**
 * Get cached spec for a repository (by owner/repo)
 * Returns the most recent spec if one exists from the last hour
 */
export async function getCachedSpec(owner: string, repo: string): Promise<StoredSpec | null> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('generated_specs')
      .select('*')
      .eq('repo_owner', owner)
      .eq('repo_name', repo)
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data as StoredSpec;
  } catch (err) {
    return null;
  }
}

/**
 * Get specs for a user
 */
export async function getUserSpecs(userId: string, limit: number = 20): Promise<StoredSpec[]> {
  try {
    const { data, error } = await supabase
      .from('generated_specs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user specs:', error);
      return [];
    }

    return (data as StoredSpec[]) || [];
  } catch (err) {
    console.error('Error fetching user specs:', err);
    return [];
  }
}

/**
 * Get popular analyzed repos
 */
export async function getPopularRepos(limit: number = 10): Promise<
  {
    repo_owner: string;
    repo_name: string;
    repo_url: string;
    analysis_count: number;
    total_views: number;
  }[]
> {
  try {
    const { data, error } = await supabase
      .from('popular_analyzed_repos')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Error fetching popular repos:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching popular repos:', err);
    return [];
  }
}

/**
 * Delete a spec (user must own it)
 */
export async function deleteSpec(shareId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('generated_specs')
      .delete()
      .eq('share_id', shareId)
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.error('Error deleting spec:', err);
    return false;
  }
}

/**
 * Update spec visibility
 */
export async function updateSpecVisibility(
  shareId: string,
  userId: string,
  isPublic: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('generated_specs')
      .update({ is_public: isPublic })
      .eq('share_id', shareId)
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.error('Error updating spec visibility:', err);
    return false;
  }
}
