
import { Guard, textResult } from "fortjs";

// PlaceHolder. Allows for future expansion.
export class PlaceHolderGuard extends Guard {
    async check() {
        console.log("\nPlaceHolderGuard called!");
        return null;
    }
}