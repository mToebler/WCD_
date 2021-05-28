
import { Controller, DefaultWorker, Worker, textResult, HTTP_METHOD, Route } from "fortjs";
import { FlumeService } from "../services/flume_service";

export class FlumeController extends Controller {
    private flume: FlumeService;

    @DefaultWorker()
    async initFlume(service: FlumeService) {
        console.log('\n\ninitFlume fired!');
        this.flume = new FlumeService();
        return this.flume;
    }

    @Worker(HTTP_METHOD.Post)
    @Route("/")
    // @Guards(UserValidatorGuard)
    async getFlume(service: FlumeService) {
        // remember that data travels around with posts
        console.log('\n\ngetFlume fired!');
        if (typeof this.flume === 'undefined') this.initFlume(this.flume);
        // return flume;
        let day = new Date();
        return this.flume.queryFlumeByDate(day);
    }


}