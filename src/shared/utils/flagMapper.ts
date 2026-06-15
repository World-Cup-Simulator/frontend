const fifaToIsoMap: Record<string, string> = {
  ARG: 'ar',
  ALG: 'dz',
  AUS: 'au',
  AUT: 'at',
  BEL: 'be',
  BIH: 'ba',
  BRA: 'br',
  CAN: 'ca',
  CPV: 'cv',
  COL: 'co',
  CRO: 'hr',
  CUW: 'cw',
  CZE: 'cz',
  COD: 'cd',
  ECU: 'ec',
  EGY: 'eg',
  ENG: 'gb-eng',
  FRA: 'fr',
  GER: 'de',
  GHA: 'gh',
  HAI: 'ht',
  IRN: 'ir',
  IRQ: 'iq',
  CIV: 'ci',
  JPN: 'jp',
  JOR: 'jo',
  MEX: 'mx',
  MAR: 'ma',
  NED: 'nl',
  NZL: 'nz',
  NOR: 'no',
  PAN: 'pa',
  PAR: 'py',
  POR: 'pt',
  QAT: 'qa',
  KSA: 'sa',
  SCO: 'gb-sct',
  SEN: 'sn',
  RSA: 'za',
  KOR: 'kr',
  ESP: 'es',
  SWE: 'se',
  SUI: 'ch',
  TUN: 'tn',
  TUR: 'tr',
  USA: 'us',
  URU: 'uy',
  UZB: 'uz',
};

export const getFlagUrl = (fifaCode: string): string => {
  const isoCode = fifaToIsoMap[fifaCode.toUpperCase()];
  if (!isoCode) {
    return '';
  }
  return `https://flagcdn.com/w40/${isoCode}.png`;
};

export const getIsoCodeFromFifa = (fifaCode: string): string => {
  return fifaToIsoMap[fifaCode.toUpperCase()] || fifaCode.toLowerCase();
};
