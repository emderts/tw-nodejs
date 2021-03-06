module.exports = {
    NAME_KOR_NO_END_CONS : 0,
    NAME_KOR_END_CONS : 1,

    ITEM_TYPE_WEAPON : 0,
    ITEM_TYPE_ARMOR : 1,
    ITEM_TYPE_SUBARMOR : 2,
    ITEM_TYPE_TRINKET : 3,
    ITEM_TYPE_SKILL_ARTIFACT : 4,
    ITEM_TYPE_RESULT_CARD : 100,
    ITEM_TYPE_DAYSTONE : 999,

    DAMAGE_TYPE_ABSOLUTE : 0,
    DAMAGE_TYPE_PHYSICAL : 1,
    DAMAGE_TYPE_MAGICAL : 2,
    DAMAGE_TYPE_PHYSICAL_FIXED : 3,
    DAMAGE_TYPE_MAGICAL_FIXED : 4,

    SKILL_TYPE_DRIVE : 10,
    SKILL_TYPE_SPECIAL : 100,

    ACTIVE_TYPE_ATTACK : 0,
    ACTIVE_TYPE_TAKE_HIT : 1,
    ACTIVE_TYPE_TURN_END : 2,
    ACTIVE_TYPE_TURN_START : 3,
    ACTIVE_TYPE_BATTLE_START : 4,
    ACTIVE_TYPE_BATTLE_END : 5,
    ACTIVE_TYPE_SKILL_WIN : 6,
    ACTIVE_TYPE_SKILL_LOSE : 7,
    ACTIVE_TYPE_DEAL_DAMAGE : 8,
    ACTIVE_TYPE_DEAL_DAMAGE_RECEIVE : 9,
    ACTIVE_TYPE_CALC_STATS : 10,
    ACTIVE_TYPE_OPP_CALC_STATS : 11,
    ACTIVE_TYPE_CALC_DAMAGE : 12,
    ACTIVE_TYPE_CALC_DAMAGE_RECEIVE : 13,
    ACTIVE_TYPE_RECEIVE_BUFF : 14,
    ACTIVE_TYPE_GIVE_BUFF : 15,
    ACTIVE_TYPE_DURATION_END : 16,
    ACTIVE_TYPE_EVADE : 17,
    ACTIVE_TYPE_SKILL_RESELECT : 18,
    ACTIVE_TYPE_ATTACK_CRIT : 19,
    ACTIVE_TYPE_DEAL_DAMAGE_CRIT : 21,
    ACTIVE_TYPE_USE_SPECIAL : 23,
    ACTIVE_TYPE_OPP_USE_SPECIAL : 25,
    ACTIVE_TYPE_MISS : 24,
    ACTIVE_TYPE_USE_DRIVE : 26,
    ACTIVE_TYPE_OPP_USE_DRIVE : 27,
    ACTIVE_TYPE_CONFUSION : 28,
    ACTIVE_TYPE_CANNOT_ATTACK : 29,
    ACTIVE_TYPE_SLEEP : 30,
    ACTIVE_TYPE_DO_HEAL : 31,
    ACTIVE_TYPE_DO_HEAL_RECEIVE : 32,
    ACTIVE_TYPE_TURN_END_WIN : 33,
    ACTIVE_TYPE_TURN_END_LOSE : 34,
    ACTIVE_TYPE_BEFORE_USE_SPECIAL : 35,
    ACTIVE_TYPE_BEFORE_OPP_USE_SPECIAL : 36,
    ACTIVE_TYPE_AFTER_SKILL : 37,
    ACTIVE_TYPE_PREVENT_DEBUFF : 38,
    ACTIVE_TYPE_AFTER_SKILL_LOSE : 39,
    ACTIVE_TYPE_AFTER_TURN_END : 40,
    ACTIVE_TYPE_AFTER_CALC_DAMAGE : 41,

    EFFECT_TYPE_SELF_BUFF : 1,
    EFFECT_TYPE_OPP_BUFF : 2,
    EFFECT_TYPE_SELF_SP : 3,
    EFFECT_TYPE_SELF_HP : 4,
    EFFECT_TYPE_ADD_HIT : 5,
    EFFECT_TYPE_SHIELD_FROM_DAMAGE : 6,
    EFFECT_TYPE_SELF_CONVERT_BUFF : 7,
    EFFECT_TYPE_OPP_CONVERT_BUFF : 8,
    EFFECT_TYPE_SELF_BUFF_REFRESH : 9,
    EFFECT_TYPE_OPP_BUFF_REFRESH : 10,
    EFFECT_TYPE_RETURN : 11,
    EFFECT_TYPE_SKILL_RESELECT : 12,
    EFFECT_TYPE_CANCEL_DAMAGE : 13,
    EFFECT_TYPE_SELECTION : 14,
    EFFECT_TYPE_RESOLVE_DRIVE : 15,
    EFFECT_TYPE_MULTIPLE : 16,
    EFFECT_TYPE_SELF_HIT : 17,
    EFFECT_TYPE_OPP_HIT : 18,
    EFFECT_TYPE_STAT_ADD : 19,
    EFFECT_TYPE_STAT_MULTIPLY : 20,
    EFFECT_TYPE_STAT_PERCENTAGE : 21,
    EFFECT_TYPE_ADD_DAMAGE : 22,
    EFFECT_TYPE_MULTIPLY_DAMAGE : 27,
    EFFECT_TYPE_SHIELD : 23,
    EFFECT_TYPE_PREVENT_DEBUFF : 24,
    EFFECT_TYPE_CHANGE_VALUE : 25,
    EFFECT_TYPE_OPP_SP : 26,
    EFFECT_TYPE_CONVERT_ITEM : 28,
    EFFECT_TYPE_RESOLVE_MAX_DAMAGE : 29,
    EFFECT_TYPE_CHANGE_ATTACK_TYPE : 30,
    EFFECT_TYPE_REDUCE_BUFF_DURATION : 31,
    EFFECT_TYPE_ADD_RESOLUTION : 32,
    EFFECT_TYPE_OPP_STAT_ADD : 33,
    EFFECT_TYPE_OPP_HP : 34,
    EFFECT_TYPE_MULTIPLY_HEAL : 35,
    EFFECT_TYPE_REMOVE_BUFF : 36,
    EFFECT_TYPE_OPP_SELF_HIT : 37,
    EFFECT_TYPE_SET_ITEM_VALUE : 38,
    EFFECT_TYPE_DUPLICATE_ITEM : 39,
    EFFECT_TYPE_SWAP_SP : 41,
    EFFECT_TYPE_CHANGE_SKILL : 42,
    EFFECT_TYPE_RESOLVE_SKILL : 43,
    EFFECT_TYPE_ADD_RESULT_CARD : 44,
    EFFECT_TYPE_SET_SKILL : 45,
    EFFECT_TYPE_SP_COST_PERCENTAGE : 46,
    EFFECT_TYPE_SET_BUFF_VALUE : 48,
    EFFECT_TYPE_OPP_REMOVE_BUFF : 49,
    EFFECT_TYPE_ADD_SKILL_VALUE : 51,
    EFFECT_TYPE_SPLIT_SP : 53,
    EFFECT_TYPE_FORCE_CRIT : 54,
    EFFECT_TYPE_MULTIPLY_DAMAGE_OBJECT : 55,
    EFFECT_TYPE_SET_ALL_BUFF_DURATION : 56,
    EFFECT_TYPE_OPP_SET_ALL_BUFF_DURATION : 57,
    EFFECT_TYPE_OPP_RESOLVE_DRIVE : 58,
    EFFECT_TYPE_ADD_DAMAGE_OBJECT : 59,
    EFFECT_TYPE_REDUCE_SHIELD_DAMAGE : 60,
    EFFECT_TYPE_SET_NAME : 61,

    DURATION_TYPE_TURN_START : 1,
    DURATION_TYPE_TURN_END : 0,
    
    ITEM_RARITY_COMMON : 0,
    ITEM_RARITY_UNCOMMON : 1,
    ITEM_RARITY_COMMON_UNCOMMON : 10,
    ITEM_RARITY_RARE : 2,
    ITEM_RARITY_PREMIUM : 3,
    ITEM_RARITY_UNIQUE : 4,
    ITEM_RARITY_EPIC : 5,
    
    STANDARD_STATUS : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
}
