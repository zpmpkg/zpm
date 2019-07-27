import { IPackageBuilder, TargetBuilder } from '../packageBuilder';
export declare class TargetExtractor extends TargetBuilder {
    run(target: IPackageBuilder): Promise<boolean>;
    needsExtraction(target: IPackageBuilder): boolean;
    writeExtractionHash(target: IPackageBuilder): void;
    getExtractionHashPath(target: IPackageBuilder): string;
    ensureSourceHash(target: IPackageBuilder): Promise<boolean>;
}
