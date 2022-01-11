import {
  ContractMethod,
  ContractProvider,
  MichelsonMap
} from '@taquito/taquito';

import { TokenMetadata } from '@taquito/tzip12';
import { Tzip12Contract, address, nat, bytes } from './type-aliases';

/**
 * `balance_of` FA2 entry point parameter
 */
export interface BalanceRequest {
  /**
   * Address of the token owner which holds token balance
   */
  owner: address;
  
  /**
   * Token ID
   */
  token_id: nat;
}

/**
 * `balance_of` FA2 entry point response
 */
export interface BalanceResponse {
  /**
   * Balance hold by the owner address for the specified token ID
   */
  balance: nat;
  
  /**
   * Owner address and token ID for which balance was requested
   */
  request: BalanceRequest;
}

/**
 *
 */
export interface TransferDestination {
  /**
   * Recipient address for the token transfer
   */
  to_: address;
  
  /**
   * ID of the token to be transferred
   */
  token_id: nat;
  
  /**
   * Amount to be transferred
   */
  amount: nat;
}

/**
 * A transfer from a single token owner address to multiple destinations.
 * It is possible to transfer multiple tokens to multiple destinations with a
 * single Transfer.
 */
export interface Transfer {
  /**
   * Owner address to transfer token(s) from
   */
  from_: address;
  
  /**
   * One or more destinations to transfer tokens to. Each destination specifies
   * destination address, token id and the amount to be transferred.
   */
  txs: TransferDestination[];
}

/**
 * Operator update parameter
 */
export interface OperatorUpdate {
  /**
   * Token owner which operators to be updated
   */
  owner: address;
  
  /**
   * Operator to be added or removed from the list of the owner's operators for
   * the specified token
   */
  operator: address;
  
  /**
   * Token ID (token type) which can be transferred on behalf of the owner by the
   * operator
   */
  token_id: nat;
}

/**
 * This is how token metadata stored withing the contract internally
 */
export interface TokenMetadataInternal {
  /** Token ID */
  token_id: nat;
  
  /**
   * Bytes encoding pieces of token metadata such as metadata external URI,
   * decimals, etc.
   */
  token_info: MichelsonMap<string, bytes>;
}

/**
 * API to access FA2 contract
 */
export interface Fa2Contract {
  /**
   * Query balances for multiple tokens and token owners.
   * Invokes FA2 contract `balance_of` entry point
   */
  queryBalances: (requests: BalanceRequest[]) => Promise<BalanceResponse[]>;
  
  /**
   * Query balances for multiple tokens and token owners and represents
   * results as NFT ownership status.
   * Invokes FA2 contract `balance_of` entry point
   */
  hasNftTokens: (requests: BalanceRequest[]) => Promise<boolean[]>;
  
  /**
   * Extract tokens metadata
   */
  tokensMetadata: (tokenIds: number[]) => Promise<TokenMetadata[]>;

  /**
   * Transfer tokens. In default implementation, only token owner or its operator
   * can transfer tokens from the owner address.
   */
  transferTokens: (transfers: Transfer[]) => ContractMethod<ContractProvider>;

  /**
   * Update list of operators who can transfer tokens on behalf of the token
   * owner. In default implementation, only the owner can update its own operators.
   *
   * @param addOperators list of operators for the specific tokens to be added
   * to the owner's operator list
   * @param removeOperators list of operators for the specific tokens to be removed
   * from the owner's operator list
   */
  updateOperators: (
    addOperators: OperatorUpdate[],
    removeOperators: OperatorUpdate[]
  ) => ContractMethod<ContractProvider>;
}

/**
 * FA2 contract API extension
 *
 * Usage example:
 * ```typescript
 * const fa2Contract =
 *   (await tezosApi(tz).at(contractAddress)).with(Fa2);
 * await fa2Contract.transfer(...);
 * ```
 */
export const Fa2 = (
  contract: Tzip12Contract,
  lambdaView?: address
): Fa2Contract => {
  const self: Fa2Contract = {
    queryBalances: async requests =>
      contract.views.balance_of(requests).read(lambdaView),

    hasNftTokens: async requests => {
      const responses = await self.queryBalances(requests);

      const results = responses.map(r => {
        if (r.balance.eq(1)) return true;
        else if (r.balance.eq(0)) return false;
        else throw new Error(`Invalid NFT balance ${r.balance}`);
      });

      return results;
    },

    tokensMetadata: async tokenIds => {
      const requests = tokenIds.map(id =>
        contract.tzip12().getTokenMetadata(id)
      );
      return Promise.all(requests);
    },

    transferTokens: transfers => contract.methods.transfer(transfers),

    updateOperators: (addOperators, removeOperators) => {
      interface AddOperator {
        add_operator: OperatorUpdate;
      }
      interface RemoveOperator {
        remove_operator: OperatorUpdate;
      }

      type UpdateOperator = AddOperator | RemoveOperator;

      const addParams: UpdateOperator[] = addOperators.map(param => {
        return { add_operator: param };
      });
      const removeParams: UpdateOperator[] = removeOperators.map(param => {
        return { remove_operator: param };
      });
      const allOperators = addParams.concat(removeParams);

      return contract.methods.update_operators(allOperators);
    }
  };

  return self;
};
