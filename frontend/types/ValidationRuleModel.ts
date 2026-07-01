export interface ValidationRuleModel {
    identifierColumn: number;
    fieldName: string;
    description: string;
    column: number;
    optional: boolean;
    regex?: string;
    choice?: string;
    errorCode?: string;
    errorMessage?: string;
}