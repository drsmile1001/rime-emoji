export type ServiceMap = Record<string, unknown>;

/**
 * 工廠函數型別：指定依賴清單和輸出型別
 */
type Factory<
  T extends ServiceMap,
  Deps extends readonly (keyof T)[],
  R,
> = (deps: { [K in Deps[number]]: T[K] }) => R;

export class ServiceContainer<T extends ServiceMap> {
  private services = new Map<keyof T, T[keyof T]>();
  private factories = new Map<
    keyof T,
    {
      deps: readonly (keyof T)[];
      factory: (deps: Partial<T>) => unknown;
    }
  >();
  private constructing = new Set<keyof T>();

  // 多載定義
  register<K extends keyof T>(key: K, instance: T[K]): void;
  register<
    K extends keyof T,
    Deps extends readonly Exclude<keyof T, K>[],
    R extends T[K],
  >(key: K, deps: Deps, factory: Factory<T, Deps, R>): void;

  // 實作
  register<
    K extends keyof T,
    Deps extends readonly (keyof T)[],
    R extends T[K],
  >(key: K, instanceOrDeps: T[K] | Deps, factory?: Factory<T, Deps, R>): void {
    if (factory) {
      this.factories.set(key, {
        deps: instanceOrDeps as Deps,
        factory: factory as (deps: Partial<T>) => unknown,
      });
      return;
    }
    this.services.set(key, instanceOrDeps as T[K]);
  }

  resolve<K extends keyof T>(key: K): T[K] {
    if (this.services.has(key)) {
      return this.services.get(key) as T[K];
    }

    if (this.constructing.has(key)) {
      throw new Error(
        `Circular dependency detected while resolving '${String(key)}'.`,
      );
    }

    if (this.factories.has(key)) {
      const { deps, factory } = this.factories.get(key)!;
      const resolvedDeps: Partial<T> = {};
      this.constructing.add(key);
      try {
        for (const depKey of deps) {
          resolvedDeps[depKey] = this.resolve(depKey);
        }
        const service = factory(resolvedDeps) as T[K];
        this.services.set(key, service);
        return service;
      } finally {
        this.constructing.delete(key);
      }
    }

    throw new Error(`Service '${String(key)}' not found.`);
  }

  reset(): void {
    this.services.clear();
    this.factories.clear();
  }
}
