const { TestEnvironment } = require('jest-environment-node');

class ZenfuseJestEnvironment extends TestEnvironment {
    /**
     * List scopes witch should run
     *
     * @type {Map<string, Function>}
     */
    scopesToOpen = new Map();

    openScopes = new Map();

    async handleTestEvent(event, state) {
        if (
            event.name !== 'setup' &&
            event.name !== 'test_fn_failure' &&
            !this.context.httpScope
        ) {
            if (super.handleTestEvent) {
                await super.handleTestEvent(event, state);
            }
            return;
        }

        switch (event.name) {
            case 'setup':
                this.global.testTimeout = state.testTimeout;
                this.global.isExchangeTestFailed = false;
                break;
            case 'run_start':
                this.prepareScopes(state);
                break;
            case 'hook_failure':
            case 'test_fn_failure':
                this.global.isExchangeTestFailed = true;
                break;
            case 'test_start':
                if (this.global.isExchangeTestFailed) {
                    event.test.mode = 'skip';
                }
                break;
            case 'run_describe_start':
                if (!this.global.isExchangeTestFailed) {
                    this.openScope(event.describeBlock);
                }
                break;
            case 'run_describe_finish':
                if (!this.global.isExchangeTestFailed) {
                    this.closeScope(event.describeBlock, state);
                }
                break;
        }

        if (super.handleTestEvent) {
            await super.handleTestEvent(event, state);
        }
    }

    prepareScopes(jestState) {
        const allowList = new Set();
        const disallowList = new Set();

        const isOnlyMode = jestState.hasFocusedTests;

        const setupBlock = (block) => {
            if (block.type !== 'describeBlock') return;
            if (disallowList.has(block)) return;

            if (block.mode === 'skip') {
                disallowList.add(block);
                block.children.forEach((b) => {
                    disallowList.add(b);
                });
            }

            if (block.mode === 'only') {
                allowList.add(block);

                const addParent = (block) => {
                    if (!block.parent) return;
                    allowList.add(block.parent);
                    return addParent(block.parent);
                };

                addParent(block.parent);

                block.children.forEach((b) => {
                    if (b.mode !== 'skip') {
                        allowList.add(b);
                    }
                });
            }

            if (!isOnlyMode) {
                allowList.add(block);
            }

            block.children.forEach(setupBlock);
        };

        setupBlock(jestState.currentDescribeBlock);

        for (const block of allowList) {
            if (block.type !== 'describeBlock') continue;

            const scope = this.getScopeByBlockName(block.name);
            if (scope) {
                this.scopesToOpen.set(block.name, scope);
            }
        }
    }

    openScope(block) {
        // if (block.name === 'INSUFFICIENT_FUNDS code') {
        //     debugger;
        // }
        if (this.scopesToOpen.has(block.name)) {
            const scope = this.scopesToOpen.get(block.name);
            this.openScopes.set(scope, scope());
        }
    }

    closeScope(block, jestState) {
        if (this.scopesToOpen.has(block.name)) {
            const scopeFunction = this.scopesToOpen.get(block.name);
            const scope = this.openScopes.get(scopeFunction);

            try {
                if (scope) {
                    // scope.abortPendingRequests();
                    scope.done();
                    this.openScopes.delete(scopeFunction);
                }
            } catch (err) {
                jestState.unhandledErrors.push(err);
                try {
                    scope.cleanAll();
                } catch {
                    /**/
                }
            }
        }
    }

    /**
     *
     * @param {string} name name of describe block
     * @returns {Function}
     */
    getScopeByBlockName(name) {
        if (name === 'ROOT_DESCRIBE_BLOCK') {
            if (this.context.httpScope) {
                return this.context.httpScope.root;
            }
        }

        const recursivelyFind = (block) => {
            for (let [key, value] of Object.entries(block)) {
                if (value === null) {
                    continue;
                }
                if (key === name && typeof value === 'function') {
                    return value;
                }

                if (typeof value === 'object') {
                    const scope = recursivelyFind(value);

                    if (scope) {
                        return scope;
                    } else {
                        continue;
                    }
                }
            }
        };

        return recursivelyFind(this.context.httpScope);
    }
}

module.exports = ZenfuseJestEnvironment;
