const { TestEnvironment } = require('jest-environment-node');

const nock = require('nock');
const inspector = require('inspector');

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
                this.global.console = inspector.console;
                break;
            case 'run_start':
                this.prepareScopes(state);
                break;
            case 'hook_failure':
            case 'error':
            case 'test_fn_failure':
                this.global.isExchangeTestFailed = true;
                this.teardown();
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
                    if (!block) return;
                    allowList.add(block);
                    return addParent(block.parent);
                };

                addParent(block.parent);

                if (block.children) {
                    block.children.forEach((b) => {
                        if (b.mode !== 'skip') {
                            allowList.add(b);
                        }
                    });
                }
            }

            if (!isOnlyMode) {
                allowList.add(block);
            }

            if (block.children) block.children.forEach(setupBlock);
        };

        setupBlock(jestState.currentDescribeBlock);

        for (const block of allowList) {
            if (block.type !== 'describeBlock') continue;

            const scope = this.getScopeByBlockName(block.name);
            if (scope) {
                this.scopesToOpen.set(block.name, scope);
            }
        }

        inspector.console.info('This scopes will be opened:');
        inspector.console.log([...this.scopesToOpen.keys()]);
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
                    scope.done();
                }
            } catch (err) {
                jestState.unhandledErrors.push(err);
            } finally {
                this.openScopes.delete(scopeFunction);
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

        return this.context.httpScope[name];
    }

    teardown() {
        nock.abortPendingRequests();
        nock.cleanAll();
        this.openScopes.clear();
        this.scopesToOpen.clear();
    }
}

module.exports = ZenfuseJestEnvironment;
