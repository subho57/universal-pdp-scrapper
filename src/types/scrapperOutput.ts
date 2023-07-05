export enum Types {
  BED = 'bed',
  BENCH = 'bench',
  BOOKSHELF = 'bookshelf',
  CHAIR = 'chair',
  COFFEE_TABLE = 'coffee_table',
  CONSOLE_TABLE = 'console_table',
  DAY_BED = 'day_bed',
  DESK = 'desk',
  DRESSING_TABLE = 'dressing_table',
  FLOOR_LAMP = 'floor_lamp',
  FUTON = 'futon',
  LOVESEAT = 'loveseat',
  MATTRESS = 'mattress',
  // MIRROR = 'mirror',
  NIGHTSTAND = 'nightstand',
  PAINTING = 'painting',
  PLANT_STAND = 'plant_stand',
  RUG = 'rug',
  SIDE_TABLE = 'side_table',
  SLEEPER_SOFA = 'sleeper_sofa',
  SOFA = 'sofa',
  SOFA_BED = 'sofa_bed',
  STOOL = 'stool',
  STORAGE_UNIT = 'storage_unit',
  STUDY_TABLE = 'study_table',
  TABLE_LAMP = 'table_lamp',
  TOY = 'toy',
  TV_STAND = 'tv_stand',
  WALL_MIRROR = 'wall_mirror',
  WALL_LAMP = 'wall_lamp',
  WALL_SHELF = 'wall_shelf',
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
  'supporting-surface'?: 'floor' | 'wall';
}
