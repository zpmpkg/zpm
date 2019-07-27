import { FsApi } from "../api/fs";
import { GitApi } from "../api/git";
import { PackageVersionApi } from "../api/package";
import { ShellApi } from "../api/shell";
import { PackageBuilder, TargetBuilder } from './packageBuilder';
interface ExtractionApi {
    version: PackageVersionApi;
    git: GitApi;
    fs: FsApi;
    shell: ShellApi;
}
interface ExtractionStore {
    api: ExtractionApi;
    script?: {
        checkout?: () => Promise<void>;
        extract?: () => Promise<void>;
    };
}
export declare class TargetExtractor extends TargetBuilder {
    prepare(target: PackageBuilder): Promise<boolean>;
    run(target: PackageBuilder): Promise<boolean>;
    ensureSourceHash(target: PackageBuilder): Promise<boolean>;
    buildExtraction(target: PackageBuilder): Promise<ExtractionStore>;
}
export {};
