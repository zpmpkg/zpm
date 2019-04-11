import { BasePackageBuilder, PackageBuilder } from '../packageBuilder';
export declare class TargetExtractor extends PackageBuilder {
    run(target: BasePackageBuilder): Promise<boolean>;
    needsExtraction(target: BasePackageBuilder): Promise<boolean>;
    writeExtractionHash(target: BasePackageBuilder): Promise<void>;
    getExtractionHashPath(target: BasePackageBuilder): string;
    ensureSourceHash(target: BasePackageBuilder): Promise<boolean>;
}
