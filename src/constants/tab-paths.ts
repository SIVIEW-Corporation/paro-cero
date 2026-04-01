export const tabPaths = ['/dashboard'] as const;

export type TabPath = (typeof tabPaths)[number];
