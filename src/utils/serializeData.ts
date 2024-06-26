import { SolanaSignInInput, SolanaSignInOutput } from '@solana/wallet-standard-features';
import { WalletAccount } from '@wallet-standard/base';
import { getCsrfToken } from 'next-auth/react';

export type SerialisableWalletAccount = {
  address: string;
  chains: string[];
  features: string[];
  icon: string | undefined;
  label: string | undefined;
  publicKey: Uint8Array;
  publicKeyLength: number;
}

function walletAccountToSerializableObject(walletAccount: WalletAccount): SerialisableWalletAccount {
  return {
    address: walletAccount.address,
    chains: [...walletAccount.chains],
    features: [...walletAccount.features],
    icon: walletAccount.icon,
    label: walletAccount.label,
    publicKey: walletAccount.publicKey,
    publicKeyLength: walletAccount.publicKey.length,
  }
}

export function serializeData(input: SolanaSignInInput, output: SolanaSignInOutput): {
    jsonInput: any,
    jsonOutput: any
} {
    const account: SerialisableWalletAccount = walletAccountToSerializableObject(output.account);
    const jsonOutput: string = JSON.stringify({...output, account});
    const jsonInput: string = JSON.stringify(input);

    return { jsonInput, jsonOutput }
}

export async function deserializeData(jsonInput: string, jsonOutput: string, csrfToken: string | undefined) {
    const parsedInput: SolanaSignInInput = await JSON.parse(jsonInput);
    const input: SolanaSignInInput = {...parsedInput, nonce: csrfToken};

    const parsedOutput: any = await JSON.parse(jsonOutput);

    // Deserialization of the WalletAccount Object
    let account = {...parsedOutput.account, publicKey: new Uint8Array(parsedOutput.account.publicKeyLength)};
    for (let i = 0; i < parsedOutput.account.publicKeyLength; i++) {
      account.publicKey[i] = parsedOutput.account.publicKey[i];
    }
    delete parsedOutput.account.publicKeyLength;

    // Final Output Object
    const output: SolanaSignInOutput = {
      account: account,
      signedMessage: new Uint8Array(parsedOutput.signedMessage.data),
      signature: new Uint8Array(parsedOutput.signature.data),
    };

    return { input, output };
}

