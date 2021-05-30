import { Console } from "console";
import { Logger, jsonResult, Singleton, HTTP_STATUS_CODE, HTTP_METHOD, HttpRequest, HttpResponse } from "fortjs";
import { request } from "http";
// const json = require('json');
// const https = require('https');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const date = require('date-and-time');
import { secrets } from "../secrets";

/*
   FlumeService contains all the Flume specific logic
   pulls from "secrets.ts" 
*/
export class FlumeService {
   public DEBUG = true;

   protected path_base: string;
   protected access_token: string;
   protected payload: {};
   protected _flume_keys: any;

   constructor() {
      this.payload = {
         method: 'POST',
         headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
         body: JSON.stringify({
            grant_type: "password",
            client_id: secrets.flume_keys.flume_client_id,
            client_secret: secrets.flume_keys.flume_client_secret,
            username: secrets.flume_keys.flume_username,
            password: secrets.flume_keys.flume_password
         })
      };
      this.access_token = "";
      this._flume_keys = JSON.parse(JSON.stringify(secrets.flume_keys)); //turn f_keys into a class
      // TODO: Got tired. You need to continue the stateful initilization of the flume object.
      this.path_base = "https://api.flumewater.com";
      // initlialize this instance
      this.flume_init();
   }

   public flume_init() {
      let url = this.path_base + "/oauth/token";
      // headers = {"Content-Type": "application/json"};
      // WORKING
      // let response = fetch(url, this.payload)
      //    .then(res => res.json())
      //    .then(json => console.log(json))
      //    .catch(err => console.error('error' + err));

      let response = fetch(url, this.payload)
         .then(res => res.json())
         // .then(parsed => console.log(parsed))
         .then(parsed => parsed["data"][0]["access_token"])
         // .then(parsed => console.log(parsed))
         .then(access_token => this.parse_access_token(access_token))
         // need to take the decoded from above and get device_id
         // .then(keys => console.log("flume_init: userID: ", keys["user_id"]), )
         /// NOTE: rollback to here if cb fails
         // .then(keys => this.processUserDeviceId(keys["user_id"]))
         .then(keys => this.processUserDeviceId(keys["user_id"], this.queryFlumeByDate))
         // .then(value => this.queryRecentFlume())
         .catch(err => console.error('error' + err));

      /*
      
            let parsed = JSON.parse(response.text);
            // print(json.dumps(parsed, indent=2));
            // print(type(parsed));
            this.access_token = parsed["data"][0]["access_token"];
            // print(access_token.pop().get("access_token"));
            // print(access_token);
            // the access_token is a base64 encoded string. It contains userID. Grab it.;
            this._flume_keys.user_id = this.getUserId(this.access_token);
            // save this for later.;
            this._flume_keys.access_token = this.access_token;
            // self._f_keys.update({ "access_token": self.access_token })
            // access_token += '=' * (-len(access_token) % 4);  // add padding
            // access_payload = json.loads(base64.b64decode(access_token).decode("utf-8"))
            console.log("flume_init: ", this._flume_keys["user_id"]);
      
            this._flume_keys.device_id =
               this._flume_keys.device_id = this.processUserDeviceId(this._flume_keys["user_id"]);
            console.log("flume_init: devideID:", this._flume_keys["device_id"]);
         */
   }

   private async queryRecentFlume() {
      let day = new Date();
      let dayN1H = date.addHours(day, (-1));
      let queries = {
         queries: [
            {
               bucket: "MIN",
               since_datetime: day.toISOString().slice(0, 19).replace("T", " "), //day.strftime("%Y-%m-%d %H:%M:%S"),
               until_datetime: dayN1H.toISOString().slice(0, 19).replace("T", " "),
               // "since_datetime": "2020-11-03 12:00:00",
               // "until_datetime": "2020-11-03 23:59:59",
               //# %a%b%d ~ MonJuly30
               request_id: day.toISOString()
            }
         ]
      };
      if (this.DEBUG) console.log('queryRecentFlume: starting makeFlumeRequest!\n');
      this.makeFlumeRequest(`users/${this._flume_keys['user_id']}/devices/${this._flume_keys['device_id']}/query`, "POST", queries)
         .then(res => JSON.parse(res.text))
         .then(loaded => { console.log('queryFlumeByDate: result', loaded); return loaded })
         .catch(err => console.error('\n\nqueryFlumeByDate: error' + err));
   }

   private parse_access_token(access_token) {
      this.access_token = access_token;
      if (this.DEBUG) console.log('parse_access_token: this.access_token:', this.access_token);
      this._flume_keys.user_id = this.getUserId(this.access_token);
      if (this.DEBUG) console.log('parse_access_token: this._flume_keys.user_id:', this._flume_keys.user_id);
      this._flume_keys.access_token = this.access_token;
      return this._flume_keys;
   }

   private handleUserDeviceId(user_id) {
      this._flume_keys.device_id = this.processUserDeviceId(user_id);
      return this._flume_keys.device_id;
   }


   /*
      GET USER ID 
      Flume access tokens last a week? It seems. 
        Takes a Flume request response
        Returns session userId
   */
   private getUserId(res) {
      if (this.DEBUG) console.log('getUserId: res:', res);
      //currently a byte string. Need dictionary. chain pile ...
      // let jwt_obj = JSON.parse(String(this.getJWTTokenPayload(res), "utf-8"));
      let jwt_obj = this.getJWTTokenPayload(res);

      return jwt_obj.user_id;
   }

   /*
     READ JWT TOKEN PAYLOAD
       Takes an JWT Auth token
       Returns the decoded payload, byte array
   */
   private getJWTTokenPayload(token) {
      // 00101110 = '.'
      let decoded = jwt.decode(token);
      // if (this.DEBUG) console.log('\n0: ', decoded);
      // let base64Url = token.split('.')[1];
      // if (this.DEBUG) console.log('\n1: ', base64Url);
      // let buffer = Buffer.from(base64Url, "utf-8");
      // if (this.DEBUG) console.log('\n2: ', buffer.toString('base64'));
      // // let delim: string = b'.';// String.toString('b' + '.', "utf-8");
      // // just swallowing crypto portion of list
      // let temp[signing_input, crypto_segment] = token.rsplit(delim, 1)
      // // same with headers, swallowing
      // header_segment, payload_segment = signing_input.split(delim, 1)    
      // let decodedValue = JSON.parse(buffer.toString('base64'));
      // console.log('getJWTTokenPayLoad\n: ');
      if (this.DEBUG) console.log(`\n\ngetJWTTokenPayload:\n ${token}  \nconverted to Base64 is: \n`, decoded);
      return decoded;
   }

   /*
   # GET USER DEVICE ID 
   #   Takes a user id 
   #   Returns a device id
   */
   private processUserDeviceId(userId, cb?: Function) {
      let deviceId: string;
      if (this.DEBUG) console.log("processUserDeviceId: using id: ", userId, "\ncb is:", cb);
      if (typeof cb === 'undefined') {
         console.log('processUserDeviceId: In if.');
         this.makeFlumeRequest(`users/${userId}/devices`)
            // .then(text => console.log("\nprocessUserDeviceId: ", text))
            .then(res => res.json())
            .then(json => json["data"][0]["id"]) //console.log('\n\ndeviceId', json["data"][0]["id"]))
            .then(deviceId => this.assignDeviceId(deviceId))
            // .then(text => console.log("\nprocessUserDeviceId: ", text))
            //(let loaded = text)
            .catch(err => console.error('error' + err));

         return deviceId;
      } else {
         console.log('processUserDeviceId: In else.');
         this.makeFlumeRequest(`users/${userId}/devices`)
            // .then(text => console.log("\nprocessUserDeviceId: ", text))
            .then(res => res.json())
            .then(json => json["data"][0]["id"]) //console.log('\n\ndeviceId', json["data"][0]["id"]))
            .then(deviceId => {
               this.assignDeviceId(deviceId);
               cb(new Date(), this);
            })
            // .then(text => console.log("\nprocessUserDeviceId: ", text))
            //(let loaded = text)
            .catch(err => console.error('error' + err));

         return deviceId;
      }



   }

   private assignDeviceId(id) {
      this._flume_keys.device_id = id;
      if (this.DEBUG) console.log('\n\ndeviceId', this._flume_keys.device_id);
      return this._flume_keys.device_id;
   }


   /*
       MAKE FLUME REQUEST
       A simple wrapper for flume requests. 
       TODO: have check auth_token to make sure everything
             is still kosher. If not, then refresh & update.
         Takes a RESTful path
         Returns response
    */
   public makeFlumeRequest(rest_path: string, method = "GET", params = undefined) {
      // NOTE: this is a STUB      
      this.checkToken();
      let url = "https://api.flumewater.com/" + rest_path;
      if (typeof params === 'undefined') {
         if (this.DEBUG) console.log('makeFlumeReq: making request from ', url);

         return fetch(url, this.getHeaders(method));
         // return requests.request(method, url, this.getHeaders());
      }
      else {
         // let body = JSON.stringify(params);
         // if (this.DEBUG) console.log('makeFlumeReq: body is: ', body);
         let options = this.getHeaders(method, params);
         if (this.DEBUG) console.log('makeFlumeReq: making request from ', url, '\n\t', { options });
         return fetch(url, { data: this.getHeaders(method) });
         // return fetch(url, { method: method, body: this.getBody(params), data: options, });
         // return requests.request(method, url, data = dumped,
         // headers = this.getHeaders())
      }
   }

   public makeFlumePost(rest_path: string, params: any) {
      let url = "https://api.flumewater.com/" + rest_path;
      let headersData = this.getSimpleHeader();
      let bodyData = this.getBody(params);
      if (this.DEBUG) console.log('makeFlumePost: making request from ', url, '\nheaders: ', headersData,
         '\nbody: ', bodyData);
      return fetch(url, {
         method: 'POST',
         body: bodyData,
         headers: headersData
      })
   }

   /*
      GET HEADERS
         Takes a dictionary or uses the keys in secrets
         Returns a dictionary of request headers 
  */
   private getHeaders(means?, bodyData?) {
      // default header
      // let header = { "Content-Type": "application/json" };
      let body: string = '';
      if (typeof means === 'undefined') means = 'GET';
      if (typeof bodyData !== 'undefined') {
         body = JSON.stringify(bodyData);
      }
      // let header = { "Accept": "application/json" };
      let header = { "Content-Type": "application/json" };
      // and if we've auth'd
      if (typeof this._flume_keys.access_token !== 'undefined') {
         header["Authorization"] = `Bearer ${this._flume_keys.access_token}`;
      }
      let method = {};
      if (body !== '')
         method = { "method": means, "body": body, "headers": header };
      else
         method = { "method": means, "headers": header };
      // if (this.DEBUG) console.log('getHeaders: returning', method);
      return method;
   }

   private getSimpleHeader() {
      let header = { "Content-Type": "application/json" };
      // and if we've auth'd
      if (typeof this._flume_keys.access_token !== 'undefined') {
         header["Authorization"] = `Bearer ${this._flume_keys.access_token}`;
      }
      return header;
   }
   private getBody(bodyData) {
      return JSON.stringify(bodyData);
   }



   /*
   CHECK TOKEN
   Check's auth token for validity, refreshes if needed.
   TODO:
     Returns nothing. Should update member _f_keys
   */
   checkToken() {
      return undefined;
   }


   /*
         QUERY FLUME BY DATE
         Makes a simple time interval query for water usage
            Takes a date
            Returns a pandas series of usage covering 20 hours
   */
   queryFlumeByDate(day: Date, that: FlumeService) {
      //  let dayn20H: date;
      let dayn20H = date.addHours(day, (-2));
      // let dayN19H = date.setHours(day.getHours()-19);
      let queries = {
         queries: [
            {
               bucket: "MIN",
               since_datetime: dayn20H.toISOString().slice(0, 19).replace("T", " "), //day.strftime("%Y-%m-%d %H:%M:%S"),
               until_datetime: day.toISOString().slice(0, 19).replace("T", " "),
               // "since_datetime": "2020-11-03 12:00:00",
               // "until_datetime": "2020-11-03 23:59:59",
               //# %a%b%d ~ MonJuly30
               request_id: day.toISOString()
            }
         ]
      };

      // that.makeFlumeRequest(`users/${that._flume_keys['user_id']}/devices/${that._flume_keys['device_id']}/query`, "POST", queries)
      that.makeFlumePost(`users/${that._flume_keys['user_id']}/devices/${that._flume_keys['device_id']}/query`, queries)
         .then(res => res.json())
         .then(res => console.log(res.data[0]))
         // .then(res => JSON.parse(res.text))
         // .then(loaded => { console.log('queryFlumeByDate: result', loaded); return loaded })
         .catch(err => console.error('\n\nqueryFlumeByDate: error' + err));
      /*
              let res = this.makeFlumeRequest(`users/${this._flume_keys['user_id']}/devices/${this._flume_keys['device_id']}/query`,"POST", queries);
              loaded = json.parse(res.text)
              print(loaded)
              # print(loaded["data"][0]["NovWeek1_2020"])
              flu_df = pd.DataFrame(loaded["data"][0][day.strftime("%a%b%d")])
              flu_df.to_csv("nov_19_flume.csv", index = False)
              
              return flu_df
              # for m in loaded["data"][0][day.strftime("%a%b%d")]:
              #     print(m)            
              # print(flu_df.head(60))        
              */
   }

}