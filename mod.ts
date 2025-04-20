import { Application } from "jsr:@oak/oak";
import router from "./routes/index.ts";

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

export { app };
