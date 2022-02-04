const TokenFarm = artifacts.require('TokenFarm')

// can be called anytime
module.exports = async function(callback) {
    let tokenFarm = await TokenFarm.deployed()
    await tokenFarm.issueTokens()
    
    console.log("tokens issued!")
    callback()
}