const { assert } = require('chai');

const DappToken = artifacts.require('DappToken');
const DaiToken = artifacts.require('DaiToken');
const TokenFarm = artifacts.require('TokenFarm');

require('chai')
  .use(require('chai-as-promised'))
  .should();

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm;

  before(async () => {
    // load contracts
    daiToken = await DaiToken.new();
    dappToken = await DappToken.new();
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

    // transfer all dappToken supply (1 Mil) to tokenFarm
    await dappToken.transfer(tokenFarm.address, tokens('1000000'));

    // transfer 100 mDai to investor on network
    await daiToken.transfer(investor, tokens('100'), { from: owner });
  });

  describe('Mock DAI deployment', async () => {
    it('has a name', async () => {
      let daiToken = await DaiToken.new();
      const name = await daiToken.name();
      assert.equal(name, 'Mock DAI Token');
    });
  });

  describe('DappToken deployment', async () => {
    it('has a name', async () => {
      let dappToken = await DappToken.new();
      const name = await dappToken.name();
      assert.equal(name, 'BroccFi Token');
    });
  });

  describe('TokenFarm deployment', async () => {
    it('has a name', async () => {
      let tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);
      const name = await tokenFarm.name();
      assert.equal(name, 'BroccFi Token Farm');
    });

    it('contract has tokens', async () => {
      let balance = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), tokens('1000000'));
    });
  });

  describe('Farming tokens', async () => {
    it('rewards investors for staking mDai tokens', async () => {
      let result;

      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens('100'),
        'correct mDAI wallet balance before staking'
      );

      // deposit mDAI into contract
      await daiToken.approve(tokenFarm.address, tokens('100'), {
        from: investor,
      });

      // staking
      await tokenFarm.stakeTokens(tokens('100'), { from: investor });

      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens('0'),
        'correct mDAI wallet balance after staking'
      );

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        tokens('100'),
        'correct mDAI tokenFarm balance after staking'
      );

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        tokens('100'),
        'investor correct mDAI tokenFarm balance after staking'
      );

      result = await tokenFarm.isStaking(investor);
      assert.equal(
        result.toString(),
        'true',
        'investor correct staking status after staking'
      );

      // issue tokens
      await tokenFarm.issueTokens({ from: owner });

      result = await dappToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens('100'),
        'investor shoiuld be rewarded with as many dappTokens as mDAI deposited'
      );

      await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

      // Unstake tokens
      await tokenFarm.unstakeTokens({ from: investor });

      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens('100'),
        'investor Mock DAI wallet balance correct after staking'
      );

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        result.toString(),
        tokens('0'),
        'Token Farm Mock DAI balance correct after staking'
      );

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        tokens('0'),
        'investor staking balance correct after staking'
      );

      result = await tokenFarm.isStaking(investor);
      assert.equal(
        result.toString(),
        'false',
        'investor staking status correct after staking'
      );
    });
  });

  // next test here
});
