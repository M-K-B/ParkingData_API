import { Application } from "jsr:@oak/oak";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts"; // add this
import router from "./routes/index.ts";

const app = new Application();

// Enable CORS globally
app.use(
  oakCors({
    origin: "https://parking-dashboard2.vercel.app", // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);

// Your routes after CORS
app.use(router.routes());
app.use(router.allowedMethods());

export { app };
