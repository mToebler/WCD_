import { DefaultController } from "./controllers/default_controller";
import { UserController } from "./controllers/user_controller";
import { ParentRoute } from "fortjs";

export const routes: ParentRoute[] = [{
    path: "/*",
    controller: DefaultController
    }, {
    path: "/user",
    controller: UserController
    }];