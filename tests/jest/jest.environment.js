const ParentEnvironment = require('jest-environment-node');

class ZenfuseJestEnvironment extends ParentEnvironment {
    async handleTestEvent(event, state) {
        switch (event.name) {
            case 'setup':
                this.global.testTimeout = state.testTimeout;
                this.global.isTestSuiteFailed = false;
                this.context.openScopes = new Map();
                break;
            case 'hook_failure':
            case 'test_fn_failure':
                this.global.isTestSuiteFailed = true;
                break;
            case 'test_start':
                if (this.global.isTestSuiteFailed) {
                    event.test.mode = 'skip';
                }
                this.openHttpMockingScope(event.test);
                break;
            case 'test_done':
                this.closeHttpMockingScope(event.test, state);
                break;
        }

        if (super.handleTestEvent) {
            await super.handleTestEvent(event, state);
        }
    }

    openHttpMockingScope(test) {
        const scope = this.getScopeNamespace(test);
        if (scope) {
            this.context.openScopes.set(scope, scope());
        }
    }

    closeHttpMockingScope(test) {
        const scope = this.getScopeNamespace(test);
        if (scope) {
            const nockScope = this.context.openScopes.get(scope);

            try {
                nockScope.done();
            } catch (nockAssertionError) {
                // TODO: Beautify this error output
                throw test.name + '\n' + nockAssertionError.message
            }
        }
    }

    getScopeNamespace(test) {
        let objectPath = [];

        const recursiveWritePath = (test) => {
            if (test.name === 'ROOT_DESCRIBE_BLOCK') return;
            if (test.parent) {
                recursiveWritePath(test.parent);
            }
            objectPath.push(test.name);
        };

        recursiveWritePath(test);

        let scope = this.context.httpScope;

        for (const key of objectPath) {
            if (!scope[key]) {
                return; // scope doesnt exists
            }
            if (scope[key]) {
                scope = scope[key];
            }
        }

        return scope;
    }
}

module.exports = ZenfuseJestEnvironment;
