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
            case 'test_start':
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
                }
                break;
            case 'run_describe_finish':
                if (
                    !this.global.isExchangeTestFailed &&
                    event.describeBlock.mode !== 'skip'
                ) {
                    this.closeHttpMockingScope(event.describeBlock);
                }
                break;
        }

        if (super.handleTestEvent) {
            await super.handleTestEvent(event, state);
        }
    }

    openHttpMockingScope(describeBlock) {
        const scope = this.getScopeOfBlock(describeBlock);
        if (scope) {
            this.context.openScopes.set(scope, scope());
        }
    }

    closeHttpMockingScope(describeBlock) {
        const isSkipped = describeBlock.tests.every((t) => t.status === 'skip');
        const scope = this.getScopeOfBlock(describeBlock);

        if (scope) {
            const nockScope = this.context.openScopes.get(scope);

            try {
                nockScope.done();
            } catch (nockAssertionError) {
                if (isSkipped && !nockScope.isDone()) {
                    return;
                }
                // TODO: Beautify this error output
                throw describeBlock.name + '\n' + nockAssertionError.message;
            }
        }
    }

    /**
     * Do not touch, magic happens here
     *
     * @param {object} block Jest test block
     * @todo refactor this cheap fuck
     * @returns {Function}
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

    terminateScopes() {}
}

module.exports = ZenfuseJestEnvironment;
