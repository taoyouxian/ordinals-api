export type DbInscription = {
  inscription_id: string;
  offset: number;
  block_height: number;
  block_hash: string;
  tx_id: string;
  address: string;
  sat_ordinal: bigint;
  sat_point: string;
  fee: number;
  content_type: string;
  content_length: number;
  timestamp: number;
};

export type DbInscriptionContent = {
  content_type: string;
  content_length: number;
  content: string;
};

export const INSCRIPTIONS_COLUMNS = [
  'inscription_id',
  'offset',
  'block_height',
  'block_hash',
  'tx_id',
  'address',
  'sat_ordinal',
  'sat_point',
  'fee',
  'content_type',
  'content_length',
  'timestamp',
];