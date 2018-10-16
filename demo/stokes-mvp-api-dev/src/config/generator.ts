var SHA256 = require("crypto-js/sha256");

// Will use this class for any random number generation we might need
export class Generator {

    // Generates random string
    public generateRandomString() {
        return Math.random().toString(36).slice(2, 12);
    }
}

export default new Generator();