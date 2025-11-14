// Claim de roles en Auth0 Actions/Rules
export const ROLES_CLAIM = "https://foodlytics.app/roles" as const;

// La web solo es para nutritionists; "admin" ≡ "nutritionist"
export const ADMIN_ROLE = "nutritionist" as const;
