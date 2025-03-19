export class ApiResponse{
    constructor(statusCode, data, msg){
        this.statusCode = statusCode;
        this.msg = msg;
        this.data = data;
        this.success = this.statusCode >= 200 && this.statusCode < 300;
    }
}