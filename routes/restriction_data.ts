import { Router } from "../deps.ts";
import {
  addNewData,
  getallData,
} from "../controllers/parkingDataController.ts";

const router = new Router();

router.get("/getAllData", await getallData);
router.post("/AddNewData", await addNewData);

export default router;
