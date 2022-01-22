const ParentEnvironment = require('jest-environment-node');

class ZenfuseJestEnvironment extends ParentEnvironment {
    async handleTestEvent(event, state) {
        switch (event.name) {
            case 'setup':
                this.global.testTimeout = state.testTimeout;
                this.global.isExchangeTestFailed = false;
                this.context.openScopes = new Map();
                break;
            case 'hook_failure':
            case 'test_fn_failure':
                this.global.isExchangeTestFailed = true;
                break;
            case 'test_fn_start':
                if (this.global.isExchangeTestFailed) {
                    event.test.mode = 'skip';
                }
                break;
            case 'run_describe_start':
                if (
                    !this.global.isExchangeTestFailed &&
                    event.describeBlock.mode !== 'skip'
                ) {
                    this.openHttpMockingScope(event.describeBlock);
                } else {
                    event.describeBlock.mode = 'skip';
                }
                break;
            case 'run_describe_stop':
                if (
                    !this.global.isExchangeTestFailed &&
                    event.describeBlock.mode !== 'skip'
                ) {
                    this.closeHttpMockingScope(event.describeBlock);
                } else {
                    event.describeBlock.mode = 'skip';
                }
                break;
        }

        if (super.handleTestEvent) {
            await super.handleTestEvent(event, state);
        }
    }

    openHttpMockingScope(test) {
        const scope = this.getScopeOfBlock(test);
        if (scope) {
            this.context.openScopes.set(scope, scope());
        }
    }

    closeHttpMockingScope(test) {
        const scope = this.getScopeOfBlock(test);
        if (scope) {
            const nockScope = this.context.openScopes.get(scope);

            try {
                nockScope.done();
            } catch (nockAssertionError) {
                // TODO: Beautify this error output
                throw test.name + '\n' + nockAssertionError.message;
            }
        }
    }

    /**
     * Do not touch, magic happens here
     *
     * @param block
     * @todo refactor this cheap fuck
     */
    getScopeOfBlock(block) {
        let objectPath = [];

        if (block.name === 'ROOT_DESCRIBE_BLOCK') {
            if (this.context.httpScope) {
                return this.context.httpScope.root;
            }
        }

        const recursiveWritePath = (test) => {
            if (test.name === 'ROOT_DESCRIBE_BLOCK') return;
            if (test.parent) {
                recursiveWritePath(test.parent);
            }
            objectPath.push(test.name);
        };

        recursiveWritePath(block);

        if (objectPath.length === 0) return;

        let scope = this.context.httpScope || {};

        for (const key of objectPath) {
            if (!scope[key]) {
                return; // scope doesnt exists
            }
            if (scope[key]) {
                scope = scope[key];
            }
        }

        if (typeof scope === 'function') {
            return scope;
        }
    }
}

module.exports = ZenfuseJestEnvironment;
