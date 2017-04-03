

openpgp.initWorker({ path:'openpgp.worker.min.js' })

// Saves options to chrome.storage
var save_options = function(){

  var ge = document.getElementById('generating');
  ge.textContent = "Generating new keys.";


  var emailInput = document.getElementById('new-personal-email-address').value;
  var passphraseInput = document.getElementById('new-personal-passphrase').value;

  var options = {
	  userIds: [{ email: emailInput }],    // multiple user IDs
	  numBits: 4096,                       // RSA key size
	  passphrase: passphraseInput          // protects the private key
  };

  openpgp.generateKey(options).then(function(key) {

  	var prikey = key.privateKeyArmored;
  	var pubkey = key.publicKeyArmored;

	  chrome.storage.sync.set({
	    personalemail: emailInput,
	    personalpassphrase: passphraseInput,
	    privatekey: key.publicKeyArmored,
	    publickey: key.publicKeyArmored
	  }, function() {
	    // Update status to let user know options were saved.
	    var em = document.getElementById('personal-email-address');
	    var pk = document.getElementById('personal-public-key');
	    ge.textContent = "New keys were generated."
	    em.textContent = emailInput;
	    pk.textContent = pubkey;
	    setTimeout(function() {
	      ge.textContent = '';
	    }, 750);
	  });

  })
};


document.getElementById("newKeySubmit").onclick = function(){
	save_options();
};

/*
// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    favoriteColor: 'red',
    likesColor: true
  }, function(items) {
    document.getElementById('color').value = items.favoriteColor;
    document.getElementById('like').checked = items.likesColor;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);








var generateKeys = function(){

  var options = {
      userIds: [{ email: 'real@email.com' }],   // multiple user IDs
      numBits: 4096,                            // RSA key size
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
*/