import { Router } from "../deps.ts";
import { getallData } from "../controllers/parkingDataController.ts";

const router = new Router();
router.get("/getAllData", await getallData);

export default router;
