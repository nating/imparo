/*  
    Created by Geoffrey Natin 3/4/17
    nating@tcd.ie
    14318196
*/

//This line should be changed to load a script from GitHub once  
// published so the app can be updated without constant republishing.
//  (https://www.inboxsdk.com/docs/)
InboxSDK.load('1.0', 'sdk_emailCrypto_46f3ba50a5').then(function(sdk){


//--------------------------------------------Composing emails-------------------------------------------------

  //Code to run when a user begins composing an email
  sdk.Compose.registerComposeViewHandler(function(composeView){

    //Button to encrypt the content and subject of an email with the public key of the recipient
    composeView.addButton({
      title: "Encrypt with Imparo",
      iconUrl: 'https://github.com/nating/email-cryptography/blob/master/assets/logo.png?raw=true',
      onClick: function(event) {

        //Get information from composed email
        var subject = event.composeView.getSubject();
        var recipients = event.composeView.getToRecipients();
        var content = event.composeView.getTextContent();

        //Get stored data regarding keys for encryption
        var storedItems = ["personalemail","publickey","people","privatekey","passphrase"];
        chrome.storage.sync.get(storedItems, function(items) {

          //Make sure all necessary data is present
          if(!items.personalemail || !items.publickey){ return alert("Imparo error: You have not yet generated your personal keys:\nGoto: chrome-extension://flhloomlgckkflmlkklmcfjjgmkkcfjg/options.html");}
          if(!checkForRecipients(items.people,recipients)){ return alert("Imparo error: Unable to find a public key for all recipients.");}

          //Extract the public key of the recipient to encrypt the message for
          var peopleJSON = JSON.parse(items.people);
          var recipientpub = peopleJSON[recipients[0].emailAddress];

          //Update user with current encryption progress
          event.composeView.setBodyText("Retrieved keys. Now encrypting content...");

          //Send message to cryptography.js
          chrome.runtime.sendMessage({type:"content-for-encryption",content:content,subject:subject,recipientpub:recipientpub,senderpub:items.publickey,senderpri:items.privatekey,passphrase:items.passphrase,sender:items.personalemail}, function(response) {
            
            //Update content of email with encrypted data for sending
            event.composeView.setSubject("_Imparo_Encrypted_Message_");
            event.composeView.setBodyText(response.content);

          });
        });
      },
    });
  });

//--------------------------------------------Reading emails-------------------------------------------------

  //Code to run when a user begins reading an email
  sdk.Conversations.registerMessageViewHandler(function(messageView){

    //If subject of message is '_Imparo_Encrypted_Message_' then add a decrypt button
    if(messageView.getThreadView().getSubject()=="_Imparo_Encrypted_Message_"){
      messageView.addToolbarButton({
        section: "MORE",
        title: "Decrypt with Imparo",
        iconUrl: 'https://github.com/nating/email-cryptography/blob/master/assets/logo.png?raw=true',
        onClick: function(event) {

          //Get details of email
          var sender = messageView.getSender().emailAddress;
          var html = messageView.getBodyElement().innerHTML;

          //Extract encrypted message from html of bodyElement
          var rep = html.substring(html.indexOf("<a href="), html.indexOf("</a>")+5);   //Make hyperlink inline again
          var stripped = html.replace(rep,"http://openpgpjs.org");                      
          stripped = stripped.replace(/(\r\n|\n|\r)/gm," ");                            //Replace (a?) newline with space
          while(stripped.indexOf('<wbr>')!==-1){                                        
            stripped = stripped.replace("<wbr>","");                                    //Remove all '<wbr>'s
          }                                                                             
          var content = stripped.substring( stripped.indexOf("-----BEGIN PGP MESSAGE-----"), stripped.indexOf("-----END PGP MESSAGE-----")+26 ); //Take only from the beginning to the end of the pgp message
      
          //Update user with current progress
          alert("Decrypting now. Please wait.");

          //Send content to cryptography.js for decryption
          chrome.runtime.sendMessage({type:"content-for-decryption",sender:sender,content:content}, function(response) {
            
          });
        },orderHint: function(hint){}
      });
    }
  });
});

//----------------------------------------Other Functions------------------------------------------------

//Checks if a json string contains keys that match the emailAddress value of each recipient object
var checkForRecipients = function(peopleString,recipients){
  var peopleJSON = JSON.parse(peopleString);
  for (var i in recipients) {
    if (!peopleJSON.hasOwnProperty(recipients[i].emailAddress)) {
      console.log("No public key for:"+recipients[i].emailAddress);
      return false;
    }
  }
  return true;
};