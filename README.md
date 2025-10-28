# 打造一个 NestJS 风格框架

> 🏝️ NestJS 是非常流行的 Node.js 服务端框架，本项目简略介绍如何制作一个 NestJS 风格的 mini 框架。

## 所谓设计模式

AOP（面向切面编程）、IoC（控制反转）和 OOP（面向对象编程）是软件开发中的三个概念，它们在构建复杂软件系统时相互关联并且互补。

1. **OOP（面向对象编程）**:
   - OOP 是一种编程范式，它使用“对象”来设计应用程序。对象可以包含数据（属性）和代码（方法）。OOP 的主要特点包括封装、继承和多态。
   - 封装隐藏了对象的内部状态，并通过公共方法暴露行为。
   - 继承允许新的对象类从现有的对象类继承属性和方法。
   - 多态允许不同类的对象被视为同一类型的实例，使得可以用统一的方式处理不同类型的对象。
2. **IoC（控制反转）**:
   - IoC 是一种设计原则，用于减少代码之间的耦合。在传统的编程实践中，代码（如对象）通常自行创建和管理它们的依赖关系。在 IoC 中，这种控制被反转：对象的创建和依赖关系的管理交给外部容器或框架。
   - 依赖注入（DI）是实现 IoC 的一种方法，它允许将依赖关系（如服务、配置）动态地注入到组件中，而不是由组件自己创建。
   - IoC 容器负责实例化对象、管理它们的生命周期和注入依赖关系。
3. **AOP（面向切面编程）**:
   - AOP 是一种编程范式，它允许开发者将横切关注点（如日志记录、事务管理、安全等）从业务逻辑中分离出来。
   - 在 AOP 中，这些横切关注点被封装到“切面”中，切面可以在程序的不同点（称为“连接点”）被动态地应用。
   - AOP 提高了代码的模块化，使得横切关注点的维护和重用变得更加容易。

**关系**:

- **AOP、IoC 与 OOP 的关系**：OOP 提供了构建应用程序的基础结构，而 AOP 和 IoC 是在 OOP 基础上提出的两种高级概念，用于解决 OOP 在处理某些类型的问题时的局限性。
- **AOP 与 IoC 的关系**：AOP 可以与 IoC 容器协同工作。例如，AOP 切面可以通过 IoC 容器进行配置和管理，切面中的依赖关系可以通过依赖注入来解决。
- **相互补充**：AOP 和 IoC 都是为了提高代码的可维护性和可扩展性。IoC 通过控制反转来管理对象的创建和依赖，而 AOP 通过切面来管理横切关注点。它们都是在 OOP 的基础上提供额外的结构和模式，以便更好地组织和管理复杂的代码。

在现代软件开发中，这些概念经常被综合使用，特别是在使用如 Spring、NestJS 等框架时，它们提供了对这些概念的内置支持，使得开发者可以更加专注于业务逻辑的实现。

### IoC & DI

IoC 到底是什么有什么用，可以通过一个简单的例子说明。

```ts
class Wing {}

class Bird {
  private wing: Wing;

  constructor() {
    this.wing = new Wing();
  }
}

const bird = new Bird();
```

`Bird` 类依赖于 `Wing` 类，如果 `Wing` 类有修改，则会影响 `Bird` 类，如果依赖的层级越深，每修改一个底层的类给上层类带来的影响将是毁灭性的（代码及其难维护）。

`IoC` 的思想就是将类的依赖动态注入，使得底层的类的修改不会影响到依赖它的类：

```ts
class Wing {}

class Bird {
  private wing: Wing;

  constructor(wing) {
    this.wing = wing;
  }
}

const wing = new Wing();
const bird = new Bird(wing); // 将实例化的 wing 传入 Bird 类
```

这样，我们便实现了类的**控制反转**。同时，我们需要有一个容器来维护各个对象实例，当用户需要使用实例时，容器会自动将对象实例化给用户。

```ts
import { Container, Service } from "typedi";

@Service()
class Wing {}

class Bird {
  private wing: Wing;

  constructor() {
    this.wing = Container.get("Wing");
  }
}
```

这种动态注入的思想就是 **依赖注入**（DI, Dependency Injection），**它是 IoC 的一种应用形式**。

## NestJS

NestJS 的特点有：

1. **依赖注入（IoC & DI）**: NestJS 强烈依赖于依赖注入设计模式，这种模式有助于提高代码的模块化和可测试性。通过依赖注入，NestJS 允许开发者定义可重用的服务（providers），并将它们注入到控制器和其他服务中，从而实现了松耦合和高内聚的设计。
2. **面向切面编程（AOP）**: NestJS 支持面向切面编程的概念，允许开发者通过拦截器（Interceptors）、守卫（Guards）、过滤器（Filters）和自定义装饰器等方式，将某些行为横切到对象的层次结构中，从而增强了代码的复用性和抽象性。
3. **函数式响应式编程（FRP）**: NestJS 与 RxJS 的集成提供了对函数式响应式编程的支持，使得处理异步操作和事件更加灵活和强大（关于响应式编程与 RxJS，涉及内容较多，本项目不体现）。

NestJS 提供一个层次清晰、易于理解和扩展的框架，以此来创建高效、可靠和可维护的服务器端应用程序。

## 装饰器 & 元数据

### TS 装饰器

TypeScript 的装饰器实现了对类型（这里是指 TypeScript 的类型）的元数据注入，使得程序在运行时也能去检查其类型相关信息。

TypeScript 装饰器主要有：

- 方法装饰器
- 类装饰器
- 属性装饰器
- 参数装饰器
- Accessor 装饰器

关于 TypeScript 装饰器相关可以移步：[Decorators & metadata reflection in TypeScript: From Novice to Expert (Part I)](https://www.wolksoftware.com/blog/decorators-reflection-javascript-typescript)

### 元数据反射

Reflect Metadata 是 ES7 的一个提案，它主要用来在声明的时候添加和读取元数据。元数据反射主要用来在声明的时候添加和读取元数据，如：

- 实例的名字
- 实例的类型
- 实例实现的接口
- 实例的属性名字和类型
- 实例构造函数的参数名和类型

Reflect Metadata 的 API 可以用于类或者类的属性上，如：

```ts
function metadata(
  metadataKey: any,
  metadataValue: any
): {
  (target: Function): void;
  (target: Object, propertyKey: string | symbol): void;
};
```

Reflect Metadata 内置了三个元数据类型：

- 类型元数据 **"design:type"**
- 参数类型元数据 **"design:paramtypes"**
- 返回值类型元数据 **"design:returntype"**

## 代码实现

启动服务：

```bash
npm run dev
```

访问接口：

```bash
➜  ~ curl 'http://localhost:3000/test/get' -v
*   Trying [::1]:3000...
* Connected to localhost (::1) port 3000
> GET /test/get HTTP/1.1
> Host: localhost:3000
> User-Agent: curl/8.4.0
> Accept: */*
>
< HTTP/1.1 200 OK
< Date: Tue, 28 May 2024 03:33:59 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
< Content-Length: 38
<
* Connection #0 to host localhost left intact
Hello World with GET from TestService!%
```

## 装饰器执行时机与代码执行流程

### 装饰器执行时机总结

所有装饰器都在**模块加载时**（即文件被 import 时）执行，而不是在应用启动或请求处理时执行。

**关键时机点：**

| 阶段           | 触发时机          | 装饰器执行 | 元数据操作 |
| -------------- | ----------------- | ---------- | ---------- |
| **模块加载**   | import 语句执行时 | ✅ 执行    | 💾 写入    |
| **应用初始化** | new Application() | ❌ 不执行  | 📖 读取    |
| **请求处理**   | 每次 HTTP 请求    | ❌ 不执行  | 📖 读取    |

**装饰器只在模块加载时执行一次，之后只是读取它们写入的元数据！**

具体执行顺序：

1. **装饰器工厂函数**先执行（如 `@Controller('/test')` 中的 `Controller('/test')`）
2. 紧接着**装饰器返回的函数**对目标（类/方法/参数）执行，并写入元数据
3. 因此 `@Module`、`@Controller`、`@Get`、`@Post`、参数装饰器 `@Req()`/`@Res()` 都是在其所在文件被加载（import）时就执行

### npm run dev 完整执行流程

#### 阶段 1: 启动与初始化

```
命令行
  $ npm run dev
      ↓
  ts-node-dev ./src/main.ts --watch
      ↓
```

#### 阶段 2: 模块加载 & 装饰器执行（关键阶段）

```
📁 src/main.ts [开始执行]
  │
  ├─► import { Application } from "../lib"
  │     └─► 📁 lib/index.ts
  │           ├─► import 'reflect-metadata' ✓ [元数据API初始化]
  │           ├─► export * from './application'
  │           ├─► export * from './decorator'
  │           └─► export * from './type'
  │
  ├─► import { AppModule } from "./app.module"
  │     └─► 📁 src/app.module.ts [开始执行]
  │           │
  │           ├─► import { Module } from "../lib" ✓
  │           │
  │           ├─► import { Logger } from './common/logger'
  │           │     └─► 📁 src/common/logger.ts [加载完成]
  │           │
  │           ├─► import { TestController } from "./test.controller"
  │           │     └─► 📁 src/test.controller.ts [开始执行]
  │           │           │
  │           │           ├─► import 装饰器函数 ✓
  │           │           │
  │           │           ├─► 🎯 @Controller('/test')
  │           │           │    ├─ 执行: Controller('/test')
  │           │           │    │   📝 console.log("Controller decorator run")
  │           │           │    └─ 执行返回函数(TestController)
  │           │           │        📝 console.log("Controller decorator return run")
  │           │           │        💾 Reflect.defineMetadata("prefix", "/test", TestController)
  │           │           │        💾 Reflect.defineMetadata("routes", [], TestController)
  │           │           │
  │           │           ├─► 🎯 @Get('/get')
  │           │           │    ├─ 执行: Get('/get')
  │           │           │    │   📝 console.log("Route decorator run")
  │           │           │    └─ 执行返回函数(target, "getHello", descriptor)
  │           │           │        📝 console.log("Route decorator return run")
  │           │           │        💾 Reflect.defineMetadata("routes", [{...}], TestController)
  │           │           │
  │           │           ├─► 🎯 @Req()
  │           │           │    └─ 执行参数装饰器
  │           │           │        💾 Reflect.defineMetadata("parameters", [{type:"request", index:0}], ...)
  │           │           │
  │           │           └─► 🎯 @Post('/post')
  │           │                ├─ 执行: Post('/post')
  │           │                │   📝 console.log("Route decorator run")
  │           │                └─ 执行返回函数(target, "postHello", descriptor)
  │           │                    📝 console.log("Route decorator return run")
  │           │                    💾 Reflect.defineMetadata("routes", [{...}], TestController)
  │           │
  │           ├─► import { TestService } from "./test.service"
  │           │     └─► 📁 src/test.service.ts [开始执行]
  │           │           │
  │           │           └─► 🎯 @Injectable()
  │           │                ├─ 执行: Injectable()
  │           │                └─ 执行返回函数(TestService)
  │           │                    💾 [无操作，装饰器为空]
  │           │
  │           └─► 🎯 @Module({ controllers: [...], providers: [...] })
  │                ├─ 执行: Module({...})
  │                │   📝 console.log("Module decorator run")
  │                └─ 执行返回函数(AppModule)
  │                    📝 console.log("Module decorator return run")
  │                    💾 Reflect.defineMetadata("controllers", [TestController], AppModule)
  │                    💾 Reflect.defineMetadata("providers", [Logger, TestService], AppModule)
  │
  └─► async function bootstrap() { ... }
        └─ 调用 bootstrap()
```

#### 阶段 3: 应用初始化（仅当 new Application(AppModule) 时）

```
📁 bootstrap() 内部
  │
  ├─► new Application(AppModule)
  │     │
  │     ├─► http.createServer(this.requestHandler) [创建HTTP服务器]
  │     │
  │     └─► this.initializeModule()
  │           │
  │           ├─► 📖 Reflect.getMetadata('controllers', AppModule)
  │           │      → [TestController]
  │           │
  │           ├─► 📖 Reflect.getMetadata('providers', AppModule)
  │           │      → [Logger, TestService]
  │           │
  │           ├─► providers.forEach(provider => {
  │           │      DIContainer.register(provider)
  │           │   })
  │           │      → DIContainer: { Logger: Logger类, TestService: TestService类 }
  │           │
  │           └─► controllers.map(controller => {
  │                 📖 params = Reflect.getMetadata('design:paramtypes', TestController)
  │                    → [Logger, TestService]
  │                 📖 injections = params.map(param => DIContainer.resolve(param))
  │                    → [new Logger(), new TestService()]
  │                 return new TestController(new Logger(), new TestService())
  │               })
  │                  → this.controllers = [testControllerInstance]
  │
  └─► app.listen(3000)
        📝 console.log('App is listening on port 3000')
        🌐 [HTTP服务器开始监听]
```

#### 阶段 4: 请求处理（每次 HTTP 请求到来时）

```
浏览器/客户端
  │
  └─► GET http://localhost:3000/test/get
        │
        └─► requestHandler(req, res)
              │
              ├─► for (const controller of this.controllers) {
              │     │
              │     ├─► 📖 prefix = Reflect.getMetadata('prefix', TestController)
              │     │      → "/test"
              │     │
              │     ├─► 📖 routes = Reflect.getMetadata('routes', TestController)
              │     │      → [
              │     │          { requestMethod: "GET", path: "/get", methodName: "getHello" },
              │     │          { requestMethod: "POST", path: "/post", methodName: "postHello" }
              │     │        ]
              │     │
              │     ├─► 匹配路由: req.url === "/test/get" && req.method === "GET" ✓
              │     │
              │     ├─► 📖 parameters = Reflect.getMetadata('parameters', TestController, 'getHello')
              │     │      → [{ type: "request", index: 0 }]
              │     │
              │     ├─► 构建参数: args[0] = req
              │     │
              │     ├─► 🚀 result = controller.getHello(req)
              │     │      │
              │     │      ├─► this.logger.log(req.method, req.url)
              │     │      │     📝 console.log("[Logger]", "GET", "/test/get")
              │     │      │
              │     │      └─► return this.testService.getHello()
              │     │            → "Hello World with GET from TestService!"
              │     │
              │     └─► res.end(result)
              │           → 返回给客户端
              │
              └─► [完成]
```

### 控制台输出顺序

```
启动时（装饰器执行阶段）:
1. "Controller decorator run"
2. "Controller decorator return run"
3. "Route decorator run"              ← @Get('/get')
4. "Route decorator return run"
5. "Route decorator run"              ← @Post('/post')
6. "Route decorator return run"
7. "Module decorator run"
8. "Module decorator return run"

应用启动:
9. "App is listening on port 3000"

请求时:
10. "[Logger] GET /test/get"          ← 每次请求都会打印
```

### 简化流程图

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 阶段 1: 启动与初始化                                                      │
└─────────────────────────────────────────────────────────────────────────┘
命令行
  $ npm run dev
      ↓
  ts-node-dev ./src/main.ts --watch

┌─────────────────────────────────────────────────────────────────────────┐
│ 阶段 2: 模块加载 & 装饰器执行（这是关键！）                                │
└─────────────────────────────────────────────────────────────────────────┘
main.ts
  └─► import lib/index.ts
        └─► import 'reflect-metadata' ✓
  └─► import app.module.ts
        ├─► import test.controller.ts
        │     ├─► @Controller('/test')     [装饰器执行/写元数据/打印log]
        │     ├─► @Get('/get')            [装饰器执行/写元数据/打印log]
        │     └─► @Post('/post')          [装饰器执行/写元数据/打印log]
        ├─► import test.service.ts
        │     └─► @Injectable()           [装饰器执行/写元数据]
        └─► @Module({...})                [装饰器执行/写元数据/打印log]

┌─────────────────────────────────────────────────────────────────────────┐
│ 阶段 3: 应用初始化（仅当 new Application(AppModule) 时）                  │
└─────────────────────────────────────────────────────────────────────────┘
bootstrap()
  └─► new Application(AppModule)
        ├─► http.createServer(requestHandler)
        ├─► initializeModule()
        │     ├─► 读取 AppModule.controllers/providers 元数据
        │     ├─► 注册 providers（DIContainer.register）
        │     └─► 实例化 controllers（利用 design:paramtypes 注入）
        └─► listen(3000)

┌─────────────────────────────────────────────────────────────────────────┐
│ 阶段 4: 请求处理（每次HTTP请求到来时）                                     │
└─────────────────────────────────────────────────────────────────────────┘
GET http://localhost:3000/test/get
  └─► requestHandler(req, res)
        ├─► 读取 controller.prefix / routes / parameters 元数据
        ├─► 匹配 method+url → 目标方法
        ├─► 依参数装饰器注入 req/res
        └─► 执行方法并 res.end(result)
```
