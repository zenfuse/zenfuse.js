const ParentEnvironment = require('jest-environment-node');

class ZenfuseJestEnvironment extends ParentEnvironment {
    testSuiteFailed = false;

    async handleTestEvent(event, state) {
        switch (event.name) {
            case 'hook_failure':
            case 'test_fn_failure':
                this.testSuiteFailed = true;
                break;
            case 'test_start':
                if (this.testSuiteFailed) {
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
