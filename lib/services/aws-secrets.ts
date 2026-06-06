/**
 * Stub module — secrets are managed by the platform.
 * This file exists so instrumentation.ts imports resolve without errors.
 */
export async function loadSecretsIntoEnv(): Promise<void> {
  // No-op in user projects — secrets are injected by the platform at runtime.
}
