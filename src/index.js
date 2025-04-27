const core = require('@actions/core');
const { akeylessLogin } = require('./auth')
const input = require('./input');
const { handleExportSecrets } = require('./secrets');
const { handleExportSecrets, createSecret } = require('./secrets');
const { createSecret } = require('./secrets'); 
const { handleExportSecrets, handleCreateSecrets } = require('./secrets');



async function run() {
    core.debug(`Getting Input for Akeyless github action`);

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

    core.debug(`access id: ${accessId}`);
    core.debug(`Fetch akeyless token with access type ${accessType}`);

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

    // ✅ Prepare the list of secrets to create
    const createSecretName = core.getInput('create-secret-name');
    const createSecretValue = core.getInput('create-secret-value');

    const secretsToCreate = [];

    if (createSecretName && createSecretValue) {
        secretsToCreate.push({
            name: createSecretName,
            value: createSecretValue,
        });
    }

    // ✅ Handle secret creation
    await handleCreateSecrets({
        akeylessToken,
        secretsToCreate,
        apiUrl,
    });

    // ✅ Then handle fetching secrets
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

    core.debug(`Done exporting secrets`);
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
