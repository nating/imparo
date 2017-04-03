


//This line should be changed to load a script from GitHub so that
// The app can be updated frequently without constant republishing.
//   (https://www.inboxsdk.com/docs/)
InboxSDK.load('1.0', 'sdk_emailCrypto_46f3ba50a5').then(function(sdk){

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
var encrypt = function(text,key){
  return "Remy Boys!";
}


//Takes:
//  Text
//  Private Key of recipient
//Returns:
//  Decrypted text
var decrypt = function(text,key){
  return "Decrypted!";
}


