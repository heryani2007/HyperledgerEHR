/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
  * registers an account as part of Org2MSP to query the ledger
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function main() {
    try {
        // Create readline interface for user input
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        // Request user input
        const userID = await new Promise((resolve) => {
        rl.question('Enter the user ID: ', async (userID) => {
        resolve(userID);                  
                 });          
        });
        
        var logWho = {
        patient_id: userID,
        };
  module.exports = { logWho };
              rl.close();// Close the readline interface

            // load the network configuration
            const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create a new CA client for interacting with the CA.
            const caURL = ccp.certificateAuthorities['ca.org2.example.com'].url;
            const ca = new FabricCAServices(caURL);

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), 'wallet');
            const wallet = await Wallets.newFileSystemWallet(walletPath);
            console.log(`Wallet path: ${walletPath}`);

            // Check to see if we've already enrolled the user.
            const userIdentity = await wallet.get(userID+'Org2');
            if (userIdentity) {
                console.log(`An identity for the user "${userID}" already exists in the wallet`);
                return;
            }

            // Check to see if we've already enrolled the admin user.
            const adminIdentity = await wallet.get('adminOrg2');
            if (!adminIdentity) {
                console.log('An identity for the admin user "admin" does not exist in the wallet');
                console.log('Run the enrollAdmin.js application before retrying');
                return;
            }

            // build a user object for authenticating with the CA
            const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            const adminUser = await provider.getUserContext(adminIdentity, 'adminOrg2');

            // Register the user, enroll the user, and import the new identity into the wallet.
            const secret = await ca.register({
                affiliation: 'org2.department1',
                enrollmentID: userID,
                role: 'client'
            }, adminUser);
            const enrollment = await ca.enroll({
                enrollmentID: userID,
                enrollmentSecret: secret
            });
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes(),
                },
                mspId: 'Org2MSP',
                type: 'X.509',
            };
            await wallet.put(userID+'Org2', x509Identity);
            console.log(`Successfully registered and enrolled admin user "${userID}" and imported it into the wallet`);

       // });
const { createLog } = require('./createAuditRecordRegisterUserOrg2.js'); // Include create_log.js createAuditRecordRegisterUserOrg1.js
    } catch (error) {
        console.error(`Failed to register user "${userID}": ${error}`);
        process.exit(1);
    }
}

main();

