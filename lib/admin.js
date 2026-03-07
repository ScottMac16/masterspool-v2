export function isSuperAdmin(userId) {
  return userId === process.env.NEXT_PUBLIC_SUPER_ADMIN_ID
}