let adminStatusRequest: Promise<boolean> | null = null;

export function getAdminStatus(): Promise<boolean> {
  if (!adminStatusRequest) {
    adminStatusRequest = fetch("/api/profile", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return false;
        const data = await response.json();
        return Boolean(data.user?.isAdmin);
      })
      .catch(() => false);
  }
  return adminStatusRequest;
}

export function clearAdminStatus() {
  adminStatusRequest = null;
}