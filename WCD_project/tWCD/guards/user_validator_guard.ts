import { Guard, textResult, HTTP_STATUS_CODE } from "fortjs";

export class UserValidatorGuard extends Guard {
    // returning anything but a NULL from chech() will block access
    async check() {
        const user = {
            name: this.body.name,
            gender: this.body.gender,
            address: this.body.address,
            emailId: this.body.emailId,
            password: this.body.password
        };
        const errMsg = this.validate(user);
        if (errMsg == null) {
            // pass user to worker method, so that they dont need to parse again  
            this.data.user = user;
            // NOTE: returning null means - guard allows request to pass  
            return null;
        } else {
            return textResult(errMsg, HTTP_STATUS_CODE.BadRequest);
        }
    }
    
    validate(user) {
        let errMessage;
        if (user.name == null || user.name.length < 5) {
            errMessage = "name should be minimum 5 characters"
        } else if (user.password == null || user.password.length < 5) {
            errMessage = "password should be minimum 5 characters";
        } else if (user.gender == null || ["male", "female"].indexOf(user.gender) < 0) {
            errMessage = "gender should be either male or female";
        } else if (user.emailId == null || !this.isValidEmail(user.emailId)) {
            errMessage = "email not valid";
        } else if (user.address == null || user.address.length < 10) {
            errMessage = "address length should be greater than 10";
        }
        return errMessage;
    }
    
    isValidEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }


}