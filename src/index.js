const core = require('@actions/core');
const { akeylessLogin } = require('./auth')
const input = require('./input');
const { handleExportSecrets, handleCreateSecrets, handleUpdateSecrets } = require('./secrets');




async function run() {
    core.debug(`Getting Input for Akeyless GitHub Action`);

    const {
        accessId,
        accessType,
        apiUrl,
        staticSecrets,
        dynamicSecrets,
        rotatedSecrets,
        sshCertificate,
        pkiCertificate,
        token,
        exportSecretsToOutputs,
        exportSecretsToEnvironment,
        parseJsonSecrets
    } = input.fetchAndValidateInput();

    core.debug(`Access ID: ${accessId}`);
    core.debug(`Fetching Akeyless token with access type: ${accessType}`);

    let akeylessToken;
    try {
        if (token !== "") {
            akeylessToken = token;
        } else {
            const akeylessLoginResponse = await akeylessLogin(accessId, accessType, apiUrl);
            akeylessToken = akeylessLoginResponse['token'];
        }
    } catch (error) {
        core.debug(`Failed to login to Akeyless: ${error}`);
        core.setFailed(`Failed to login to Akeyless`);
        return;
    }

    core.debug(`Akeyless token length: ${akeylessToken.length}`);

    // Prepare list of secrets to create
    const createSecretName = core.getInput('create-secret-name');
    const createSecretValue = core.getInput('create-secret-value');

    const secretsToCreate = [];
    if (createSecretName && createSecretValue) {
        secretsToCreate.push({
            name: createSecretName,
            value: createSecretValue,
        });
    }

    // Prepare list of secrets to update
    const updateSecretName = core.getInput('update-secret-name');
    const updateSecretValue = core.getInput('update-secret-value');

    const secretsToUpdate = [];
    if (updateSecretName && updateSecretValue) {
        secretsToUpdate.push({
            name: updateSecretName,
            value: updateSecretValue,
        });
    }

    // Handle secret creation
    if (secretsToCreate.length > 0) {
        await handleCreateSecrets({
            akeylessToken,
            secretsToCreate,
            apiUrl,
        });
    }

    // Handle secret update
    if (secretsToUpdate.length > 0) {
        await handleUpdateSecrets({
            akeylessToken,
            secretsToUpdate,
            apiUrl,
        });
    }

    // Then handle fetching secrets
    const args = {
        akeylessToken,
        staticSecrets,
        dynamicSecrets,
        rotatedSecrets,
        apiUrl,
        exportSecretsToOutputs,
        exportSecretsToEnvironment,
        sshCertificate,
        pkiCertificate,
        parseJsonSecrets
    };

    await handleExportSecrets(args);

    core.debug(`Done processing all secrets`);
}




if (require.main === module) {
    try {
        core.debug('Starting main run');
        run();
    } catch (error) {
        core.debug(error.stack);
        core.setFailed('Akeyless action has failed');
        core.debug(error.message);
    }
}
