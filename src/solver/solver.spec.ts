import * as Logic from 'logic-solver'

describe('solver', () => {
    describe('Solver', () => {
        test('', () => {
            const solver = new Logic.Solver()
            solver.require(Logic.exactlyOne('zpm@1.0.0', 'zpm@2.0.0'))
            solver.require(
                Logic.implies(
                    Logic.exactlyOne('zpm@1.0.0'),
                    Logic.exactlyOne('azpm@1.0.0', 'azpm@2.0.0')
                )
            )
            solver.require(
                Logic.implies(
                    Logic.exactlyOne('zpm@2.0.0'),
                    Logic.exactlyOne('azpm@1.0.0', 'azpm@2.0.0')
                )
            )
            const sol1 = solver.solve()
            console.log(sol1.getTrueVars())
            console.log(
                solver
                    .minimizeWeightedSum(
                        sol1,
                        ['azpm@1.0.0', 'azpm@2.0.0', 'zpm@1.0.0', 'zpm@2.0.0'],
                        [1, 2, 1, 2]
                    )
                    .getMap()
            )
        })
    })
})
