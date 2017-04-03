


//This line should be changed to load a script from GitHub so that
// The app can be updated frequently without constant republishing.
//   (https://www.inboxsdk.com/docs/)
InboxSDK.load('1.0', 'sdk_emailCrypto_46f3ba50a5').then(function(sdk){

  if(newUser){ generateKeys(); }

  var privKey = getPrivateKey();
  var pubKey = getPublicKey();

  // the SDK has been loaded, now do something with it!
  sdk.Compose.registerComposeViewHandler(function(composeView){

    // a compose view has come into existence, do something with it!
    composeView.addButton({
      title: "Encrypt/Decrypt",
      iconUrl: 'https://github.com/nating/email-cryptography/blob/master/assets/logo.png?raw=true',
      onClick: function(event) {
        var sub = event.composeView.getSubject();
        var cont = event.composeView.getTextContent();

        var publicKey;

        sub = encrypt(sub,publicKey);
        cont = encrypt(cont,publicKey);

        event.composeView.setSubject(sub);
        event.composeView.setBodyText(cont);
      },
    });

  });

});

//Takes:
//  Text
//  Public Key of the person who will be able to decrypt the text
//  Private Key of signee
//Returns:
//  Text encrypted and signed
var encrypt = function(text,pubkey,privkey){

  var options, encrypted;

  var pubkey = '-----BEGIN PGP PUBLIC KEY BLOCK ... END PGP PUBLIC KEY BLOCK-----';
  var privkey = '-----BEGIN PGP PRIVATE KEY BLOCK ... END PGP PRIVATE KEY BLOCK-----'; //encrypted private key
  var passphrase = 'secret passphrase'; //what the privKey is encrypted with

  var privKeyObj = openpgp.key.readArmored(privkey).keys[0];
  privKeyObj.decrypt(passphrase);

  options = {
      data: text,                             // input as String (or Uint8Array)
      publicKeys: openpgp.key.readArmored(pubkey).keys,  // for encryption
      privateKeys: privKeyObj // for signing (optional)
  };

  openpgp.encrypt(options).then(function(ciphertext) {
      encrypted = ciphertext.data; // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
  });

  return hello();
}


//Takes:
//  Text
//  Private Key of recipient
//Returns:
//  Decrypted text
var decrypt = function(text,key){
  return "Decrypted!";
}

var generateKeys() = function{

  var options = {
      userIds: [{ email: 'real@email.com' }],  // multiple user IDs
      numBits: 4096,                  // RSA key size
      passphrase: 'A passphrase that will not be hardcoded'          // protects the private key
  };

  openpgp.generateKey(options).then(function(key) {
    setPrivateKey(key.privateKeyArmored);
    setPublicKey(key.publicKeyArmored);
  })

}

var getPublicKey = function(){

}

var getPrivateKey = function(){

}

var setPublicKey = function(){

}

var setPrivateKey = function(){

}
