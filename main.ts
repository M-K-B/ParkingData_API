import { app } from "./mod.ts";
import { PORT } from "./config/config.ts";

console.log(`Server running on http://localhost:${PORT}`);
await app.listen({ port: PORT });
