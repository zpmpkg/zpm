import { PackageBuilder, TargetBuilder } from './packageBuilder';
export declare class TargetCMakeBuilder extends TargetBuilder {
    private moduleMap;
    private libraryPaths;
    run(target: PackageBuilder): Promise<boolean>;
    ownDefinition(target: PackageBuilder): boolean;
    writeCmakeFile(target: PackageBuilder, content: string): Promise<void>;
    seperateModule(target: PackageBuilder): boolean;
    finish(): Promise<boolean>;
    private getTargetSettings;
    private buildTemplate;
    private getTemplateView;
}
