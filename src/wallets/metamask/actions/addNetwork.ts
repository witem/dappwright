import { Page } from 'playwright-core';
import { clickOnButton, typeOnInputField } from '../../../helpers';

import { AddNetwork } from '../../../index';
import { clickOnLogo, getErrorMessage, openNetworkDropdown } from './helpers';

export const addNetwork =
  (page: Page) =>
  async ({ networkName, rpc, chainId, symbol }: AddNetwork): Promise<void> => {
    await page.bringToFront();
    await openNetworkDropdown(page);
    await clickOnButton(page, 'Add network');

    const responsePromise = page.waitForResponse(
      (response) => new URL(response.url()).pathname === new URL(rpc).pathname,
    );

    await typeOnInputField(page, 'Network name', networkName);
    await typeOnInputField(page, 'New RPC URL', rpc);
    await typeOnInputField(page, 'Chain ID', String(chainId));
    await typeOnInputField(page, 'Currency symbol', symbol);

    await responsePromise;
    await page.waitForTimeout(500);

    const errorMessage = await getErrorMessage(page);
    if (errorMessage) {
      await clickOnLogo(page);
      throw new SyntaxError(errorMessage);
    }

    await clickOnButton(page, 'Save');

    await page.waitForSelector(`//*[text() = '${networkName}']`);

    const gotItButtonVisible = await page.isVisible(`//button[contains(text(), 'Got it')]`);
    if (gotItButtonVisible) await clickOnButton(page, 'Got it');
  };
