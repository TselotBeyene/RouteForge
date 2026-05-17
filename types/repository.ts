export interface RepositorySummary {
  repositoryName: string;
  integrationCount: number;
  routeFileCount: number;
  manifestCount: number;
}

export interface RepositoryIntegration {
  name: string;
  sourceLanguage: "yaml" | "java" | string;
  sourcePath: string;
  manifestPath?: string | null;
  routeCount: number;
  routeUris: string[];
}

export interface RepositoryFileContent {
  path: string;
  content: string;
  language: "yaml" | "java" | "text" | string;
}
