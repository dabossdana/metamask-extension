import { strict as assert } from 'assert';
import { Suite } from 'mocha';
import { withRedesignConfirmationFixtures } from '../helper-fixture';
import {
  DAPP_HOST_ADDRESS,
  WINDOW_TITLES,
  openDapp,
  unlockWallet,
} from '../../../helpers';
import { Ganache } from '../../../seeder/ganache';
import { Driver } from '../../../webdriver/driver';

describe('Confirmation Signature - Sign Typed Data V3', function (this: Suite) {
  if (!process.env.ENABLE_CONFIRMATION_REDESIGN) { return; }

  it('initiates and confirms', async function () {
    await withRedesignConfirmationFixtures(
      this.test?.fullTitle(),
      async ({ driver, ganacheServer }: { driver: Driver, ganacheServer: Ganache }) => {
        const addresses = await ganacheServer.getAccounts();
        const publicAddress = addresses?.[0] as string;

        await unlockWallet(driver);
        await openDapp(driver);
        await driver.clickElement('#signTypedDataV3');
        await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);

        const origin = driver.findElement({ text: DAPP_HOST_ADDRESS });
        const contractPetName = driver.findElement({
          css: '.name__value',
          text: '0xCcCCc...ccccC',
        });

        const primaryType = driver.findElement({ text: 'Mail' });
        const fromName = driver.findElement({ text: 'Cow' });
        const fromAddress = driver.findElement({ css: '.name__value', text: '0xCD2a3...DD826' });
        const toName = driver.findElement({ text: 'Bob' });
        const toAddress = driver.findElement({ css: '.name__value', text: '0xbBbBB...bBBbB' });
        const contents = driver.findElement({ text: 'Hello, Bob!' });

        assert.ok(await origin, 'origin');
        assert.ok(await contractPetName, 'contractPetName');
        assert.ok(await primaryType, 'primaryType');
        assert.ok(await fromName, 'fromName');
        assert.ok(await fromAddress, 'fromAddress');
        assert.ok(await toName, 'toName');
        assert.ok(await toAddress, 'toAddress');
        assert.ok(await contents, 'contents');

        await driver.clickElement('[data-testid="confirm-footer-button"]');

        /**
         * TODO: test scroll and fixing scroll
         * @see {@link https://github.com/MetaMask/MetaMask-planning/issues/2458}
         */
        // test "confirm-footer-button" is disabled and unclickable
        //
        // await driver.clickElement('.confirm-scroll-to-bottom__button');
        // await driver.clickElement('[data-testid="confirm-footer-button"]');

        await assertVerifiedResults(driver, publicAddress);
      },
    );
  });

  it('initiates and rejects', async function () {
    await withRedesignConfirmationFixtures(
      this.test?.fullTitle(),
      async ({ driver, ganacheServer }: { driver: Driver, ganacheServer: Ganache }) => {
        const addresses = await ganacheServer.getAccounts();
        const publicAddress = addresses?.[0] as string;

        await unlockWallet(driver);
        await openDapp(driver);
        await driver.clickElement('#signTypedDataV3');
        await driver.switchToWindowWithTitle(WINDOW_TITLES.Dialog);
        await driver.clickElement('[data-testid="confirm-footer-cancel-button"]');

        await driver.switchToWindowWithTitle(WINDOW_TITLES.TestDApp);

        const rejectionResult = await driver.findElement('#signTypedDataV3Result');
        assert.equal(await rejectionResult.getText(), 'Error: User rejected the request.');
      },
    );
  });
});

async function assertVerifiedResults(driver: Driver, publicAddress: string) {
  await driver.switchToWindowWithTitle(WINDOW_TITLES.TestDApp);
  await driver.clickElement('#signTypedDataV3Verify');

  const verifyResult = await driver.findElement('#signTypedDataV3Result');
  await driver.waitForSelector({
    css: '#signTypedDataV3VerifyResult',
    text: publicAddress,
  });
  const verifyRecoverAddress = await driver.findElement('#signTypedDataV3VerifyResult');

  assert.equal(await verifyResult.getText(), '0x0a22f7796a2a70c8dc918e7e6eb8452c8f2999d1a1eb5ad714473d36270a40d6724472e5609948c778a07216bd082b60b6f6853d6354c731fd8ccdd3a2f4af261b');
  assert.equal(await verifyRecoverAddress.getText(), publicAddress);
}
