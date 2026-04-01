export const tabPaths = [
  '/assets',
  '/plans',
  '/workorders',
  '/inspecciones',
  '/notifications',
  '/reports',
] as const;

export type TabPath = (typeof tabPaths)[number];
