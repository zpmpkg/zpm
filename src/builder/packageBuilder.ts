export abstract class PackageBuilder {
    public extraction = {}

    public build = {}

    public settings: { [k: string]: any } = {}

    public abstract async extract(): Promise<boolean>
}
