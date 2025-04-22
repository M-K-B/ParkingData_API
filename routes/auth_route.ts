import { Router } from "../deps.ts";
import { googleLogin, login, signup } from "../controllers/authController.ts";

const router = new Router();
router.post("/register", await signup);
router.post("/login", await login);
router.post("/loginG", await googleLogin);
export default router;
