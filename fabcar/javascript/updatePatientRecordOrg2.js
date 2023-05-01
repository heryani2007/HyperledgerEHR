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
            rl.question('What is the record number you want to update: ', (carNumber) => {
                resolve(carNumber);

            });
        });
        
        var logWho = {
        account: user,
        patient_id: carNumber,
        };
  module.exports = { logWho };
        
        const name = await new Promise((resolve) => {
            rl.question('Enter patients name: ', (name) => {
                resolve(name);

            });
        });
        
        
        const patient_ID = await new Promise((resolve) => {
            rl.question('Enter patients ID: ', (patient_ID) => {
                resolve(patient_ID);

            });
        });
        
        const primary_care_doctor = await new Promise((resolve) => {
            rl.question("Enter patients primary car doctor's name: ", (primary_care_doctor) => {
                resolve(primary_care_doctor);
            });
        });


        const date_of_birth = await new Promise((resolve) => {
            rl.question("Enter the patients date od birth: ", (date_of_birth) => {
                resolve(date_of_birth);
            });
        });


        const gender = await new Promise((resolve) => {
            rl.question("Enter the patients gender: ", (gender) => {
                resolve(gender);
            });
        });

        const address = await new Promise((resolve) => {
            rl.question("Enter the patients address: ", (address) => {
                resolve(address);
            });
        });


        const insurance = await new Promise((resolve) => {
            rl.question("Enter the patients insurance: ", (insurance) => {
                resolve(insurance);
            });
        });


        const prescription = await new Promise((resolve) => {
            rl.question("Enter the patients prescription: ", (prescription) => {
                resolve(prescription);
            });
        });

        const allergies = await new Promise((resolve) => {
            rl.question("Enter the patients allergies: ", (allergies) => {
                resolve(allergies);
            });
        });


        rl.close(); // Close the readline interface
        
        const updates = {
    name: name,
    patient_ID: patient_ID,
    primary_care_doctor: primary_care_doctor,
    date_of_birth: date_of_birth,
    gender: gender,
    address: address,
    insurance: insurance,
    prescription: prescription,
    allergies: allergies
};
                
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        //console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(user+'Org2');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            console.log('You Are Not Among Those Permitted To Perform This Action');
            console.log('This Agression Has Been Logged');
            const { createLog } = require('./createAuditRecordFailUpdatePatientOrg2'); // Include create_log.js
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: user+'Org2', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
        //await contract.submitTransaction('updateCar', carNumber, 'Org2MSP', name, patient_ID, primary_care_doctor, date_of_birth, gender, address, insurance, prescription, allergies);
        await contract.submitTransaction('updateCar', carNumber+'Org2MSP', JSON.stringify(updates));
        console.log('Transaction has been submitted');
        
        const { createLog } = require('./createAuditRecordUpdateOrg2'); // Include create_log.js
        
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
