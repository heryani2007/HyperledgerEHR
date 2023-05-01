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
const readline = require('readline'); // Add this line to include the readline module
//const { createLog } = require('./createAuditRecordDeleteOrg1'); // Include create_log.js

async function main() {  
        try {
            // Create readline interface for user input
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const user = await new Promise((resolve) => {
            rl.question('Enter the account you would like to run the script as: ', (user) => {
                resolve(user);
                
            });
        });   

        // Ask for user input for the name
        const carNumber = await new Promise((resolve) => {
            rl.question('Enter the record number you want to delete: ', (carNumber) => {
                resolve(carNumber);

            });
        });
        
        var logWho = {
        account: user,
        patient_id: carNumber,
        };
  module.exports = { logWho };
       rl.close(); // Close the readline interface
    
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

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
            const { createLog } = require('./createAuditRecordFailDeletePatientOrg1'); // Include create_log.js
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user+'Org1', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');


        // Call the deleteCar transaction
        const carNumberToDelete = carNumber;
        await contract.submitTransaction('deleteCar', carNumberToDelete+'Org1MSP');
        console.log(`Record with number ${carNumberToDelete} has been deleted`);
        const { createLog } = require('./createAuditRecordDeleteOrg1'); // Include create_log.js
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();

