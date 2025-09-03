// Les clés sont des préfixes de routes (ex: "/categories" protège tout ce qui commence par /categories)
export const routePermissions: Record<string, string[]> = {
  "/auth": ["admin", "authservice", "organizer"],
  "/dashboard": ["admin", "authservice", "organizer"],
  "/categories": ["admin", "authservice"],
  "/cities": ["admin", "authservice"],
  "/events": ["admin", "authservice"],
  "/places": ["admin", "authservice"],
  "/users": ["admin", "authservice"],
  "/reports": ["admin", "authservice"],
  "/profile": ["admin", "authservice", "organizer"],
  "/settings": ["admin", "authservice", "organizer"],
  "/my-events": ["organizer"],
  "/invitations": ["admin", "authservice", "organizer"],
  "/scan": ["admin", "authservice", "organizer"],
};
