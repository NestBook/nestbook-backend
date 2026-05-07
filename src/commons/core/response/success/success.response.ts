export class SuccessResponse<TData = unknown> {
  public readonly success = true;
  public readonly data: TData;
  public readonly message: string;

  protected constructor(data: TData, message: string) {
    this.data = data;
    this.message = message;
  }
}
