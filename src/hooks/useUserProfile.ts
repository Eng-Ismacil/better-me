"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  memberSince?: string;
  timezone?: string;
  isAdmin?: boolean;
}

interface ProfileApiResponse {
  user: UserProfileData;
  error?: string;
}

export const USER_PROFILE_QUERY_KEY = ["user-profile"] as const;

/**
 * Fetch profile data from API
 */
async function fetchUserProfile(): Promise<UserProfileData> {
  const res = await fetch("/api/profile", {
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) {
    throw new Error("Failed to load user profile");
  }
  const data: ProfileApiResponse = await res.json();
  if (!data?.user) {
    throw new Error(data.error || "User data missing");
  }
  return data.user;
}

/**
 * Hook to read and optimistically update user profile & avatar
 */
export function useUserProfile(initialProfile?: Partial<UserProfileData>) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: fetchUserProfile,
    staleTime: 30 * 1000, // 30s fresh
    gcTime: 10 * 60 * 1000, // 10m cache
    initialData: initialProfile?.id
      ? {
          id: initialProfile.id,
          name: initialProfile.name || "Admin",
          email: initialProfile.email || "",
          avatarUrl: initialProfile.avatarUrl || "/images/avatar.jpg",
          memberSince: initialProfile.memberSince || "",
          timezone: initialProfile.timezone || "UTC",
          isAdmin: initialProfile.isAdmin ?? true,
        }
      : undefined,
  });

  // Optimistic update for profile details (name, avatarUrl, timezone)
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { name?: string; avatarUrl?: string; timezone?: string }) => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      return data;
    },
    onMutate: async (newUpdates) => {
      // 1. Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: USER_PROFILE_QUERY_KEY });

      // 2. Snapshot current state for rollback
      const previousProfile = queryClient.getQueryData<UserProfileData>(USER_PROFILE_QUERY_KEY);

      // 3. Optimistically update local cache INSTANTLY (0ms latency)
      if (previousProfile) {
        queryClient.setQueryData<UserProfileData>(USER_PROFILE_QUERY_KEY, {
          ...previousProfile,
          ...newUpdates,
        });
      }

      return { previousProfile };
    },
    onError: (_err, _newUpdates, context) => {
      // Rollback to previous state on failure
      if (context?.previousProfile) {
        queryClient.setQueryData(USER_PROFILE_QUERY_KEY, context.previousProfile);
      }
    },
    onSettled: () => {
      // Always re-sync with server after settled
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    },
  });

  // Optimistic upload & update for avatar image file
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image");
      return data as { url: string; success: boolean };
    },
    onMutate: async (file) => {
      await queryClient.cancelQueries({ queryKey: USER_PROFILE_QUERY_KEY });

      const previousProfile = queryClient.getQueryData<UserProfileData>(USER_PROFILE_QUERY_KEY);

      // Instant local preview via Blob URL for 0ms visual feedback
      const localPreviewUrl = URL.createObjectURL(file);

      if (previousProfile) {
        queryClient.setQueryData<UserProfileData>(USER_PROFILE_QUERY_KEY, {
          ...previousProfile,
          avatarUrl: localPreviewUrl,
        });
      }

      return { previousProfile, localPreviewUrl };
    },
    onSuccess: (data) => {
      // Update with the permanent Cloudinary secure_url
      queryClient.setQueryData<UserProfileData>(USER_PROFILE_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          avatarUrl: data.url,
        };
      });
    },
    onError: (_err, _file, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(USER_PROFILE_QUERY_KEY, context.previousProfile);
      }
    },
    onSettled: (_data, _err, _variables, context) => {
      if (context?.localPreviewUrl) {
        URL.revokeObjectURL(context.localPreviewUrl);
      }
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    refetch: query.refetch,
  };
}
