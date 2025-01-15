export enum Types {
  BATHTUB = 'bathtub',
  BED = 'bed',
  BENCH = 'bench',
  BOOKSHELF = 'bookshelf',
  CABINET = 'cabinet',
  CHAIR = 'chair',
  COFFEE_TABLE = 'coffee_table',
  CONSOLE_TABLE = 'console_table',
  DAY_BED = 'day_bed',
  DESK = 'desk',
  DRESSING_TABLE = 'dressing_table',
  FAUCET = 'faucet',
  FLOOR_LAMP = 'floor_lamp',
  FUTON = 'futon',
  LIGHT = 'light',
  LOVESEAT = 'loveseat',
  MATTRESS = 'mattress',
  MIRROR = 'mirror',
  NIGHTSTAND = 'nightstand',
  PAINTING = 'painting',
  PLANT_STAND = 'plant_stand',
  RUG = 'rug',
  SIDE_TABLE = 'side_table',
  SINK = 'sink',
  SLEEPER_SOFA = 'sleeper_sofa',
  SOFA = 'sofa',
  SOFA_BED = 'sofa_bed',
  STOOL = 'stool',
  STORAGE_UNIT = 'storage_unit',
  STUDY_TABLE = 'study_table',
  TABLE_LAMP = 'table_lamp',
  TOY = 'toy',
  TV_STAND = 'tv_stand',
  VANITY = 'vanity',
  WALL_LAMP = 'wall_lamp',
  WALL_MIRROR = 'wall_mirror',
  WALL_SHELF = 'wall_shelf',
  WATER_CLOSET = 'water_closet',
}

export interface ScrapperOutput {
  product_name?: string;
  images?: string[];
  height?: string;
  width?: string;
  depth?: string;
  material?: string;
  price?: string;
  sku?: string;
  artist?: string;
  type?: Types;
  product_url?: string;
  source?: string;
  glbs?: string[];
  glb_to_use?: string;
  description?: string;
  tags?: string;
  'supporting-surface'?: 'floor' | 'wall';
}

export interface ProductMetadata {
  product_name: string;
  product_url: string;
  type: string;
  price: number;
  height: number;
  width: number;
  depth: number;
  tags: string;
  images: string[];
  sku: string;
  source: string;
  description: string;
}

export interface ScraperInput {
  url: string;
  html: string;
}
