export abstract class Writer<Argument, Result> {
  public abstract write(argument?: Argument): Promise<Result | undefined>;
}
