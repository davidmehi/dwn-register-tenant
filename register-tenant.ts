
import { expect } from 'chai';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import { webcrypto } from 'node:crypto';
import { config } from '../../src/config.js';
import { ProofOfWork } from '../../src/registration/proof-of-work.js';
import type { ProofOfWorkChallengeModel } from '../../src/registration/proof-of-work-types.js';
import type { RegistrationData, RegistrationRequest } from '../../src/registration/registration-types.js';
import { ProofOfWorkManager } from '../../src/registration/proof-of-work-manager.js';

if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = webcrypto;
}

  // Get command line arguments
  const args = process.argv;
  if(args.length <= 2) {
    console.log("Missing dwn endpoint or tenant did");
    process.exit(1);
  }


  //let dwnServer: DwnServer;
  const dwnServerConfig = { ...config } // not touching the original config

  const dwnMessageEndpoint = args[2];
  const termsOfUseEndpoint = dwnMessageEndpoint + '/registration/terms-of-service';
  const proofOfWorkEndpoint = dwnMessageEndpoint + '/registration/proof-of-work';
  const registrationEndpoint = dwnMessageEndpoint + '/registration';
  const tenantDid = args[3];

    // Scenario:
    // 1. Alice fetches the terms-of-service.
    // 2. Alice fetches the proof-of-work challenge.
    // 3. Alice creates registration data based on the hash of the terms-of-service and her DID.
    // 4. Alice computes the proof-of-work response nonce based on the the proof-of-work challenge and the registration data.
    // 5. Alice sends the registration request to the server and is now registered.
    // 6. Alice can now write to the DWN.

    // 1. Alice fetches the terms-of-service.
    const termsOfServiceGetResponse = await fetch(termsOfUseEndpoint, {
      method: 'GET',
    });
    const termsOfServiceFetched = await termsOfServiceGetResponse.text();
    expect(termsOfServiceGetResponse.status).to.equal(200);
    //expect(termsOfServiceFetched).to.equal(readFileSync(dwnServerConfig.termsOfServiceFilePath).toString());
    console.log("Retrieved terms of service");

    // 2. Alice fetches the proof-of-work challenge.
    const proofOfWorkChallengeGetResponse = await fetch(proofOfWorkEndpoint, {
      method: 'GET',
    });
    const { challengeNonce, maximumAllowedHashValue} = await proofOfWorkChallengeGetResponse.json() as ProofOfWorkChallengeModel;
    expect(proofOfWorkChallengeGetResponse.status).to.equal(200);
    expect(challengeNonce.length).to.equal(64);
    expect(ProofOfWorkManager.isHexString(challengeNonce)).to.be.true;
    expect(ProofOfWorkManager.isHexString(maximumAllowedHashValue)).to.be.true;
    console.log("Retrieved proof of work challenge");

    // 3. Alice creates registration data based on the hash of the terms-of-service and her DID.
    const registrationData: RegistrationData = {
      did: tenantDid,
      termsOfServiceHash: ProofOfWork.hashAsHexString([termsOfServiceFetched]),
    };
    console.log("Create registration data");
    console.log("hash:" + ProofOfWork.hashAsHexString([termsOfServiceFetched]));

    // 4. Alice computes the proof-of-work response nonce based on the the proof-of-work challenge and the registration data.
    const responseNonce = ProofOfWork.findQualifiedResponseNonce({
      challengeNonce,
      maximumAllowedHashValue,
      requestData: JSON.stringify(registrationData),
    });
    console.log("Computes POW response nonce");

    // 5. Alice sends the registration request to the server and is now registered.
    const registrationRequest: RegistrationRequest = {
      registrationData,
      proofOfWork: {
        challengeNonce,
        responseNonce,
      },
    };

    console.log("Create registration request");

    const registrationResponse = await fetch(registrationEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationRequest),
    });
    console.log("Status: " + registrationResponse.status);
    //console.log("Body: " + JSON.stringify(registrationResponse.body));

    expect(registrationResponse.status).to.equal(200);
    console.log("Tenant registered");

