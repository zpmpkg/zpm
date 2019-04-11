import { BasePackageBuilder, PackageBuilder } from '../packageBuilder';
export declare class TargetBuilder extends PackageBuilder {
    private libraryPaths;
    run(target: BasePackageBuilder): Promise<boolean>;
    finish(): Promise<boolean>;
    private getTargetSettings;
    private buildTemplate;
    private getTemplateView;
}
