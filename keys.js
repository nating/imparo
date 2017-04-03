

var options = {
    userIds: [{ email: email }],	// multiple user IDs
    numBits: 4096,                  // RSA key size
    passphrase: passphrase          // protects the private key
};

openpgp.generateKey(options).then(function(key) {
    var privkey = key.privateKeyArmored;
    var pubkey = key.publicKeyArmored;
})