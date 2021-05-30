import { DefaultController } from "./controllers/default_controller";
import { UserController } from "./controllers/user_controller";
import { ParentRoute } from "fortjs";
import { FlumeController } from "./controllers/flume_controller";
import { RachioController } from "./controllers/rachio_controller";

export const routes: ParentRoute[] = [{
    path: "/*",
    controller: DefaultController
    }, {
    path: "/user",
    controller: UserController
    }, {
    path: "/flume",
    controller: FlumeController
    }, {
    path: "/rachio",
        controller: RachioController
    }];
