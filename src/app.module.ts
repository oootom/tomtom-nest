import { Module } from "../lib";

import { Logger } from "./common/logger";
import { TestController } from "./test.controller";
import { TestService } from "./test.service";

console.log("app.module.ts run");

@Module({
  controllers: [TestController],
  providers: [Logger, TestService],
})
export class AppModule {}
