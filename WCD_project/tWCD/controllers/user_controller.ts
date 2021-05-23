/* Singleton by way of dependency injection. Only want one instance of the UserController  */
import { Controller, DefaultWorker, Worker, textResult, jsonResult, Singleton, HTTP_STATUS_CODE, HTTP_METHOD, Route, Guards } from "fortjs";
import { UserService } from "../services/user_service";
import { UserValidatorGuard } from "../guards/user_validator_guard";
import { PlaceHolderGuard } from "../guards/place_holder_guard";

// TODO: This whole class needs a shield for authentication
export class UserController extends Controller {
   // A default worker adds the route "/" & the http method "GET" 
   /*  
      The singleton decorator creates and injects the singleton
      The service is a parameter, which makes unit testing possible:
      TODO: npm run test
   */
   @DefaultWorker()
   async getUsers(@Singleton(UserService) service) {
      return jsonResult(service.getUsers());
   }

   /* 
      Uses POST to pull data from request and call's service to create 
      a add a user.
      The worker decorator worker takes the httpmethod which determines 
      CRUD method called.
      Route hooks the path.
      The `this` is tricky here. It refers to the request.
      The Guards decorator method is called before this method and determines 
      whether this ever gets called or not.
   */
   @Worker(HTTP_METHOD.Post)
   @Route("/")
   @Guards(UserValidatorGuard)
   async addUser(@Singleton(UserService) service) {
      // remember that data travels around with posts
      const newUser = service.addUser(this.data.user);
      return jsonResult(newUser, HTTP_STATUS_CODE.Created);
   }

   /*
      Uses PUT to update user data (which is pulled from the request)
      NOTE: the reuse of the Guard validator.
    */
   @Worker(HTTP_METHOD.Put)
   @Guards(UserValidatorGuard)
   @Route("/")
   async updateUser(@Singleton(UserService) service) {
      const user = this.data.user;
      const userUpdated = service.updateUser(user);
      if (userUpdated === true) {
         return textResult("user updated");
      } else {
         return textResult("invalid user");
      }
   }

   /*
      Uses DELETE to remove the user from the data cache. This method is 
      pulled from the request body. The Guard is just a place holder for now. 
      NOTE:REMEBER: this.data is the "backpack" that travels around with a request. 
      It is accessible by the gaurd and the controller (but not the service).
      Since the Guard is called before the controller method here, it can 
      change the state of this.data
   */
   @Worker(HTTP_METHOD.Delete)
   @Guards(UserValidatorGuard)
   @Route("/")
   async removeUser(@Singleton(UserService) service) {
      const user = this.data.user;
      console.log("\nremoveUserController: user:", user);
      const deletedUser = service.removeUser(user.id);
      if (deletedUser.id == user.idd) {
         return textResult("user removed");
      } else {
         return textResult("invalid user");
      }
   }


   @Worker(HTTP_METHOD.Delete)
   @Route("/del") // full path: {host}/user/1?id={id}
   async removeByQueryString(@Singleton(UserService) service) {
      // taking id from query string
      const userId = Number(this.query.id);
      const user = service.getUser(userId);
      if (user != null) {
         service.removeUser(userId);
         return textResult("user deleted");
      } else {
         return textResult("invalid user", 404);
      }
   }

   @Worker(HTTP_METHOD.Delete)
   @Route("/{id}")
   async removeByRoute(@Singleton(UserService) service) {
      // taking id from route
      const userId = Number(this.param.id);

      const user = service.getUser(userId);
      if (user != null) {
         service.removeUser(userId);
         return textResult("user deleted");
      } else {
         return textResult("invalid user");
      }
   }

   // RETRIEVING A USER: GET
   @Worker(HTTP_METHOD.Get)
   @Route("/{id}")
   async retrieveByRoute(@Singleton(UserService) service) {
      // taking id from route
      const userId = Number(this.param.id);

      const user = service.getUser(userId);
      if (user != null) {
         return jsonResult(user, HTTP_STATUS_CODE.Ok);
         // return textResult("user deleted");
      } else {
         return textResult("invalid user", HTTP_STATUS_CODE.NotFound);
      }
   }


}