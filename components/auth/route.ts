import { route } from "../../__types";
import { AuthController } from './controller';
const controller: AuthController = new AuthController();

const routes: route[] = [
    {path: controller.__component + "/register", method: "post", function: controller.register, private: false},
    {path: controller.__component + "/login", method: "post", function: controller.login, private: false},
    {path: controller.__component + "/delete/:id", method: "get", function: controller.deleteImage, private: true},
]

export default routes;