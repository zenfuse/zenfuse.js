const ParentEnvironment = require('jest-environment-node');

class ZenfuseJestEnvironment extends ParentEnvironment {
    /**
     * List scopes with should run
     *
     * @type {Map<string, Function>}
     */
    scopesToOpen = new Map();

    /**
     * List all scopes by block object
     *
     * @type {Map<{ name: string, mode: 'only'|'skip' }, Function>}
     */
    allScopes = new Map();

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
            case 'finish_describe_definition':
                this.addBlockToScopes(event);
                break;
            case 'run_start':
                this.fillScopesToOpen(state);
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
                    this.openHttpMockingScope(event.describeBlock);
                }
                break;
            case 'run_describe_finish':
                if (!this.global.isExchangeTestFailed) {
                    this.closeHttpMockingScope(event.describeBlock, state);
                }
                break;
        }

        if (super.handleTestEvent) {
            await super.handleTestEvent(event, state);
        }
    }

    addBlockToScopes(event) {
        const scope = this.getScopeByBlockName(event.blockName);

        if (!scope) return;

        this.allScopes.set(
            {
                name: event.blockName,
                mode: event.mode,
            },
            scope,
        );
    }

    fillScopesToOpen(jestState) {
        const entries = [...this.allScopes.entries()];

        this.scopesToOpen = new Map();

        if (jestState.hasFocusedTests) {
            for (const [block, scope] of entries) {
                if (block.mode === 'only') {
                    // TODO: Add every childred of only block

                    this.scopesToOpen.set(block.name, scope);
                }
            }
        } else {
            entries.forEach(([block, scope]) => {
                if (block.mode !== 'skip' && scope) {
                    this.scopesToOpen.set(block.name, scope);
                }
            });
        }

        if (this.context.httpScope.root) {
            this.scopesToOpen.set(
                'ROOT_DESCRIBE_BLOCK',
                this.context.httpScope.root,
            );
        }
    }

    openHttpMockingScope(block) {
        if (this.scopesToOpen.has(block.name)) {
            const scope = this.scopesToOpen.get(block.name);
            this.openScopes.set(scope, scope());
        }
    }

    closeHttpMockingScope(block, jestState) {
        if (this.scopesToOpen.has(block.name)) {
            const scope = this.openScopes.get(block.name);

            try {
                if (scope) scope.done();
            } catch (err) {
                jestState.unhandledErrors.push(err);
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
