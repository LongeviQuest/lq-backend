import { CommandOptions } from '../models/Options';
import { ValidationResult } from '../models/ValidationResult';

export abstract class Command<Result> {
  private commandOptions: CommandOptions | undefined;

  constructor(commandOptions?: CommandOptions) {
    this.commandOptions = commandOptions;
  }

  protected abstract validate(): ValidationResult | undefined;

  public async execute(): Promise<Result | undefined> {
    if (this.commandOptions?.needValidation) {
      const validation = this.validate();
      if (validation?.failCauses && validation?.failCauses?.length > 0) {
        throw new Error(
          `${
            Object(this).constructor.name
          } has failed because the validations didn't pass due the following errors: ${validation.failCauses?.join(
            ' or '
          )}`
        );
      }
    }
    return await this.executeCommand();
  }
  protected abstract executeCommand(): Promise<Result>;
}
