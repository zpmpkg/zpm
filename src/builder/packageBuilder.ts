export abstract class PackageBuilder {
    public abstract async extract(): Promise<boolean>
}
