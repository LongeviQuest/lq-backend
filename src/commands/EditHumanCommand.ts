import { configuration } from '../configuration';
import { ValidationResult } from '../models/ValidationResult';
import { EditHumanWriter } from '../writers/EditHumanWriter';
import { Command } from './Command';
//
export interface PropertyToEdit {
  name: string;
  type: string;
  value: any;
}

export interface EditHumanCommandArgs {
  id: string;
  propertiesToUpdate: PropertyToEdit[];
}
export class EditHumanCommand extends Command<string> {
  private updateHumanCommandArgs: EditHumanCommandArgs;
  private writer: EditHumanWriter;
  constructor(updateHumanCommandArgs: EditHumanCommandArgs) {
    super({ needValidation: true });
    this.updateHumanCommandArgs = updateHumanCommandArgs;
    this.writer = new EditHumanWriter(
      configuration.database.connectionString,
      configuration.database.name
    );
  }

  protected validate(): ValidationResult | undefined {
    let validationResult: ValidationResult = { failCauses: [] };
    if (!this.updateHumanCommandArgs.id) {
      validationResult.failCauses?.push('the id is required');
    }
    if (!this.updateHumanCommandArgs.propertiesToUpdate) {
      validationResult.failCauses?.push('the properties are required');
    }
    return validationResult.failCauses ? validationResult : undefined;
  }
  protected async executeCommand(): Promise<string> {
    return (await this.writer.write(this.updateHumanCommandArgs)) ?? '';
  }
}
