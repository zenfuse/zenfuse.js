/**
 * Checks is instance has required environment variables.
 *
 * @param {string[]} requiredVars List of varibles
 */
const checkProcessHasVariables = (requiredVars) => {
    const errors = [];

    for (const variable of requiredVars) {
        if (!process.env[variable]) {
            const errorMsg = `${variable} environment variable is required`;
            errors.push(errorMsg);
        }
    }

    if (errors.length > 0) {
        const errorString =
            'ENVIRONMENT VALIDATION FAILED\n' + errors.join('\n');

        throw errorString;
    }
};

module.exports = checkProcessHasVariables;
