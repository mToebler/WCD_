
import { Controller, DefaultWorker, Worker, textResult, HTTP_METHOD, Route } from "fortjs";
import { FlumeService } from "../services/flume_service";

export class FlumeController extends Controller {

    @DefaultWorker()
    async initFlume(service: FlumeService) {
        console.log('\n\ninitFlume fired!');
        let flume = new FlumeService();
        return flume;
    }

    @Worker(HTTP_METHOD.Post)
    @Route("/")
    // @Guards(UserValidatorGuard)
    async getFlume(service: FlumeService) {
       // remember that data travels around with posts
       console.log('\n\ngetFlume fired!');
        let flume = new FlumeService();
        return flume;
    }
 

}