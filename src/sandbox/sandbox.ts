import * as fs from 'fs-extra'
import * as ts from 'typescript'
import { NodeVM, VMScript } from 'vm2'
import { logger } from '~/common/logger'

export async function executeSandboxTypescript(file: string, sandbox: any) {
    const vm = new NodeVM({
        sandbox: {
            log: logger,
            ...sandbox,
        },
        compiler: (code: any) => {
            const result = ts.transpileModule(code.code, {
                compilerOptions: {
                    target: ts.ScriptTarget.ES2016,
                    module: ts.ModuleKind.CommonJS,
                },
            })
            console.log(result.outputText)
            return result.outputText
        },
    })
    const source = await fs.readFile(file)
    try {
        const script = new VMScript(source.toString(), file)
        return vm.run(script)
    } catch (err) {
        logger.error(`Failed to run script: ${err.message}`)
    }
}
