
import { Controller, DefaultWorker, Worker, textResult } from "fortjs";
import { RachioService } from "../services/rachio_service";

export class RachioController extends Controller {
    private rachio: RachioService;

    @DefaultWorker()
    async getDevices(service: RachioService) {
        this.rachio = new RachioService();
        this.rachio.getRachioDevices();
        
    }
}