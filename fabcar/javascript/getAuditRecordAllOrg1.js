/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
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
        
                var logWho = {
        account: user,
        };
  module.exports = { logWho };

        rl.close();
    
    
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user+'Org1');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            console.log('You Are Not Among Those Permitted To Perform This Action');
            console.log('This Agression Has Been Logged');
            const { createLog } = require('./createAuditRecordFailGetAuditOrg1.js'); // Include create_log.js
            return;
        }

        // Check if the user's organization matches the car's organization
        const clientOrg = identity.mspId;
        if (clientOrg !== 'Org1MSP') {
            throw new Error(`Access denied. Only Org1MSP organization is authorized to query the chaincode.`);
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user+'Org1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('logging');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('queryAllCars');
        const allResults = JSON.parse(result.toString());

        // Filter the results to include only entries that have Org1MSP
        const filteredResults = allResults.filter((record) => record.Record.mspID === 'Org1MSP');

        console.log(`Transaction has been evaluated, result is:`);
        console.log(filteredResults);

        const { createLog } = require('./createAuditRecordGetAuditAllOrg1'); // Include create_log.js

        // Disconnect from the gateway.
        await gateway.disconnect();
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}


main();
