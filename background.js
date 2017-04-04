/*  
    Created by Geoffrey Natin 3/4/17
    nating@tcd.ie
    14318196
*/

//Initialize openpgp worker thread for cryptography
openpgp.initWorker({ path:'chrome-extension://flhloomlgckkflmlkklmcfjjgmkkcfjg/openpgp.worker.min.js' });

//Listen for messages sent from imparo.js
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
    
//-------------------------------------------------Encryption----------------------------------------------------

    if (msg.type == "content-for-encryption"){

    	//Extract data from message
    	var content = msg.content;
    	var subject = msg.subject;
    	var senderEmail = msg.sender;
    	var senderPublicKey = msg.senderpub;
    	var senderPrivateKey = msg.senderpri;
    	var senderPassphrase = msg.passphrase;
    	var recieverPublicKey = msg.recipient;

    	//Create privateKeyObject by decrypting stored private key with passphrase
    	var privKeyObj = openpgp.key.readArmored(senderPrivateKey).keys[0];
		privKeyObj.decrypt(senderPassphrase);

		//Set up options for the encryption
    	options = {
		    data: '{subject:"'+subject+'",content:"'+content+'"}',
			publicKeys: openpgp.key.readArmored(recieverPublicKey).keys,
		    privateKeys: privKeyObj
		};

		//Sign the contents
		openpgp.sign(options).then(function(signed) {
		    var signedContent = signed.data;

		    //Encrypt the signed content
			openpgp.encrypt(options).then(function(ciphertext) {
			    var encryptedContent = ciphertext.data;

			    //Send the encrypted content back to imparo.js
    			sendResponse({type: "encrypted-content",content:encryptedContent});
			});
		});
    }

//-------------------------------------------------Decryption----------------------------------------------------

    else if(msg.type == "content-for-decryption"){

    	//Extract data from message
    	var sender = msg.sender;
    	var encrypted = msg.content;

    	//Hardcoded test message cause I can't get a real one to work for the life of me
    	var pgp_msg =
            ['-----BEGIN PGP MESSAGE-----',
            'Version: OpenPGP.js v2.5.3',
            'Comment: http://openpgpjs.org',
            '',
            'hIwDBU4Dycfvp2EBA/9tuhQgOrcATcm2PRmIOcs6q947YhlsBTZZdVJDfVjkKlyM',
            'M0yE+lnNplWb041Cpfkkl6IvorKQd2iPbAkOL0IXwmVN41l+PvVgMcuFvvzetehG',
            'Ca0/VEYOaTZRNqyr9FIzcnVy1I/PaWT3iqVAYa+G8TEA5Dh9RLfsx8ZA9UNIaNI+',
            'ASm9aZ3H6FerNhm8RezDY5vRn6xw3o/wH5YEBvV2BEmmFKZ2BlqFQxqChr8UNwd1',
            'Ieebnq0HtBPE8YU/L0U=',
            '=JyIa',
            '-----END PGP MESSAGE-----'].join('\n');

        //Get stored data relating to keys for decrypt and verify content
        var storageItems = ["people","privatekey","passphrase"];
        chrome.storage.sync.get(storageItems, function(items) {

        	//Check contacts for the the email address of the person who sent the encrypted email to verify their signature
  			var peopleJSON = JSON.parse(items.people);
        	if(!peopleJSON.hasOwnProperty(sender)){alert("Imparo Error: You do not have the public key for "+sender+" to verify their signature."); }

        	//Create private key object by decrypting stored private key with passphrase
	    	var privKeyObj = openpgp.key.readArmored(items.privatekey).keys[0];
			privKeyObj.decrypt(items.passphrase);

			//Set up options for decrypting and verifying
	    	options = {
			    message: openpgp.message.readArmored(encrypted),
			    publicKeys: openpgp.key.readArmored(items.people[sender]).keys,
			    privateKey: privKeyObj // for decryption
			};

			//Decrypt the content
			openpgp.decrypt(options).then(function(plaintext) {

				//Here we will verify the signature and then show the user the decrypted message!
			    alert(plaintext.data);
			});

		});
    }
    return true;
});


