console.log("di.ts run");

export class DIContainer {
  private static providers = new Map<any, any>();

  static register<T>(token: new (...args: any[]) => T, instance?: T) {
    const provider = instance || new token();
    DIContainer.providers.set(token, provider);
  }

  static resolve<T>(token: new (...args: any[]) => T): T {
    let provider = DIContainer.providers.get(token);

    if (!provider) {
      provider = new token();
      DIContainer.providers.set(token, provider);
    }

    return provider;
  }
}
