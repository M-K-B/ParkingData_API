import { Router } from "../deps.ts";
import restrictionsRoutes from "./restriction_data.ts";

const router = new Router();
router.use(
    "/data",
    restrictionsRoutes.routes(),
    restrictionsRoutes.allowedMethods(),
);

export default router;
