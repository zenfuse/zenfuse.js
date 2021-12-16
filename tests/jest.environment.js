const ParentEnvironment = require('jest-environment-node');

class ZenfuseJestEnvironment extends ParentEnvironment {
    async handleTestEvent(event, state) {
        switch (event.name) {
            case 'setup':
                this.global.testTimeout = state.testTimeout;
                this.global.isTestSuiteFailed = false;
                break;
            case 'hook_failure':
            case 'test_fn_failure':
                this.global.isTestSuiteFailed = true;
                break;
            case 'test_start':
                if (this.global.isTestSuiteFailed) {
                    event.test.mode = 'skip';
                }
                break;
        }

        if (super.handleTestEvent) {
            await super.handleTestEvent(event, state);
        }
    }
}

module.exports = ZenfuseJestEnvironment;
