import { SuccessResponse } from "./success.response";

export class OkResponse<TData = unknown> extends SuccessResponse<TData> {
    constructor(data: TData, message = 'OK') {
        super(data, message);
    }
}

