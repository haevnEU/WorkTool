import {ValidationRuleModel} from "./ValidationRuleModel.ts";

export interface ValidationSchemaModel {
    readableName: string;
    schemaName: string;
    headerIdentifier: string;
    headerIdentifierColumn: number;
    idColumn: number;
    idName: string;
    totalColumns: number;
    rules: ValidationRuleModel[];
}