/**
 * Global default respawn times
 * These are used if an Item or Monster doesn't specify respawnTime in its model
 * Times are in milliseconds (1000ms = 1 second)
 */

export const DEFAULT_ITEM_RESPAWN_TIME = 60 * 1000; // 60 seconds
export const DEFAULT_MONSTER_RESPAWN_TIME = 120 * 1000; // 120 seconds

/**
 * NOTE: Respawn times are now defined directly on Item and Monster models
 * via the respawnTime field. This allows each item/monster to have its own
 * respawn time. These defaults are only used if respawnTime is not set.
 *
 * Example:
 * {
 *   id: 'weapon-ascia-001',
 *   name: 'Ascia da Guerra',
 *   respawnTime: 180 * 1000,  // 3 minutes (overrides DEFAULT_ITEM_RESPAWN_TIME)
 *   ...
 * }
 */
