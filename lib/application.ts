import * as http from "http";
import { DIContainer } from "./di";
import { Request, Response } from "./type";

console.log("application.ts run");

export class Application {
  private readonly server: http.Server;
  private controllers: any[] = [];

  constructor(private readonly module: any) {
    this.server = http.createServer(this.requestHandler.bind(this));
    this.initializeModule();
  }

  private initializeModule() {
    const controllers = Reflect.getMetadata("controllers", this.module) || [];
    const providers = Reflect.getMetadata("providers", this.module) || [];

    providers.forEach((provider) => {
      DIContainer.register(provider);
    });

    this.controllers = controllers.map((controller) => {
      const params = Reflect.getMetadata("design:paramtypes", controller) || [];
      const injections = params.map((param) => DIContainer.resolve(param));

      return new controller(...injections);
    });
  }

  private requestHandler(req: Request, res: Response) {
    for (const controller of this.controllers) {
      const prefix = Reflect.getMetadata("prefix", controller.constructor);
      const routes =
        Reflect.getMetadata("routes", controller.constructor) || [];

      for (const route of routes) {
        if (
          req.url === `${prefix}${route.path}` &&
          req.method === route.requestMethod
        ) {
          const parameters =
            Reflect.getMetadata(
              "parameters",
              controller.constructor,
              route.methodName
            ) || [];
          const args = new Array(parameters.length);

          parameters.forEach((param: any) => {
            if (
              typeof param.type !== "undefined" &&
              typeof param.index === "number"
            ) {
              if (param.type === "request") {
                args[param.index] = req;
              } else if (param.type === "response") {
                args[param.index] = res;
              }
            }
          });

          const result = controller[route.methodName](...args);
          res.end(result);
          return;
        }
      }
    }
    res.end("Not Found");
  }

  listen(port: number, callback?: () => void) {
    this.server.listen(port, callback);
  }
}
