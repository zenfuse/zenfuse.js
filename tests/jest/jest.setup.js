expect.extend({
    toMatchSchema(received, zodSchema) {
        const result = zodSchema.safeParse(received);

        let message;

        if (!result.success) {
            message = result.error.errors
                .map((e) => `${e.path.join('.')} ${e.message}`.trim())
                .join('\n');
        }

        return {
            actual: received,
            message: () => message,
            pass: result.success,
        };
    },
});

const TEST_TIMEOUT = 5000;

global.isEnd2EndTest = process.env.TEST_MODE === 'e2e';
global.isIntegrationTest = !global.isEnd2EndTest;

jest.setTimeout(TEST_TIMEOUT);
