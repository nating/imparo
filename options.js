/*  
    Created by Geoffrey Natin 3/4/17
    nating@tcd.ie
    14318196
*/

//Run cryptography worker thread
openpgp.initWorker({ path:'openpgp.worker.min.js' });

//-----------------------------------------------------Saving New Keys-----------------------------------------------------

//Save keys from new keys input
var save_keys = function(){

  var ge = document.getElementById('generating-keys');
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
	    passphrase: passphraseInput,
	    personalpassphrase: passphraseInput,
	    privatekey: key.privateKeyArmored,
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
  return true;
};

//-----------------------------------------------------Saving a new contact-----------------------------------------------------

//Save contact from new contact input
var save_contact = function(){

	//Get html elements from page
	var g = document.getElementById('adding-contact');
	var e = document.getElementById('new-contact-email-address');
	var p = document.getElementById('new-contact-public-key');

	//Update user with current progress
	g.textContent = "Adding contact...";

	//Extract values from html elements
	var emailInput = e.value;
	var pubKeyInput = p.value;

	//Get stored contacts data
	chrome.storage.sync.get(["people"], function(items) {
		var peopleString = items.people || "{}";
		var peopleJSON = JSON.parse(peopleString);

		//Update contacts data
		peopleJSON[emailInput] = pubKeyInput;
		peopleString = JSON.stringify(peopleJSON);

		//Store new contacts data
		chrome.storage.sync.set({
		  	people: peopleString
		},function() {

		    //Update status to let user know contact was saved
		    g.textContent = "New Contact was added."

		    //Clear all inputs after interval
		    setTimeout(function() {
		      	g.textContent = '';
		    	e.textContent = '';
		    	p.textContent = '';
		    }, 750);

		    //Update list of contacts displayed on page
			var str = "";
			for (var key in peopleJSON) {
			  if (peopleJSON.hasOwnProperty(key)) {
			    str += key + "\t:\t" + peopleJSON[key].substring(95,95+50)+"...<br><br>"; //First 95 characters of public key are always the same
			  }
			}
			document.getElementById('contacts').innerHTML = str;
		});
	});
	return true;
};

//-----------------------------------------------------Deleting a contact-----------------------------------------------------

//Delete contact from new contact input
var delete_contact = function(){

	//Get html elements from page
  	var g = document.getElementById('adding-contact');
  	var e = document.getElementById('new-contact-email-address');
  	var p = document.getElementById('new-contact-public-key');

  	//Update user with current progress
  	g.textContent = "Deleting contact...";

  	//Extract values from html elements
  	var emailInput = e.value;

  	//Get stored contacts data
	chrome.storage.sync.get(["people"], function(items) {
		var peopleString = items.people || "{}";
		var peopleJSON = JSON.parse(peopleString);

		//Update contacts data
		delete peopleJSON[emailInput];
		peopleString = JSON.stringify(peopleJSON);

		//Store updated contacts data
		chrome.storage.sync.set({
		  	people: peopleString
		},function() {

		    //Update status to let user know contact was deleted
		    g.textContent = "Contact was deleted."

		    //Clear inputs after an interval
		    setTimeout(function() {
		      	g.textContent = '';
		    	e.textContent = '';
		    	p.textContent = '';
		    }, 750);

		    //Update list of contacts displayed on page
			var str = "";
			for (var key in peopleJSON) {
			  if (peopleJSON.hasOwnProperty(key)) {
			    str += key + "\t:\t" + peopleJSON[key].substring(95,95+50)+"...<br><br>"; //First 95 characters of public key are always the same
			  }
			}
			document.getElementById('contacts').innerHTML = str;
		});
	});
	return true;
};

//------------------------------------------------Fixing up HTML onLoad--------------------------------------------------

//Get stored data about keys
var storedItems = ["personalemail","publickey","people"];
chrome.storage.sync.get(storedItems, function(items) {

	//Display user credentials on page
	document.getElementById('personal-email-address').textContent = items.personalemail;
	document.getElementById('personal-public-key').textContent = items.publickey;

	//Display user's contacts on page
	var peopleString = items.people || "{}";
	var peopleJSON = JSON.parse(peopleString);
	var str = "";
	for (var key in peopleJSON) {
	  if (peopleJSON.hasOwnProperty(key)) {
	    str += key + "\t:\t" + peopleJSON[key].substring(95,95+50)+"...<br><br>"; //First 95 characters of public key are always the same
	  }
	}
	document.getElementById('contacts').innerHTML = str;
});

//Add onClick methods to various buttons on page
document.getElementById("newKeySubmit").onclick = function(){save_keys();};
document.getElementById("deleteContactSubmit").onclick = function(){delete_contact();};
document.getElementById('newContactSubmit').onclick = function(){save_contact();}