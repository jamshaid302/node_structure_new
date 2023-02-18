import { route } from "../../__types";
import { ImageController } from './controller';
const controller: ImageController = new ImageController();
const multer = require('multer');
const upload = multer({ dest: "temp/" });

const routes: route[] = [
    {path: controller.__component + "/add-image", method: "post", function: controller.uploadUserImage, uploader: upload.fields([{ name: 'images', maxCount: 5}]), private: true},
    {path: controller.__component + "/list", method: "get", function: controller.list, private: true},
    {path: controller.__component + "/delete-image", method: "post", function: controller.deleteUserImage, private: true},
]

export default routes;