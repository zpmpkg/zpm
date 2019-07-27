import { IPackageBuilder, TargetBuilder } from '../packageBuilder';
export declare class TargetBuilder extends TargetBuilder {
    private libraryPaths;
    run(target: IPackageBuilder): Promise<boolean>;
    finish(): Promise<boolean>;
    private getTargetSettings;
    private buildTemplate;
    private getTemplateView;
}
