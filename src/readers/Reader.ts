export abstract class Reader<Argument, Result> {
  public abstract read(argument?: Argument): Promise<Result | undefined>;
}
