
import { Controller, DefaultWorker, Worker, Guards, jsonResult, textResult, Singleton, HTTP_METHOD, Route } from "fortjs";
import { RachioService } from "../services/rachio_service";
import { RachioGuard } from "../guards/rachio_guard";

export class RachioController extends Controller {
    // private rachio: RachioService;
    private devices;
    private DEBUG = true;

    @DefaultWorker()        
    async getRachio(@Singleton(RachioService) service) {
        service = new RachioService();        
        if (this.DEBUG) console.log('R_Controller: service: ', service);        
    }

    @Worker(HTTP_METHOD.Get)
    @Guards(RachioGuard)
    @Route('/device/{id}')        
    async getDevices(@Singleton(RachioService) service) {
        // swallowing id
        return jsonResult(service.getRachioDevice(this.param.id));         
    }

    /*
        Get State: returns following object:
            localizedTimeStamp: 1622358000000,
            precipIntensity: 0,
            precipProbability: 0,
            windSpeed: 7.46,
            humidity: 0.13,
            cloudCover: 0.04,
            dewPoint: 25,
            weatherType: 'clear-day',
            currentTemperature: 87,
            weatherSummary: 'Sunny',
            weatherStationId: 'KVGT',
            icons: {},
            prettyTime: '2021-05-30T00:00:00-07:00',
            calculatedPrecip: 0,
    */
    @Worker(HTTP_METHOD.Get)
    @Guards(RachioGuard)
    @Route('/device/{id}/conditions')        
    async getConditions(@Singleton(RachioService) service) {
        console.log('controller: ', await jsonResult(service.getRachioConditions(this.param.id)));
        // return jsonResult(service.getRachioDeviceState(this.param.id));
    }

    @Worker(HTTP_METHOD.Get)
    @Guards(RachioGuard)
    @Route('/device/{id}/forecast')        
    async getForecast(@Singleton(RachioService) service) {
        // swallowing id
        return jsonResult(service.getRachioForecast(this.param.id));         
    }

    @Worker(HTTP_METHOD.Get)
    @Guards(RachioGuard)
    @Route('/device/{id}/forecast/{day}')        
    async getForecastDay(@Singleton(RachioService) service) {
        // swallowing id
        return jsonResult(service.getRachioForecastDay(this.param.day));         
    }



}