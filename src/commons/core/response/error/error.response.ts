export class ErrorResponse extends Error {
    public readonly success = false as const;
    public readonly code: string;
    public readonly message: string;
    public readonly fieldErrors?: Record<string, string[]>;
    public readonly httpStatus: number;

    protected constructor(
        code: string,
        message: string,
        httpStatus: number,
        fieldErrors?: Record<string, string[]>,
    ) {
        super(message);
        this.name = new.target.name;
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
        this.fieldErrors = fieldErrors;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}