import { DefinitionResolver } from './definitionResolver';
import { PackageDefinitionSummary } from './packageDefinition';
export declare class GitDefinitionResolver extends DefinitionResolver {
    private validator;
    getPackageDefinition(hash?: string): Promise<PackageDefinitionSummary>;
    getDefinitionPath(): string;
    private getContent;
}
