import { randomUUID } from 'crypto';
import { ENV } from '../env';
import { PgStore } from '../pg/pg-store';
import {
  ChainhookEventObserver,
  ChainhookNodeOptions,
  Payload,
  ServerOptions,
  ServerPredicate,
} from '@hirosystems/chainhook-client';
import { logger } from '@hirosystems/api-toolkit';

export const CHAINHOOK_BASE_PATH = `http://${ENV.CHAINHOOK_NODE_RPC_HOST}:${ENV.CHAINHOOK_NODE_RPC_PORT}`;
export const PREDICATE_UUID = randomUUID();

/**
 * Starts the chainhooks event server.
 * @param args - DB
 * @returns ChainhookEventObserver instance
 */
export async function startChainhookServer(args: { db: PgStore }): Promise<ChainhookEventObserver> {
  const predicates: ServerPredicate[] = [];
  if (ENV.CHAINHOOK_AUTO_PREDICATE_REGISTRATION) {
    const blockHeight = await args.db.getChainTipBlockHeight();
    logger.info(`Ordinals predicate starting from block ${blockHeight}...`);
    predicates.push({
      uuid: PREDICATE_UUID,
      name: 'inscription_feed',
      version: 1,
      chain: 'bitcoin',
      networks: {
        mainnet: {
          start_block: blockHeight,
          if_this: {
            scope: 'ordinals_protocol',
            operation: 'inscription_feed',
          },
        },
      },
    });
  }

  const serverOpts: ServerOptions = {
    hostname: ENV.API_HOST,
    port: ENV.EVENT_PORT,
    auth_token: ENV.CHAINHOOK_NODE_AUTH_TOKEN,
    external_base_url: `http://${ENV.EXTERNAL_HOSTNAME}:${ENV.EVENT_PORT}`,
    wait_for_chainhook_node: ENV.CHAINHOOK_AUTO_PREDICATE_REGISTRATION,
    validate_chainhook_payloads: true,
    body_limit: 41943040, // 40MB
  };
  const chainhookOpts: ChainhookNodeOptions = {
    base_url: CHAINHOOK_BASE_PATH,
  };
  const server = new ChainhookEventObserver(serverOpts, chainhookOpts);
  await server.start(predicates, async (_uuid: string, payload: Payload) => {
    await args.db.updateInscriptions(payload);
  });
  return server;
}
