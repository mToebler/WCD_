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

/*
   All about the RachioService class
*/
export class RachioService {
//TODO: CONSTRUCTOR!!!!!!!!!!!
   /* 
      NOTE: Don't instantiate the Resource classes directly. Always 
      get an instance from the RachioClient or returned from a method on another Resource instance.
   */

   private rachioClient = new RachioClient(secrets.auth_token);

   getRachioDevices() {
      this.rachioClient.getDevices()
         .then(devices =>
            devices.array.forEach(device =>
               console.log(`Name: ${device.name}; Model: ${device.model}; ID: ${device.id}`)
            )
         )
         .catch(err => console.log('getRachioDevices Error: ', err));
            
         
   }

}