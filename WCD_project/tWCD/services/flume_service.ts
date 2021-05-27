import { Console } from "console";
import { Logger, jsonResult, Singleton, HTTP_STATUS_CODE, HTTP_METHOD, HttpRequest, HttpResponse } from "fortjs";
import { request } from "http";
// const json = require('json');
// const https = require('https');
const fetch = require('node-fetch');
import { secrets } from "../secrets";

/*
   FlumeService contains all the Flume specific logic
   pulls from "secrets.ts" 
*/
export class FlumeService {

   protected path_base: string;
   protected access_token: string;
   protected payload: {};

   constructor() {
      this.payload = {
         method: 'POST',
         headers: {Accept: 'application/json', 'Content-Type': 'application/json'},         
         body: JSON.stringify({
            grant_type: "password",
            client_id: secrets.flume_keys.flume_client_id,
            client_secret: secrets.flume_keys.flume_client_secret,
            username: secrets.flume_keys.flume_username,
            password: secrets.flume_keys.flume_password
         })
      };
      this.access_token = "";
      //_flume_keys = deepcopy(flume_keys) //turn f_keys into a class
      // TODO:You got tired. You need to continue the stateful initilization of the flume object.
      this.path_base = "https://api.flumewater.com";
      // initlialize this instance
      this.flume_init();
   }
   
   flume_init() {
      let url = this.path_base + "/oauth/token";
      // headers = {"Content-Type": "application/json"};
      fetch(url, this.payload)
         .then(res => res.json())
         .then(json => console.log(json))
         .catch(err => console.error('error' + err));
      // https.request();
      // let response = HttpRequest.request("POST", url);
   }
      /*
   let response = http.requests.request("POST", url, 
                               json=self.payload, headers=self.getHeaders());
   
   parsed = json.loads(response.text)
   # print(json.dumps(parsed, indent=2))
   # print(type(parsed))
   self.access_token = parsed["data"][0]["access_token"]
   # print(access_token.pop().get("access_token"))
   # print(access_token)
   # the access_token is a base64 encoded string. It contains userID. Grab it.
   self._f_keys.update({"user_id" : self.getUserId(self.access_token)})
   # save this for later.
   self._f_keys.update({"access_token" : self.access_token})
   # access_token += '=' * (-len(access_token) % 4)  # add padding
   # access_payload = json.loads(base64.b64decode(access_token).decode("utf-8"))
   print(self._f_keys["user_id"])
   self._f_keys.update({"device_id" : self.getUserDeviceId(self._f_keys["user_id"])})
   print(self._f_keys["device_id"])
   }
   
*/

   /*
       MAKE FLUME REQUEST
       A simple wrapper for flume requests. 
       TODO: have check auth_token to make sure everything
             is still kosher. If not, then refresh & update.
         Takes a RESTful path
         Returns response
    */
   
   // makeFlumeRequest(rest_path: string, method = "GET", params = undefined) {
   //    // NOTE: this is a STUB
   //    const heading = document.querySelector('h1');
   //    this.checkToken();
   //    let url = "https://api.flumewater.com/" + rest_path;
   //    if (params == undefined) {
   //       return requests.request(method, url,
   //          headers = self.getHeaders())
   //    }
   //    else {
   //       dumped = json.dumps(params)
   //       return requests.request(method, url, data = dumped,
   //          headers = self.getHeaders())
   //    }
   // }

   /*
   CHECK TOKEN
   Check's auth token for validity, refreshes if needed.
   TODO:
     Returns nothing. Should update member _f_keys
   */
   // checkToken() {
   //    continue;

   // }
}