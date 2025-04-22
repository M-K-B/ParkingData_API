import { Router } from "../deps.ts";
import restrictionsRoutes from "./restriction_data.ts";
import authRoutes from "./auth_route.ts";

const router = new Router();
router.use(
  "/api/v1",
  restrictionsRoutes.routes(),
  restrictionsRoutes.allowedMethods(),
  authRoutes.routes(),
  authRoutes.allowedMethods(),
);

export default router;
