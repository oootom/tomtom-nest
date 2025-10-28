import { Application } from "../lib";
import { AppModule } from "./app.module";

async function bootstrap() {
  console.log("bootstrap run");
  console.log(AppModule.prototype);
  // const app = new Application(AppModule);
  // app.listen(3000, () => console.log('App is listening on port 3000'));
}

bootstrap();
