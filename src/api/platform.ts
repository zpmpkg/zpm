import os from 'os'

export class PlatformApi {
    public os: string
    public constructor() {
        this.os = os.platform()
    }
}
