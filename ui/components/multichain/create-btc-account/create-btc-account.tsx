import React from 'react';
import { InternalAccount, KeyringClient, Sender } from '@metamask/keyring-api';
import { HandlerType } from '@metamask/snaps-utils';
import { Json, JsonRpcRequest } from '@metamask/utils';
import { handleSnapRequest } from '../../../store/actions';
import { CreateAccount } from '..';
import { useI18nContext } from '../../../hooks/useI18nContext';

type CreateBtcAccountOptions = {
  /**
   * Callback called once the account has been created
   */
  onActionComplete: (completed: boolean) => Promise<void>;
};

// TODO: Move this in a separate file
const origin = 'metamask';
const snapId = 'local:http://localhost:8080';
// const origin = 'https://metamask.github.io';
// const snapId = 'npm:@metamask/snap-simple-keyring-snap';

class BitcoinSnapSender implements Sender {
  send = async (request: JsonRpcRequest): Promise<Json> => {
    return (await handleSnapRequest({
      snapId,
      origin,
      handler: HandlerType.OnKeyringRequest,
      request,
    })) as Json;
  };
}

export const CreateBtcAccount = ({
  onActionComplete,
}: CreateBtcAccountOptions) => {
  const t = useI18nContext();

  const onCreateAccount = async (_name: string) => {
    // We finish the current action to close the popup before starting the account creation.
    //
    // NOTE: We asssume that at this stage, name validation has already been validated so we
    // can safely proceed with the account Snap flow.
    await onActionComplete(true);

    const client = new KeyringClient(new BitcoinSnapSender());
    await client.createAccount({
      // TODO: Add constants for this
      scope: 'bip122:000000000019d6689c085ae165831e93',
    });

    // TODO: Add logic to rename account
  };

  const getNextAvailableAccountName = async (_accounts: InternalAccount[]) => {
    return 'Bitcoin Account';
  };

  return (
    <CreateAccount
      onActionComplete={onActionComplete}
      onCreateAccount={onCreateAccount}
      getNextAvailableAccountName={getNextAvailableAccountName}
    ></CreateAccount>
  );
};
