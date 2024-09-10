export interface ActionState<T> {
  data: T | null;
  error: string | null;
}