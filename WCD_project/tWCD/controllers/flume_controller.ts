
import { Controller, DefaultWorker, Worker, textResult, HTTP_METHOD, Route } from "fortjs";
import { FlumeService } from "../services/flume_service";

export class FlumeController extends Controller {

    @DefaultWorker()
    async getFlume(service: FlumeService) {
        let flume = new FlumeService();
        return flume.flume_init();
    }

    @Worker(HTTP_METHOD.Post)
    @Route("/")
    // @Guards(UserValidatorGuard)
    async addUser(service: FlumeService) {
       // remember that data travels around with posts
        let flume = new FlumeService();
        return flume.flume_init();
    }
 

}