
import { Guards, Controller, DefaultWorker, Worker, textResult, HTTP_METHOD, Route } from "fortjs";
import { FlumeValidatorGuard } from "../guards/flume_validator_guard";
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
    @Guards(FlumeValidatorGuard)
    async getFlume(service: FlumeService) {
        // remember that data travels around with posts
        console.log('\n\ngetFlume fired!');
        let day = new Date();
        let payload: any;        
        if (false && typeof this.flume === 'undefined') {
            this.initFlume(this.flume)
                .then(flumeInstance => {
                    if (flumeInstance.DEBUG) console.log('getFlume: Starting queryFlumeByDate\n');
                    flumeInstance.queryFlumeByDate(day, this.flume)
                })
                .then(data => { payload = data; return payload})
                .catch(err => console.error('\n\ngetFlume: Error!: ', err));
        }
        if (typeof this.flume === 'undefined') {
            this.flume = await this.initFlume(this.flume);
            if (this.flume.DEBUG) console.log('getFlume: Starting queryFlumeByDate\n');
            payload = await this.flume.queryFlumeByDate(day, this.flume);
            if (this.flume.DEBUG) console.log('getFlume: payload: ', payload);
                
        }
        // return flume;
    }

    // @Worker(HTTP_METHOD.Get)
    // @Route("/range/{start}/{end}")
    // @Guards(FlumeValidatorGuard)
    // async getFlumeUseByRange(service: FlumeService) {
    //     const HOUR = 3600000;
    //     const startTime = new Date(this.param.start);
    //     const endTime = new Date(this.param.end);
    //     if (this.flume.DEBUG) console.log('getFlumeUseByRange: start: ', startTime, ' end: ', endTime, ' difference: ', endTime.getTime() - startTime.getTime(), ' limit: ', HOUR * 20);
    //     let payload: any;
    //     if (endTime.getTime() - startTime.getTime() < HOUR * 20) {         
    //         payload = await this.flume.queryFlumeByDateRange(startTime, endTime, this.flume);
    //         if (this.flume.DEBUG) console.log('getFlume: payload: ', payload);
    //     } else {
    //         console.log('getFlumeUseByRange: time range cannot be more than 20 hours.');
    //     }

        
    // }
    


}