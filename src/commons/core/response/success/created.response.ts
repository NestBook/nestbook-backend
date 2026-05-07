import { SuccessResponse } from "./success.response";

export class CreatedResponse<TData = unknown> extends SuccessResponse<TData> {
    constructor(data: TData, message = 'Created') {
        super(data, message);
    }
}