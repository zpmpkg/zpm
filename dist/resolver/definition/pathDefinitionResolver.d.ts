import { DefinitionResolver } from './definitionResolver';
import { PackageDefinitionSummary } from './packageDefinition';
export declare class PathDefinitionResolver extends DefinitionResolver {
    private validator;
    getPackageDefinition(version?: string): Promise<PackageDefinitionSummary>;
    getDefinitionPath(): string;
    mayUseDevelopmentPackages(): boolean;
    private getContent;
    private getYamlDefinition;
    private isSingularYaml;
    private getDefinition;
}
