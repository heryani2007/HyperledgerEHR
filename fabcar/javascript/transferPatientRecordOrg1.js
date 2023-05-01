/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * ADDS ENTRY TO THE STATE DATABASE MYCHANNEL_FABCAR AS appUser
 * STILL GETS REPLICATED TO OTHER COUCHDB
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function main() {
    try {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const user = await new Promise((resolve) => {
            rl.question('Enter the account you would like to run the script as: ', (user) => {
                resolve(user);
            });
        });

        const oldCarNumber = await new Promise((resolve) => {
            rl.question('What is the number of the record you want to transfer: ', (carNumber) => {
                resolve(carNumber);
            });
        });

        const newCarNumber = await new Promise((resolve) => {
            rl.question('Enter Org would you like to transfer the record to: ', (newCarNumber) => {
                resolve(newCarNumber);
            });
        });
const newCarNumberTrimmed = newCarNumber.slice(0, -3);
        var logWho = {
        account: user,
        patient_id: oldCarNumber+" sent to "+newCarNumber,
        };
  module.exports = { logWho };

        rl.close();

        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get(user+'Org1');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            console.log('You Are Not Among Those Permitted To Perform This Action');
            console.log('This Agression Has Been Logged');
            const { createLog } = require('./createAuditRecordFailTransferPatientOrg1'); // Include create_log.js
            return;
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user+'Org1', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('mychannel');

        const contract = network.getContract('fabcar');

        await contract.submitTransaction('transferCar', oldCarNumber+'Org1MSP', newCarNumber, newCarNumberTrimmed);
        console.log('Transaction has been submitted');
        
        const { createLog } = require('./createAuditRecordTransferOrg1'); // Include create_log.js
        
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();

