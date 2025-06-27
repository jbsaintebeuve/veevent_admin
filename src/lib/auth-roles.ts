// Centralisation des rôles autorisés pour l'accès à l'admin
export const allowedRoles = ["admin", "authservice", "organizer"];

export function isRoleAllowed(role?: string): boolean {
  return !!role && allowedRoles.includes(role.toLowerCase());
}
