import { Controller, DefaultWorker, textResult, viewResult, Worker, Assign } from "fortjs";

export class DefaultController extends Controller {
    // workers do some task and retrun the result as an http response
    @DefaultWorker()
    async index(@Assign('FortJs') title: string) {
        const data = {
            title: title
        };
        // viewResult takes 2 params: 1) the view; 2) its data
        const result = await viewResult('default/index.html', data);
        return result;
    }
}