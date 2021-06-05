import { Console } from "console";
import { Logger, jsonResult, Singleton, HTTP_STATUS_CODE, HTTP_METHOD, HttpRequest, HttpResponse } from "fortjs";
import { request } from "http";
// const json = require('json');
// const https = require('https');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const date = require('date-and-time');
import { secrets } from "../secrets";
const RachioClient = require('rachio');
const DEBUG = true;


const zoneCache = {
   zones: []
}
/*
   All about the RachioService class
*/
export class RachioService {

   public rachioClient;
//TODO: CONSTRUCTOR!!!!!!!!!!
   /* 
      NOTE: Don't instantiate the Resource classes directly. Always 
      get an instance from the RachioClient or returned from a method on another Resource instance.
   */
   constructor() {
      this.rachioClient = new RachioClient(secrets.auth_token);
      
   }


   getRachioDevices() {
      if (DEBUG) console.log('getRachioDevices: client: ', this.rachioClient);
      this.rachioClient.getDevices()
         .then(devices =>
            devices.array.forEach(device =>
               console.log(`Name: ${device.name}; Model: ${device.model}; ID: ${device.id}`)
            )
         )
         .catch(err => console.log('getRachioDevices Error: ', err));
            
         
   }

   getRachioDevice(id) {
      if (DEBUG) console.log('getRachioDevice: client: ', secrets.device_ID);
      this.rachioClient.getDevice(secrets.device_ID)
         .then(device => {
            console.log(`Name: ${device.name}; Model: ${device.model}; ID: ${device.id}`);
            return device;
         }
            )         
         .catch(err => console.log('getRachioDevice Error: ', err));
            
         
   }

   getRachioConditions(id) {
      if (DEBUG) console.log('getRachioDeviceConditions: client: ', secrets.device_ID);
      this.rachioClient.getDeviceCurrentConditions(secrets.device_ID)
         .then(conditions => {
            console.log(`conditions: `, conditions);
            return conditions;
         })
         .catch(err => console.log('getRachioConditions Error: ', err));
   }

   /* 
      Get Rachio Forecast
         returns an array of of Forecast objects for the next 14 days
   */
   getRachioForecast(id) {
      if (DEBUG) console.log('getRachioForecast: client: ', secrets.device_ID);
      this.rachioClient.getDeviceForecast(secrets.device_ID)
         .then(forecast => {
            console.log(`forecast: `, forecast);
            return forecast;
         })         
         .catch(err => console.log('getRachioForecast Error: ', err));
   }

   getRachioForecastDay(day) {
      this.rachioClient.getDeviceForecast(secrets.device_ID)
         .then(forecast => {
            console.log(`forecast day: ${day}: `, forecast[day])
            return forecast[day];
         })
         .catch(err => console.log('getRachioForecastDay Error: ', err));
   }
   
   getRachioZones(id) {
      this.rachioClient.getZonesByDevice(secrets.device_ID)
         .then(zones => {
            console.log(`Zones: `, zones)
            return zones;
         })
         .catch(err => console.log('getRachioZones', err));
   }

   getRachioZone(zoneId) {
      this.rachioClient.getZone(zoneId)
         .then(zone => {
            console.log(`Zone: `, zone);
            return zone;
         })
         .catch(err => console.log('getRachioZone', err));
   }

   getRachioByNumber(number) {      
      this.rachioClient.getDevice(secrets.device_ID)
         .then(device => device.getZones())
         .then(zones => {
            zones.forEach(zone => {
               let newZone = {
                  name: zone.name,
                  number: zone.zoneNumber,
                  id: zone.id,
                  image: zone.imageUrl,
                  lastWatered: zone.lastWateredDate
               };
               zoneCache.zones.push(newZone);
               console.log('getRachioByNumber: caching zone: ', newZone);
            });
            // return new Promise((resolve, reject) =>
            return zoneCache.zones.find(zone => zone.nubmer == number);
         })
         .catch(err => console.log('getRachioByNumber', err));
          
      // console.log(`${zone.name} : ${zone.zoneNumber} : ${zone.enabled} : ${zone.id}`)));
   }


}