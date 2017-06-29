(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.DotaFlashCardsApp = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var btoa = (typeof window !== "undefined" ? window['btoa'] : typeof global !== "undefined" ? global['btoa'] : null);
var atob = (typeof window !== "undefined" ? window['atob'] : typeof global !== "undefined" ? global['atob'] : null);

var BitArray = (function() {
    // converts binary string to a hexadecimal string
    // returns an object with key 'valid' to a boolean value, indicating
    // if the string is a valid binary string.
    // If 'valid' is true, the converted hex string can be obtained by
    // the 'result' key of the returned object
    function binaryToHex(s) {
        var i, k, part, accum, ret = '';
        for (i = s.length - 1; i >= 3; i -= 4) {
            // extract out in substrings of 4 and convert to hex
            part = s.substr(i + 1 - 4, 4);
            accum = 0;
            for (k = 0; k < 4; k += 1) {
                if (part[k] !== '0' && part[k] !== '1') {
                    // invalid character
                    return {
                        valid: false
                    };
                }
                // compute the length 4 substring
                accum = accum * 2 + parseInt(part[k], 10);
            }
            if (accum >= 10) {
                // 'A' to 'F'
                ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
            } else {
                // '0' to '9'
                ret = String(accum) + ret;
            }
        }
        // remaining characters, i = 0, 1, or 2
        if (i >= 0) {
            accum = 0;
            // convert from front
            for (k = 0; k <= i; k += 1) {
                if (s[k] !== '0' && s[k] !== '1') {
                    return {
                        valid: false
                    };
                }
                accum = accum * 2 + parseInt(s[k], 10);
            }
            // 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
            ret = String(accum) + ret;
        }
        return {
            valid: true,
            result: ret
        };
    }

    // converts hexadecimal string to a binary string
    // returns an object with key 'valid' to a boolean value, indicating
    // if the string is a valid hexadecimal string.
    // If 'valid' is true, the converted binary string can be obtained by
    // the 'result' key of the returned object
    function hexToBinary(s) {
        var i, k, part, ret = '';
        // lookup table for easier conversion. '0' characters are padded for '1' to '7'
        var lookupTable = {
            '0': '0000',
            '1': '0001',
            '2': '0010',
            '3': '0011',
            '4': '0100',
            '5': '0101',
            '6': '0110',
            '7': '0111',
            '8': '1000',
            '9': '1001',
            'a': '1010',
            'b': '1011',
            'c': '1100',
            'd': '1101',
            'e': '1110',
            'f': '1111',
            'A': '1010',
            'B': '1011',
            'C': '1100',
            'D': '1101',
            'E': '1110',
            'F': '1111'
        };
        for (i = 0; i < s.length; i += 1) {
            if (lookupTable.hasOwnProperty(s[i])) {
                ret += lookupTable[s[i]];
            } else {
                return {
                    valid: false
                };
            }
        }
        return {
            valid: true,
            result: ret
        };
    }

    function hexToBase64(str) {
        return btoa(String.fromCharCode.apply(null,
            str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
    }

    function base64ToHex(str) {
        for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
            var tmp = bin.charCodeAt(i).toString(16);
            if (tmp.length === 1) tmp = "0" + tmp;
            hex[hex.length] = tmp;
        }
        return hex.join("");
    }

    function BitArray(size) {
        this.size = size;
        this.data = [];
        for (var i = 0; i < size; i++) {
            this.data.push(false);
        }
    }

    BitArray.prototype.set = function(index) {
        this.data[index] = true;
    };

    BitArray.prototype.clear = function(index) {
        this.data[index] = false;
    };

    BitArray.prototype.value = function(index, value) {
        if (value === undefined) return this.data[index];
        this.data[index] = !!value;
    };

    BitArray.prototype.toBase64 = function() {
        var s = '';
        for (var i = 0; i < this.data.length; i++) {
            s = s + (this.data[i] ? '1' : '0');
        }
        return hexToBase64(binaryToHex(s).result);
    };

    BitArray.prototype.fromBase64 = function(value) {
        value = value || '';
        var h = base64ToHex(value);
        var b = hexToBinary(h).result;
        this.data = [];
        for (var i = 0; i < this.size; i++) {
            this.data[i] = b.charAt(i) === '1';
        }
    };
    
    BitArray.prototype.toBase64UrlSafe = function() {
        return this.urlEncode(this.toBase64());
    };
    
    BitArray.prototype.fromBase64UrlSafe = function(value) {
        return this.fromBase64(this.urlDecode(value));
    };
    
    BitArray.prototype.urlEncode = function(value) {
        value = value || '';
        return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };
    
    BitArray.prototype.urlDecode = function(value) {
        value = value || '';
        var incoming = value.replace(/-/g, '+').replace(/_/g, '/');
        
        switch (value.length % 4) {
            case 2: incoming += "=="; break;
            case 3: incoming += "="; break;
        }
        return incoming;
    };
    
    return BitArray;
})();

module.exports = BitArray;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
'use strict';
var ko = require('./herocalc_knockout');
var abilityData = require("./herocalc_abilitydata");
var TalentController = require("./hero/TalentController");

var AbilityModel = function (a, h) {
    var self = this;
    self.hero = h;
    self.abilityData = abilityData;
    self.hasScepter = ko.observable(false);
    self.isShapeShiftActive = ko.observable(false);
    self.abilities = a;
    self._abilities = self.abilities();
    for (var i = 0; i < self.abilities().length; i++) {
        self._abilities[i].level = ko.observable(0);
        self._abilities[i].isActive = ko.observable(false);
        self._abilities[i].isDetail = ko.observable(false);
        self._abilities[i].baseDamage = ko.observable(0);
        self._abilities[i].baseDamageReductionPct = ko.observable(0);
        self._abilities[i].baseDamageMultiplier = ko.observable(0);
        self._abilities[i].bash = ko.observable(0);
        self._abilities[i].bashBonusDamage = ko.observable(0);
        self._abilities[i].bonusDamage = ko.observable(0);
        self._abilities[i].bonusDamageOrb = ko.observable(0);
        self._abilities[i].bonusDamagePct = ko.observable(0);
        self._abilities[i].bonusDamagePrecisionAura = ko.observable(0);
        self._abilities[i].bonusDamageReduction = ko.observable(0);
        self._abilities[i].bonusHealth = ko.observable(0);
        self._abilities[i].bonusStrength = ko.observable(0);
        self._abilities[i].bonusStrength2 = ko.observable(0);
        self._abilities[i].bonusAgility = ko.observable(0);
        self._abilities[i].bonusAgility2 = ko.observable(0);
        self._abilities[i].bonusInt = ko.observable(0);
        self._abilities[i].bonusAllStatsReduction = ko.observable(0);
        self._abilities[i].damageAmplification = ko.observable(0);
        self._abilities[i].damageReduction = ko.observable(0);
        self._abilities[i].evasion = ko.observable(0);
        self._abilities[i].magicResist = ko.observable(0);
        self._abilities[i].manaregen = ko.observable(0);
        self._abilities[i].manaregenreduction = ko.observable(0);
        self._abilities[i].missChance = ko.observable(0);
        self._abilities[i].movementSpeedFlat = ko.observable(0);
        self._abilities[i].movementSpeedPct = ko.observable(0);
        self._abilities[i].movementSpeedPctReduction = ko.observable(0);
        self._abilities[i].turnRateReduction = ko.observable(0);
        self._abilities[i].attackrange = ko.observable(0);
        self._abilities[i].attackspeed = ko.observable(0);
        self._abilities[i].attackspeedreduction = ko.observable(0);
        self._abilities[i].armor = ko.observable(0);
        self._abilities[i].armorReduction = ko.observable(0);
        self._abilities[i].healthregen = ko.observable(0);
        self._abilities[i].lifesteal = ko.observable(0);
        self._abilities[i].visionnight = ko.observable(0);
        self._abilities[i].visionday = ko.observable(0);
    }
    self.abilityControlData = {};
    self.abilitySettingsData = function (data, parent, index) {
        if (self.abilityControlData[data] == undefined) {
            return self.processAbility(data, parent, index, self.abilityData[data]);
        }
        else {
            return self.abilityControlData[data];
        }
    }
    
    self.processAbility = function (data, parent, index, args) {
        var result = {};
        result.data = [];
        var v;
        var v_list = [];
        for (var i=0; i < args.length; i++) {
            switch (args[i].controlType) {
                case 'input':
                    v = ko.observable(0).extend({ numeric: 2 });
                    v.controlValueType = args[i].controlValueType;
                    v_list.push(v);
                    result.data.push({ labelName: args[i].label.toUpperCase() + ':', controlVal: v, controlType: args[i].controlType, display: args[i].display });
                break;
                case 'checkbox':
                    v = ko.observable(false);
                    v.controlValueType = args[i].controlValueType;
                    v_list.push(v);
                    result.data.push({ labelName: args[i].label.toUpperCase() + '?', controlVal: v, controlType: args[i].controlType, display: args[i].display });
                break;
                case 'radio':
                    v = ko.observable(args[i].controlOptions[0].value);
                    v.controlValueType = args[i].controlValueType;
                    v_list.push(v);
                    result.data.push({ labelName: args[i].label.toUpperCase() + '?', controlVal: v, controlType: args[i].controlType, display: args[i].display, controlOptions: args[i].controlOptions });
                break;
                case 'method':
                case 'text':
                    // single input abilities
                    if (args[i].controls == undefined) {
                        if (args[i].noLevel) {
                            var attributeValue = function (attributeName) {
                                return {fn: ko.computed(function () {
                                    var _ability = self.abilities().find(function(b) {
                                        return b.name == data;
                                    });
                                    return self.getAbilityAttributeValue(_ability.attributes, attributeName, 0);
                                })};
                            };
                        }
                        else {
                            var attributeValue = function (attributeName) {
                                return {fn: ko.computed(function () {
                                    var _ability = self.abilities().find(function(b) {
                                        return b.name == data;
                                    });
                                    return self.getAbilityAttributeValue(_ability.attributes, attributeName, _ability.level());
                                })};
                            };
                        }
                        var g = attributeValue(args[i].attributeName)
                        var r = self.getComputedFunction(v, g.fn, args[i].fn, parent, index, self, args[i].returnProperty, undefined, data);
                        if (args[i].ignoreTooltip) {
                            var tooltip = args[i].label || args[i].attributeName;
                        }
                        else {
                            var tooltip = self.getAbilityAttributeTooltip(self.abilities()[index].attributes, args[i].attributeName) || args[i].label || args[i].attributeName;
                        }
                        result.data.push({ labelName: tooltip.toUpperCase(), controlVal: r, controlType: args[i].controlType, display: args[i].display, clean: g.fn });
                    }
                    // multi input abilities
                    else {
                        if (args[i].noLevel) {
                            var attributeValue = function (attributeName) {
                                return {fn: ko.computed(function () {
                                    return self.getAbilityAttributeValue(self.abilities()[index].attributes, attributeName, 0);
                                })};
                            };
                        }
                        else {
                            var attributeValue = function (attributeName) {
                                return {fn: ko.computed(function () {
                                    return self.getAbilityAttributeValue(self.abilities()[index].attributes, attributeName, self.abilities()[index].level());
                                })};
                            };
                        }
                        var g = attributeValue(args[i].attributeName)
                        var r = self.getComputedFunction(v_list, g.fn, args[i].fn, parent, index, self, args[i].returnProperty, args[i].controls, data);
                        if (args[i].ignoreTooltip) {
                            var tooltip = args[i].label || args[i].attributeName;
                        }
                        else {
                            var tooltip = self.getAbilityAttributeTooltip(self.abilities()[index].attributes, args[i].attributeName) || args[i].label || args[i].attributeName;
                        }
                        result.data.push({ labelName: tooltip.toUpperCase(), controlVal: r, controlType: args[i].controlType, display: args[i].display, clean: g.fn });
                    }
                    
                    if (args[i].controlType == 'method') {
                        v_list.push(r);
                    }
                break;
            }
        }
        self.abilityControlData[data] = result;
        return result;
    }

    self.getComputedFunction = function (v, attributeValue, fn, parent, index, abilityModel, returnProperty, controls, abilityName) {
        var _ability = abilityModel.abilities().find(function(b) {
            return b.name == abilityName;
        });
        return ko.pureComputed(function () {                
            var inputValue;
            if (controls == undefined) {
                if (v == undefined) {
                    inputValue = v;
                }
                else if (typeof v() == 'boolean') {
                    inputValue = v();
                }
                else if (v.controlValueType == undefined) {
                    inputValue = parseFloat(v());
                }
                else if (v.controlValueType == 'string') {
                    inputValue = v();
                }
                else {
                    inputValue = parseFloat(v());
                }
            }
            else {
                var v_list = [];
                for (var i=0;i<controls.length;i++) {
                    switch (typeof v[controls[i]]()) {
                        case 'boolean':
                        case 'object':
                            v_list.push(v[controls[i]]());
                        break;
                        default:
                            v_list.push(parseFloat(v[controls[i]]()));
                        break;
                    }
                }
                inputValue = v_list;
            }
            
            var returnVal = fn.call(this, inputValue, attributeValue(), parent, index, abilityModel, _ability, TalentController);
            if (returnProperty != undefined) {
                _ability[returnProperty](returnVal);
            }
            return returnVal;
        }, this);
    }
    
    self.getAbilityLevelByAbilityName = function (abilityName) {
        for (var i = 0; i < self.abilities().length; i++) {
            if (self._abilities[i].name == abilityName) {
                return self._abilities[i].level();
            }
        }
        return -1;
    }

    self.getAbilityByName = function (abilityName) {
        for (var i = 0; i < self.abilities().length; i++) {
            if (self._abilities[i].name == abilityName) {
                return self._abilities[i];
            }
        }
        return undefined;
    }

    self.getAbilityPropertyValue = function (ability, property) {
        return parseFloat(ko.utils.unwrapObservable(ability[property])[ability.level()-1]);
    }
    
    self.getAttributeBonusLevel = function () {
        for (var i = 0; i < self.abilities().length; i++) {
            if (self._abilities[i].name == 'attribute_bonus') {
                return self._abilities[i].level();
            }
        }
        return 0;        
    }
    
    self.getAllStatsReduction = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {                    
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        /*switch(attribute.name) {
                            // invoker_quas
                            case 'bonus_strength':
                                totalAttribute += parseInt(attribute.value[ability.level()-1]);
                            break;
                        }*/
                    }
                }
                else if (ability.bonusAllStatsReduction != undefined) {
                    // slark_essence_shift
                    totalAttribute+=ability.bonusAllStatsReduction();
                }
            }
        }
        return totalAttribute;
    });
    
    self.getStrengthReduction = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {                    
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        /*switch(attribute.name) {
                            // invoker_quas
                            case 'bonus_strength':
                                totalAttribute += parseInt(attribute.value[ability.level()-1]);
                            break;
                        }*/
                    }
                }
                else if (ability.bonusStrength != undefined && ability.name == 'undying_decay') {
                    // undying_decay
                    totalAttribute-=ability.bonusStrength();
                }
            }
        }
        return totalAttribute;
    });
    
    self.getStrength = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0) {
                if (!(ability.name in self.abilityData)) {
                    if (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1)) {
                        for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                            var attribute = self._abilities[i].attributes[j];
                            switch(attribute.name) {
                                // sven_gods_strength
                                case 'gods_strength_bonus_str':
                                    totalAttribute += parseInt(attribute.value[ability.level()-1]);
                                break;
                            }
                        }
                    }
                }
                else {
                    if (ability.bonusStrength != undefined) {
                        if (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1)) {
                            // pudge_flesh_heap,morphling_morph_str,morphling_morph_agi,undying_decay
                            totalAttribute+=ability.bonusStrength();
                        }
                    }
                    if (ability.bonusStrength2 != undefined) {
                        if (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1)) {
                            // morphling_morph_str
                            totalAttribute+=ability.bonusStrength2();
                        }
                    }
                }
            }
        }
        return totalAttribute;
    });
    
    self.getAgility = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0) {
                if (!(ability.name in self.abilityData)) {
                    if (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1)) {
                        for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                            var attribute = self._abilities[i].attributes[j];
                            switch(attribute.name) {
                                // drow_ranger_marksmanship
                                case 'marksmanship_agility_bonus':
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                break;
                            }
                        }
                    }
                }
                else {
                    if (ability.bonusAgility != undefined) {
                        if (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1)) {
                            // morphling_morph_agi,morphling_morph_str
                            totalAttribute+=ability.bonusAgility();
                        }
                    }
                    if (ability.bonusAgility2 != undefined) {
                        if (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1)) {
                            // morphling_morph_agi,morphling_morph_str
                            totalAttribute+=ability.bonusAgility2();
                        }
                    }
                }
            }
        }
        return totalAttribute;
    });

    self.getIntelligence = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0) {
                if (!(ability.name in self.abilityData)) {
                    if (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1)) {
                        for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                            var attribute = self._abilities[i].attributes[j];
                            switch(attribute.name) {
                                // invoker_exort
                            /*    case 'bonus_intelligence':
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                break;*/
                            }
                        }
                    }
                }
                /*else if (ability.bonusInt != undefined) {
                    if (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1) || ability.name == 'invoker_exort') {
                        // invoker_exort
                        totalAttribute+=ability.bonusInt();
                    }
                }*/
            }
        }
        return totalAttribute;
    });
    
    self.getArmor = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // axe_berserkers_call,dragon_knight_dragon_blood,troll_warlord_berserkers_rage,lycan_shapeshift,enraged_wildkin_toughness_aura
                            case 'bonus_armor':
                                if (ability.name != 'templar_assassin_meld') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                            // sven_warcry
                            case 'warcry_armor':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                            // lich_frost_armor,ogre_magi_frost_armor
                            case 'armor_bonus':
                                if (ability.name == 'lich_frost_armor' || ability.name == 'ogre_magi_frost_armor') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                        }
                    }
                }
                else if (ability.armor != undefined) {
                    // shredder_reactive_armor,visage_gravekeepers_cloak
                    totalAttribute+=ability.armor();
                }
            }
        }
        return totalAttribute;
    });

    self.getArmorBaseReduction = ko.computed(function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                //if (!(ability.name in self.abilityData)) {
                    switch(ability.name) {
                        //elder_titan_natural_order
                        case 'elder_titan_natural_order':
                            totalAttribute *= (1-self.getAbilityAttributeValue(self._abilities[i].attributes, 'armor_reduction_pct', ability.level())/100);
                        break;
                    }
                //}
            }
        }
        return totalAttribute;
    });
    
    self.getArmorReduction = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    switch(ability.name) {
                        //templar_assassin_meld
                        case 'templar_assassin_meld':
                            totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, 'bonus_armor', ability.level());
                        break;
                        // tidehunter_gush
                        case 'tidehunter_gush':
                            totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, 'armor_bonus', ability.level());
                        break;
                        // naga_siren_rip_tide
                        case 'naga_siren_rip_tide':
                        // slardar_amplify_damage
                        case 'slardar_amplify_damage':
                        // vengefulspirit_wave_of_terror
                        case 'vengefulspirit_wave_of_terror':
                            totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, 'armor_reduction', ability.level());
                        break;
                        // nevermore_dark_lord
                        case 'nevermore_dark_lord':
                            totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, 'presence_armor_reduction', ability.level());
                        break;
                    }
                }
                else if (ability.armorReduction != undefined) {
                    // alchemist_acid_spray
                    totalAttribute+=ability.armorReduction();
                }
            }
        }
        return totalAttribute;
    });

    self.getHealth = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // lone_druid_true_form,lycan_shapeshift,troll_warlord_berserkers_rage
                            case 'bonus_hp':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                            // lone_druid_synergy
                            case 'true_form_hp_bonus':
                                if (self.isTrueFormActive()) {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                        }
                    }
                }
                else if (ability.bonusHealth != undefined) {
                    // clinkz_death_pact
                    totalAttribute+=ability.bonusHealth();
                }
            }
        }
        return totalAttribute;
    });
    
    self.isTrueFormActive = function () {
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.isActive() && ability.name == 'lone_druid_true_form') {
                return true;
            }
        }
        return false;
    }

    self.getHealthRegen = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // alchemist_chemical_rage, dragon_knight_dragon_blood
                            case 'bonus_health_regen':
                            // broodmother_spin_web
                            case 'heath_regen':
                            // omniknight_guardian_angel,treant_living_armor,satyr_hellcaller_unholy_aura
                            case 'health_regen':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                            // legion_commander_press_the_attack
                            case 'hp_regen':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                        }
                    }
                }
                else if (ability.healthregen != undefined) {
                    // shredder_reactive_armor,invoker_quas,necrolyte_sadist
                    totalAttribute+=ability.healthregen();
                }
            }
        }
        return totalAttribute;
    });

    self.getMana = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                //if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // obsidian_destroyer_essence_aura
                            case 'bonus_mana':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                        }
                    }
                //}
            }
        }
        return totalAttribute;
    });
    
    self.getManaRegen = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // alchemist_chemical_rage
                            case 'bonus_mana_regen':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                        }
                    }
                }
                else if (ability.manaregen != undefined) {
                    // necrolyte_sadist
                    totalAttribute+=ability.manaregen();
                }
            }
        }
        return totalAttribute;
    });
    
    self.getManaRegenArcaneAura = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                //if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // crystal_maiden_brilliance_aura
                            case 'mana_regen':
                                if (ability.name == 'crystal_maiden_brilliance_aura') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                        }
                    }
                //}
            }
        }
        return totalAttribute;
    });

    self.getManaRegenReduction = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                /*if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        //switch(attribute.name) {
                        //    // 
                        //    case '':
                        //        totalAttribute += parseInt(attribute.value[ability.level()-1]);
                        //    break;
                        //}
                    }
                }
                else*/ if (ability.manaregenreduction != undefined) {
                    // pugna_nether_ward
                    totalAttribute+=ability.manaregenreduction();
                }
            }
        }
        return totalAttribute;
    });
    
    self.getAttackRange = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0) {
                if (!(ability.name in self.abilityData)) {
                    if (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1)) {
                        for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                            var attribute = self._abilities[i].attributes[j];
                            switch(attribute.name) {
                                // winter_wyvern_arctic_burn
                                case 'attack_range_bonus':
                                // templar_assassin_psi_blades,sniper_take_aim
                                case 'bonus_attack_range':
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                break;
                                // terrorblade_metamorphosis,troll_warlord_berserkers_rage
                                case 'bonus_range':
                                    if (ability.name == 'terrorblade_metamorphosis') {
                                        totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                    }
                                    if (ability.name == 'troll_warlord_berserkers_rage') {
                                        totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                    }
                                break;
                                // tiny_grow
                                case 'bonus_range_scepter':
                                    if (ability.name == 'tiny_grow' && self.hasScepter()) {
                                        totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                    }
                                break;
                                // enchantress_impetus
                                case 'bonus_attack_range_scepter':
                                    if (ability.name == 'enchantress_impetus' && self.hasScepter()) {
                                        totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                    }
                                break;
                            }
                        }
                        // lone_druid_true_form
                        if (ability.name == 'lone_druid_true_form') {
                            totalAttribute -= 422;
                        }
                    }
                    else if (ability.name == 'enchantress_impetus' && self.hasScepter()) {
                        for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                            var attribute = self._abilities[i].attributes[j];
                            switch(attribute.name) {
                              case 'bonus_attack_range_scepter':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                              break;
                            }
                        }
                    }
                }
                else if (ability.attackrange != undefined) {
                    if (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1)) {
                        // dragon_knight_elder_dragon_form
                        totalAttribute+=ability.attackrange();
                    }
                }
            }
        }
        return totalAttribute;
    });
    
    self.getAttackSpeed = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // abaddon_frostmourne,troll_warlord_battle_trance
                            case 'attack_speed':
                            // visage_grave_chill
                            case 'attackspeed_bonus':
                            // mirana_leap
                            case 'leap_speedbonus_as':
                            // life_stealer
                            case 'attack_speed_bonus':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                            // clinkz_strafe,ursa_overpower
                            case 'attack_speed_bonus_pct':
                                if (ability.name == 'clinkz_strafe' || ability.name == 'ursa_overpower') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                            // axe_culling_blade,necronomicon_archer_aoe
                            case 'speed_bonus':
                                if (ability.name == 'axe_culling_blade' || ability.name == 'necronomicon_archer_aoe') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                            // ancient_apparition_chilling_touch
                            case 'attack_speed_pct':
                                if (ability.name == 'ancient_apparition_chilling_touch') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                            // beastmaster_inner_beast,lycan_feral_impulse,lone_druid_rabid,tiny_grow,phantom_assassin_phantom_strike,windrunner_focusfire,ogre_magi_bloodlust,centaur_khan_endurance_aura
                            case 'bonus_attack_speed':
                                if (ability.name == 'beastmaster_inner_beast' 
                                 || ability.name == 'lycan_feral_impulse' 
                                 || ability.name == 'lone_druid_rabid' 
                                 || ability.name == 'tiny_grow' 
                                 || ability.name == 'phantom_assassin_phantom_strike' 
                                 || ability.name == 'windrunner_focusfire' 
                                 || ability.name == 'ogre_magi_bloodlust'
                                 || ability.name == 'centaur_khan_endurance_aura') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                        }
                    }
                }
                else if (ability.attackspeed != undefined) {
                    // troll_warlord_fervor,wisp_overcharge,lina_fiery_soul,invoker_alacrity,invoker_wex,huskar_berserkers_blood
                    totalAttribute+=ability.attackspeed();
                }
            }
        }
        return totalAttribute;
    });

    self.getAttackSpeedReduction = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // night_stalker_void,crystal_maiden_crystal_nova,ghost_frost_attack,ogre_magi_frost_armor,polar_furbolg_ursa_warrior_thunder_clap
                            case 'attackspeed_slow':
                            // lich_frost_armor,lich_frost_nova,enchantress_untouchable
                            case 'slow_attack_speed':
                            // beastmaster_primal_roar
                            case 'slow_attack_speed_pct':
                            // storm_spirit_overload
                            case 'overload_attack_slow':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                            // omniknight_degen_aura
                            case 'speed_bonus':
                                if (ability.name == 'omniknight_degen_aura') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                            // tusk_frozen_sigil,crystal_maiden_freezing_field
                            case 'attack_slow':
                                if (ability.name == 'crystal_maiden_freezing_field' && !self.hasScepter()) {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                                else if (ability.name == 'tusk_frozen_sigil') {
                                    totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                            case 'attack_slow_scepter':
                                if (ability.name == 'crystal_maiden_freezing_field' && self.hasScepter()) {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                            // faceless_void_time_walk
                            case 'attack_speed_pct':
                                if (ability.name == 'faceless_void_time_walk') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                            // bounty_hunter_jinada
                            case 'bonus_attackspeed':
                                if (ability.name == 'bounty_hunter_jinada') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                            // brewmaster_thunder_clap
                            case 'attack_speed_slow':
                                if (ability.name == 'brewmaster_thunder_clap') {
                                    totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                            // medusa_stone_gaze
                            case 'slow':
                                if (ability.name == 'medusa_stone_gaze') {
                                    totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                            // visage_grave_chill
                            case 'attackspeed_bonus':
                                totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                            // abaddon_frostmourne
                            case 'attack_slow_tooltip':
                                if (ability.name == 'abaddon_frostmourne') {
                                    totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                        }
                    }
                    if (ability.name == 'enraged_wildkin_tornado') {
                        totalAttribute -= 15;
                    }
                }
                else if (ability.attackspeedreduction != undefined) {
                    // viper_viper_strike,viper_corrosive_skin,jakiro_liquid_fire,lich_chain_frost,sandking_epicenter,earth_spirit_rolling_boulder
                    totalAttribute+=ability.attackspeedreduction();
                }
            }
        }
        return totalAttribute;
    });
    self.getBash = ko.computed(function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // slardar_bash
                            case 'chance':
                            // sniper_headshot
                            case 'proc_chance':
                                totalAttribute *= (1 - self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                            break;
                        }
                    }
                }
                else if (ability.bash != undefined) {
                    // spirit_breaker_greater_bash,faceless_void_time_lock
                    totalAttribute *= (1 - ability.bash()/100);
                }
            }
        }
        return totalAttribute;
    });    
    self.getBaseDamage = ko.computed(function () {
        var totalAttribute = 0;
        var totalMultiplier = 1;
        var sources = {};
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // tiny_grow,terrorblade_metamorphosis
                            case 'bonus_damage':
                                if (ability.name == 'tiny_grow' || ability.name == 'terrorblade_metamorphosis') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                    sources[ability.name] = {
                                        'damage': self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level()),
                                        'damageType': 'physical',
                                        'displayname': ability.displayname
                                    }
                                }
                            break;
                        }
                    }
                }
                else {
                    if (ability.baseDamageMultiplier != undefined) {
                        // earthshaker_enchant_totem
                        totalMultiplier += ability.baseDamageMultiplier()/100;
                        /*totalAttribute += ability.baseDamage();
                        sources[ability.name] = {
                            'damage': ability.baseDamage(),
                            'damageType': 'physical',
                            'displayname': ability.displayname
                        }*/
                    }
                    if (ability.baseDamage != undefined) {
                        // clinkz_death_pact
                        totalAttribute += ability.baseDamage();
                        sources[ability.name] = {
                            'damage': ability.baseDamage(),
                            'damageType': 'physical',
                            'displayname': ability.displayname
                        }
                    }
                }
            }
        }
        return { sources: sources, total: totalAttribute, multiplier: totalMultiplier };
    });
    
    self.getSelfBaseDamageReductionPct = ko.computed(function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // medusa_split_shot
                            case 'damage_modifier':
                                totalAttribute *= (1 + self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                            break;
                            // windrunner_focusfire
                            case 'focusfire_damage_reduction':
                                if (!self.hasScepter()) {
                                    totalAttribute *= (1 + self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                                }
                            break;
                            case 'focusfire_damage_reduction_scepter':
                                if (self.hasScepter()) {
                                    totalAttribute *= (1 + self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                                }
                            break;
                        }
                    }
                }
            }
        }
        return totalAttribute;
    });
    
    self.getBaseDamageReductionPct = ko.computed(function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // vengefulspirit_command_aura
                            case 'bonus_damage_pct':
                                if (ability.name == 'vengefulspirit_command_aura') {
                                    totalAttribute *= (1 - self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                                }
                            break;
                        }
                    }
                }
                else if (ability.baseDamageReductionPct != undefined) {
                    // nevermore_requiem
                    totalAttribute *= (1 + ability.baseDamageReductionPct()/100);
                }
            }
        }
        return totalAttribute;
    });
    
    self.getBAT = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // troll_warlord_berserkers_rage,alchemist_chemical_rage,lone_druid_true_form,lycan_shapeshift
                            case 'base_attack_time':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                        }
                    }
                }
            }
        }
        return totalAttribute;
    });
    self.getBonusDamage = ko.computed(function () {
        var totalAttribute = 0;
        var sources = {};
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // broodmother_insatiable_hunger,luna_lunar_blessing,templar_assassin_refraction,templar_assassin_meld,troll_warlord_berserkers_rage,lone_druid_true_form_battle_cry
                            case 'bonus_damage':
                                if (ability.name == 'broodmother_insatiable_hunger' || ability.name == 'luna_lunar_blessing'
                                 || ability.name == 'templar_assassin_refraction' || ability.name == 'templar_assassin_meld'
                                 || ability.name == 'troll_warlord_berserkers_rage' || ability.name == 'lone_druid_true_form_battle_cry') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                    sources[ability.name] = {
                                        'damage': self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level()),
                                        'damageType': 'physical',
                                        'displayname': ability.displayname
                                    }
                                }
                            break;
                            // lycan_howl
                            case 'hero_bonus_damage':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                sources[ability.name] = {
                                    'damage': self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level()),
                                    'damageType': 'physical',
                                    'displayname': ability.displayname
                                }
                            break;
                        }
                    }
                    if (ability.name == 'storm_spirit_overload') {
                        totalAttribute += self.getAbilityPropertyValue(ability, 'damage');
                        sources[ability.name] = {
                            'damage': self.getAbilityPropertyValue(ability, 'damage'),
                            'damageType': 'magic',
                            'displayname': ability.displayname
                        }                        
                    }
                }
                else if (ability.bonusDamage != undefined && ability.bonusDamage() != 0) {
                    // nevermore_necromastery,ursa_fury_swipes,ursa_enrage,invoker_alacrity,invoker_exort,elder_titan_ancestral_spirit,spectre_desolate,razor_static_link
                    totalAttribute+=ability.bonusDamage();
                    sources[ability.name] = {
                        'damage': ability.bonusDamage(),
                        'damageType': ability.name == 'spectre_desolate' ? 'pure' : 'physical',
                        'displayname': ability.displayname
                    }
                }
            }
        }
        return { sources: sources, total: totalAttribute };
    });

    self.getBonusDamagePercent = ko.computed(function () {
        var totalAttribute = 0;
        var sources = {};
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // bloodseeker_bloodrage
                            case 'damage_increase_pct':
                                if (ability.name == 'bloodseeker_bloodrage') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                    sources[ability.name] = {
                                        'damage': self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100,
                                        'damageType': 'physical',
                                        'displayname': ability.displayname
                                    }
                                }
                            break;
                            // magnataur_empower,vengefulspirit_command_aura,alpha_wolf_command_aura
                            case 'bonus_damage_pct':
                                if (ability.name == 'magnataur_empower' || ability.name == 'vengefulspirit_command_aura' || ability.name == 'alpha_wolf_command_aura') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                    sources[ability.name] = {
                                        'damage': self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100,
                                        'damageType': 'physical',
                                        'displayname': ability.displayname
                                    }
                                }
                            break;
                            // sven_gods_strength
                            case 'gods_strength_damage':
                                if (ability.name == 'sven_gods_strength' && self.hero != undefined && self.hero.heroId() == 'sven') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                    sources[ability.name] = {
                                        'damage': self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100,
                                        'damageType': 'physical',
                                        'displayname': ability.displayname
                                    }
                                }
                            break;
                            case 'gods_strength_damage_scepter':
                                if (ability.name == 'sven_gods_strength' && self.hero == undefined) {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                    sources[ability.name] = {
                                        'damage': self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100,
                                        'damageType': 'physical',
                                        'displayname': ability.displayname
                                    }
                                }
                            break;
                        }
                    }
                }
                /*else if (ability.bonusDamagePct != undefined && ability.bonusDamagePct() != 0) {
                    // bloodseeker_bloodrage
                    // totalAttribute+=ability.bonusDamagePct()/100;
                    // sources[ability.name] = {
                        // 'damage': ability.bonusDamagePct()/100,
                        // 'damageType': 'physical',
                        // 'displayname': ability.displayname
                    // }
                }*/
            }
        }
        return { sources: sources, total: totalAttribute };
    });

    self.getBonusDamageBackstab = ko.computed(function () {
        var totalAttribute1 = 0;
        var totalAttribute2 = 0;
        var sources = [];
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.name == 'riki_backstab') {
                if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // riki_backstab
                            case 'damage_multiplier':
                                totalAttribute1 += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                sources.push({
                                    'damage': self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level()),
                                    'damageType': 'physical',
                                    'displayname': ability.displayname
                                });
                            break;
                        }
                    }/*
                    if (ability.bonusDamageBackstab != undefined) {
                        // damage_multiplier
                        totalAttribute2+=ability.bonusDamageBackstab();
                        sources.push({
                            'damage': ability.bonusDamageBackstab(),
                            'damageType': 'physical',
                            'displayname': ability.displayname
                        });
                    }
                    */
                }
            }
        }
        return { sources: sources, total: [totalAttribute1,totalAttribute2] };
    });
    
    self.getBonusDamagePrecisionAura = ko.computed(function () {
        var totalAttribute1 = 0;
        var totalAttribute2 = 0;
        var sources = [];
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.name == 'drow_ranger_trueshot') {
                if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // drow_ranger_trueshot
                            case 'trueshot_ranged_damage':
                                totalAttribute1 += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                sources.push({
                                    'damage': self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100,
                                    'damageType': 'physical',
                                    'displayname': ability.displayname
                                });
                            break;
                        }
                    }
                    if (ability.bonusDamagePrecisionAura != undefined) {
                        // drow_ranger_trueshot
                        totalAttribute2+=ability.bonusDamagePrecisionAura();
                        sources.push({
                            'damage': ability.bonusDamagePrecisionAura(),
                            'damageType': 'physical',
                            'displayname': ability.displayname
                        });
                    }
                }
            }
        }
        return { sources: sources, total: [totalAttribute1,totalAttribute2] };
    });
    
    self.getBonusDamageReduction = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // bane_enfeeble
                            case 'enfeeble_attack_reduction':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                        }
                    }
                }
                else if (ability.bonusDamageReduction != undefined) {
                    // rubick_fade_bolt,razor_static_link
                    totalAttribute+=ability.bonusDamageReduction();
                }
            }
        }
        return totalAttribute;
    });
    
    self.getBonusDamageReductionPct = ko.computed(function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // medusa_split_shot
                            case 'damage_modifier':
                                totalAttribute *= (1 + self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                            break;
                            // windrunner_focusfire
                            case 'focusfire_damage_reduction':
                                if (!self.hasScepter()) {
                                    totalAttribute *= (1 + self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                                }
                            break;
                            case 'focusfire_damage_reduction_scepter':
                                if (self.hasScepter()) {
                                    totalAttribute *= (1 + self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                                }
                            break;
                        }
                    }
                }
            }
        }
        return totalAttribute;
    });

    self.getDamageAmplification = ko.computed(function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                /*if (!(ability.name in self.abilityData)) {
                    if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                        for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                            var attribute = self._abilities[i].attributes[j];
                            switch(attribute.name) {
                                // bane_enfeeble
                                case 'enfeeble_attack_reduction':
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                break;
                            }
                        }
                    }
                }
                else*/ if (ability.damageAmplification != undefined) {
                        // undying_flesh_golem
                        totalAttribute *= (1 + ability.damageAmplification()/100);
                }
            }
        }
        return totalAttribute;
    });
    
    self.getDamageReduction = ko.computed(function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // bloodseeker_bloodrage
                            case 'damage_increase_pct':
                                if (ability.name == 'bloodseeker_bloodrage') {
                                    totalAttribute *= (1 + self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                                }
                            break;
                        }
                    }
                    // kunkka_ghostship
                    if (ability.name == 'kunkka_ghostship') {
                        totalAttribute *= (1 - 50/100);
                    }
                }
                else if (ability.damageReduction != undefined) {
                    // wisp_overcharge,bristleback_bristleback,spectre_dispersion,medusa_mana_shield,ursa_enrage,visage_gravekeepers_cloak
                    totalAttribute *= (1 + ability.damageReduction()/100);
                }
            }
        }
        return totalAttribute;
    });

    self.getCritSource = ko.computed(function () {
        var sources = {};
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    switch(ability.name) {
                        // phantom_assassin_coup_de_grace,brewmaster_drunken_brawler,chaos_knight_chaos_strike,lycan_shapeshift,skeleton_king_mortal_strike,juggernaut_blade_dance,alpha_wolf_critical_strike,giant_wolf_critical_strike
                        case 'phantom_assassin_coup_de_grace':
                            if (sources[ability.name] == undefined) {
                                sources[ability.name] = {
                                    'chance': self.getAbilityAttributeValue(self._abilities[i].attributes, 'crit_chance', ability.level())/100,
                                    'multiplier': self.getAbilityAttributeValue(self._abilities[i].attributes, 'crit_bonus', ability.level())/100,
                                    'count': 1,
                                    'displayname': ability.displayname
                                }
                            }
                            else {
                                sources[ability.name].count += 1;
                            }
                        break;
                        case 'brewmaster_drunken_brawler':
                            if (sources[ability.name] == undefined) {
                                sources[ability.name] = {
                                    'chance': self.getAbilityAttributeValue(self._abilities[i].attributes, 'crit_chance', ability.level())/100,
                                    'multiplier': self.getAbilityAttributeValue(self._abilities[i].attributes, 'crit_multiplier', ability.level())/100,
                                    'count': 1,
                                    'displayname': ability.displayname
                                }
                            }
                            else {
                                sources[ability.name].count += 1;
                            }
                        break;
                        case 'chaos_knight_chaos_strike':
                        case 'lycan_shapeshift':
                            if (sources[ability.name] == undefined) {
                                sources[ability.name] = {
                                    'chance': self.getAbilityAttributeValue(self._abilities[i].attributes, 'crit_chance', ability.level())/100,
                                    'multiplier': self.getAbilityAttributeValue(self._abilities[i].attributes, 'crit_multiplier', ability.level())/100,
                                    'count': 1,
                                    'displayname': ability.displayname
                                }
                            }
                            else {
                                sources[ability.name].count += 1;
                            }
                        break;
                        case 'skeleton_king_mortal_strike':
                            if (sources[ability.name] == undefined) {
                                sources[ability.name] = {
                                    'chance': self.getAbilityAttributeValue(self._abilities[i].attributes, 'crit_chance', ability.level())/100,
                                    'multiplier': self.getAbilityAttributeValue(self._abilities[i].attributes, 'crit_mult', ability.level())/100,
                                    'count': 1,
                                    'displayname': ability.displayname
                                }
                            }
                            else {
                                sources[ability.name].count += 1;
                            }
                        break;
                        case 'juggernaut_blade_dance':
                            if (sources[ability.name] == undefined) {
                                sources[ability.name] = {
                                    'chance': self.getAbilityAttributeValue(self._abilities[i].attributes, 'blade_dance_crit_chance', ability.level())/100,
                                    'multiplier': self.getAbilityAttributeValue(self._abilities[i].attributes, 'blade_dance_crit_mult', ability.level())/100,
                                    'count': 1,
                                    'displayname': ability.displayname
                                }
                            }
                            else {
                                sources[ability.name].count += 1;
                            }
                        break;
                        case 'alpha_wolf_critical_strike':
                        case 'giant_wolf_critical_strike':
                            if (sources[ability.name] == undefined) {
                                sources[ability.name] = {
                                    'chance': self.getAbilityAttributeValue(self._abilities[i].attributes, 'crit_chance', ability.level())/100,
                                    'multiplier': self.getAbilityAttributeValue(self._abilities[i].attributes, 'crit_mult', ability.level())/100,
                                    'count': 1,
                                    'displayname': ability.displayname
                                }
                            }
                            else {
                                sources[ability.name].count += 1;
                            }
                        break;
                    }
                }
            }
        }
        return sources;
    });    

    self.getCleaveSource = ko.computed(function () {
        var sources = {};
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    switch(ability.name) {
                        // magnataur_empower
                        case 'magnataur_empower':
                            if (sources[ability.name] == undefined) {
                                sources[ability.name] = {
                                    'radius': self.getAbilityAttributeValue(self._abilities[i].attributes, 'cleave_radius', ability.level()),
                                    'magnitude': self.getAbilityAttributeValue(self._abilities[i].attributes, 'cleave_damage_pct', ability.level())/100,
                                    'count': 1,
                                    'displayname': ability.displayname
                                }
                            }
                            else {
                                sources[ability.name].count += 1;
                            }
                        break;
                        // sven_great_cleave
                        case 'sven_great_cleave':
                            if (sources[ability.name] == undefined) {
                                sources[ability.name] = {
                                    'radius': self.getAbilityAttributeValue(self._abilities[i].attributes, 'great_cleave_radius', ability.level()),
                                    'magnitude': self.getAbilityAttributeValue(self._abilities[i].attributes, 'great_cleave_damage', ability.level())/100,
                                    'count': 1,
                                    'displayname': ability.displayname
                                }
                            }
                            else {
                                sources[ability.name].count += 1;
                            }
                        break;
                        // kunkka_tidebringer
                        case 'kunkka_tidebringer':
                            if (sources[ability.name] == undefined) {
                                sources[ability.name] = {
                                    'radius': self.getAbilityAttributeValue(self._abilities[i].attributes, 'radius', ability.level()),
                                    'magnitude': 1,
                                    'count': 1,
                                    'displayname': ability.displayname
                                }
                            }
                            else {
                                sources[ability.name].count += 1;
                            }
                        break;
                        // tiny_grow
                        case 'tiny_grow':
                            if (self.hasScepter()) {
                                if (sources[ability.name] == undefined) {
                                    sources[ability.name] = {
                                        'radius': self.getAbilityAttributeValue(self._abilities[i].attributes, 'bonus_cleave_radius_scepter', ability.level()),
                                        'magnitude': self.getAbilityAttributeValue(self._abilities[i].attributes, 'bonus_cleave_damage_scepter', ability.level())/100,
                                        'count': 1,
                                        'displayname': ability.displayname
                                    }
                                }
                                else {
                                    sources[ability.name].count += 1;
                                }
                            }
                        break;
                    }
                }
            }
        }
        return sources;
    });    
    
    self.getCritChance = ko.computed(function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // phantom_assassin_coup_de_grace,brewmaster_drunken_brawler,chaos_knight_chaos_strike,lycan_shapeshift,skeleton_king_mortal_strike
                            case 'crit_chance':
                                totalAttribute *= (1 - self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                            break;
                        }
                    }
                }
            }
        }
        return totalAttribute;
    });            
    
    self.getEvasion = ko.computed(function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // phantom_assassin_blur
                            case 'bonus_evasion':
                            // brewmaster_drunken_brawler
                            case 'dodge_chance':
                                totalAttribute *= (1 - self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                            break;
                        }
                    }
                }
            }
        }
        return totalAttribute;
    });
    
    self.getEvasionBacktrack = ko.computed(function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // faceless_void_backtrack
                            case 'dodge_chance_pct':
                                totalAttribute *= (1 - self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                            break;
                        }
                    }
                }
            }
        }
        return totalAttribute;
    });
    
    self.getMissChance = ko.computed(function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // broodmother_incapacitating_bite,brewmaster_drunken_haze
                            case 'miss_chance':
                            // riki_smoke_screen,keeper_of_the_light_blinding_light,tinker_laser
                            case 'miss_rate':
                                totalAttribute *= (1 - self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                            break;
                        }
                    }
                }
                else if (ability.missChance != undefined) {
                    // night_stalker_crippling_fear
                    totalAttribute*=(1-ability.missChance()/100);
                }
            }
        }
        return totalAttribute;
    });
    
    self.getLifesteal = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // skeleton_king_vampiric_aura
                            case 'vampiric_aura':
                            // broodmother_insatiable_hunger
                            case 'lifesteal_pct':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                        }
                    }
                }
                else if (ability.lifesteal != undefined) {
                    // life_stealer_open_wounds
                    totalAttribute+=ability.lifesteal();
                }
            }
        }
        return totalAttribute;
    });

    self.getSpellAmp = ko.computed(function () {
        var totalAttribute = 0;
        /*for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // keeper_of_the_light_chakra_magic
                            case 'cooldown_reduction':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                        }
                    }
                }
            }
        }*/
        return totalAttribute;
    });
    
    self.getCooldownReductionFlat = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // keeper_of_the_light_chakra_magic
                            case 'cooldown_reduction':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                        }
                    }
                }
            }
        }
        return totalAttribute;
    });

    self.getCooldownReductionPercent = ko.computed(function () {
        var totalAttribute = 1;
        return totalAttribute;
    });

    self.getCooldownIncreaseFlat = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // faceless_void_time_dilation
                            case 'duration':
                                if (ability.name == 'faceless_void_time_dilation') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                        }
                    }
                }
            }
        }
        return totalAttribute;
    });

    self.getCooldownIncreasePercent = ko.computed(function () {
        var totalAttribute = 1;
        return totalAttribute;
    });
    
    self.getMagicResist = ko.computed(function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // antimage_spell_shield
                            case 'spell_shield_resistance':
                                totalAttribute *= (1 - self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                            break;
                            // phantom_lancer_phantom_edge
                            case 'magic_resistance_pct':
                                if (ability.name == 'phantom_lancer_phantom_edge') {
                                    totalAttribute *= (1 - self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                                }
                            break;
                            // rubick_null_field
                            case 'magic_damage_reduction_pct':
                                if (ability.name == 'rubick_null_field') {
                                    totalAttribute *= (1 - self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                                }
                            break;
                        }
                    }
                }
                else if (ability.magicResist != undefined) {
                    // huskar_berserkers_blood,viper_corrosive_skin,visage_gravekeepers_cloak
                    totalAttribute *= (1 - ability.magicResist()/100);
                }
            }
        }
        return totalAttribute;
    });

    self.getMagicResistReduction = ko.computed(function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // ancient_apparition_ice_vortex
                            case 'spell_resist_pct':
                            // pugna_decrepify
                            case 'bonus_spell_damage_pct':
                            // skywrath_mage_ancient_seal
                            case 'resist_debuff':
                                totalAttribute *= (1 - self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                            break;
                            // elder_titan_natural_order
                            case 'magic_resistance_pct':
                                totalAttribute *= (1 - self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100);
                            break;
                        }
                    }
                }
            }
        }
        return totalAttribute;
    });
    
    self.getMovementSpeedFlat = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // alchemist_chemical_rage
                            case 'bonus_movespeed':
                                if (ability.name == 'alchemist_chemical_rage') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                            // tiny_grow
                            case 'bonus_movement_speed':
                                if (ability.name == 'tiny_grow') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }
                            break;
                            // troll_warlord_berserkers_rage
                            case 'bonus_move_speed':
                                if (ability.name == 'troll_warlord_berserkers_rage') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                                }                                
                            break;
                            // lone_druid_true_form
                            case 'speed_loss':
                                totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                        }
                    }
                }
                else if (ability.movementSpeedFlat != undefined) {
                // dragon_knight_elder_dragon_form
                    totalAttribute+=ability.movementSpeedFlat();
                }
            }
        }
        return totalAttribute;
    });
    
    self.getMovementSpeedPercent = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // abaddon_frostmourne 
                            case 'move_speed_pct':
                            // bounty_hunter_track 
                            case 'bonus_move_speed_pct':
                            // mirana_leap 
                            case 'leap_speedbonus':
                            // sven_warcry 
                            case 'warcry_movespeed':
                            // clinkz_wind_walk
                            case 'move_speed_bonus_pct':
                            // windrunner_windrun
                            case 'movespeed_bonus_pct':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                            break;
                            // broodmother_spin_web,spectre_spectral_dagger
                            case 'bonus_movespeed':
                                if (ability.name == 'broodmother_spin_web' || ability.name == 'spectre_spectral_dagger') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // axe_culling_blade,necronomicon_archer_aoe
                            case 'speed_bonus':
                                if (ability.name == 'axe_culling_blade' || ability.name == 'necronomicon_archer_aoe') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // nyx_assassin_vendetta 
                            case 'movement_speed':
                                if (ability.name == 'nyx_assassin_vendetta') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // spirit_breaker_empowering_haste
                            case 'bonus_movespeed_pct':
                                if (ability.name == 'spirit_breaker_empowering_haste') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // ogre_magi_bloodlust,death_prophet_witchcraft,kobold_taskmaster_speed_aura
                            case 'bonus_movement_speed':
                                if (ability.name == 'ogre_magi_bloodlust' || ability.name == 'death_prophet_witchcraft' || ability.name == 'kobold_taskmaster_speed_aura') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // razor_unstable_current,phantom_lancer_doppelwalk
                            case 'movement_speed_pct':
                                if (ability.name == 'razor_unstable_current' || ability.name == 'phantom_lancer_doppelwalk') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // treant_natures_guise,lone_druid_rabid
                            case 'bonus_move_speed':
                                if (ability.name == 'treant_natures_guise' || ability.name == 'lone_druid_rabid') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // wisp_tether
                            case 'movespeed':
                                if (ability.name == 'wisp_tether') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // kunkka_ghostship,visage_grave_chill
                            case 'movespeed_bonus':
                                if (ability.name == 'kunkka_ghostship' || ability.name == 'visage_grave_chill') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }                                
                            break;
                        }
                    }
                }
                else if (ability.movementSpeedPct != undefined) {
                // axe_battle_hunger,bristleback_warpath,spirit_breaker_greater_bash,lina_fiery_soul,invoker_ghost_walk,invoker_wex,elder_titan_ancestral_spirit
                    totalAttribute+=ability.movementSpeedPct()/100;
                }
            }
        }
        return totalAttribute;
    });

    self.getMovementSpeedPercentReduction = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // crystal_maiden_freezing_field
                            case 'movespeed_slow':
                                if (ability.name == 'crystal_maiden_freezing_field' && !self.hasScepter()) {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            case 'movespeed_slow_scepter':
                                if (ability.name == 'crystal_maiden_freezing_field' && self.hasScepter()) {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // elder_titan_earth_splitter,magnataur_skewer,abaddon_frostmourne 
                            case 'slow_pct':
                                totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                            break;
                            // night_stalker_void,crystal_maiden_crystal_nova,ghost_frost_attack,ogre_magi_frost_armor,polar_furbolg_ursa_warrior_thunder_clap
                            case 'movespeed_slow':
                                if (ability.name != 'crystal_maiden_freezing_field') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // lich_frost_armor,lich_frost_nova,enchantress_enchant
                            case 'slow_movement_speed':
                            // beastmaster_primal_roar
                            case 'slow_movement_speed_pct':
                            // drow_ranger_frost_arrows
                            case 'frost_arrows_movement_speed':
                            // skeleton_king_hellfire_blast
                            case 'blast_slow':
                            // slardar_slithereen_crush
                            case 'crush_extra_slow':
                            // storm_spirit_overload:
                            case 'overload_move_slow':
                            // windrunner_windrun
                            case 'enemy_movespeed_bonus_pct':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                            break;
                            // phantom_assassin_stifling_dagger,tusk_frozen_sigil
                            case 'move_slow':
                                if (ability.name == 'phantom_assassin_stifling_dagger') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                                else if (ability.name == 'tusk_frozen_sigil') {
                                    totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // invoker_ice_wall,medusa_stone_gaze,wisp_tether
                            case 'slow':
                                if (ability.name == 'medusa_stone_gaze') {
                                    totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                                else {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // broodmother_incapacitating_bite,bounty_hunter_jinada,spectre_spectral_dagger,winter_wyvern_arctic_burn
                            case 'bonus_movespeed':
                                if (ability.name == 'broodmother_incapacitating_bite' || ability.name == 'bounty_hunter_jinada' || ability.name == 'winter_wyvern_arctic_burn' || ability.name == 'winter_wyvern_splinter_blast') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                                else if (ability.name == 'spectre_spectral_dagger') {
                                    totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // omniknight_degen_aura
                            case 'speed_bonus':
                                if (ability.name == 'omniknight_degen_aura') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // tidehunter_gush
                            case 'movement_speed':
                                if (ability.name == 'tidehunter_gush') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // pugna_decrepify,chen_penitence
                            case 'bonus_movement_speed':
                                if (ability.name == 'pugna_decrepify' || ability.name == 'chen_penitence') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // ancient_apparition_ice_vortex,phantom_lancer_spirit_lance,skywrath_mage_concussive_shot,faceless_void_time_walk
                            case 'movement_speed_pct':
                                if (ability.name == 'ancient_apparition_ice_vortex' || ability.name == 'phantom_lancer_spirit_lance' || ability.name == 'faceless_void_time_walk') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                                else if (ability.name == 'skywrath_mage_concussive_shot') {
                                    totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // razor_unstable_current
                            case 'slow_amount':
                                if (ability.name == 'razor_unstable_current') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // brewmaster_drunken_haze,brewmaster_thunder_clap,treant_leech_seed
                            case 'movement_slow':
                                if (ability.name == 'brewmaster_drunken_haze' || ability.name == 'brewmaster_thunder_clap') {
                                    totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                                else if (ability.name == 'ursa_earthshock' || ability.name == 'treant_leech_seed') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // skeleton_king_reincarnation
                            case 'movespeed':
                                if (ability.name == 'skeleton_king_reincarnation') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                            // kunkka_torrent,visage_grave_chill
                            case 'movespeed_bonus':
                                if (ability.name == 'kunkka_torrent') {
                                    totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                                else if (ability.name == 'visage_grave_chill') {
                                    totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                        }
                    }
                    if (ability.name == 'satyr_trickster_purge') {
                        totalAttribute -= 80/100;
                    }
                    else if (ability.name == 'enraged_wildkin_tornado') {
                        totalAttribute -= 15/100;
                    }
                }
                else if (ability.movementSpeedPctReduction != undefined) {
                    // axe_battle_hunger,batrider_sticky_napalm,shredder_chakram,meepo_geostrike,life_stealer_open_wounds,
                    // venomancer_poison_sting,viper_viper_strike,viper_corrosive_skin,viper_poison_attack,venomancer_venomous_gale,treant_leech_seed
                    // lich_chain_frost,sniper_shrapnel,centaur_stampede,huskar_life_break,jakiro_dual_breath,meepo_geostrike,sandking_epicenter
                    // earth_spirit_rolling_boulder,invoker_ghost_walk,invoker_ice_wall,elder_titan_earth_splitter
                    // undying_flesh_golem,templar_assassin_psionic_trap,nevermore_requiem,queenofpain_shadow_strike
                    totalAttribute+=ability.movementSpeedPctReduction()/100;
                }
            }
        }
        return totalAttribute;
    });

    self.getTurnRateReduction = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // medusa_stone_gaze
                            case 'slow':
                                if (ability.name == 'medusa_stone_gaze') {
                                    totalAttribute -= self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                                }
                            break;
                        }
                    }
                }
                else if (ability.turnRateReduction != undefined) {
                    // batrider_sticky_napalm
                    totalAttribute+=ability.turnRateReduction()/100;
                }
            }
        }
        return totalAttribute;
    });
    
    self.getVisionRangeNight = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // winter_wyvern_arctic_burn
                            case 'night_vision_bonus':
                            // lycan_shapeshift,luna_lunar_blessing
                            case 'bonus_night_vision':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level());
                            break;
                        }
                    }
                }
                else if (ability.visionnight != undefined) {
                    // 
                    totalAttribute+=ability.visionnight();
                }
            }
        }
        return totalAttribute;
    });

    self.getVisionRangePctReduction = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // night_stalker_darkness
                            case 'blind_percentage':
                                totalAttribute += self.getAbilityAttributeValue(self._abilities[i].attributes, attribute.name, ability.level())/100;
                            break;
                        }
                    }
                }
            }
        }
        return totalAttribute;
    });

    self.setEvasion = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (ability.name == 'windrunner_windrun') {
                    return 1;
                }
            }
        }
        return totalAttribute;
    });
    
    self.setMovementSpeed = ko.computed(function () {
        var MAX_MOVESPEED = 522;
        var MIN_MOVESPEED = 100;
        var totalAttribute = 0;
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (ability.name == 'spirit_breaker_charge_of_darkness') {
                    return self.getAbilityAttributeValue(ability.attributes, 'movement_speed', ability.level());
                }
                if (ability.name == 'dark_seer_surge') {
                    return MAX_MOVESPEED;
                }
                if (ability.name == 'centaur_stampede') {
                    return MAX_MOVESPEED;
                }
                if (ability.name == 'lycan_shapeshift') {
                    return MAX_MOVESPEED;
                }
                if (ability.name == 'lion_voodoo' || ability.name == 'shadow_shaman_voodoo') {
                    return MIN_MOVESPEED;
                }
            }
        }
        return totalAttribute;
    });

    self.getBashSource = function (attacktype) {
        var sources = {};
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // sniper_headshot
                            case 'proc_chance':
                                if (sources[ability.name] == undefined && ability.name == 'sniper_headshot') {
                                    sources[ability.name] = {
                                        'chance': self.getAbilityAttributeValue(ability.attributes, attribute.name, ability.level())/100,
                                        'damage': self.getAbilityPropertyValue(ability, 'damage'),
                                        'count': 1,
                                        'damageType': 'physical',
                                        'displayname': ability.displayname
                                    }
                                }
                            break;
                            // slardar_bash
                            case 'chance':
                                if (sources[ability.name] == undefined && ability.name == 'slardar_bash') {
                                    sources[ability.name] = {
                                        'chance': self.getAbilityAttributeValue(ability.attributes, attribute.name, ability.level())/100,
                                        'damage': self.getAbilityAttributeValue(ability.attributes, 'bonus_damage', ability.level()),
                                        'count': 1,
                                        'damageType': 'physical',
                                        'displayname': ability.displayname
                                    }
                                }
                            break;
                        }
                    }
                }
                else if (ability.bashBonusDamage != undefined) {
                    // faceless_void_time_lock
                    if (sources[ability.name] == undefined && ability.name == 'faceless_void_time_lock') {
                        sources[ability.name] = {
                            'chance': ability.bash()/100,
                            'damage': ability.bashBonusDamage(),
                            'count': 1,
                            'damageType': 'magic',
                            'displayname': ability.displayname
                        }
                    }
                    // spirit_breaker_greater_bash
                    if (sources[ability.name] == undefined && ability.name == 'spirit_breaker_greater_bash') {
                        sources[ability.name] = {
                            'chance': ability.bash()/100,
                            'damage': ability.bashBonusDamage()/100,
                            'count': 1,
                            'damageType': 'magic',
                            'displayname': ability.displayname
                        }
                    }
                }
            }
        }

        return sources;
    };
    
    self.getOrbSource = function () {
        var sources = {};
        for (var i = 0; i < self.abilities().length; i++) {
            var ability = self._abilities[i];
            if (ability.level() > 0 && (ability.isActive() || (ability.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') != -1))) {
                if (!(ability.name in self.abilityData)) {
                    for (var j = 0; j < self._abilities[i].attributes.length; j++) {
                        var attribute = self._abilities[i].attributes[j];
                        switch(attribute.name) {
                            // antimage_mana_break
                            case 'mana_per_hit':
                                if (sources[ability.name] == undefined && ability.name == 'antimage_mana_break') {
                                    sources[ability.name] = {
                                        'damage': self.getAbilityAttributeValue(ability.attributes, attribute.name, ability.level()) 
                                                * self.getAbilityAttributeValue(ability.attributes, 'damage_per_burn', ability.level()),
                                        'damageType': 'physical',
                                        'displayname': ability.displayname
                                    }
                                }
                            break;
                            // clinkz_searing_arrows
                            case 'damage_bonus':
                                if (sources[ability.name] == undefined && ability.name == 'clinkz_searing_arrows') {
                                    sources[ability.name] = {
                                        'damage': self.getAbilityAttributeValue(ability.attributes, attribute.name, ability.level()),
                                        'damageType': 'physical',
                                        'displayname': ability.displayname
                                    }
                                }
                            // silencer_glaives_of_wisdom
                            case 'intellect_damage_pct':
                                if (sources[ability.name] == undefined && ability.name == 'silencer_glaives_of_wisdom') {
                                    sources[ability.name] = {
                                        'damage': self.getAbilityAttributeValue(ability.attributes, attribute.name, ability.level())/100 * self.hero.totalInt(),
                                        'damageType': 'pure',
                                        'displayname': ability.displayname
                                    }
                                }
                            break;
                        }
                    }
                }
                else if (ability.bonusDamageOrb != undefined) {
                    // obsidian_destroyer_arcane_orb
                    if (sources[ability.name] == undefined && ability.name == 'obsidian_destroyer_arcane_orb') {
                        sources[ability.name] = {
                            'damage': ability.bonusDamageOrb(),
                            'damageType': 'pure',
                            'displayname': ability.displayname
                        }
                    }
                }
            }
        }
        
        return sources;
    };
    
    self.toggleAbility = function (index, data, event) {
        if (self.abilities()[index()].behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') < 0) {
            if (self.abilities()[index()].isActive()) {
                self.abilities()[index()].isActive(false);
            }
            else {
                self.abilities()[index()].isActive(true);
            }
            
            if (self.abilities()[index()].name == 'lycan_shapeshift') {
                self.isShapeShiftActive(self.abilities()[index()].isActive());
            }
        }
    }.bind(this);

    self.toggleAbilityDetail = function (index, data, event) {
        if (self.abilities()[index()].isDetail()) {
            self.abilities()[index()].isDetail(false);
        }
        else {
            self.abilities()[index()].isDetail(true);
        }
    }.bind(this);
    
    self.getAbility = function (abilityName) {
        return self.abilities().find(function(b) {
            return b.name == abilityName;
        });
    }
}

AbilityModel.prototype.levelUpAbility = function (index, data, event, hero) {
    var self = this;
    if (self.abilities()[index()].level() < hero.getAbilityLevelMax(data) && hero.availableSkillPoints() > 0 ) {
        switch(self.abilities()[index()].abilitytype) {
            case 'DOTA_ABILITY_TYPE_ULTIMATE':
                if (hero.heroId() == 'invoker') {
                    if (
                        (self.abilities()[index()].level() == 0) && (parseInt(hero.selectedHeroLevel()) >= 2) ||
                        (self.abilities()[index()].level() == 1) && (parseInt(hero.selectedHeroLevel()) >= 7) ||
                        (self.abilities()[index()].level() == 2) && (parseInt(hero.selectedHeroLevel()) >= 11) ||
                        (self.abilities()[index()].level() == 3) && (parseInt(hero.selectedHeroLevel()) >= 17)
                    ) {
                        self.abilities()[index()].level(self.abilities()[index()].level()+1);
                        hero.skillPointHistory.push(index());
                    }
                }
                else if (hero.heroId() == 'meepo') {
                    if (self.abilities()[index()].level() * 7 + 3 <= parseInt(hero.selectedHeroLevel())) {
                        self.abilities()[index()].level(self.abilities()[index()].level()+1);
                        hero.skillPointHistory.push(index());
                    }
                }
                else {
                    if ((self.abilities()[index()].level()+1) * 5 + 1 <= parseInt(hero.selectedHeroLevel())) {
                        self.abilities()[index()].level(self.abilities()[index()].level()+1);
                        hero.skillPointHistory.push(index());
                    }
                }
            break;
            default:
                if (self.abilities()[index()].level() * 2 + 1 <= parseInt(hero.selectedHeroLevel())) {
                    self.abilities()[index()].level(self.abilities()[index()].level()+1);
                    hero.skillPointHistory.push(index());
                }
            break;
        }
        switch (self.abilities()[index()].name) {
            case 'beastmaster_call_of_the_wild':
            case 'chen_test_of_faith':
            case 'morphling_morph_agi':
            case 'shadow_demon_shadow_poison':
                self.abilities()[index() + 1].level(self.abilities()[index()].level());
            break;
            case 'morphling_morph_str':
                self.abilities()[index() - 1].level(self.abilities()[index()].level());
            break;
            case 'keeper_of_the_light_spirit_form':
                self.abilities()[index() - 1].level(self.abilities()[index()].level());
                self.abilities()[index() - 2].level(self.abilities()[index()].level());
            break;
            case 'nevermore_shadowraze1':
                self.abilities()[index() + 1].level(self.abilities()[index()].level());
                self.abilities()[index() + 2].level(self.abilities()[index()].level());
            break;
            case 'nevermore_shadowraze2':
                self.abilities()[index() - 1].level(self.abilities()[index()].level());
                self.abilities()[index() + 1].level(self.abilities()[index()].level());
            break;
            case 'nevermore_shadowraze3':
                self.abilities()[index() - 1].level(self.abilities()[index()].level());
                self.abilities()[index() - 2].level(self.abilities()[index()].level());
            break;
            case 'ember_spirit_fire_remnant':
                self.abilities()[index() - 1].level(self.abilities()[index()].level());
            break;
            case 'lone_druid_true_form':
                self.abilities()[index() - 1].level(self.abilities()[index()].level());
            break;
            case 'monkey_king_tree_dance':
                self.abilities()[index() + 1].level(self.abilities()[index()].level());
            break;
        }
    }
};
AbilityModel.prototype.levelDownAbility = function (index, data, event, hero) {
    var i = ko.utils.unwrapObservable(index);
    var self = this;
    if (self.abilities()[i].level() > 0) {
        self.abilities()[i].level(self.abilities()[i].level() - 1);
        hero.skillPointHistory.splice(hero.skillPointHistory().lastIndexOf(i), 1);
        switch (self.abilities()[i].name) {
            case 'beastmaster_call_of_the_wild':
            case 'chen_test_of_faith':
            case 'morphling_morph_agi':
            case 'shadow_demon_shadow_poison':
                self.abilities()[i + 1].level(self.abilities()[i].level());
            break;
            case 'morphling_morph_str':
                self.abilities()[i - 1].level(self.abilities()[i].level());
            break;
            case 'keeper_of_the_light_spirit_form':
                self.abilities()[i - 1].level(self.abilities()[i].level());
                self.abilities()[i - 2].level(self.abilities()[i].level());
            break;
            case 'nevermore_shadowraze1':
                self.abilities()[i + 1].level(self.abilities()[i].level());
                self.abilities()[i + 2].level(self.abilities()[i].level());
            break;
            case 'nevermore_shadowraze2':
                self.abilities()[i - 1].level(self.abilities()[i].level());
                self.abilities()[i + 1].level(self.abilities()[i].level());
            break;
            case 'nevermore_shadowraze3':
                self.abilities()[i - 1].level(self.abilities()[i].level());
                self.abilities()[i - 2].level(self.abilities()[i].level());
            break;
            case 'ember_spirit_fire_remnant':
                self.abilities()[i - 1].level(self.abilities()[i].level());
            break;
            case 'lone_druid_true_form':
                self.abilities()[i - 1].level(self.abilities()[i].level());
            break;
            case 'monkey_king_tree_dance':
                self.abilities()[i + 1].level(self.abilities()[i].level());
            break;
        }
    }
};
AbilityModel.prototype.getAbilityAttributeValue = function (attributes, attributeName, level) {
    for (var i=0; i < attributes.length; i++) {
        if (attributes[i].name == attributeName) {
            if (level == 0) {
                return parseFloat(attributes[i].value[0]);
            }
            else if (level > attributes[i].value.length) {
                return parseFloat(attributes[i].value[0]);
            }
            else {
                return parseFloat(attributes[i].value[level-1]);
            }
        }
    }
}
AbilityModel.prototype.getAbilityAttributeTooltip = function (attributes, attributeName) {
    for (var i=0; i<attributes.length; i++) {
        if (attributes[i].name == attributeName) {
            if (attributes[i].hasOwnProperty('tooltip')) {
                var d = attributes[i].tooltip.replace(/\\n/g, '');
                return d;
            }
            else {
                return '';
            }
        }
    }
    return '';
}

module.exports = AbilityModel;
},{"./hero/TalentController":11,"./herocalc_abilitydata":16,"./herocalc_knockout":17}],3:[function(require,module,exports){
'use strict';
var ko = require('./herocalc_knockout');

var AbilityModel = require("./AbilityModel");
var InventoryViewModel = require("./inventory/InventoryViewModel");
var findWhere = require("./util/findWhere");
var buffOptionsArray = require("./buffs/buffOptionsArray");
var debuffOptionsArray = require("./buffs/debuffOptionsArray");

var BuffViewModel = function (itemData, a) {
    var self = this;
    AbilityModel.call(this, ko.observableArray([]));
    self.availableBuffs = ko.observableArray(buffOptionsArray.items);
    self.availableDebuffs = ko.observableArray(debuffOptionsArray.items);
    self.selectedBuff = ko.observable(self.availableBuffs()[0]);
    
    self.buffs = ko.observableArray([]);
    self.itemBuffs = new InventoryViewModel(itemData);
    
    self.addBuff = function (data, event) {
        if (findWhere(self.buffs(), { name: self.selectedBuff().buffName }) == undefined) {
            var a = JSON.parse(JSON.stringify(self.selectedBuff().abilityData));
            a.level = ko.observable(0);
            a.isActive = ko.observable(false);
            a.isDetail = ko.observable(false);
            a.baseDamage = ko.observable(0);
            a.bash = ko.observable(0);
            a.bashBonusDamage = ko.observable(0);
            a.bonusDamage = ko.observable(0);
            a.bonusDamageOrb = ko.observable(0);
            a.bonusDamagePct = ko.observable(0);
            a.bonusDamagePrecisionAura = ko.observable(0);
            a.bonusDamageReduction = ko.observable(0);
            a.bonusHealth = ko.observable(0);
            a.bonusStrength = ko.observable(0);
            a.bonusStrength2 = ko.observable(0);
            a.bonusAgility = ko.observable(0);
            a.bonusAgility2 = ko.observable(0);
            a.bonusInt = ko.observable(0);
            a.bonusAllStatsReduction = ko.observable(0);
            a.damageAmplification = ko.observable(0);
            a.damageReduction = ko.observable(0);
            a.evasion = ko.observable(0);
            a.magicResist = ko.observable(0);
            a.manaregen = ko.observable(0);
            a.manaregenreduction = ko.observable(0);
            a.missChance = ko.observable(0);
            a.movementSpeedFlat = ko.observable(0);
            a.movementSpeedPct = ko.observable(0);
            a.movementSpeedPctReduction = ko.observable(0);
            a.turnRateReduction = ko.observable(0);
            a.attackrange = ko.observable(0);
            a.attackspeed = ko.observable(0);
            a.attackspeedreduction = ko.observable(0);
            a.armor = ko.observable(0);
            a.armorReduction = ko.observable(0);
            a.healthregen = ko.observable(0);
            a.lifesteal = ko.observable(0);
            a.visionnight = ko.observable(0);
            a.visionday = ko.observable(0);
            switch (a.name) {
                case 'invoker_cold_snap':
                case 'invoker_ghost_walk':
                case 'invoker_tornado':
                case 'invoker_emp':
                case 'invoker_alacrity':
                case 'invoker_chaos_meteor':
                case 'invoker_sun_strike':
                case 'invoker_forge_spirit':
                case 'invoker_ice_wall':
                case 'invoker_deafening_blast':
                    a.level(1);
                break;
            }
            self.abilities.push(a);
            self.buffs.push({ name: self.selectedBuff().buffName, hero: self.selectedBuff().hero, data: a });
        }
    };
    
    self.removeBuff = function (data, event, abilityName) {
        if (findWhere(self.buffs(), { name: abilityName })  != undefined) {
                self.buffs.remove(findWhere(self.buffs(), { name: abilityName }));
                if (self.abilityControlData[abilityName] != undefined) {
                    for (var i = 0; i < self.abilityControlData[abilityName].data.length; i++) {
                        if (self.abilityControlData[abilityName].data[i].controlVal.dispose != undefined) {
                            self.abilityControlData[abilityName].data[i].controlVal.dispose();
                        }
                        if (self.abilityControlData[abilityName].data[i].clean != undefined) {
                            self.abilityControlData[abilityName].data[i].clean.dispose();
                        }
                    }
                    self.abilityControlData[abilityName] = undefined;
                }
                for (var i = 0; i < self.abilities().length; i++) {
                    if (self.abilities()[i].name == abilityName) {
                        self.abilities()[i].level(0);
                        self.abilities.remove(self.abilities()[i]);
                        break;
                    }
                }
        }
    };
    self.toggleBuff = function (index, data, event) {
        if (self.buffs()[index()].data.behavior.indexOf('DOTA_ABILITY_BEHAVIOR_PASSIVE') < 0) {
            if (self.buffs()[index()].data.isActive()) {
                self.buffs()[index()].data.isActive(false);
                self.abilities()[index()].isActive(false);
            }
            else {
                self.buffs()[index()].data.isActive(true);
                self.abilities()[index()].isActive(true);
            }
        }
    }.bind(this);

    self.toggleBuffDetail = function (index, data, event) {
        if (self.buffs()[index()].data.isDetail()) {
            self.buffs()[index()].data.isDetail(false);
        }
        else {
            self.buffs()[index()].data.isDetail(true);
        }
    }.bind(this);

    // Overrides the ability module function to remove available skill point check
    self.levelUpAbility = function (index, data, event, hero) {
        if (self.abilities()[index()].level() < hero.getAbilityLevelMax(data)) {
            switch(self.abilities()[index()].abilitytype) {
                case 'DOTA_ABILITY_TYPE_ULTIMATE':
                    self.abilities()[index()].level(self.abilities()[index()].level() + 1);
                break;
                default:
                    self.abilities()[index()].level(self.abilities()[index()].level() + 1);
                break;
            }
            switch (self.abilities()[index()].name) {
                case 'beastmaster_call_of_the_wild':
                case 'chen_test_of_faith':
                case 'morphling_morph_agi':
                case 'shadow_demon_shadow_poison':
                    self.abilities()[index() + 1].level(self.abilities()[index()].level());
                break;
                case 'morphling_morph_str':
                    self.abilities()[index() - 1].level(self.abilities()[index()].level());
                break;
                case 'keeper_of_the_light_spirit_form':
                    self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    self.abilities()[index() - 2].level(self.abilities()[index()].level());
                case 'nevermore_shadowraze1':
                    self.abilities()[index() + 1].level(self.abilities()[index()].level());
                    self.abilities()[index() + 2].level(self.abilities()[index()].level());
                break;
                case 'nevermore_shadowraze2':
                    self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    self.abilities()[index() + 1].level(self.abilities()[index()].level());
                break;
                case 'nevermore_shadowraze3':
                    self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    self.abilities()[index() - 2].level(self.abilities()[index()].level());
                break;
            }
        }
    };
    self.levelDownAbility = function (index, data, event, hero) {
        if (self.abilities()[index()].level() > 0) {
            self.abilities()[index()].level(self.abilities()[index()].level() - 1);
            switch (self.abilities()[index()].name) {
                case 'beastmaster_call_of_the_wild':
                case 'chen_test_of_faith':
                case 'morphling_morph_agi':
                case 'shadow_demon_shadow_poison':
                    self.abilities()[index() + 1].level(self.abilities()[index()].level());
                break;
                case 'morphling_morph_str':
                    self.abilities()[index() - 1].level(self.abilities()[index()].level());
                break;
                case 'keeper_of_the_light_spirit_form':
                    self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    self.abilities()[index() - 2].level(self.abilities()[index()].level());
                case 'nevermore_shadowraze1':
                    self.abilities()[index() + 1].level(self.abilities()[index()].level());
                    self.abilities()[index() + 2].level(self.abilities()[index()].level());
                break;
                case 'nevermore_shadowraze2':
                    self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    self.abilities()[index() + 1].level(self.abilities()[index()].level());
                break;
                case 'nevermore_shadowraze3':
                    self.abilities()[index() - 1].level(self.abilities()[index()].level());
                    self.abilities()[index() - 2].level(self.abilities()[index()].level());
                break;
                case 'ember_spirit_fire_remnant':
                    self.abilities()[index() - 1].level(self.abilities()[index()].level());
                break;
                case 'lone_druid_true_form':
                    self.abilities()[index() - 1].level(self.abilities()[index()].level());
                break;
            }
        }
    };
    
    return self;
}
BuffViewModel.prototype = Object.create(AbilityModel.prototype);
BuffViewModel.prototype.constructor = BuffViewModel;

module.exports = BuffViewModel;
},{"./AbilityModel":2,"./buffs/buffOptionsArray":5,"./buffs/debuffOptionsArray":6,"./herocalc_knockout":17,"./inventory/InventoryViewModel":19,"./util/findWhere":29}],4:[function(require,module,exports){
var findWhere = require("../util/findWhere");

var BuffModel = function (heroData, unitData, hero, ability) {
    this.buffName = ability;
    if (heroData['npc_dota_hero_' + hero] == undefined) {
        this.hero = hero;
        this.abilityData = findWhere(unitData[hero].abilities, {name: ability})
        this.buffDisplayName = unitData[hero].displayname + ' - ' + this.abilityData.displayname;
    }
    else {
        this.hero = 'npc_dota_hero_' + hero;
        this.abilityData = findWhere(heroData['npc_dota_hero_' + hero].abilities, {name: ability})
        this.buffDisplayName = heroData['npc_dota_hero_' + hero].displayname + ' - ' + this.abilityData.displayname;        
        if (ability == 'sven_gods_strength') {
            this.buffDisplayName += ' (Aura for allies)';
        }
    }

};

module.exports = BuffModel;
},{"../util/findWhere":29}],5:[function(require,module,exports){
var BuffModel = require("./BuffModel");

var buffOptionsArray = {};

var init = function (heroData, unitData) {
    buffOptionsArray.items = [
        new BuffModel(heroData, unitData, 'abaddon', 'abaddon_frostmourne'),
        new BuffModel(heroData, unitData, 'axe', 'axe_culling_blade'),
        new BuffModel(heroData, unitData, 'beastmaster', 'beastmaster_inner_beast'),
        new BuffModel(heroData, unitData, 'bloodseeker', 'bloodseeker_bloodrage'),
        new BuffModel(heroData, unitData, 'bounty_hunter', 'bounty_hunter_track'),
        new BuffModel(heroData, unitData, 'centaur', 'centaur_stampede'),
        new BuffModel(heroData, unitData, 'crystal_maiden', 'crystal_maiden_brilliance_aura'),
        new BuffModel(heroData, unitData, 'dark_seer', 'dark_seer_surge'),
        new BuffModel(heroData, unitData, 'dazzle', 'dazzle_weave'),
        new BuffModel(heroData, unitData, 'drow_ranger', 'drow_ranger_trueshot'),
        new BuffModel(heroData, unitData, 'invoker', 'invoker_alacrity'),
        new BuffModel(heroData, unitData, 'wisp', 'wisp_tether'),
        new BuffModel(heroData, unitData, 'wisp', 'wisp_overcharge'),
        new BuffModel(heroData, unitData, 'kunkka', 'kunkka_ghostship'),
        new BuffModel(heroData, unitData, 'lich', 'lich_frost_armor'),
        new BuffModel(heroData, unitData, 'life_stealer', 'life_stealer_open_wounds'),
        new BuffModel(heroData, unitData, 'luna', 'luna_lunar_blessing'),
        new BuffModel(heroData, unitData, 'lycan', 'lycan_howl'),
        new BuffModel(heroData, unitData, 'magnataur', 'magnataur_empower'),
        new BuffModel(heroData, unitData, 'mirana', 'mirana_leap'),
        new BuffModel(heroData, unitData, 'ogre_magi', 'ogre_magi_bloodlust'),
        new BuffModel(heroData, unitData, 'omniknight', 'omniknight_guardian_angel'),
        new BuffModel(heroData, unitData, 'rubick', 'rubick_null_field'),
        new BuffModel(heroData, unitData, 'skeleton_king', 'skeleton_king_vampiric_aura'),
        new BuffModel(heroData, unitData, 'spirit_breaker', 'spirit_breaker_empowering_haste'),
        new BuffModel(heroData, unitData, 'sven', 'sven_warcry'),
        new BuffModel(heroData, unitData, 'sven', 'sven_gods_strength'),
        new BuffModel(heroData, unitData, 'treant', 'treant_living_armor'),
        new BuffModel(heroData, unitData, 'troll_warlord', 'troll_warlord_battle_trance'),
        new BuffModel(heroData, unitData, 'vengefulspirit', 'vengefulspirit_command_aura'),
        new BuffModel(heroData, unitData, 'npc_dota_neutral_alpha_wolf', 'alpha_wolf_critical_strike'),
        new BuffModel(heroData, unitData, 'npc_dota_neutral_alpha_wolf', 'alpha_wolf_command_aura'),
        new BuffModel(heroData, unitData, 'npc_dota_neutral_polar_furbolg_ursa_warrior', 'centaur_khan_endurance_aura'),
        new BuffModel(heroData, unitData, 'npc_dota_neutral_kobold_taskmaster', 'kobold_taskmaster_speed_aura'),
        new BuffModel(heroData, unitData, 'npc_dota_neutral_ogre_magi', 'ogre_magi_frost_armor'),
        new BuffModel(heroData, unitData, 'npc_dota_neutral_satyr_hellcaller', 'satyr_hellcaller_unholy_aura'),
        new BuffModel(heroData, unitData, 'npc_dota_neutral_enraged_wildkin', 'enraged_wildkin_toughness_aura'),
        new BuffModel(heroData, unitData, 'npc_dota_necronomicon_archer_1', 'necronomicon_archer_aoe')
    ];
    return buffOptionsArray.items;
}

buffOptionsArray.init = init;

module.exports = buffOptionsArray;
},{"./BuffModel":4}],6:[function(require,module,exports){
var BuffModel = require("./BuffModel");

var debuffOptionsArray = {};

var init = function (heroData, unitData) {
    debuffOptionsArray.items = [
        new BuffModel(heroData, unitData, 'abaddon', 'abaddon_frostmourne'),
        new BuffModel(heroData, unitData, 'alchemist', 'alchemist_acid_spray'),
        new BuffModel(heroData, unitData, 'ancient_apparition', 'ancient_apparition_ice_vortex'),
        new BuffModel(heroData, unitData, 'axe', 'axe_battle_hunger'),
        new BuffModel(heroData, unitData, 'bane', 'bane_enfeeble'),
        new BuffModel(heroData, unitData, 'batrider', 'batrider_sticky_napalm'),
        new BuffModel(heroData, unitData, 'beastmaster', 'beastmaster_primal_roar'),
        new BuffModel(heroData, unitData, 'bounty_hunter', 'bounty_hunter_jinada'),
        new BuffModel(heroData, unitData, 'brewmaster', 'brewmaster_thunder_clap'),
        new BuffModel(heroData, unitData, 'brewmaster', 'brewmaster_drunken_haze'),
        new BuffModel(heroData, unitData, 'bristleback', 'bristleback_viscous_nasal_goo'),
        new BuffModel(heroData, unitData, 'broodmother', 'broodmother_incapacitating_bite'),
        new BuffModel(heroData, unitData, 'centaur', 'centaur_stampede'),
        new BuffModel(heroData, unitData, 'chen', 'chen_penitence'),
        new BuffModel(heroData, unitData, 'crystal_maiden', 'crystal_maiden_crystal_nova'),
        new BuffModel(heroData, unitData, 'crystal_maiden', 'crystal_maiden_freezing_field'),
        new BuffModel(heroData, unitData, 'dazzle', 'dazzle_weave'),
        new BuffModel(heroData, unitData, 'drow_ranger', 'drow_ranger_frost_arrows'),
        new BuffModel(heroData, unitData, 'earth_spirit', 'earth_spirit_rolling_boulder'),
        new BuffModel(heroData, unitData, 'elder_titan', 'elder_titan_natural_order'),
        new BuffModel(heroData, unitData, 'elder_titan', 'elder_titan_earth_splitter'),
        new BuffModel(heroData, unitData, 'enchantress', 'enchantress_untouchable'),
        new BuffModel(heroData, unitData, 'enchantress', 'enchantress_enchant'),
        new BuffModel(heroData, unitData, 'faceless_void', 'faceless_void_time_walk'),
        new BuffModel(heroData, unitData, 'huskar', 'huskar_life_break'),
        new BuffModel(heroData, unitData, 'invoker', 'invoker_ghost_walk'),
        new BuffModel(heroData, unitData, 'invoker', 'invoker_ice_wall'),
        new BuffModel(heroData, unitData, 'wisp', 'wisp_tether'),
        new BuffModel(heroData, unitData, 'jakiro', 'jakiro_dual_breath'),
        new BuffModel(heroData, unitData, 'jakiro', 'jakiro_liquid_fire'),
        new BuffModel(heroData, unitData, 'keeper_of_the_light', 'keeper_of_the_light_blinding_light'),
        new BuffModel(heroData, unitData, 'kunkka', 'kunkka_torrent'),
        new BuffModel(heroData, unitData, 'lich', 'lich_frost_nova'),
        new BuffModel(heroData, unitData, 'lich', 'lich_frost_armor'),
        new BuffModel(heroData, unitData, 'lich', 'lich_chain_frost'),
        new BuffModel(heroData, unitData, 'life_stealer', 'life_stealer_open_wounds'),
        new BuffModel(heroData, unitData, 'lion', 'lion_voodoo'),
        new BuffModel(heroData, unitData, 'magnataur', 'magnataur_skewer'),
        new BuffModel(heroData, unitData, 'medusa', 'medusa_stone_gaze'),
        new BuffModel(heroData, unitData, 'meepo', 'meepo_geostrike'),
        new BuffModel(heroData, unitData, 'naga_siren', 'naga_siren_rip_tide'),
        new BuffModel(heroData, unitData, 'night_stalker', 'night_stalker_void'),
        new BuffModel(heroData, unitData, 'night_stalker', 'night_stalker_crippling_fear'),
        new BuffModel(heroData, unitData, 'night_stalker', 'night_stalker_darkness'),
        new BuffModel(heroData, unitData, 'ogre_magi', 'ogre_magi_ignite'),
        new BuffModel(heroData, unitData, 'omniknight', 'omniknight_degen_aura'),
        new BuffModel(heroData, unitData, 'phantom_assassin', 'phantom_assassin_stifling_dagger'),
        new BuffModel(heroData, unitData, 'phantom_lancer', 'phantom_lancer_spirit_lance'),
        new BuffModel(heroData, unitData, 'pudge', 'pudge_rot'),
        new BuffModel(heroData, unitData, 'pugna', 'pugna_decrepify'),
        new BuffModel(heroData, unitData, 'queenofpain', 'queenofpain_shadow_strike'),
        new BuffModel(heroData, unitData, 'riki', 'riki_smoke_screen'),
        new BuffModel(heroData, unitData, 'rubick', 'rubick_fade_bolt'),
        new BuffModel(heroData, unitData, 'sand_king', 'sandking_epicenter'),
        new BuffModel(heroData, unitData, 'nevermore', 'nevermore_dark_lord'),
        new BuffModel(heroData, unitData, 'shadow_shaman', 'shadow_shaman_voodoo'),
        new BuffModel(heroData, unitData, 'skeleton_king', 'skeleton_king_hellfire_blast'),
        new BuffModel(heroData, unitData, 'skeleton_king', 'skeleton_king_reincarnation'),
        new BuffModel(heroData, unitData, 'skywrath_mage', 'skywrath_mage_concussive_shot'),
        new BuffModel(heroData, unitData, 'skywrath_mage', 'skywrath_mage_ancient_seal'),
        new BuffModel(heroData, unitData, 'slardar', 'slardar_slithereen_crush'),
        new BuffModel(heroData, unitData, 'slardar', 'slardar_amplify_damage'),
        new BuffModel(heroData, unitData, 'slark', 'slark_essence_shift'),
        new BuffModel(heroData, unitData, 'sniper', 'sniper_shrapnel'),
        new BuffModel(heroData, unitData, 'spectre', 'spectre_spectral_dagger'),
        new BuffModel(heroData, unitData, 'storm_spirit', 'storm_spirit_overload'),
        new BuffModel(heroData, unitData, 'templar_assassin', 'templar_assassin_meld'),
        new BuffModel(heroData, unitData, 'tidehunter', 'tidehunter_gush'),
        new BuffModel(heroData, unitData, 'tinker', 'tinker_laser'),
        new BuffModel(heroData, unitData, 'treant', 'treant_leech_seed'),
        new BuffModel(heroData, unitData, 'tusk', 'tusk_frozen_sigil'),
        new BuffModel(heroData, unitData, 'undying', 'undying_flesh_golem'),
        new BuffModel(heroData, unitData, 'ursa', 'ursa_earthshock'),
        new BuffModel(heroData, unitData, 'vengefulspirit', 'vengefulspirit_wave_of_terror'),
        new BuffModel(heroData, unitData, 'vengefulspirit', 'vengefulspirit_command_aura'),
        new BuffModel(heroData, unitData, 'venomancer', 'venomancer_venomous_gale'),
        new BuffModel(heroData, unitData, 'venomancer', 'venomancer_poison_sting'),
        new BuffModel(heroData, unitData, 'viper', 'viper_poison_attack'),
        new BuffModel(heroData, unitData, 'viper', 'viper_corrosive_skin'),
        new BuffModel(heroData, unitData, 'viper', 'viper_viper_strike'),
        new BuffModel(heroData, unitData, 'visage', 'visage_grave_chill'),
        new BuffModel(heroData, unitData, 'warlock', 'warlock_upheaval'),
        new BuffModel(heroData, unitData, 'weaver', 'weaver_the_swarm'),
        new BuffModel(heroData, unitData, 'windrunner', 'windrunner_windrun'),
        new BuffModel(heroData, unitData, 'winter_wyvern', 'winter_wyvern_arctic_burn'),
        new BuffModel(heroData, unitData, 'winter_wyvern', 'winter_wyvern_splinter_blast'),
        new BuffModel(heroData, unitData, 'npc_dota_neutral_ghost', 'ghost_frost_attack'),
        new BuffModel(heroData, unitData, 'npc_dota_neutral_polar_furbolg_ursa_warrior', 'polar_furbolg_ursa_warrior_thunder_clap'),
        new BuffModel(heroData, unitData, 'npc_dota_neutral_ogre_magi', 'ogre_magi_frost_armor'),
        new BuffModel(heroData, unitData, 'npc_dota_neutral_satyr_trickster', 'satyr_trickster_purge'),
        new BuffModel(heroData, unitData, 'npc_dota_neutral_enraged_wildkin', 'enraged_wildkin_tornado')
    ];
    return debuffOptionsArray.items;
}

debuffOptionsArray.init = init;

module.exports = debuffOptionsArray;
},{"./BuffModel":4}],7:[function(require,module,exports){
var DamageTypeColor = {
    'physical': '#979aa2',
    'pure': 'goldenrod',
    'magic': '#428bca',
    'default': '#979aa2'
}

module.exports = DamageTypeColor;
},{}],8:[function(require,module,exports){
'use strict';
var ko = require('../herocalc_knockout');
    
var DamageTypeColor = require("./DamageTypeColor");
var extend = require("../util/extend");
var TalentController = require("./TalentController");

var HeroDamageMixin = function (self, itemData) {
    self.critInfo = ko.pureComputed(function () {
        var critSources = self.inventory.getCritSource();
        extend(critSources, self.ability().getCritSource());
        extend(critSources, self.buffs.getCritSource());
        var critSourcesArray = [];
        for (var prop in critSources) {
            var el = critSources[prop];
            el.name = prop
            critSourcesArray.push(el);
        }
        function compareByMultiplier(a,b) {
            if (a.multiplier < b.multiplier)
                return 1;
            if (a.multiplier > b.multiplier)
                return -1;
            return 0;
        }

        critSourcesArray.sort(compareByMultiplier);
        
        var result = [];
        var critTotal = 0;
        for (var i = 0; i < critSourcesArray.length; i++) {
            var total = 1;
            for (var j = 0; j < i; j++) {
                for (var k = 0; k <critSourcesArray[j].count; k++) {
                    total *= (1 - critSourcesArray[j].chance);
                }
            }
            var total2 = 1;
            for (var k = 0; k < critSourcesArray[i].count; k++) {
                total2 *= (1 - critSourcesArray[i].chance);
            }
            total *= (1 - total2);
            critTotal += total;
            if (critSourcesArray[i].count > 1) {
                result.push({
                    'name':critSourcesArray[i].displayname + ' x' + critSourcesArray[i].count,
                    'chance':critSourcesArray[i].chance,
                    'multiplier':critSourcesArray[i].multiplier,
                    'count':critSourcesArray[i].count,
                    'totalChance':total
                });
            }
            else {
                result.push({
                    'name':critSourcesArray[i].displayname,
                    'chance':critSourcesArray[i].chance,
                    'multiplier':critSourcesArray[i].multiplier,
                    'count':critSourcesArray[i].count,
                    'totalChance':total
                });
            }
        }
        return { sources: result, total: critTotal };
    });

    self.cleaveInfo = ko.pureComputed(function () {
        var cleaveSources = self.inventory.getCleaveSource();
        extend(cleaveSources, self.ability().getCleaveSource());
        extend(cleaveSources, self.buffs.getCleaveSource());
        var cleaveSourcesArray = [];
        for (var prop in cleaveSources) {
            var el = cleaveSources[prop];
            el.name = prop
            cleaveSourcesArray.push(el);
        }
        function compareByRadius(a,b) {
            if (a.radius < b.radius)
                return 1;
            if (a.radius > b.radius)
                return -1;
            return 0;
        }

        cleaveSourcesArray.sort(compareByRadius);
        var cleaveSourcesByRadius = {};
        for (var i = 0; i < cleaveSourcesArray.length; i++) {
            var total = 0;
            for (var j = 0; j <cleaveSourcesArray.length; j++) {
                if (cleaveSourcesArray[j].radius >= cleaveSourcesArray[i].radius) {
                    total += cleaveSourcesArray[j].magnitude * cleaveSourcesArray[j].count;
                }
            }
            cleaveSourcesByRadius[cleaveSourcesArray[i].radius] = total;
        }
        var result = [];
        for (var prop in cleaveSourcesByRadius) {
            result.push({
                'radius':prop,
                'magnitude':cleaveSourcesByRadius[prop]
            });
        }
        return result;
    });
    
    self.bashInfo = ko.pureComputed(function () {
        var attacktype = self.heroData().attacktype;
        var bashSources = self.inventory.getBashSource(attacktype);
        extend(bashSources, self.ability().getBashSource());
        var bashSourcesArray = [];
        for (var prop in bashSources) {
            var el = bashSources[prop];
            el.name = prop
            bashSourcesArray.push(el);
        }
        function compareByDuration(a, b) {
            if (a.duration < b.duration)
                return 1;
            if (a.duration > b.duration)
                return -1;
            return 0;
        }

        //bashSourcesArray.sort(compareByDuration);
        
        var result = [];
        var bashTotal = 0;
        for (var i = 0;i < bashSourcesArray.length; i++) {
            var total = 1;
            for (var j = 0; j < i; j++) {
                for (var k = 0; k < bashSourcesArray[j].count; k++) {
                    total *= (1 - bashSourcesArray[j].chance);
                }
            }
            var total2 = 1;
            for (var k = 0; k < bashSourcesArray[i].count; k++) {
                total2 *= (1 - bashSourcesArray[i].chance);
            }
            total *= (1 - total2);
            bashTotal += total;
            if (bashSourcesArray[i].name === 'spirit_breaker_greater_bash') {
                var d = bashSourcesArray[i].damage * self.totalMovementSpeed();
            }
            else {
                var d = bashSourcesArray[i].damage;
            }
            if (bashSourcesArray[i].count > 1) {
                result.push({
                    'name':bashSourcesArray[i].displayname, // + ' x' + bashSourcesArray[i].count,
                    'chance':bashSourcesArray[i].chance,
                    'damage':d,
                    'count':bashSourcesArray[i].count,
                    'damageType':bashSourcesArray[i].damageType,
                    'totalChance':total
                });
            }
            else {
                result.push({
                    'name':bashSourcesArray[i].displayname,
                    'chance':bashSourcesArray[i].chance,
                    'damage':d,
                    'count':bashSourcesArray[i].count,
                    'damageType':bashSourcesArray[i].damageType,
                    'totalChance':total
                });
            }

        }
        return { sources: result, total: bashTotal };
    });
    
    self.orbProcInfo = ko.pureComputed(function () {
        var attacktype = self.heroData().attacktype;
        var damageSources = self.inventory.getOrbProcSource();
        var damageSourcesArray = [];
        for (var prop in damageSources) {
            var el = damageSources[prop];
            el.name = prop
            damageSourcesArray.push(el);
        }
        function compareByDamage(a, b) {
            if (a.priority > b.priority) {
                return 1;
            }
            if (a.priority < b.priority) {
                return -1;
            }
            if (a.damage < b.damage)
                return 1;
            if (a.damage > b.damage)
                return -1;
            return 0;
        }

        damageSourcesArray.sort(compareByDamage);
        
        var result = [];
        var damageTotal = 0;
        for (var i=0 ; i < damageSourcesArray.length; i++) {
            var total = 1;
            for (var j = 0; j < i; j++) {
                for (var k = 0; k < damageSourcesArray[j].count; k++) {
                    total *= (1 - damageSourcesArray[j].chance);
                }
            }
            var total2 = 1;
            for (var k = 0; k < damageSourcesArray[i].count; k++) {
                total2 *= (1 - damageSourcesArray[i].chance);
            }
            total *= (1 - total2);
            damageTotal += total;
            if (damageSourcesArray[i].count > 1) {
                result.push({
                    'name':damageSourcesArray[i].displayname + ' x' + damageSourcesArray[i].count,
                    'chance':damageSourcesArray[i].chance,
                    'damage':damageSourcesArray[i].damage,
                    'count':damageSourcesArray[i].count,
                    'damageType':damageSourcesArray[i].damageType,
                    'totalChance':total
                });
            }
            else {
                result.push({
                    'name':damageSourcesArray[i].displayname,
                    'chance':damageSourcesArray[i].chance,
                    'damage':damageSourcesArray[i].damage,
                    'count':damageSourcesArray[i].count,
                    'damageType':damageSourcesArray[i].damageType,
                    'totalChance':total
                });
            }
        }
        return { sources: result, total: damageTotal };
    });
    
    self.getReducedDamage = function (value, type) {
        var result = value;
        switch (type) {
            case 'physical':
                result = value * (1 - (0.06 * self.enemy().totalArmorPhysical()) / (1 + 0.06 * Math.abs(self.enemy().totalArmorPhysical())));
            break;
            case 'magic':
                result = value * (1 - self.enemy().totalMagicResistance() / 100);
            break;
            case 'pure':
                result = value;
            break;
            case 'composite':
                result = value * (1 - (0.06 * self.enemy().totalArmorPhysical()) / (1 + 0.06 * Math.abs(self.enemy().totalArmorPhysical())));
                result *= (1 - self.enemy().totalMagicResistance() / 100);
            break;
        }
        result *= self.ability().getDamageAmplification() * self.debuffs.getDamageAmplification();
        result *= self.enemy().ability().getDamageReduction() * self.enemy().buffs.getDamageReduction();
        return result;
    }
    
    self.damageTotalInfo = ko.pureComputed(function () {
        var bonusDamageArray = [
            self.ability().getBonusDamage().sources,
            self.buffs.getBonusDamage().sources,
            TalentController.getBonusDamage(self.selectedTalents()).sources
        ],
        bonusDamagePctArray = [
            self.ability().getBonusDamagePercent().sources,
            self.buffs.getBonusDamagePercent().sources
        ],
        itemBonusDamage = self.inventory.getBonusDamage().sources,
        itemBonusDamagePct = self.buffs.itemBuffs.getBonusDamagePercent(self.inventory.getBonusDamagePercent()).sources,
        critSources = self.critInfo(),
        abilityOrbSources = self.ability().getOrbSource(),
        itemOrbSources = self.inventory.getOrbSource(),
        itemProcOrbSources = self.orbProcInfo(),
        bashSources = self.bashInfo(),
        
        attackSources = [];
        
        attackSources.push({
            name: 'Base Attack',
            cooldown: 1
        });
        
        // weaver_geminate_attack
        if (self.heroId() === 'weaver') {
            var a = self.ability().abilities().find(function (ability) {
                return ability.name === 'weaver_geminate_attack';
            });
            if (a) {
                if (a.level() > 0) {
                    var cd = a.cooldown[a.level() - 1];
                    attackSources.push({
                        name: a.displayname,
                        cooldown: (1/cd)
                    });
                }
            }
        }
        
        // echo_sabre
        var item = self.inventory.items().find(function (o) { return o.item === "echo_sabre" && o.enabled(); });
        if (item && self.heroData().attacktype === 'DOTA_UNIT_CAP_MELEE_ATTACK') {
            var item_echo_sabre = itemData['item_echo_sabre'];
            attackSources.push({
                name: item_echo_sabre.displayname,
                cooldown: (1/item_echo_sabre.cooldown)
            });
        }

        var attacks = attackSources.map(function (a) {
            var baseDamage = (self.baseDamage()[0] + self.baseDamage()[1]) / 2,
            totalDamage = 0,
            totalCritableDamage = 0,
            totalCrit = 0,
            geminateAttack = { damage: 0, damageReduced: 0, cooldown: 6, active: false },
            echoSabreAttack = { damage: 0, damageReduced: 0, cooldown: itemData['item_echo_sabre'].cooldown[0], active: false },
            damage = {
                pure: 0,
                physical: 0,
                magic: 0
            },
            result = [],
            crits = [];
            
            // base damage
            result.push({
                name: 'Base Damage',
                damage: baseDamage,
                damageType: 'physical',
                damageReduced: self.getReducedDamage(baseDamage, 'physical'),
                enabled: ko.observable(true)
            });
            totalDamage += baseDamage;
            totalCritableDamage += baseDamage;
            damage.physical += baseDamage;
            
            // bonus damage from items
            for (i in itemBonusDamage) {
                var d = itemBonusDamage[i].damage*itemBonusDamage[i].count * self.ability().getSelfBaseDamageReductionPct() * self.enemy().ability().getBaseDamageReductionPct() * self.debuffs.itemBuffs.getBaseDamageReductionPct();
                result.push({
                    name: itemBonusDamage[i].displayname + (itemBonusDamage[i].count > 1 ? ' x' + itemBonusDamage[i].count : ''),
                    damage: d,
                    damageType: itemBonusDamage[i].damageType,
                    damageReduced: self.getReducedDamage(d, itemBonusDamage[i].damageType),
                    enabled: ko.observable(true)
                });
                totalDamage += d;
                totalCritableDamage += d;
                damage[itemBonusDamage[i].damageType] += d;
            }

            // bonus damage percent from items
            for (i in itemBonusDamagePct) {
                var d = baseDamage * itemBonusDamagePct[i].damage;
                result.push({
                    name: itemBonusDamagePct[i].displayname,
                    damage: d,
                    damageType: itemBonusDamagePct[i].damageType,
                    damageReduced: self.getReducedDamage(d, itemBonusDamagePct[i].damageType),
                    enabled: ko.observable(true)
                });
                totalDamage += d;
                totalCritableDamage += d;
                damage[itemBonusDamagePct[i].damageType] += d;
            }
            
            // bonus damage from abilities and buffs
            for (var i = 0; i < bonusDamageArray.length; i++) {
                for (j in bonusDamageArray[i]) {
                    var d = bonusDamageArray[i][j].damage;
                    result.push({
                        name: bonusDamageArray[i][j].displayname,
                        damage: d,
                        damageType: bonusDamageArray[i][j].damageType,
                        damageReduced: self.getReducedDamage(d, bonusDamageArray[i][j].damageType),
                        enabled: ko.observable(true)
                    });
                    totalDamage += d;
                    totalCritableDamage += d;
                    damage[bonusDamageArray[i][j].damageType] += d;
                }
            }
            
            // bonus damage percent from abilities and buffs
            for (var i = 0; i < bonusDamagePctArray.length; i++) {
                for (j in bonusDamagePctArray[i]) {
                    var d = baseDamage * bonusDamagePctArray[i][j].damage;
                    result.push({
                        name: bonusDamagePctArray[i][j].displayname,
                        damage: d,
                        damageType: bonusDamagePctArray[i][j].damageType,
                        damageReduced: self.getReducedDamage(d, bonusDamagePctArray[i][j].damageType),
                        enabled: ko.observable(true)
                    });
                    totalDamage += d;
                    totalCritableDamage += d;
                    damage[bonusDamagePctArray[i][j].damageType] += d;
                }
            }
            // drow_ranger_trueshot
            if (self.heroData().attacktype === 'DOTA_UNIT_CAP_RANGED_ATTACK') {
                if (self.heroId() === 'drow_ranger') {
                    var s = self.ability().getBonusDamagePrecisionAura().sources;
                    var index = 0;
                }
                else {
                    var s = self.buffs.getBonusDamagePrecisionAura().sources;
                    var index = 1;
                }
                if (s[index] != undefined) {
                    if (self.heroId() === 'drow_ranger') {
                        var d = s[index].damage * self.totalAgi();
                    }
                    else {
                        var d = s[index].damage;
                    }
                    result.push({
                        name: s[index].displayname,
                        damage: d,
                        damageType: 'physical',
                        damageReduced: self.getReducedDamage(d, 'physical'),
                        enabled: ko.observable(true)
                    });
                    totalDamage += d;
                    totalCritableDamage += d;
                    damage.physical += d;                    
                }
            }
            
            // riki_backstab
            if (self.heroId() === 'riki') {
                var s = self.ability().getBonusDamageBackstab().sources;
                var index = 0;
            }
            else {
                var s = self.buffs.getBonusDamageBackstab().sources;
                var index = 1;
            }
            if (s[index] != undefined) {
                if (self.heroId() === 'riki') {
                    var d = s[index].damage * self.totalAgi();
                }
                else {
                    var d = s[index].damage;
                }
                result.push({
                    name: s[index].displayname,
                    damage: d,
                    damageType: 'physical',
                    damageReduced: self.getReducedDamage(d, 'physical'),
                    enabled: ko.observable(true)
                });
                totalDamage += d;
                //totalCritableDamage += d;
                damage.physical += d;                    
            }

            // bash damage
            for (var i = 0; i < bashSources.sources.length; i++) {
                var o = bashSources.sources[i];
                var d = bashSources.sources[i].damage;
                var cd = self.attacksPerSecond();
                if (o.cooldown) {
                    cd = Math.max(1/o.cooldown, cd);
                }
                for (var j = 0; j < bashSources.sources[i].count; j++) {
                    result.push({
                        name: bashSources.sources[i].name,
                        damage: d,
                        damageType: bashSources.sources[i].damageType,
                        damageReduced: self.getReducedDamage(d, bashSources.sources[i].damageType),
                        dps: d * cd * bashSources.sources[i].chance,
                        dpsReduced: self.getReducedDamage(d, bashSources.sources[i].damageType) * cd * bashSources.sources[i].chance,
                        enabled: ko.observable(true)
                    });
                    totalDamage += d;
                    damage[bashSources.sources[i].damageType] += d;
                }

            }
            
            // %-based orbs
            for (var i = 0; i < itemProcOrbSources.sources.length; i++) {
                var d = itemProcOrbSources.sources[i].damage * (1 - Math.pow(1 - itemProcOrbSources.sources[i].chance, itemProcOrbSources.sources[i].count));
                result.push({
                    name: itemProcOrbSources.sources[i].name,
                    damage: d,
                    damageType: itemProcOrbSources.sources[i].damageType,
                    damageReduced: self.getReducedDamage(d, itemProcOrbSources.sources[i].damageType),
                    enabled: ko.observable(true)
                });
                totalDamage += d;
                damage[itemProcOrbSources.sources[i].damageType] += d;
            }
            
            // ability orbs
            for (var orb in abilityOrbSources) {
                var d = abilityOrbSources[orb].damage * (1 - itemProcOrbSources.total);
                result.push({
                    name: abilityOrbSources[orb].displayname,
                    damage: d,
                    damageType: abilityOrbSources[orb].damageType,
                    damageReduced: self.getReducedDamage(d, abilityOrbSources[orb].damageType),
                    enabled: ko.observable(true)
                });
                totalDamage += d;
                damage[abilityOrbSources[orb].damageType] += d;
            }
            
            // item orbs
            if (Object.keys(abilityOrbSources).length === 0) {
                for (var orb in itemOrbSources) {
                    var d = itemOrbSources[orb].damage * (1 - itemProcOrbSources.total);
                    result.push({
                        name: itemOrbSources[orb].displayname,
                        damage: d,
                        damageType: itemOrbSources[orb].damageType,
                        damageReduced: self.getReducedDamage(d, itemOrbSources[orb].damageType),
                        enabled: ko.observable(true)
                    });
                    totalDamage += d;
                    damage[itemOrbSources[orb].damageType] += d;
                }            
            }
            
            // crit damage
            for (var i = 0; i < critSources.sources.length; i++) {
                var d = totalCritableDamage * (critSources.sources[i].multiplier - 1);// * critSources.sources[i].totalChance;
                crits.push({
                    name: critSources.sources[i].name + ', ' + critSources.sources[i].multiplier + 'x, ' + (critSources.sources[i].totalChance * 100).toFixed(1) + '%',
                    damage: d,
                    damageType: 'physical',
                    damageReduced: self.getReducedDamage(d, 'physical'),
                    enabled: ko.observable(true),
                    chance: critSources.sources[i].totalChance
                });
                totalCrit += d;
            }

            var totalReduced = self.getReducedDamage(damage.pure, 'pure') 
                    + self.getReducedDamage(damage.physical, 'physical')
                    + self.getReducedDamage(damage.magic, 'magic'),
                totalCritReduced = self.getReducedDamage(totalCrit, 'physical'),
                dps = {
                    base: totalDamage * self.attacksPerSecond(),
                    crit: totalCrit * self.attacksPerSecond(),
                    geminateAttack: geminateAttack.active ? geminateAttack.damage / geminateAttack.cooldown : 0,
                    reduced: {
                        base: totalReduced * self.attacksPerSecond(),
                        crit: totalCritReduced * self.attacksPerSecond(),
                        geminateAttack: geminateAttack.active ? self.getReducedDamage(geminateAttack.damage, 'physical') / geminateAttack.cooldown : 0,
                    }
                }
                
            crits.forEach(function (o) {
                if (!o.dps) {
                    o.dps = o.damage * (o.cooldown || self.attacksPerSecond()) * o.chance;
                }
                if (!o.dpsReduced) {
                    o.dpsReduced = o.damageReduced * (o.cooldown || self.attacksPerSecond()) * o.chance;
                }
            });
                
            result.forEach(function (o) {
                if (!o.dps) {
                    o.dps = o.damage * (o.cooldown || self.attacksPerSecond());
                }
                if (!o.dpsReduced) {
                    o.dpsReduced = o.damageReduced * (o.cooldown || self.attacksPerSecond());
                }
            });
            
            var totalCritChance = crits.reduce(function (memo, o) { return memo + o.chance }, 0);
                
            var t1Crit = ko.computed(function () {
                var c = crits.find(function (o) { return o.enabled(); });
                return c ? c.damage : 0;
            });
            var t2Crit = ko.computed(function () {
                var c = crits.find(function (o) { return o.enabled(); });
                return c ? c.damageReduced : 0;
            });
            var t3Crit = ko.computed(function () {
                return crits.filter(function (o) { return o.enabled(); }).reduce(function (memo, o) { return memo + o.dps }, 0);
            });
            var t4Crit = ko.computed(function () {
                return crits.filter(function (o) { return o.enabled(); }).reduce(function (memo, o) { return memo + o.dpsReduced }, 0);
            });
                
            var t1 = ko.computed(function () {
                return result.filter(function (o) { return o.enabled(); }).reduce(function (memo, o) { return memo + o.damage }, 0) + t1Crit();
            });
            var t2 = ko.computed(function () {
                return result.filter(function (o) { return o.enabled(); }).reduce(function (memo, o) { return memo + o.damageReduced }, 0) + t2Crit();
            });
            var t3 = ko.computed(function () {
                return (result.filter(function (o) { return o.enabled(); }).reduce(function (memo, o) { return memo + o.dps }, 0) + t3Crit()) * a.cooldown;
            });
            var t4 = ko.computed(function () {
                return (result.filter(function (o) { return o.enabled(); }).reduce(function (memo, o) { return memo + o.dpsReduced }, 0) + t4Crit()) * a.cooldown;
            });
            
            var totalCritRow = [t1Crit, t2Crit, t3Crit, t4Crit];
            
            var totalRow = [t1, t2, t3, t4];

            return {
                name: a.name + ' Subtotal',
                cooldown: a.cooldown,
                enabled: ko.observable(true),
                visible: ko.observable(true),
                totalCritChance: totalCritChance,
                totalCritRow: totalCritRow,
                totalRow: totalRow,
                sources: result,
                sourcesCrit: crits,
                total: totalDamage,
                totalCrit: totalCrit,
                totalGeminateAttack: totalDamage + geminateAttack.damage,
                totalGeminateAttackReduced: totalReduced + geminateAttack.damageReduced,
                geminateAttack: geminateAttack,
                totalCritReduced: totalCritReduced,
                totalReduced: totalReduced,
                sumTotal: totalDamage + totalCrit,
                sumTotalReduced: totalReduced + totalCritReduced,
                dps: {
                    base: dps.base,
                    crit: dps.base + dps.crit,
                    geminateAttack: dps.base + dps.geminateAttack,
                    total: dps.base + dps.crit + dps.geminateAttack,
                    reduced: {
                        base: dps.reduced.base,
                        crit: dps.reduced.base + dps.reduced.crit,
                        geminateAttack: dps.reduced.base + dps.reduced.geminateAttack,
                        total: dps.reduced.base + dps.reduced.crit + dps.reduced.geminateAttack
                    }
                }
            };
        });
        
        var t1 = ko.computed(function () {
            return attacks.filter(function (o) { return o.enabled(); }).reduce(function (memo, o) { return memo + o.totalRow[0]() }, 0);
        });
        var t2 = ko.computed(function () {
            return attacks.filter(function (o) { return o.enabled(); }).reduce(function (memo, o) { return memo + o.totalRow[1]() }, 0);
        });
        var t3 = ko.computed(function () {
            return attacks.filter(function (o) { return o.enabled(); }).reduce(function (memo, o) { return memo + o.totalRow[2]() }, 0);
        });
        var t4 = ko.computed(function () {
            return attacks.filter(function (o) { return o.enabled(); }).reduce(function (memo, o) { return memo + o.totalRow[3]() }, 0);
        });
            
        return {
            attacks: attacks,
            totalRow: [t1, t2, t3, t4]
        }
    });
    
    self.getDamageTypeColor = function (damageType) {
        return DamageTypeColor[damageType] || DamageTypeColor['default'];
    }
    
}

module.exports = HeroDamageMixin;
},{"../herocalc_knockout":17,"../util/extend":28,"./DamageTypeColor":7,"./TalentController":11}],9:[function(require,module,exports){
'use strict';
var ko = require('../herocalc_knockout');

var AbilityModel = require("../AbilityModel");
var BuffViewModel = require("../BuffViewModel");
var InventoryViewModel = require("../inventory/InventoryViewModel");
var diffProperties = require("./diffProperties");
var HeroDamageMixin = require("./HeroDamageMixin");
var TalentController = require("./TalentController");
var totalExp = require("./totalExp");
var nextLevelExp = require("./nextLevelExp");

var HeroModel = function (heroData, itemData, h) {
    var self = this;
    self.heroId = ko.observable(h);
    self.selectedHeroLevel = ko.observable(1);
    self.inventory = new InventoryViewModel(itemData, self);
    self.selectedInventory = ko.observable(-1);
    self.buffs = new BuffViewModel(itemData);
    self.buffs.hasScepter = self.inventory.hasScepter;
    self.debuffs = new BuffViewModel(itemData);
    self.heroData = ko.computed(function () {
      return heroData['npc_dota_hero_' + self.heroId()];
    });
    self.heroCompare = ko.observable(self);
    self.enemy = ko.observable(self);
    self.unit = ko.observable(self);
    self.clone = ko.observable(self);
    
    self.talents = [
        ko.observable(-1),
        ko.observable(-1),
        ko.observable(-1),
        ko.observable(-1)
    ];
    
    self.selectedTalents = ko.computed(function () {
        var arr = [];
        for (var i = 0; i < 4; i++) {
            if (self.talents[i]() !== -1) {
                arr.push(self.heroData().talents[i][self.talents[i]()]);
            }
        }
        return arr;
    });
    
    self.skillPointHistory = ko.observableArray();
    
    self.ability = ko.computed(function () {
        var a = new AbilityModel(ko.observableArray(JSON.parse(JSON.stringify(self.heroData().abilities))), self);
        switch (self.heroId()) {
            case 'earth_spirit':
            case 'ogre_magi':
                a._abilities[3].level(1);
            break;
            case 'monkey_king':
                a._abilities[5].level(1);
            break;
            case 'invoker':
                for (var i = 5; i < 16; i++) {
                    a._abilities[i].level(1);
                }
            break;
        }
        self.skillPointHistory.removeAll();
        a.hasScepter = self.inventory.hasScepter
        return a;
    });

    self.availableSkillPoints = ko.computed(function () {
        var c = self.selectedHeroLevel();
        for (var i = 0; i < 4; i++) {
            if (self.selectedHeroLevel() < i * 5 + 10) self.talents[i](-1);
        }
        c -= self.talents.filter(function (talent) { return talent() !== -1 }).length;
        for (var i = 0; i < self.ability().abilities().length; i++) {
            switch(self.ability().abilities()[i].abilitytype) {
                case 'DOTA_ABILITY_TYPE_ULTIMATE':
                    if (self.heroId() === 'invoker') {
                        /*while (
                            ((self.ability().abilities()[i].level() == 1) && (parseInt(self.selectedHeroLevel()) < 2)) ||
                            ((self.ability().abilities()[i].level() == 2) && (parseInt(self.selectedHeroLevel()) < 7)) ||
                            ((self.ability().abilities()[i].level() == 3) && (parseInt(self.selectedHeroLevel()) < 11)) ||
                            ((self.ability().abilities()[i].level() == 4) && (parseInt(self.selectedHeroLevel()) < 17))
                        ) {
                            self.ability().levelDownAbility(i, null, null, self);
                        }*/
                    }
                    else if (self.heroId() === 'meepo') {
                        while ((self.ability().abilities()[i].level()-1) * 7 + 3 > parseInt(self.selectedHeroLevel())) {
                            self.ability().levelDownAbility(i, null, null, self);
                        }
                    }
                    else {
                        while (self.ability().abilities()[i].level() * 5 + 1 > parseInt(self.selectedHeroLevel())) {
                            self.ability().levelDownAbility(i, null, null, self);
                        }
                    }
                break;
                default:
                    while (self.ability().abilities()[i].level() * 2 - 1 > parseInt(self.selectedHeroLevel())) {
                        self.ability().levelDownAbility(i, null, null, self);
                    }
                break;
            }
        }
        while (self.skillPointHistory().length > c) {
            self.ability().levelDownAbility(self.skillPointHistory()[self.skillPointHistory().length-1], null, null, self);
        }
        return c-self.skillPointHistory().length;
    }, this);
    self.primaryAttribute = ko.pureComputed(function () {
        var v = self.heroData().attributeprimary;
        if (v === 'DOTA_ATTRIBUTE_AGILITY') return 'agi';
        if (v === 'DOTA_ATTRIBUTE_INTELLECT') return 'int';
        if (v === 'DOTA_ATTRIBUTE_STRENGTH') return 'str';
        return '';
    });
    self.totalExp = ko.pureComputed(function () {
        return totalExp[self.selectedHeroLevel() - 1];
    });
    self.nextLevelExp = ko.pureComputed(function () {
        return nextLevelExp[self.selectedHeroLevel() - 1];
    });
    self.startingArmor = ko.pureComputed(function () {
        return (self.heroData().attributebaseagility * .14 + self.heroData().armorphysical).toFixed(2);
    });
    self.respawnTime = ko.pureComputed(function () {
        var level = self.selectedHeroLevel();
        var reduction = TalentController.getRespawnReduction(self.selectedTalents());
        if (level >= 1 && level <= 5) {
            return (level - 1) * 2 + 8 - reduction;
        }
        else if (level >= 6 && level <= 11) {
            return (level - 6) * 2 + 26 - reduction;
        }
        else if (level >= 12 && level <= 17) {
            return (level - 12) * 2 + 46 - reduction;
        }
        else if (level >= 18 && level <= 24) {
            return (level - 18) * 4 + 66 - reduction;
        }
        else if (level == 25) {
            return 100 - reduction;
        }
    });
    self.totalAttribute = function (a) {
        if (a === 'agi') return parseFloat(self.totalAgi());
        if (a === 'int') return parseFloat(self.totalInt());
        if (a === 'str') return parseFloat(self.totalStr());
        return 0;
    };
    self.totalAgi = ko.pureComputed(function () {
        return (self.heroData().attributebaseagility
                + self.heroData().attributeagilitygain * (self.selectedHeroLevel() - 1) 
                + self.inventory.getAttributes('agi') 
                + self.ability().getAttributeBonusLevel() * 2
                + self.ability().getAgility()
                + TalentController.getAgility(self.selectedTalents())
                + self.enemy().ability().getAllStatsReduction()
                + self.debuffs.getAllStatsReduction()
               ).toFixed(2);
    });
    self.intStolen = ko.observable(0).extend({ numeric: 0 });
    self.totalInt = ko.pureComputed(function () {
        return (self.heroData().attributebaseintelligence 
                + self.heroData().attributeintelligencegain * (self.selectedHeroLevel() - 1) 
                + self.inventory.getAttributes('int') 
                + self.ability().getAttributeBonusLevel() * 2
                + self.ability().getIntelligence()
                + TalentController.getIntelligence(self.selectedTalents())
                + self.enemy().ability().getAllStatsReduction()
                + self.debuffs.getAllStatsReduction() + self.intStolen()
               ).toFixed(2);
    });
    self.totalStr = ko.pureComputed(function () {
        return (self.heroData().attributebasestrength 
                + self.heroData().attributestrengthgain * (self.selectedHeroLevel() - 1) 
                + self.inventory.getAttributes('str') 
                + self.ability().getAttributeBonusLevel() * 2
                + self.ability().getStrength()
                + TalentController.getStrength(self.selectedTalents())
                + self.enemy().ability().getStrengthReduction()
                + self.enemy().ability().getAllStatsReduction()
                + self.debuffs.getAllStatsReduction()
               ).toFixed(2);
    });
    self.health = ko.pureComputed(function () {
        return (self.heroData().statushealth + Math.floor(self.totalStr()) * 20 
                + self.inventory.getHealth()
                + self.ability().getHealth()
                + TalentController.getHealth(self.selectedTalents())
                ).toFixed(2);
    });
    self.healthregen = ko.pureComputed(function () {
        var healthRegenAura = [self.inventory.getHealthRegenAura, self.buffs.itemBuffs.getHealthRegenAura].reduce(function (memo, fn) {
            var obj = fn(memo.excludeList);
            obj.value += memo.value;
            return obj;
        }, {value: 0, excludeList: []});
        return (self.heroData().statushealthregen + self.totalStr() * .06 
                + self.inventory.getHealthRegen() 
                + self.ability().getHealthRegen()
                + TalentController.getHealthRegen(self.selectedTalents())
                + self.buffs.getHealthRegen()
                + healthRegenAura.value
                ).toFixed(2);
    });
    self.mana = ko.pureComputed(function () {
        return (self.heroData().statusmana
                + self.totalInt() * 11
                + self.inventory.getMana()
                + TalentController.getMana(self.selectedTalents())
                + self.ability().getMana()).toFixed(2);
    });
    self.manaregen = ko.pureComputed(function () {
        return ((self.heroData().statusmanaregen 
                + self.totalInt() * .04 
                + self.ability().getManaRegen()
                + TalentController.getManaRegen(self.selectedTalents())
                ) 
                * (1 + self.inventory.getManaRegenPercent()) 
                + (self.heroId() === 'crystal_maiden' ? self.ability().getManaRegenArcaneAura() * 2 : self.buffs.getManaRegenArcaneAura())
                + self.inventory.getManaRegenBloodstone()
                + self.inventory.getManaRegen()
                - self.enemy().ability().getManaRegenReduction()).toFixed(2);
    });
    self.totalArmorPhysical = ko.pureComputed(function () {
        var armorAura = [self.inventory.getArmorAura, self.buffs.itemBuffs.getArmorAura].reduce(function (memo, fn) {
            var obj = fn(memo.attributes);
            return obj;
        }, {value:0, attributes:[]});
        var armorReduction = [self.enemy().inventory.getArmorReduction, self.debuffs.itemBuffs.getArmorReduction].reduce(function (memo, fn) {
            var obj = fn(memo.excludeList);
            obj.value += memo.value;
            return obj;
        }, {value: 0, excludeList: []});
        return (self.enemy().ability().getArmorBaseReduction() * self.debuffs.getArmorBaseReduction() * (self.heroData().armorphysical + self.totalAgi() * .14)
                + self.inventory.getArmor()
                //+ self.inventory.getArmorAura().value
                //+ self.enemy().inventory.getArmorReduction()
                + self.ability().getArmor()
                + TalentController.getArmor(self.selectedTalents())
                + self.enemy().ability().getArmorReduction()
                + self.buffs.getArmor()
                //+ self.buffs.itemBuffs.getArmor()
                + self.debuffs.getArmorReduction()
                //+ self.buffs.itemBuffs.getArmorAura().value
                + armorAura.value
                + armorReduction.value
                //+ self.debuffs.getArmorReduction()
                ).toFixed(2);
    });
    self.totalArmorPhysicalReduction = ko.pureComputed(function () {
        var totalArmor = self.totalArmorPhysical();
        if (totalArmor >= 0) {
            return ((0.06 * self.totalArmorPhysical()) / (1 + 0.06 * self.totalArmorPhysical()) * 100).toFixed(2);
        }
        else {
            return -((0.06 * -self.totalArmorPhysical()) / (1 + 0.06 * -self.totalArmorPhysical()) * 100).toFixed(2);
        }
    });
    self.spellAmp = ko.pureComputed(function () {
        return (self.totalInt() / 14
                + self.inventory.getSpellAmp()
                + self.ability().getSpellAmp()
                + TalentController.getSpellAmp(self.selectedTalents())
                + self.buffs.getSpellAmp()
                ).toFixed(2);
    });
    self.cooldownReductionFlat = ko.pureComputed(function () {
        return self.inventory.getCooldownReductionFlat()
                + self.ability().getCooldownReductionFlat()
                + TalentController.getCooldownReductionFlat(self.selectedTalents())
                + self.buffs.getCooldownReductionFlat()
                - self.enemy().inventory.getCooldownIncreaseFlat()
                - self.enemy().ability().getCooldownIncreaseFlat()
                - self.debuffs.getCooldownIncreaseFlat()
                - self.debuffs.itemBuffs.getCooldownIncreaseFlat();
    });
    self.cooldownReductionProduct = ko.pureComputed(function () {
        return self.inventory.getCooldownReductionPercent().value
                * self.ability().getCooldownReductionPercent()
                * TalentController.getCooldownReductionPercent(self.selectedTalents())
                * self.buffs.getCooldownReductionPercent()
                * self.enemy().inventory.getCooldownIncreasePercent()
                * self.enemy().ability().getCooldownIncreasePercent()
                * self.debuffs.getCooldownIncreasePercent()
                * self.debuffs.itemBuffs.getCooldownIncreasePercent();
    });
    self.cooldownReductionPercent = ko.pureComputed(function () {
        return ((1 - self.cooldownReductionProduct()) * 100).toFixed(2);
    });
    self.totalMovementSpeed = ko.pureComputed(function () {
        var MIN_MOVESPEED = 100;
        var ms = (self.ability().setMovementSpeed() > 0 ? self.ability().setMovementSpeed() : self.buffs.setMovementSpeed());
        if (ms > 0) {
            return ms;
        }
        else {
            var movementSpeedFlat = [self.inventory.getMovementSpeedFlat, self.buffs.itemBuffs.getMovementSpeedFlat].reduce(function (memo, fn) {
                var obj = fn(memo.excludeList);
                obj.value += memo.value;
                return obj;
            }, {value:0, excludeList:[]});
            var movementSpeedPercent = [self.inventory.getMovementSpeedPercent, self.buffs.itemBuffs.getMovementSpeedPercent].reduce(function (memo, fn) {
                var obj = fn(memo.excludeList);
                obj.value += memo.value;
                return obj;
            }, {value:0, excludeList:[]});
            var movementSpeedPercentReduction = [self.enemy().inventory.getMovementSpeedPercentReduction, self.debuffs.itemBuffs.getMovementSpeedPercentReduction].reduce(function (memo, fn) {
                var obj = fn(memo.excludeList);
                obj.value += memo.value;
                return obj;
            }, {value:0, excludeList:[]});
            return Math.max(
                self.enemy().inventory.isSheeped() || self.debuffs.itemBuffs.isSheeped() ? 140 :
                (self.heroData().movementspeed + movementSpeedFlat.value + self.ability().getMovementSpeedFlat() + TalentController.getMovementSpeedFlat(self.selectedTalents())) * 
                (1 //+ self.inventory.getMovementSpeedPercent() 
                   + movementSpeedPercent.value
                   + movementSpeedPercentReduction.value
                   + self.ability().getMovementSpeedPercent() 
                   //+ self.enemy().inventory.getMovementSpeedPercentReduction() 
                   + self.enemy().ability().getMovementSpeedPercentReduction() 
                   + self.buffs.getMovementSpeedPercent() 
                   + self.debuffs.getMovementSpeedPercentReduction()
                   + self.unit().ability().getMovementSpeedPercent() 
                )
            , MIN_MOVESPEED).toFixed(2);
        }
    });
    self.totalTurnRate = ko.pureComputed(function () {
        return (self.heroData().movementturnrate 
                * (1 + self.enemy().ability().getTurnRateReduction()
                     + self.debuffs.getTurnRateReduction())).toFixed(2);
    });
    self.baseDamage = ko.pureComputed(function () {
        var totalAttribute = self.totalAttribute(self.primaryAttribute()),
            abilityBaseDamage = self.ability().getBaseDamage(),
            minDamage = self.heroData().attackdamagemin,
            maxDamage = self.heroData().attackdamagemax;
        return [Math.floor((minDamage + totalAttribute + abilityBaseDamage.total) * self.ability().getSelfBaseDamageReductionPct() * self.enemy().ability().getBaseDamageReductionPct() * self.debuffs.getBaseDamageReductionPct() * self.debuffs.itemBuffs.getBaseDamageReductionPct() * abilityBaseDamage.multiplier),
                Math.floor((maxDamage + totalAttribute + abilityBaseDamage.total) * self.ability().getSelfBaseDamageReductionPct() * self.enemy().ability().getBaseDamageReductionPct() * self.debuffs.getBaseDamageReductionPct() * self.debuffs.itemBuffs.getBaseDamageReductionPct() * abilityBaseDamage.multiplier)];
    });
    self.baseDamageAvg = ko.pureComputed(function () {
        return (self.baseDamage()[0] + self.baseDamage()[1]) / 2;
    });
    self.baseDamageMin = ko.pureComputed(function () {
        return self.baseDamage()[0];
    });
    self.baseDamageMax = ko.pureComputed(function () {
        return self.baseDamage()[1];
    });
    self.bonusDamage = ko.pureComputed(function () {
        return ((self.inventory.getBonusDamage().total
                + self.ability().getBonusDamage().total
                + TalentController.getBonusDamage(self.selectedTalents()).total
                + self.buffs.getBonusDamage().total
                + Math.floor((self.baseDamage()[0] + self.baseDamage()[1]) / 2 
                              * (self.buffs.itemBuffs.getBonusDamagePercent(self.inventory.getBonusDamagePercent()).total
                                 + self.ability().getBonusDamagePercent().total
                                 + self.buffs.getBonusDamagePercent().total
                                )
                            )
                + Math.floor(
                    (self.heroData().attacktype == 'DOTA_UNIT_CAP_RANGED_ATTACK' 
                        ? ((self.heroId() == 'drow_ranger') ? self.ability().getBonusDamagePrecisionAura().total[0] * self.totalAgi() : self.buffs.getBonusDamagePrecisionAura().total[1])
                        : 0)
                  )
                + Math.floor(
                    ((self.heroId() == 'riki') ? self.ability().getBonusDamageBackstab().total[0] * self.totalAgi() : 0)
                  )
                ) * self.ability().getSelfBaseDamageReductionPct()
                  * self.enemy().ability().getBaseDamageReductionPct()
                  * self.debuffs.itemBuffs.getBaseDamageReductionPct());
    });
    self.bonusDamageReduction = ko.pureComputed(function () {
        return Math.abs(self.enemy().ability().getBonusDamageReduction() + self.debuffs.getBonusDamageReduction());
    });
    self.damageAvg = ko.pureComputed(function () {
        return (self.baseDamage()[0] + self.baseDamage()[1]) / 2 + self.bonusDamage();
    });
    self.damageMin = ko.pureComputed(function () {
        return self.baseDamage()[0] + self.bonusDamage();
    });
    self.damageMax = ko.pureComputed(function () {
        return self.baseDamage()[1] + self.bonusDamage();
    });
    self.damage = ko.pureComputed(function () {
        return [self.baseDamage()[0] + self.bonusDamage(),
                self.baseDamage()[1] + self.bonusDamage()];
    });
    self.totalMagicResistanceProduct = ko.pureComputed(function () {
        return (1 - self.heroData().magicalresistance / 100) 
                * self.inventory.getMagicResist()
                * self.ability().getMagicResist()
                * TalentController.getMagicResist(self.selectedTalents())
                * self.buffs.getMagicResist()
                * self.inventory.getMagicResistReductionSelf()
                * self.enemy().inventory.getMagicResistReduction()
                * self.enemy().ability().getMagicResistReduction()
                * self.debuffs.getMagicResistReduction()
                * self.debuffs.itemBuffs.getMagicResistReduction();
    });
    self.totalMagicResistance = ko.pureComputed(function () {
        return ((1 - self.totalMagicResistanceProduct()) * 100).toFixed(2);
    });
    self.bat = ko.pureComputed(function () {
        var abilityBAT = self.ability().getBAT();
        if (abilityBAT > 0) {
            return abilityBAT;
        }
        return self.heroData().attackrate;
    });
    self.ias = ko.pureComputed(function () {
        var attackSpeed = [self.inventory.getAttackSpeed].reduce(function (memo, fn) {
            var obj = fn(memo.excludeList);
            obj.value += memo.value;
            return obj;
        }, {value:0, excludeList:[]});
        var attackSpeedAura = [self.inventory.getAttackSpeedAura, self.buffs.itemBuffs.getAttackSpeedAura].reduce(function (memo, fn) {
            var obj = fn(memo.excludeList);
            obj.value += memo.value;
            return obj;
        }, {value: 0, excludeList: []});
        var attackSpeedReduction = [self.enemy().inventory.getAttackSpeedReduction, self.debuffs.itemBuffs.getAttackSpeedReduction].reduce(function (memo, fn) {
            var obj = fn(memo.excludeList);
            obj.value += memo.value;
            return obj;
        }, {value:0, excludeList: []});
        var val = parseFloat(self.totalAgi()) 
                //+ self.inventory.getAttackSpeed() 
                + attackSpeed.value
                + attackSpeedAura.value
                + attackSpeedReduction.value
                //+ self.enemy().inventory.getAttackSpeedReduction() 
                + self.ability().getAttackSpeed() 
                + TalentController.getAttackSpeed(self.selectedTalents()) 
                + self.enemy().ability().getAttackSpeedReduction() 
                + self.buffs.getAttackSpeed() 
                + self.debuffs.getAttackSpeedReduction()
                + self.unit().ability().getAttackSpeed(); 
        if (val < -80) {
            return -80;
        }
        else if (val > 500) {
            return 500;
        }
        return val.toFixed(2);
    });
    self.attackTime = ko.pureComputed(function () {
        return (self.bat() / (1 + self.ias() / 100)).toFixed(2);
    });
    self.attacksPerSecond = ko.pureComputed(function () {
        return ((1 + self.ias() / 100) / self.bat()).toFixed(2);
    });
    self.evasion = ko.pureComputed(function () {
        if (self.enemy().inventory.isSheeped() || self.debuffs.itemBuffs.isSheeped()) return 0;
        var e = self.ability().setEvasion();
        if (e) {
            return (e * 100).toFixed(2);
        }
        else {
            return (
                (
                    1 - (
                        self.inventory.getEvasion()
                        * self.ability().getEvasion()
                        * self.ability().getEvasionBacktrack()
                        * TalentController.getEvasion(self.selectedTalents())
                        * self.buffs.itemBuffs.getEvasion()
                    )
                ) * 100
            ).toFixed(2);
        }
    });
    self.ehpPhysical = ko.pureComputed(function () {
        var evasion = self.enemy().inventory.isSheeped() || self.debuffs.itemBuffs.isSheeped() ? 1 : self.inventory.getEvasion() * self.ability().getEvasion() * self.buffs.itemBuffs.getEvasion();
        if (self.totalArmorPhysical() >= 0) {
            var ehp = self.health() * (1 + .06 * self.totalArmorPhysical());
        }
        else {
            var ehp = self.health() * (1 - .06 * self.totalArmorPhysical()) / (1 - .12 * self.totalArmorPhysical());
        }
        ehp /= (1 - (1 - (evasion * self.ability().getEvasionBacktrack())));
        ehp /= (1 - parseFloat(self.enemy().missChance()) / 100);
        ehp *= (self.inventory.activeItems().some(function (item) {return item.item == 'mask_of_madness';}) ? (1 / 1.3) : 1);
        ehp *= (1 / self.ability().getDamageReduction());
        ehp *= (1 / self.buffs.getDamageReduction());
        ehp *= (1 / self.enemy().ability().getDamageAmplification());
        ehp *= (1 / self.debuffs.getDamageAmplification());
        return ehp.toFixed(2);
    });
    self.ehpMagical = ko.pureComputed(function () {
        var ehp = self.health() / self.totalMagicResistanceProduct();
        ehp *= (self.inventory.activeItems().some(function (item) {return item.item == 'mask_of_madness';}) ? (1 / 1.3) : 1);
        ehp *= (1 / self.ability().getDamageReduction());
        ehp *= (1 / self.buffs.getDamageReduction());
        ehp *= (1 / self.ability().getEvasionBacktrack());
        ehp *= (1 / self.enemy().ability().getDamageAmplification());
        ehp *= (1 / self.debuffs.getDamageAmplification());
        return ehp.toFixed(2);
    });
    self.bash = ko.pureComputed(function () {
        var attacktype = self.heroData().attacktype;
        return ((1 - (self.inventory.getBash(attacktype) * self.ability().getBash())) * 100).toFixed(2);
    });
    
    self.critChance = ko.pureComputed(function () {
        return ((1 - (self.inventory.getCritChance() * self.ability().getCritChance())) * 100).toFixed(2);
    });

    HeroDamageMixin(self, itemData);
    
    /*self.critDamage = ko.computed(function () {
        self.critInfo();
        return 0;
    });*/
    self.missChance = ko.pureComputed(function () {
        var missDebuff = [self.enemy().inventory.getMissChance, self.debuffs.itemBuffs.getMissChance].reduce(function (memo, fn) {
            var obj = fn(memo.excludeList);
            obj.value *= memo.value;
            return obj;
        }, {value:1, excludeList:[]});
        return ((1 - (self.enemy().ability().getMissChance() * self.debuffs.getMissChance() * missDebuff.value)) * 100).toFixed(2);
    });
    self.totalattackrange = ko.pureComputed(function () {
        var attacktype = self.heroData().attacktype;
        return self.heroData().attackrange
             + self.ability().getAttackRange()
             + TalentController.getAttackRange(self.selectedTalents())
             + self.inventory.getAttackRange(attacktype).value;
    });
    self.visionrangeday = ko.pureComputed(function () {
        return (self.heroData().visiondaytimerange) * (1 + self.enemy().ability().getVisionRangePctReduction() + self.debuffs.getVisionRangePctReduction());
    });
    self.visionrangenight = ko.pureComputed(function () {
        return (self.heroData().visionnighttimerange + self.inventory.getVisionRangeNight() + self.ability().getVisionRangeNight()) * (1 + self.enemy().ability().getVisionRangePctReduction() + self.debuffs.getVisionRangePctReduction());
    });
    self.lifesteal = ko.pureComputed(function () {
        var total = self.inventory.getLifesteal()
                  + self.ability().getLifesteal()
                  + TalentController.getLifesteal(self.selectedTalents())
                  + self.buffs.getLifesteal();
        if (self.heroData().attacktype == 'DOTA_UNIT_CAP_MELEE_ATTACK') {
            var lifestealAura = [self.inventory.getLifestealAura, self.buffs.itemBuffs.getLifestealAura].reduce(function (memo, fn) {
                var obj = fn(memo.excludeList);
                obj.value += memo.value;
                return obj;
            }, {value: 0, excludeList: []});
            total += lifestealAura.value;
        }
        return (total).toFixed(2);
    });
    
    self.diffProperties = diffProperties;
    self.diff = {};

    for (var i = 0; i < self.diffProperties.length; i++) {
        var index = i;
        self.diff[self.diffProperties[index]] = self.getDiffFunction(self.diffProperties[index]);
    }
};

HeroModel.prototype.getDiffFunction = function (prop) {
    var self = this;
    return ko.computed(function () {
        if (prop == 'baseDamage') {
            return [self[prop]()[0] - self.heroCompare()[prop]()[0], self[prop]()[1] - self.heroCompare()[prop]()[1]];
        }
        else {
            return self[prop]() - self.heroCompare()[prop]();
        }
    }, this, { deferEvaluation: true });
}

HeroModel.prototype.getAbilityLevelMax = function (data) {
    if (data.abilitytype === 'DOTA_ABILITY_TYPE_ATTRIBUTES') {
        return 1;
    }
    else if (data.name === 'invoker_quas' || data.name === 'invoker_wex' || data.name === 'invoker_exort') {
        return 7;
    }
    else if (data.name === 'invoker_invoke') {
        return 1;
    }
    else if (data.name === 'earth_spirit_stone_caller' || data.name === 'ogre_magi_unrefined_fireblast' || data.name === 'monkey_king_mischief') {
        return 1;
    }
    else if (data.abilitytype === 'DOTA_ABILITY_TYPE_ULTIMATE' || data.name === 'keeper_of_the_light_recall' ||
             data.name === 'keeper_of_the_light_blinding_light' || data.name === 'ember_spirit_activate_fire_remnant' ||
             data.name === 'lone_druid_true_form_battle_cry') {
        return 3;
    }
    else if (data.name === 'puck_ethereal_jaunt'  || data.name === 'shadow_demon_shadow_poison_release' ||
             data.name === 'templar_assassin_trap' || data.name === 'spectre_reality') {
        return 0;
    }
    else if (data.name === 'invoker_cold_snap'  || data.name === 'invoker_ghost_walk' || data.name === 'invoker_tornado' || 
             data.name === 'invoker_emp' || data.name === 'invoker_alacrity' || data.name === 'invoker_chaos_meteor' || 
             data.name === 'invoker_sun_strike' || data.name === 'invoker_forge_spirit' || data.name === 'invoker_ice_wall' || 
             data.name === 'invoker_deafening_blast') {
        return 0;
    }
    else if (data.name === 'techies_minefield_sign' || data.name === 'techies_focused_detonate') {
        return 0;
    }
    else {
        return 4;
    }
};

HeroModel.prototype.toggleTalent = function (talentTier, talentIndex) {
    if (this.talents[talentTier]() === talentIndex) {
        this.talents[talentTier](-1);
    }
    else if (this.availableSkillPoints() > 0 || this.talents[talentTier]() == 1 - talentIndex) {
        if (parseInt(this.selectedHeroLevel()) >= talentTier * 5 + 10) {
            this.talents[talentTier](talentIndex);
        }
    }
}

module.exports = HeroModel;
},{"../AbilityModel":2,"../BuffViewModel":3,"../herocalc_knockout":17,"../inventory/InventoryViewModel":19,"./HeroDamageMixin":8,"./TalentController":11,"./diffProperties":12,"./nextLevelExp":14,"./totalExp":15}],10:[function(require,module,exports){
var HeroOption = function (name, displayname, hero) {
    this.heroName = name;
    this.heroDisplayName = displayname;
    this.hero = hero;
};

module.exports = HeroOption;
},{}],11:[function(require,module,exports){
module.exports = {
    getTalentById: function (talents, talentId) {
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name == talentId) {
                return ability;
            }
        }
    },
    getBonusDamage: function (talents) {
        var totalAttribute = 0;
        var sources = {};
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_attack_damage_')) {
                totalAttribute += ability.attributes[0].value[0];
                sources[ability.name] = {
                    'damage': ability.attributes[0].value[0],
                    'damageType': 'physical',
                    'displayname': ability.displayname
                }
            }
        }
        return { sources: sources, total: totalAttribute };
    },
    getHealth: function (talents) {
        var totalAttribute = 0;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_hp_') && !ability.name.startsWith('special_bonus_hp_regen_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
        }
        return totalAttribute;
    },
    getHealthRegen: function (talents) {
        var totalAttribute = 0;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_hp_regen_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
        }
        return totalAttribute;
    },
    getMana: function (talents) {
        var totalAttribute = 0;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_mp_') && !ability.name.startsWith('special_bonus_mp_regen_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
        }
        return totalAttribute;
    },
    getManaRegen: function (talents) {
        var totalAttribute = 0;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_mp_regen_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
        }
        return totalAttribute;
    },
    getArmor: function (talents) {
        var totalAttribute = 0;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_armor_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
        }
        return totalAttribute;
    },
    getSpellAmp: function (talents) {
        var totalAttribute = 0;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_spell_amplify_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
        }
        return totalAttribute;
    },
    getCooldownReductionFlat: function (talents) {
        var totalAttribute = 0;
        return totalAttribute;
    },
    getCooldownReductionPercent: function (talents) {
        var totalAttribute = 1;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_cooldown_reduction_')) {
                totalAttribute *= (1 - ability.attributes[0].value[0]/100);
            }
        }
        return totalAttribute;
    },
    getCooldownIncreaseFlat: function (talents) {
        var totalAttribute = 0;
        return totalAttribute;
    },
    getCooldownIncreasePercent: function (talents) {
        var totalAttribute = 1;
        return totalAttribute;
    },
    getMovementSpeedFlat: function (talents) {
        var totalAttribute = 0;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_movement_speed_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
        }
        return totalAttribute;
    },
    getAttackRange: function (talents) {
        var totalAttribute = 0;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_attack_range_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
        }
        return totalAttribute;
    },
    getAttackSpeed: function (talents) {
        var totalAttribute = 0;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_attack_speed_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
        }
        return totalAttribute;
    },
    getLifesteal: function (talents) {
        var totalAttribute = 0;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_lifesteal_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
        }
        return totalAttribute;
    },
    getEvasion: function (talents) {
        var totalAttribute = 1;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_evasion_')) {
                totalAttribute *= (1 - ability.attributes[0].value[0]/100);
            }
        }
        return totalAttribute;
    },
    getMagicResist: function (talents) {
        var totalAttribute = 1;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_magic_resistance_')) {
                totalAttribute *= (1 - ability.attributes[0].value[0]/100);
            }
        }
        return totalAttribute;
    },
    getRespawnReduction: function (talents) {
        var totalAttribute = 0;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_respawn_reduction_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
        }
        return totalAttribute;
    },
    getStrength: function (talents) {
        var totalAttribute = 0;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_strength_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
            else if (ability.name.startsWith('special_bonus_all_stats_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
        }
        return totalAttribute;
    },
    getAgility: function (talents) {
        var totalAttribute = 0;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_agility_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
            else if (ability.name.startsWith('special_bonus_all_stats_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
        }
        return totalAttribute;
    },
    getIntelligence: function (talents) {
        var totalAttribute = 0;
        for (var i = 0; i < talents.length; i++) {
            var ability = talents[i];
            if (ability.name.startsWith('special_bonus_intelligence_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
            else if (ability.name.startsWith('special_bonus_all_stats_')) {
                totalAttribute += ability.attributes[0].value[0];
            }
        }
        return totalAttribute;
    }
}
},{}],12:[function(require,module,exports){
var diffProperties = [
    'totalAgi',
    'totalInt',
    'totalStr',
    'health',
    'healthregen',
    'mana',
    'manaregen',
    'totalArmorPhysical',
    'totalArmorPhysicalReduction',
    'totalMovementSpeed',
    'totalTurnRate',
    'spellAmp',
    'cooldownReductionPercent',
    'baseDamage',
    'bonusDamage',
    'bonusDamageReduction',
    'damage',
    'totalMagicResistanceProduct',
    'totalMagicResistance',
    'bat',
    'ias',
    'attackTime',
    'attacksPerSecond',
    'evasion',
    'ehpPhysical',
    'ehpMagical',
    'bash',
    'critChance',
    //'critDamage',
    'missChance',
    'totalattackrange',
    'visionrangeday',
    'visionrangenight',
    'lifesteal'
];

module.exports = diffProperties;
},{}],13:[function(require,module,exports){
var HeroOption = require("./HeroOption");

var heroOptionsArray = {};

var init = function (heroData) {
    heroOptionsArray.items = [];
    for (var h in heroData) {
        heroOptionsArray.items.push(new HeroOption(h.replace('npc_dota_hero_', ''), heroData[h].displayname));
    }
    return heroOptionsArray.items;
}

heroOptionsArray.init = init;

module.exports = heroOptionsArray;
},{"./HeroOption":10}],14:[function(require,module,exports){
var nextLevelExp = [200, 300, 400, 500, 600, 615, 630, 645, 660, 675, 775, 1175, 1200, 1225, 1250, 1275, 1375, 1400, 1425, 1600, 1900, 2200, 2500, 2975, '&mdash;'];

module.exports = nextLevelExp;
},{}],15:[function(require,module,exports){
var totalExp = [0, 200, 500, 900, 1400, 2000, 2615, 3425, 3890, 4550, 5225, 6000, 7175, 8375, 9600, 10850, 12125, 13500, 14900, 16325, 17925, 19825, 22025, 24525, 27500];

module.exports = totalExp;
},{}],16:[function(require,module,exports){
var abilityData = {
    'alchemist_acid_spray': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'armor_reduction',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return -a;
            },
            returnProperty: 'armorReduction'
        }
    ],
    'alchemist_unstable_concoction': [
        {
            label: 'Brew Time',
            controlType: 'input'
        },
        {
            attributeName: 'max_damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a/5;
            }
        },
        {
            attributeName: 'max_stun',
            label: 'Total Stun',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a/5;
            }
        }
    ],
    'ancient_apparition_cold_feet': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'stun_duration',
            label: 'Total Stun',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            }
        }
    ],
    'ancient_apparition_ice_blast': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'dot_damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')+v*a;
            }
        }
    ],
    'antimage_mana_void': [
        {
            label: 'Enemy Missing Mana',
            controlType: 'input'
        },
        {
            attributeName: 'mana_void_damage_per_mana',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'axe_battle_hunger': [
        {
            label: 'Battle Hungered Enemies',
            controlType: 'input'
        },
        {
            attributeName: 'speed_bonus',
            label: 'Movement Speed Bonus',
            controlType: 'text',
            noLevel: true,
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'movementSpeedPct'
        },
        {
            attributeName: 'slow',
            label: 'Movement Speed Bonus',
            controlType: 'text',
            noLevel: true,
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'bane_nightmare': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        }
    ],
    'bane_fiends_grip': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'Enemy Max Mana',
            controlType: 'input'
        },
        {
            attributeName: 'fiend_grip_damage',
            label: 'Total Damage',
            controlType: 'text',
            controls: [0,1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (parent.inventory.hasScepter()) {
                    return v[0]*abilityModel.getAbilityAttributeValue(ability.attributes, 'fiend_grip_damage_scepter',ability.level());
                }
                else {
                    return v[0]*a;
                }
            }
        },
        {
            attributeName: 'fiend_grip_mana_drain',
            label: 'Total Mana Drain',
            controlType: 'text',
            controls: [0,1],
            noLevel: true,
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (parent.inventory.hasScepter()) {
                    return v[0]*v[1]*abilityModel.getAbilityAttributeValue(ability.attributes, 'fiend_grip_mana_drain_scepter',ability.level())/100;
                }
                else {
                    return v[0]*v[1]*a/100;
                }
            }
        }
    ],
    'batrider_sticky_napalm': [
        {
            label: 'Stacks',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Bonus Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'bonusDamage'
        },
        {
            attributeName: 'movement_speed_pct',
            label: 'Enemy Movement Speed Slow',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'movementSpeedPctReduction'
        },
        {
            attributeName: 'turn_rate_pct',
            label: 'Enemy Turn Rate Slow',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'turnRateReduction'
        }
    ],
    'batrider_firefly': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage_per_second',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'bloodseeker_rupture': [
        {
            label: 'Enemy Distance Traveled',
            controlType: 'input'
        },
        {
            attributeName: 'movement_damage_pct',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage') + v*a/100;
            }
        }
    ],
    'bristleback_viscous_nasal_goo': [
        {
            label: 'Stacks',
            controlType: 'input'
        },
        {
            attributeName: 'armor_per_stack',
            label: 'Enemy Armor Reduction',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return -v*a;
            },
            returnProperty: 'armorReduction'
        },
        {
            attributeName: 'move_slow_per_stack',
            label: '%SLOW:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return -(abilityModel.getAbilityAttributeValue(ability.attributes, 'base_move_slow',0)+v*a);
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'bristleback_quill_spray': [
        {
            label: 'Stacks',
            controlType: 'input'
        },
        {
            attributeName: 'quill_stack_damage',
            label: 'DAMAGE',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var total = abilityModel.getAbilityAttributeValue(ability.attributes, 'quill_base_damage',ability.level())+v*a,
                damage_cap = abilityModel.getAbilityAttributeValue(ability.attributes, 'max_damage',0);
                if (total > damage_cap) {
                    total = damage_cap;
                }
                return total;
            }
        }
    ],
    'bristleback_bristleback': [
        {
            label: 'Damage From',
            controlType: 'radio',
            controlValueType: 'string',
            controlOptions: [
                {text: 'Back', value: 'back'},
                {text: 'Side', value: 'side'}
            ]
        },
        {
            attributeName: 'back_damage_reduction',
            label: '%DAMAGE REDUCTION:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var ability = abilityModel.abilities().find(function(b) {
                    return b.name == 'bristleback_bristleback';
                });
                if (v == 'back') {
                    var total = abilityModel.getAbilityAttributeValue(ability.attributes, 'back_damage_reduction', ability.level());
                }
                else {
                    var total = abilityModel.getAbilityAttributeValue(ability.attributes, 'side_damage_reduction', ability.level());
                }
                return -total;
            },
            returnProperty: 'damageReduction'
        }
    ],
    'bristleback_warpath': [
        {
            label: 'Stacks',
            controlType: 'input'
        },
        {
            attributeName: 'damage_per_stack',
            label: 'BONUS DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v < 1) {
                    return 0;
                }
                else {
                    return abilityModel.getAbilityAttributeValue(ability.attributes, 'base_damage',ability.level())+(v-1)*a;
                }
            }
        },
        {
            attributeName: 'move_speed_per_stack',
            label: '%MOVEMENT:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v < 1) {
                    return 0;
                }
                else {
                    return abilityModel.getAbilityAttributeValue(ability.attributes, 'base_move_speed',ability.level())+(v-1)*a;
                }
            },
            returnProperty: 'movementSpeedPct'
        }
    ],
    'centaur_return': [
        {
            label: 'Strength',
            controlType: 'input'
        },
        {
            attributeName: 'strength_pct',
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityAttributeValue(ability.attributes, 'return_damage',ability.level()) + v*a/100;
            }
        }
    ],
    'centaur_stampede': [
        {
            label: 'Strength',
            controlType: 'input'
        },
        {
            attributeName: 'strength_damage',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'slow_movement_speed',
            label: 'Enemy Movement Speed Slow',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return -a;
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'clinkz_death_pact': [
        {
            label: 'Consumed Unit HP',
            controlType: 'input'
        },
        {
            attributeName: 'damage_gain_pct',
            label: 'BASE DAMAGE GAIN:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a/100;
            },
            returnProperty: 'baseDamage'
        },
        {
            attributeName: 'health_gain_pct',
            label: 'HEALTH GAIN:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a/100;
            },
            returnProperty: 'bonusHealth'
        }
    ],
    'crystal_maiden_frostbite': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        }
    ],
    'dark_seer_ion_shell': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage_per_second',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'dazzle_shadow_wave': [
        {
            label: 'Targets',
            controlType: 'input'
        },
        {
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        }
    ],
    'dazzle_weave': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'armor_per_second',
            label: 'ARMOR',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'armor'
        },
        {
            attributeName: 'armor_per_second',
            label: 'ARMOR REDUCTION:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return -v*a;
            },
            returnProperty: 'armorReduction'
        }
    ],
    'death_prophet_exorcism': [
        {
            label: 'Damage Dealt',
            controlType: 'input'
        },
        {
            attributeName: 'heal_percent',
            label: 'Total Armor',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a/100;
            }
        }
    ],
    'disruptor_static_storm': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var damagevalue = 0.25 * (130 + 40 * ability.level()) * (1/20),
                mult = (v*4)*((v*4)+1)/2;
                return damagevalue * mult;
            }
        }
    ],
    'doom_bringer_scorched_earth': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage_per_second',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'bonus_movement_speed_pct',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPct'
        },
        {
            attributeName: 'damage_per_second',
            label: 'HP REGEN:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'healthregen'
        }
    ],
    'doom_bringer_doom': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (parent.inventory.hasScepter()) {
                    return v*abilityModel.getAbilityAttributeValue(ability.attributes, 'damage_scepter',ability.level());
                }
                else {
                    return v*a;
                }
            }
        }
    ],
    'dragon_knight_elder_dragon_form': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'bonus_attack_range',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'attackrange'
        },
        {
            attributeName: 'bonus_movement_speed',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedFlat'
        }
    ],
    'drow_ranger_trueshot': [
        {
            label: 'Drow\'s Agility',
            controlType: 'input',
            display: 'buff'
        },
        {
            attributeName: 'trueshot_ranged_damage',
            label: 'DAMAGE BONUS:',
            ignoreTooltip: true,
            controlType: 'text',
            display: 'buff',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a/100;
            },
            returnProperty: 'bonusDamagePrecisionAura'
        }
    ],
    'earth_spirit_rolling_boulder': [
        {
            label: 'Using Stone',
            controlType: 'checkbox'
        },
        {
            attributeName: 'move_slow',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v) {
                    return -a;
                }
                else {
                    return 0;
                }
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'earthshaker_enchant_totem': [
        {
            label: 'Activated',
            controlType: 'checkbox'
        },
        {
            attributeName: 'totem_damage_percentage',
            label: 'DAMAGE',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v) {
                    return a;
                }
                else {
                    return 0;
                }
            },
            returnProperty: 'baseDamageMultiplier'
        }
    ],
    'earthshaker_echo_slam': [
        {
            label: 'Enemies in Range',
            controlType: 'input'
        },
        {
            attributeName: 'echo_slam_echo_damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'elder_titan_ancestral_spirit': [
        {
            label: 'HEROES PASSED THROUGH',
            controlType: 'input'
        },
        {
            label: 'CREEPS PASSED THROUGH',
            controlType: 'input'
        },
        {
            attributeName: 'damage_creeps',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            controls: [0,1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v[0]*abilityModel.getAbilityAttributeValue(ability.attributes, 'damage_heroes',ability.level()) + v[1]*a;
            },
            returnProperty: 'bonusDamage'
        },
        {
            attributeName: 'move_pct_creeps',
            label: '%BONUS SPEED:',
            ignoreTooltip: true,
            controlType: 'text',
            controls: [0,1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v[0]*abilityModel.getAbilityAttributeValue(ability.attributes, 'move_pct_heroes',ability.level()) + v[1]*a;
            },
            returnProperty: 'movementSpeedPct'
        }
    ],
    'elder_titan_earth_splitter': [
        {
            label: 'Enemy Max Health',
            controlType: 'input'
        },
        {
            attributeName: 'damage_pct',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a/100;
            }
        },
        {
            attributeName: 'slow_pct',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return -a;
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'enchantress_natures_attendants': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'heal',
            label: 'HEAL:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityAttributeValue(ability.attributes, 'wisp_count',ability.level())*v*a;
            }
        }
    ],
    'enigma_malefice': [
        {
            label: 'Hits',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'stun_duration',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'enigma_midnight_pulse': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'Enemy Max Health',
            controlType: 'input'
        },
        {
            attributeName: 'damage_percent',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            controls: [0,1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v[0]*v[1]*a/100;
            }
        }
    ],
    'enigma_black_hole': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'far_damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'near_damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'faceless_void_time_lock': [
        {
            attributeName: 'bonus_damage',
            label: '%MOVESPEED AS DAMAGE',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'bashBonusDamage'
        },
        {
            attributeName: 'duration',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            }
        },
        {
            attributeName: 'chance_pct',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'bash'
        }
    ],
    'gyrocopter_rocket_barrage': [
        {
            label: 'Rockets',
            controlType: 'input'
        },
        {
            attributeName: 'rockets_per_second',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            }
        },
        {
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        }
    ],
/*        'gyrocopter_homing_missile': [
        {
            label: 'Distance Traveled',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'gyrocopter_flak_cannon': [
        {
            label: 'Attacks',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],*/
    'huskar_burning_spear': [
        {
            label: 'Stacks',
            controlType: 'input'
        },
        {
            attributeName: 'health_cost',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        }
    ],
    'huskar_berserkers_blood': [
        {
            label: '%HP',
            controlType: 'input'
        },
        {
            attributeName: 'hp_threshold_max',
            label: 'Health at given %HP:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return parent.health()*v/100;
            }
        },
        {
            attributeName: 'hp_threshold_max',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            }
        },
        {
            attributeName: 'maximum_resistance',
            label: 'MAGIC RESISTANCE BONUS:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var v = Math.min(v, 100);
                v = Math.max(v, 10);
                var hp_threshold_max = abilityModel.getAbilityAttributeValue(ability.attributes, 'hp_threshold_max',0);
                var d = 100 - hp_threshold_max;
                var c = (v - hp_threshold_max) / d;
                c = 1 - c;
                return c*a;
            },
            returnProperty: 'magicResist'
        },
        {
            attributeName: 'maximum_attack_speed',
            label: 'ATTACK SPEED BONUS:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var v = Math.min(v, 100);
                v = Math.max(v, 10);
                var hp_threshold_max = abilityModel.getAbilityAttributeValue(ability.attributes, 'hp_threshold_max',0);
                var d = 100 - hp_threshold_max;
                var c = (v - hp_threshold_max) / d;
                c = 1 - c;
                return c*a;
            },
            returnProperty: 'attackspeed'
        }
    ],
    'huskar_life_break': [
        {
            label: 'Enemy Current HP',
            controlType: 'input'
        },
        {
            attributeName: 'health_damage',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            label: 'Huskar Current HP',
            controlType: 'input'
        },
        {
            attributeName: 'health_cost_percent',
            label: 'DAMAGE TAKEN:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'movespeed',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'invoker_quas': [
        {
            label: 'Instances',
            controlType: 'input'
        },
        /*{
            attributeName: 'bonus_strength',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'bonusStrength'
        },*/
        {
            attributeName: 'health_regen_per_instance',
            label: 'HP REGEN:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'healthregen'
        }
    ],
    'invoker_wex': [
        {
            label: 'Instances',
            controlType: 'input'
        },
        /*{
            attributeName: 'bonus_agility',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'bonusAgility'
        },*/
        {
            attributeName: 'move_speed_per_instance',
            label: '%MOVE SPEED:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'movementSpeedPct'
        },
        {
            attributeName: 'attack_speed_per_instance',
            label: '%ATTACK SPEED:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'attackspeed'
        }
    ],
    'invoker_exort': [
        {
            label: 'Instances',
            controlType: 'input'
        },
        /*{
            attributeName: 'bonus_intelligence',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'bonusInt'
        },*/
        {
            attributeName: 'bonus_damage_per_instance',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'bonusDamage'
        }
    ],
    'invoker_ghost_walk': [
        {
            label: 'Quas Level',
            controlType: 'input'
        },
        {
            attributeName: 'enemy_slow',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v == 0) {
                    return 0;
                }
                return abilityModel.getAbilityAttributeValue(ability.attributes, 'enemy_slow',v);
            },
            returnProperty: 'movementSpeedPctReduction'
        },
        {
            label: 'Wex Level',
            controlType: 'input',
            display: 'ability'
        },
        {
            attributeName: 'self_slow',
            label: 'Total Damage',
            controlType: 'text',
            display: 'ability',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v == 0) {
                    return 0;
                }
                return abilityModel.getAbilityAttributeValue(ability.attributes, 'self_slow',v);
            },
            returnProperty: 'movementSpeedPct'
        }
    ],
    'invoker_alacrity': [
        {
            label: 'Wex Level',
            controlType: 'input'
        },
        {
            attributeName: 'bonus_attack_speed',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v == 0) {
                    return 0;
                }
                return abilityModel.getAbilityAttributeValue(ability.attributes, 'bonus_attack_speed',v);
            },
            returnProperty: 'attackspeed'
        },
        {
            label: 'Exort Level',
            controlType: 'input',
        },
        {
            attributeName: 'bonus_damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v == 0) {
                    return 0;
                }
                return abilityModel.getAbilityAttributeValue(ability.attributes, 'bonus_damage',v);
            },
            returnProperty: 'bonusDamage'
        }
    ],
    'invoker_ice_wall': [
        {
            label: 'Quas Level',
            controlType: 'input'
        },
        {
            attributeName: 'slow',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v == 0) {
                    return 0;
                }
                return abilityModel.getAbilityAttributeValue(ability.attributes, 'slow',v);
            },
            returnProperty: 'movementSpeedPctReduction'
        },
        {
            label: 'Exort Level',
            controlType: 'input',
            display: 'ability'
        },
        {
            label: 'Duration',
            controlType: 'input',
            display: 'ability'
        },
        {
            attributeName: 'damage_per_second',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            display: 'ability',
            controls: [1,2],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v[0] == 0) {
                    return 0;
                }
                return abilityModel.getAbilityAttributeValue(ability.attributes, 'damage_per_second',v[0])*v[1];
            }
        }
    ],
    'jakiro_dual_breath': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*2 + 
                abilityModel.getAbilityAttributeValue(ability.attributes, 'burn_damage',ability.level())*v;
            }
        },
        {
            attributeName: 'slow_movement_speed_pct',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        },
        {
            attributeName: 'slow_attack_speed_pct',
            label: '%ATTACK SLOW:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'attackspeedreduction'
        }
    ],
    'jakiro_liquid_fire': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'slow_attack_speed_pct',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'attackspeedreduction'
        }
    ],
    'jakiro_macropyre': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'juggernaut_blade_fury': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        }
    ],
    'juggernaut_healing_ward': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'Max Health',
            controlType: 'input'
        },
        {
            attributeName: 'healing_ward_heal_amount',
            label: 'HEAL OVER TIME:',
            ignoreTooltip: true,
            controlType: 'text',
            controls: [0,1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v[0]*v[1]*a/100;
            }
        }
    ],
    'juggernaut_omni_slash': [
        {
            label: 'Jumps',
            controlType: 'input'
        },
        {
            label: 'MIN DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityAttributeValue(ability.attributes, 'omni_slash_damage',1)*v;
            }
        },
        {
            label: 'MAX DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityAttributeValue(ability.attributes, 'omni_slash_damage',2)*v;
            }
        }
    ],
    'keeper_of_the_light_illuminate': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage_per_second',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'keeper_of_the_light_mana_leak': [
        {
            label: 'Distance Moved',
            controlType: 'input'
        },
        {
            label: 'Enemy Max Mana',
            controlType: 'input'
        },
        {
            attributeName: 'mana_leak_pct',
            label: 'MANA LEAKED:',
            ignoreTooltip: true,
            controlType: 'text',
            controls: [0,1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v[0]/100*v[1]*a/100;
            }
        }
    ],
    'legion_commander_duel': [
        {
            label: 'Duel Wins',
            controlType: 'input'
        },
        {
            attributeName: 'reward_damage',
            label: 'Total Damage:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'bonusDamage'
        }
    ],
    'leshrac_pulse_nova': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'mana_cost_per_second',
            label: 'MANA COST:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'lich_chain_frost': [
        {
            label: 'Bounce Hits',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'slow_movement_speed',
            label: 'Enemy Movement Speed Slow',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        },
        {
            attributeName: 'slow_attack_speed',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'attackspeedreduction'
        }
    ],
    'life_stealer_feast': [
        {
            label: 'Enemy Current HP',
            controlType: 'input'
        },
        {
            attributeName: 'hp_leech_percent',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a/100;
            },
            returnProperty: 'bonusDamage'
        }
    ],
    'life_stealer_open_wounds': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'heal_percent',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'lifesteal'
        },
        {
            attributeName: 'slow_steps',
            label: '%SLOW:',
            ignoreTooltip: true,
            controlType: 'text',
            noLevel: true,
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityAttributeValue(ability.attributes, 'slow_steps',v+1);
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'lina_fiery_soul': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'fiery_soul_move_speed_bonus',
            label: 'Enemy Movement Speed Slow',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'movementSpeedPct'
        },
        {
            attributeName: 'fiery_soul_attack_speed_bonus',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'attackspeed'
        }
    ],
    'lion_mana_drain': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'mana_per_second',
            label: 'MANA DRAINED:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'luna_moon_glaive': [
        {
            label: 'Damage',
            controlType: 'input'
        },
        {
            attributeName: 'damage_reduction_percent',
            label: 'BOUNCE DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var result = [];
                for (var i = 1; i < 6; i++) {
                    result.push((v*Math.pow(a/100,i)).toFixed(2))
                }
                return result.join('<br>');
            }
        }
    ],
    'luna_eclipse': [
        {
            label: 'Beam Count',
            controlType: 'input'
        },
        {
            attributeName: 'beams',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var lucentBeamAbility = abilityModel.abilities().find(function(b) {
                    return b.name == 'luna_lucent_beam';
                });
                if (lucentBeamAbility.level() == 0) return 0;
                var damage = abilityModel.getAbilityPropertyValue(lucentBeamAbility, 'damage');
                return v*damage;
            }
        }
    ],
    'medusa_mystic_snake': [
        {
            label: 'Jump Count',
            controlType: 'input'
        },
        {
            attributeName: 'snake_damage',
            label: 'Damage Per Jump:',
            ignoreTooltip: true,
            controlType: 'method',
            display: 'none',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var snake_jumps = abilityModel.getAbilityAttributeValue(ability.attributes, 'snake_jumps',ability.level());
                var snake_scale = abilityModel.getAbilityAttributeValue(ability.attributes, 'snake_scale',0);
                var damage = [];
                for (var i = 0; i < snake_jumps; i++) {
                    damage.push(a + a * i * snake_scale/100);
                }
                return damage;
            }
        },
        {
            attributeName: 'snake_damage',
            label: 'Damage Per Jump:',
            ignoreTooltip: true,
            controlType: 'text',
            controls: [0,1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v[1].join(' / ');
            }
        },
        {
            attributeName: 'snake_damage',
            label: 'Total Damage:',
            ignoreTooltip: true,
            controlType: 'text',
            controls: [0,1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v[1].slice(0, v[0]).reduce(function (memo, o) { return memo + o }, 0);
            }
        },
        {
            attributeName: 'snake_damage',
            label: 'Max Damage:',
            ignoreTooltip: true,
            controlType: 'text',
            controls: [0,1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v[1].reduce(function (memo, o) { return memo + o }, 0);
            }
        }
    ],
    'medusa_mana_shield': [
        {
            label: 'Damage',
            controlType: 'input'
        },
        {
            attributeName: 'damage_per_mana',
            label: 'MANA USED:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return (v/a).toFixed(2);
            }
        },
        {
            attributeName: 'absorption_tooltip',
            label: '%DAMAGE REDUCTION:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return -a;
            },
            returnProperty: 'damageReduction'
        }
    ],
    'meepo_poof': [
        {
            label: 'Meepo Count',
            controlType: 'input'
        },
        {
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        }
    ],
    'meepo_geostrike': [
        {
            label: 'Stacks',
            controlType: 'input'
        },
        {
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        },
        {
            attributeName: 'slow',
            label: '%SLOW:',
            ignoreTooltip: true,
            controlType: 'text',
            noLevel: true,
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityAttributeValue(ability.attributes, 'slow',ability.level())*v;
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'mirana_arrow': [
        {
            label: 'Arrow Travel Distance',
            controlType: 'input'
        },
        {
            attributeName: 'arrow_max_stun',
            label: 'STUN DURATION:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var arrow_min_stun = abilityModel.getAbilityAttributeValue(ability.attributes, 'arrow_min_stun',0);
                var arrow_max_stunrange = abilityModel.getAbilityAttributeValue(ability.attributes, 'arrow_max_stunrange',0);
                var scale = Math.min(v, arrow_max_stunrange) / arrow_max_stunrange;
                return Math.max(arrow_min_stun, Math.floor(a * scale / 0.1) * 0.1);
            }
        },
        {
            attributeName: 'arrow_bonus_damage',
            label: 'TOTAL DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var ability = ability;
                var damage = ko.utils.unwrapObservable(ability.damage)[ability.level()-1];
                var arrow_max_stunrange = abilityModel.getAbilityAttributeValue(ability.attributes, 'arrow_max_stunrange',0);
                var scale = Math.min(v, arrow_max_stunrange) / arrow_max_stunrange;
                var bonus_damage = Math.floor(a * scale / 2.8) * 2.8;
                return damage + ' + ' + bonus_damage + ' = ' + (damage + bonus_damage);
            }
        }
    ],
    'morphling_morph_agi': [
        {
            label: 'Shifts',
            controlType: 'input'
        },
        {
            attributeName: 'points_per_tick',
            label: 'AGI SHIFT GAIN:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'bonusAgility'
        },
        {
            attributeName: 'points_per_tick',
            label: 'STR SHIFT LOSS:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return -v*a;
            },
            returnProperty: 'bonusStrength'
        },
        {
            attributeName: 'bonus_attributes',
            label: 'SHIFT TIME:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'bonusAgility2'
        },
        {
            attributeName: 'morph_cooldown',
            label: 'SHIFT TIME:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'mana_cost',
            label: 'SHIFT MANA COST:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a*abilityModel.getAbilityAttributeValue(ability.attributes, 'morph_cooldown',ability.level());
            }
        }
    ],
    'morphling_morph_str': [
        {
            label: 'Shifts',
            controlType: 'input'
        },
        {
            attributeName: 'points_per_tick',
            label: 'STR SHIFT GAIN:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'bonusStrength'
        },
        {
            attributeName: 'points_per_tick',
            label: 'AGI SHIFT LOSS:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return -v*a;
            },
            returnProperty: 'bonusAgility'
        },
        {
            attributeName: 'bonus_attributes',
            label: 'SHIFT TIME:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'bonusStrength2'
        },
        {
            attributeName: 'morph_cooldown',
            label: 'SHIFT TIME:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'mana_cost',
            label: 'SHIFT MANA COST:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a*abilityModel.getAbilityAttributeValue(ability.attributes, 'morph_cooldown',ability.level());
            }
        }
    ],
    'furion_wrath_of_nature': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'necrolyte_heartstopper_aura': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'Enemy Max Health',
            controlType: 'input'
        },
        {
            attributeName: 'aura_damage',
            label: 'HEALTH LOST:',
            ignoreTooltip: true,
            controlType: 'text',
            controls: [0,1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v[0]*v[1]*a/100;
            }
        }
    ],
    'necrolyte_sadist': [
        {
            label: 'Unit Kills',
            controlType: 'input'
        },
        {
            label: 'Hero Kills',
            controlType: 'input'
        },
        {
            attributeName: 'health_regen',
            label: 'Total Damage',
            controlType: 'text',
            controls: [0,1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var hero_multiplier = abilityModel.getAbilityAttributeValue(ability.attributes, 'hero_multiplier',0)
                return (v[0]+v[1]*hero_multiplier)*a;
            },
            returnProperty: 'healthregen'
        },
        {
            attributeName: 'mana_regen',
            label: 'Total Damage',
            controlType: 'text',
            controls: [0,1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var hero_multiplier = abilityModel.getAbilityAttributeValue(ability.attributes, 'hero_multiplier',0)
                return (v[0]+v[1]*hero_multiplier)*a;
            },
            returnProperty: 'manaregen'
        }
    ],
    'night_stalker_crippling_fear': [
        {
            label: 'Is Night',
            controlType: 'checkbox'
        },
        {
            attributeName: 'miss_rate_night',
            label: '%CHANCE TO MISS:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v) {
                    return abilityModel.getAbilityAttributeValue(ability.attributes, 'miss_rate_night',ability.level());
                }
                else {
                    return abilityModel.getAbilityAttributeValue(ability.attributes, 'miss_rate_day',ability.level());
                }
            },
            returnProperty: 'missChance'
        }
    ],    
    'night_stalker_hunter_in_the_night': [
        {
            label: 'Is Night',
            controlType: 'checkbox'
        },
        {
            attributeName: 'bonus_attack_speed_night',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v) {
                    return a;
                }
                else {
                    return 0;
                }
            },
            returnProperty: 'attackspeed'
        },
        {
            attributeName: 'bonus_movement_speed_pct_night',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v) {
                    return a;
                }
                else {
                    return 0;
                }
            },
            returnProperty: 'movementSpeedPct'
        }
    ],    
    'obsidian_destroyer_arcane_orb': [
        {
            label: 'Current Mana',
            controlType: 'input'
        },
        {
            attributeName: 'mana_pool_damage_pct',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a/100;
            },
            returnProperty: 'bonusDamageOrb'
        }
    ],
    'ogre_magi_ignite': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'burn_damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'slow_movement_speed_pct',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'pudge_rot': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        },
        {
            attributeName: 'rot_slow',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'pudge_flesh_heap': [
        {
            label: 'Stacks',
            controlType: 'input'
        },
        {
            attributeName: 'flesh_heap_strength_buff_amount',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'bonusStrength'
        },
        {
            attributeName: 'flesh_heap_magic_resist',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'magicResist'
        }
    ],
    'pudge_dismember': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'dismember_damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'pugna_nether_ward': [
        {
            label: 'Enemy Mana Spent',
            controlType: 'input'
        },
        {
            attributeName: 'mana_multiplier',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'mana_regen',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'manaregenreduction'
        }
    ],
    'pugna_life_drain': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'health_drain',
            label: 'HEALTH DRAINED:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'queenofpain_shadow_strike': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'movement_slow',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        },
        {
            attributeName: 'strike_damage',
            label: 'Total Damage:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var duration_damage = abilityModel.getAbilityAttributeValue(ability.attributes, 'duration_damage',ability.level());
                var ticks = Math.floor(v/3);
                return a + duration_damage * ticks;
            }
        }
    ],
    'razor_plasma_field': [
        {
            label: 'Distance',
            controlType: 'input'
        },
        {
            attributeName: 'radius',
            label: 'MIN DISTANCE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return 200;
            }
        },
        {
            attributeName: 'radius',
            label: 'MAX DISTANCE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return 200 + a;
            }
        },
        {
            attributeName: 'radius',
            label: 'Instance Damage',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var max_radius = a + 200;
                var scale = (Math.min(Math.max(v, 200), max_radius) - 200) / (max_radius - 200);
                var damage_min = abilityModel.getAbilityAttributeValue(ability.attributes, 'damage_min',ability.level());
                var damage_max = abilityModel.getAbilityAttributeValue(ability.attributes, 'damage_max',ability.level());
                return damage_min + (damage_max - damage_min) * scale;
            }
        }
    ],
    'razor_static_link': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'drain_length',
            label: 'Damage Drained:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var tick_duration = Math.floor(v * 4) + 1;
                var ticks = Math.min(a * 4 + 1, tick_duration);
                var drain_rate = abilityModel.getAbilityAttributeValue(ability.attributes, 'drain_rate',ability.level());
                return ticks * drain_rate/4;
            },
            returnProperty: 'bonusDamage'
        },
        {
            attributeName: 'drain_length',
            label: 'Enemy Damage Lost:',
            ignoreTooltip: true,
            controlType: 'text',
            display: 'hidden',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var tick_duration = Math.floor(v * 4) + 1;
                var ticks = Math.min(a * 4 + 1, tick_duration);
                var drain_rate = abilityModel.getAbilityAttributeValue(ability.attributes, 'drain_rate',ability.level());
                return ticks * drain_rate/4;
            },
            returnProperty: 'bonusDamageReduction'
        }
    ],
    'razor_eye_of_the_storm': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'rubick_fade_bolt': [
        {
            label: 'Jumps',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a * (1 - v*abilityModel.getAbilityAttributeValue(ability.attributes, 'jump_damage_reduction_pct',ability.level())/100);
            }
        },
        {
            attributeName: 'hero_attack_damage_reduction',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'bonusDamageReduction'
        }
    ],
    'sandking_sand_storm': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        }
    ],
    'sandking_epicenter': [
        {
            label: 'Pulses',
            controlType: 'input'
        },
        {
            attributeName: 'epicenter_damage',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'epicenter_slow',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        },
        {
            attributeName: 'epicenter_slow_as',
            label: '%ATTACK SLOW:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'attackspeedreduction'
        }
    ],
    'shadow_demon_shadow_poison': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'stack_damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var stackmult = [1,2,4,8];
                if (v > 4) {
                    return a * stackmult[3] + 50 * (v - 4);
                }
                else if (v <= 0) {
                    return 0
                }
                else {
                    return a * stackmult[v-1]
                }
            }
        }
    ],
    'nevermore_necromastery': [
        {
            label: 'Souls',
            controlType: 'input'
        },
        {
            attributeName: 'necromastery_damage_per_soul',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var talent = TalentController.getTalentById(parent.selectedTalents(), 'special_bonus_unique_nevermore_1');
                if (talent) {
                    return v * (a + talent.attributes[0].value[0]);
                }
                else {
                    return v * a;
                }
            },
            returnProperty: 'bonusDamage'
        }
    ],
    'nevermore_requiem': [
        {
            label: 'Line Hit Count',
            controlType: 'input'
        },
        {
            attributeName: 'requiem_reduction_damage',
            label: 'Damage:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        },
        {
            label: 'Return Line Hit Count (Scepter)',
            controlType: 'input'
        },
        {
            attributeName: 'requiem_damage_pct_scepter',
            label: 'Damage/Heal:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v*a/100;
            }
        },
        {
            attributeName: 'requiem_damage_pct_scepter',
            label: 'Total Damage:',
            ignoreTooltip: true,
            controlType: 'text',
            controls: [0,1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var damage = abilityModel.getAbilityPropertyValue(ability, 'damage');
                return damage*v[0] + damage*v[1]*a/100;
            }
        },
        {
            attributeName: 'requiem_reduction_damage',
            label: '%DAMAGE REDUCTION:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'baseDamageReductionPct'
        },
        {
            attributeName: 'requiem_reduction_ms',
            label: '%DAMAGE REDUCTION:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'shadow_shaman_shackles': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        }
    ],
    'silencer_curse_of_the_silent': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return Math.floor(v)*a;
            }
        },
        {
            attributeName: 'movespeed',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
/*        'silencer_glaives_of_wisdom': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],*/
    'skywrath_mage_mystic_flare': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'slark_essence_shift': [
        {
            label: 'Attacks',
            controlType: 'input'
        },
        {
            attributeName: 'agi_gain',
            label: 'Total Damage',
            controlType: 'text',
            display: 'ability',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'bonusAgility'
        },
        {
            attributeName: 'stat_loss',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return -v*a;
            },
            returnProperty: 'bonusAllStatsReduction'
        }
    ],
    'slark_shadow_dance': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'bonus_regen_pct',
            label: 'TOTAL HEALTH REGENERATED:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*parent.health()*a/100;
            }
        },
        {
            attributeName: 'bonus_regen_pct',
            label: 'HEALTH GAINED PER SECOND:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return parent.health()*a/100;
            },
            returnProperty: 'healthregen'
        },
        {
            attributeName: 'bonus_movement_speed',
            label: '%MOVE SPEED:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPct'
        }
    ],
    'sniper_shrapnel': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'shrapnel_damage',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'slow_movement_speed',
            label: 'Enemy Movement Speed Slow',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'spectre_desolate': [
        {
            label: 'Enemy Alone',
            controlType: 'checkbox'
        },
        {
            attributeName: 'bonus_damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v) {
                    return a;
                }
                else {
                    return 0;
                }
            },
            returnProperty: 'bonusDamage'
        }
    ],
    'spectre_dispersion': [
        {
            label: 'Damage Taken',
            controlType: 'input'
        },
        {
            attributeName: 'damage_reflection_pct',
            label: 'DAMAGE REFLECTED:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return -a;
            },
            returnProperty: 'damageReduction'
        },
        {
            attributeName: 'damage_reflection_pct',
            label: 'DAMAGE REFLECTED:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a/100;
            }
        }
    ],
    'storm_spirit_ball_lightning': [
        {
            label: 'MAX MANA',
            controlType: 'input'
        },
        {
            label: 'Distance',
            controlType: 'input'
        },
        {
            attributeName: 'ball_lightning_initial_mana_base',
            label: 'Total Damage:',
            ignoreTooltip: true,
            controlType: 'text',
            controls: [0, 1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')/100*v[1];
            }
        },
        {
            attributeName: 'ball_lightning_initial_mana_base',
            label: 'FLAT MANA COST:',
            ignoreTooltip: true,
            controlType: 'method',
            controls: [0, 1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var distance_intervals = Math.floor(v[1]/100);
                var travel_cost_base = abilityModel.getAbilityAttributeValue(ability.attributes, 'ball_lightning_travel_cost_base',0);
                return a + distance_intervals * travel_cost_base;
            }
        },
        {
            attributeName: 'ball_lightning_initial_mana_percentage',
            label: '%MAX MANA COST:',
            ignoreTooltip: true,
            controlType: 'method',
            controls: [0, 1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var distance_intervals = Math.floor(v[1]/100);
                var travel_cost_percent = abilityModel.getAbilityAttributeValue(ability.attributes, 'ball_lightning_travel_cost_percent',0);
                return a + distance_intervals * travel_cost_percent;
            }
        },
        {
            attributeName: 'ball_lightning_initial_mana_base',
            label: 'TOTAL MANA COST:',
            ignoreTooltip: true,
            controlType: 'text',
            controls: [0, 1, 2, 3],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v[2] + ' + ' + (v[3]/100 * v[0]) + ' (' + v[3] + '% of max) = ' + (v[2] + v[3]/100 * v[0]);
            }
        }
    ],
    'templar_assassin_psionic_trap': [
        {
            label: 'Charge Time',
            controlType: 'input'
        },
        {
            attributeName: 'movement_speed_min_tooltip',
            label: '%MOVE SLOW:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var max_slow = abilityModel.getAbilityAttributeValue(ability.attributes, 'movement_speed_max_tooltip',0);
                var slow_per_tick = (max_slow - a)/40;
                return -(a + slow_per_tick * Math.min(Math.max(0, v), 4) * 10);
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'shredder_reactive_armor': [
        {
            label: 'Stacks',
            controlType: 'input'
        },
        {
            attributeName: 'bonus_armor',
            label: 'Total Armor Bonus',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'armor'
        },
        {
            attributeName: 'bonus_hp_regen',
            label: 'Total HP Regen Bonus',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'healthregen'
        }
    ],
    'shredder_chakram': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage_per_second',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var interval = abilityModel.getAbilityAttributeValue(ability.attributes, 'damage_interval',0);
                var ticks = Math.floor(v / interval);
                return a*interval*ticks;
            }
        },
        {
            attributeName: 'mana_per_second',
            label: 'MANA COST:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var interval = abilityModel.getAbilityAttributeValue(ability.attributes, 'damage_interval',0);
                var ticks = Math.floor(v / interval);
                return a*interval*ticks;
            }
        },
        {
            label: 'ENEMY %HP',
            controlType: 'input'
        },
        {
            attributeName: 'slow',
            label: 'MANA COST:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var ticks = 20 - Math.floor(Math.min(Math.max(v-1, 0), 99) / 5);
                return -a*ticks;
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'spirit_breaker_greater_bash': [
        {
            label: 'Bash Proc',
            controlType: 'checkbox'
        },
        {
            attributeName: 'damage',
            label: '%MOVESPEED AS DAMAGE',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v) {
                    return a;
                }
                else {
                    return 0;
                }
            },
            returnProperty: 'bashBonusDamage'
        },
        {
            attributeName: 'bonus_movespeed_pct',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (v) {
                    return a;
                }
                else {
                    return 0;
                }
            },
            returnProperty: 'movementSpeedPct'
        },
        {
            attributeName: 'chance_pct',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a
            },
            returnProperty: 'bash'
        }
    ],
    'techies_land_mines': [
        {
            label: 'Number of Mines',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'damage',
            label: 'AFTER REDUCTIONS:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var phys_reduction = parent.enemy().totalArmorPhysicalReduction(),
                    magic_reduction = parent.enemy().totalMagicResistance();
                return (v * a * (1 - phys_reduction / 100) * (1 - magic_reduction / 100)).toFixed(2);
            }
        }
    ],
    'techies_suicide': [
        {
            attributeName: 'damage',
            label: 'FULL DAMAGE AFTER REDUCTIONS:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var phys_reduction = parent.enemy().totalArmorPhysicalReduction(),
                    magic_reduction = parent.enemy().totalMagicResistance();
                return (a * (1 - phys_reduction / 100) * (1 - magic_reduction / 100)).toFixed(2);
            }
        },
        {
            attributeName: 'partial_damage',
            label: 'PARTIAL DAMAGE AFTER REDUCTIONS:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var phys_reduction = parent.enemy().totalArmorPhysicalReduction(),
                    magic_reduction = parent.enemy().totalMagicResistance();
                return (a * (1 - phys_reduction / 100) * (1 - magic_reduction / 100)).toFixed(2);
            }
        },
        {
            attributeName: 'damage',
            label: 'RESPAWN TIME:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return (parent.respawnTime() / 2).toFixed(0) + ' seconds';
            }
        }
    ],
    'techies_remote_mines': [
        {
            label: 'Number of Mines',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'damage',
            label: 'AFTER REDUCTIONS:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var magic_reduction = parent.enemy().totalMagicResistance();
                return (v * a * (1 - magic_reduction / 100)).toFixed(2);
            }
        }
    ],
    'tinker_march_of_the_machines': [
        {
            label: 'Robot Explosions',
            controlType: 'input'
        },
        {
            attributeName: 'machines_per_sec',
            label: 'TOTAL DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        }
    ],
    'treant_leech_seed': [
        {
            label: 'Pulses',
            controlType: 'input'
        },
        {
            attributeName: 'leech_damage',
            label: 'DAMAGE/HEAL:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'movement_slow',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'troll_warlord_fervor': [
        {
            label: 'Stacks',
            controlType: 'input'
        },
        {
            attributeName: 'attack_speed',
            label: 'ATTACK SPEED:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            },
            returnProperty: 'attackspeed'
        }
    ],
    'undying_decay': [
        {
            label: 'Stacks',
            controlType: 'input'
        },
        {
            attributeName: 'str_steal',
            label: 'STRENGTH STOLEN:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                if (parent.inventory.hasScepter()) {
                    var str_steal_scepter = abilityModel.getAbilityAttributeValue(ability.attributes, 'str_steal_scepter',0);
                    return v*str_steal_scepter;
                }
                else {
                    return v*a;
                }
            },
            returnProperty: 'bonusStrength'
        },
    ],
    'undying_soul_rip': [
        {
            label: 'Units',
            controlType: 'input'
        },
        {
            attributeName: 'damage_per_unit',
            label: 'DAMAGE/HEAL:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'undying_flesh_golem': [
        {
            label: 'Distance',
            controlType: 'input'
        },
        {
            attributeName: 'max_speed_slow',
            label: '%MOVE SLOW:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var min_speed_slow = abilityModel.getAbilityAttributeValue(ability.attributes, 'min_speed_slow', 0);
                var radius = abilityModel.getAbilityAttributeValue(ability.attributes, 'radius', 0);
                var full_power_radius = abilityModel.getAbilityAttributeValue(ability.attributes, 'full_power_radius', 0);
                var distance = Math.min(Math.max(v, full_power_radius), radius);
                var scale = 1 - (distance - full_power_radius) / (radius - full_power_radius);
                return -Math.max(scale * a, min_speed_slow);
            },
            returnProperty: 'movementSpeedPctReduction'
        },
        {
            attributeName: 'max_damage_amp',
            label: '%DAMAGE AMP:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var min_damage_amp = abilityModel.getAbilityAttributeValue(ability.attributes, 'min_damage_amp', 0);
                var radius = abilityModel.getAbilityAttributeValue(ability.attributes, 'radius', 0);
                var full_power_radius = abilityModel.getAbilityAttributeValue(ability.attributes, 'full_power_radius', 0);
                var distance = Math.min(Math.max(v, full_power_radius), radius);
                var scale = 1 - (distance - full_power_radius) / (radius - full_power_radius);
                return Math.max(scale * a, min_damage_amp);
            },
            returnProperty: 'damageAmplification'
        },
        {
            label: 'MAX HP',
            controlType: 'input'
        },
        {
            label: 'Hero Death Count',
            controlType: 'input'
        },
        {
            label: 'Creep Death Count',
            controlType: 'input'
        },
        {
            attributeName: 'death_heal',
            label: 'DEATH HEAL (HEROES):',
            ignoreTooltip: true,
            controlType: 'method',
            controls: [1, 2],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v[0]*v[1]*a/100;
            }
        },
        {
            attributeName: 'death_heal_creep',
            label: 'DEATH HEAL (CREEPS):',
            ignoreTooltip: true,
            controlType: 'method',
            controls: [1, 3],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v[0]*v[1]*a/100;
            }
        },
        {
            attributeName: 'death_heal_creep',
            label: 'TOTAL DEATH HEAL:',
            ignoreTooltip: true,
            controlType: 'text',
            controls: [4, 5],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v[0]+v[1];
            }
        }
    ],
    'ursa_fury_swipes': [
        {
            label: 'Stacks',
            controlType: 'input'
        },
        {
            attributeName: 'damage_per_stack',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var enrageAbility = abilityModel.abilities().find(function(b) {
                    return b.name == 'ursa_enrage';
                });
                if (enrageAbility.isActive() && enrageAbility.level() > 0) {
                    var enrage_multiplier = abilityModel.getAbilityAttributeValue(enrageAbility.attributes, 'enrage_multiplier', enrageAbility.level());
                    return v*a*enrage_multiplier;
                }
                return v*a;
            },
            returnProperty: 'bonusDamage'
        }
    ],
    'ursa_enrage': [
        {
            attributeName: 'damage_reduction',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return -a;
            },
            returnProperty: 'damageReduction'
        }
    ],
    'venomancer_venomous_gale': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'tick_damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityAttributeValue(ability.attributes, 'strike_damage',ability.level()) + Math.floor(v/3)*a;
            }
        },
        {
            attributeName: 'movement_slow',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'venomancer_poison_sting': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'movement_speed',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'venomancer_poison_nova': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'viper_poison_attack': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'bonus_movement_speed',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        },
        {
            attributeName: 'bonus_attack_speed',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'attackspeedreduction'
        }
    ],
    'viper_corrosive_skin': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'bonus_movement_speed',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        },
        {
            attributeName: 'bonus_attack_speed',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'attackspeedreduction'
        },
        {
            attributeName: 'bonus_magic_resistance',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'magicResist'
        }
    ],
    'viper_viper_strike': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'bonus_movement_speed',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'movementSpeedPctReduction'
        },
        {
            attributeName: 'bonus_attack_speed',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'attackspeedreduction'
        }
    ],
    'visage_soul_assumption': [
        {
            label: 'Charges',
            controlType: 'input'
        },
        {
            attributeName: 'soul_charge_damage',
            label: 'Total Damage:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var soul_base_damage = abilityModel.getAbilityAttributeValue(ability.attributes, 'soul_base_damage',0);
                var stack_limit = abilityModel.getAbilityAttributeValue(ability.attributes, 'stack_limit', ability.level());
                stack_limit = Math.max(Math.min(v, stack_limit), 0);
                return soul_base_damage + stack_limit*a;
            }
        }
    ],
    'visage_gravekeepers_cloak': [
        {
            label: 'Layers',
            controlType: 'input'
        },
        {
            attributeName: 'damage_reduction',
            label: 'DAMAGE REDUCTION:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return -v*a;
            },
            returnProperty: 'damageReduction'
        }
    ],
    'warlock_shadow_word': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        }
    ],
    'warlock_upheaval': [
        {
            label: 'Channel Duration',
            controlType: 'input'
        },
        {
            attributeName: 'slow_rate_duration',
            label: '%MOVE SLOW:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var max_slow = abilityModel.getAbilityAttributeValue(ability.attributes, 'max_slow',0);
                var slow_per_tick = max_slow / (a - 0.5) / 2;
                var ticks = Math.max(Math.floor(v * 2) - 1, 0);
                return -Math.min(ticks * slow_per_tick, max_slow);
            },
            returnProperty: 'movementSpeedPctReduction'
        }
    ],
    'weaver_the_swarm': [
        {
            label: 'Attacks',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'armor_reduction',
            label: 'DAMAGE:',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return -v*a;
            },
            returnProperty: 'armorReduction'
        }
    ],
    'windrunner_powershot': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*v;
            }
        }
    ],
    'winter_wyvern_cold_embrace': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            label: 'Ally Max Health',
            controlType: 'input'
        },
        {
            attributeName: 'heal_percentage',
            label: 'TOTAL HEAL:',
            ignoreTooltip: true,
            controlType: 'text',
            controls: [0,1],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var base_heal = abilityModel.getAbilityAttributeValue(ability.attributes, 'heal_additive',ability.level());
                return (base_heal + v[1] * a/100) * v[0];
            }
        }
    ],
    'wisp_spirits': [
        {
            label: 'Collision Count',
            controlType: 'input'
        },
        {
            attributeName: 'hero_damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'creep_damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'wisp_overcharge': [
        {
            label: 'Current HP',
            controlType: 'input'
        },
        {
            attributeName: 'drain_pct',
            label: 'HP DRAINED:',
            ignoreTooltip: true, 
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            label: 'Current MP',
            controlType: 'input'
        },
        {
            attributeName: 'drain_pct',
            label: 'MP DRAINED:',
            ignoreTooltip: true, 
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        },
        {
            attributeName: 'bonus_attack_speed',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'attackspeed'
        },
        {
            attributeName: 'bonus_damage_pct',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return a;
            },
            returnProperty: 'damageReduction'
        }
    ],
    'witch_doctor_paralyzing_cask': [
        {
            label: 'Hero Bounce Count',
            controlType: 'input'
        },
        {
            attributeName: 'hero_damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var bounces = abilityModel.getAbilityAttributeValue(ability.attributes, 'bounces',ability.level());
                return Math.min(Math.max(v, 0), bounces)*a;
            }
        },
        {
            label: 'Creep Bounce Count',
            controlType: 'input'
        },
        {
            attributeName: 'hero_damage',
            label: 'CREEP DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var bounces = abilityModel.getAbilityAttributeValue(ability.attributes, 'bounces',ability.level());
                var damage = abilityModel.getAbilityPropertyValue(ability, 'damage');
                return Math.min(Math.max(v, 0), bounces)*damage;
            }
        }
    ],
    'witch_doctor_voodoo_restoration': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'heal',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var interval = abilityModel.getAbilityAttributeValue(ability.attributes, 'heal_interval',ability.level());
                var heal_per_tick = a * interval;
                var ticks = Math.max(Math.floor(v / interval) - 1, 0);
                return heal_per_tick * ticks;
            }
        },
        {
            attributeName: 'mana_per_second',
            label: 'MANA COST:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var interval = abilityModel.getAbilityAttributeValue(ability.attributes, 'heal_interval',ability.level());
                var mana_per_tick = a * interval;
                var ticks = Math.max(Math.floor(v / interval) - 1, 0);
                return mana_per_tick * ticks;
            }
        }
    ],
    'witch_doctor_maledict': [
        {
            label: 'damage 0-4s',
            controlType: 'input'
        },
        {
            label: 'damage 4-8s',
            controlType: 'input'
        },
        {
            label: 'damage 8-12s',
            controlType: 'input'
        },
        {
            attributeName: 'bonus_damage',
            label: 'Dot Damage after 3s:',
            ignoreTooltip: true,
            controlType: 'method',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var damage = abilityModel.getAbilityPropertyValue(ability, 'damage');
                return 3*damage;
            }
        },
        {
            attributeName: 'bonus_damage',
            label: 'Burst Damage at 4s:',
            ignoreTooltip: true,
            controlType: 'method',
            controls: [0, 3],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var damage = abilityModel.getAbilityPropertyValue(ability, 'damage');
                var d = v.reduce(function (memo, o) { return memo + o }, 0);
                return Math.max(d, 0) * a/100;
            }
        },
        {
            attributeName: 'bonus_damage',
            label: 'Dot Damage after 7s:',
            ignoreTooltip: true,
            controlType: 'method',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var damage = abilityModel.getAbilityPropertyValue(ability, 'damage');
                return 7*damage;
            }
        },
        {
            attributeName: 'bonus_damage',
            label: 'Burst Damage at 8s:',
            ignoreTooltip: true,
            controlType: 'method',
            controls: [0, 1, 4, 5],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var damage = abilityModel.getAbilityPropertyValue(ability, 'damage');
                var d = v.reduce(function (memo, o) { return memo + o }, 0);
                return Math.max(d, 0) * a/100;
            }
        },
        {
            attributeName: 'bonus_damage',
            label: 'Dot Damage after 11s:',
            ignoreTooltip: true,
            controlType: 'method',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var damage = abilityModel.getAbilityPropertyValue(ability, 'damage');
                return 11*damage;
            }
        },
        {
            attributeName: 'bonus_damage',
            label: 'Burst Damage at 12s:',
            ignoreTooltip: true,
            controlType: 'method',
            controls: [0, 1, 2, 4, 6, 7],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var damage = abilityModel.getAbilityPropertyValue(ability, 'damage');
                var d = v.reduce(function (memo, o) { return memo + o }, 0);
                return Math.max(d, 0) * a/100;
            }
        },
        {
            attributeName: 'bonus_damage',
            label: 'Total Burst Damage:',
            ignoreTooltip: true,
            controlType: 'method',
            controls: [4, 6, 8],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v.reduce(function (memo, o) { return memo + o }, 0);
            }
        },
        {
            attributeName: 'bonus_damage',
            label: 'Total Maledict Damage:',
            ignoreTooltip: true,
            controlType: 'method',
            controls: [9],
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var duration = abilityModel.getAbilityAttributeValue(ability.attributes, 'duration_tooltip',0);
                var damage = abilityModel.getAbilityPropertyValue(ability, 'damage');
                return damage * duration + v[0];
            }
        },
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'bonus_damage',
            label: 'DOT Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                var duration = abilityModel.getAbilityAttributeValue(ability.attributes, 'duration_tooltip',0);
                return abilityModel.getAbilityPropertyValue(ability, 'damage')*Math.min(Math.max(v, 0), duration);
            }
        }
    ],
    'witch_doctor_death_ward': [
        {
            label: 'Duration',
            controlType: 'input'
        },
        {
            attributeName: 'damage',
            label: 'Total Damage',
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a;
            }
        }
    ],
    'zuus_static_field': [
        {
            label: 'Enemy HP',
            controlType: 'input'
        },
        {
            attributeName: 'damage_health_pct',
            label: 'DAMAGE:',
            ignoreTooltip: true,
            controlType: 'text',
            fn: function (v, a, parent, index, abilityModel, ability, TalentController) {
                return v*a/100;
            }
        }
    ]
}

module.exports = abilityData;
},{}],17:[function(require,module,exports){
(function (global){
'use strict';
var ko = (typeof window !== "undefined" ? window['ko'] : typeof global !== "undefined" ? global['ko'] : null);

ko.mapping = require('../lib/knockout.mapping');
ko.wrap = require('../lib/knockout.wrap');

ko.extenders.numeric = function(target, opts) {
    //create a writable computed observable to intercept writes to our observable
    var result = ko.pureComputed({
        read: target,  //always return the original observables value
        write: function(newValue) {
            var current = target(),
                roundingMultiplier = Math.pow(10, (opts === Object(opts) ? opts.precision : opts) || 0),
                newValueAsNum = isNaN(newValue) ? (opts.defaultValue || 0) : +newValue,
                valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;
 
            //only write if it changed
            if (valueToWrite !== current) {
                target(valueToWrite);
            } else {
                //if the rounded value is the same, but a different value was written, force a notification for the current field
                if (newValue !== current) {
                    target.notifySubscribers(valueToWrite);
                }
            }
        }
    }).extend({ notify: 'always' });
 
    //initialize with current value to make sure it is rounded appropriately
    result(target());
 
    //return the new computed observable
    return result;
};

module.exports = ko;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../lib/knockout.mapping":30,"../lib/knockout.wrap":31}],18:[function(require,module,exports){
(function (global){
var ko = (typeof window !== "undefined" ? window['ko'] : typeof global !== "undefined" ? global['ko'] : null);
var stackableItems = require("./stackableItems");
var levelItems = require("./levelItems");
var itemsWithActive = require("./itemsWithActive");

var BasicInventoryViewModel = function (h) {
    var self = this;
    self.items = ko.observableArray([]);
    self.activeItems = ko.observableArray([]);
    self.addItem = function (data, event) {
        if (data.selectedItem() != undefined) {
            var new_item = {
                item: data.selectedItem().split('|')[0],
                state: ko.observable(0),
                size: data.itemInputValue(),
                enabled: ko.observable(true)
            }
            switch (new_item.item) {
                case 'dagon':
                    new_item.size = Math.min(new_item.size, 5);
                break;
                break;
                case 'travel_boots':
                case 'diffusal_blade':
                    new_item.size = Math.min(new_item.size, 2);
                break;
                case 'necronomicon':
                    new_item.size = Math.min(new_item.size, 3);
                break;
            }
            this.items.push(new_item);
            if (data.selectedItem() === 'ring_of_aquila' || data.selectedItem() === 'ring_of_basilius' || data.selectedItem() === 'heart') {
                this.toggleItem(undefined, new_item, undefined);
            }
        }
    }.bind(this);
    self.toggleItem = function (index, data, event) {
        if (itemsWithActive.indexOf(data.item) >= 0) {
            if (this.activeItems.indexOf(data) < 0) {
                this.activeItems.push(data);
            }
            else {
                this.activeItems.remove(data);
            }
            switch (data.item) {
                case 'power_treads':
                    if (data.state() < 2) {
                        data.state(data.state() + 1);
                    }
                    else {
                        data.state(0);
                    }                
                break;
                default:
                    if (data.state() == 0) {
                        data.state(1);
                    }
                    else {
                        data.state(0);
                    }                
                break;
            }
        }
    }.bind(this);
    self.removeItem = function (item) {
        this.activeItems.remove(item);
        this.items.remove(item);
    }.bind(this);
    self.toggleMuteItem = function (item) {
        item.enabled(!item.enabled());
    }.bind(this);
    self.removeAll = function () {
        this.activeItems.removeAll();
        this.items.removeAll();
    }.bind(this);
}
BasicInventoryViewModel.prototype.getItemImage = function (data) {
    var state = ko.utils.unwrapObservable(data.state);
    switch (data.item) {
        case 'power_treads':
            if (state == 0) {
                return '/media/images/items/' + data.item + '_str.png';
            }
            else if (state == 1) {
                return '/media/images/items/' + data.item + '_int.png';
            }
            else {
                return '/media/images/items/' + data.item + '_agi.png';
            }
        break;
        case 'tranquil_boots':
        case 'ring_of_basilius':
            if (state == 0) {
                return '/media/images/items/' + data.item + '.png';
            }
            else {
                return '/media/images/items/' + data.item + '_active.png';
            }
        break;
        case 'armlet':
            if (state == 0) {
                return '/media/images/items/' + data.item + '.png';
            }
            else {
                return '/media/images/items/' + data.item + '_active.png';
            }
        break;
        case 'ring_of_aquila':
            if (state == 0) {
                return '/media/images/items/' + data.item + '_active.png';
            }
            else {
                return '/media/images/items/' + data.item + '.png';
            }
        break;
        case 'dagon':
        case 'diffusal_blade':
        case 'travel_boots':
        case 'necronomicon':
            if (data.size > 1) {
                return '/media/images/items/' + data.item + '_' + data.size + '.png';
            }
            else {
                return '/media/images/items/' + data.item + '.png';
            }
        break;
        default:
            return '/media/images/items/' + data.item + '.png';            
        break;
    }
};
BasicInventoryViewModel.prototype.getItemSizeLabel = function (data) {
    if (stackableItems.indexOf(data.item) != -1) {
        return '<span style="font-size:10px">Qty: </span>' + data.size;
    }
    else if (levelItems.indexOf(data.item) != -1) {
        return '<span style="font-size:10px">Lvl: </span>' + data.size;
    }
    else if (data.item == 'bloodstone') {
        return '<span style="font-size:10px">Charges: </span>' + data.size;
    }
    else {
        return '';
    }
};
BasicInventoryViewModel.prototype.getActiveBorder = function (data) {
    switch (data.item) {
        case 'power_treads':
        case 'tranquil_boots':
        case 'ring_of_basilius':
        case 'ring_of_aquila':
        case 'armlet':
            return 0;
        break;
        default:
            return ko.utils.unwrapObservable(data.state);    
        break;
    }
}
BasicInventoryViewModel.prototype.getItemAttributeValue = function (attributes, attributeName, level) {
    for (var i = 0; i < attributes.length; i++) {
        if (attributes[i].name == attributeName) {
            if (level == 0) {
                return parseFloat(attributes[i].value[0]);
            }
            else if (level > attributes[i].value.length) {
                return parseFloat(attributes[i].value[0]);
            }
            else {
                return parseFloat(attributes[i].value[level - 1]);
            }
        }
    }
}

module.exports = BasicInventoryViewModel;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./itemsWithActive":24,"./levelItems":25,"./stackableItems":26}],19:[function(require,module,exports){
'use strict';
var ko = require('../herocalc_knockout');

var stackableItems = require("./stackableItems");
var levelItems = require("./levelItems");
var BasicInventoryViewModel = require("./BasicInventoryViewModel");
var itemOptionsArray = require("./itemOptionsArray");
var itemBuffOptions = require("./itemBuffOptions");
var itemDebuffOptions = require("./itemDebuffOptions");

var InventoryViewModel = function (itemData, h) {
    var self = this;
    BasicInventoryViewModel.call(this, h);
    self.hero = h;
    self.hasInventory = ko.observable(true);
    self.items = ko.observableArray([]);
    self.activeItems = ko.observableArray([]);
    self.hasScepter = ko.computed(function () {
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            if (item === 'ultimate_scepter' && self.items()[i].enabled()) {
                return true;
            }
            
        }
        return false;
    }, this);
    self.isEthereal = ko.computed(function () {
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if ((item === 'ghost' || item === 'ethereal_blade') && self.items()[i].enabled() && isActive) {
                return true;
            }
        }
        return false;
    }, this);
    self.isSheeped = ko.computed(function () {
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (item === 'sheepstick' && self.items()[i].enabled() && isActive) {
                return true;
            }
        }
        return false;
    }, this);
    self.totalCost = ko.computed(function () {
        var c = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            if (!self.items()[i].enabled()) continue;
            if (stackableItems.indexOf(item) != -1) {
                c += itemData['item_' + item].itemcost * self.items()[i].size;
            }
            else if (levelItems.indexOf(item) != -1) {
                switch(item) {
                    case 'travel_boots':
                    case 'diffusal_blade':
                    case 'necronomicon':
                    case 'dagon':
                        c += itemData['item_' + item].itemcost + (self.items()[i].size - 1) * itemData['item_recipe_' + item].itemcost;
                    break;
                    default:
                        c += itemData['item_' + item].itemcost;
                    break;
                }
            }
            else {
                c += itemData['item_' + item].itemcost;
            }
            
        }
        return c;
    }, this);
    self.addItemBuff = function (data, event) {
        if (self.hasInventory() && self.selectedItemBuff() != undefined) {
            var new_item = {
                item: self.selectedItemBuff(),
                state: ko.observable(0),
                size: 1,
                enabled: ko.observable(true)
            }
            self.items.push(new_item);
            if (self.selectedItemBuff() === 'ring_of_aquila' || self.selectedItemBuff() === 'ring_of_basilius') {
                self.toggleItem(undefined, new_item, undefined);
            }
        }
    };
    self.addItemDebuff = function (data, event) {
        if (self.hasInventory() && self.selectedItemDebuff() != undefined) {
            var new_item = {
                item: self.selectedItemDebuff().split('|')[0],
                state: ko.observable(0),
                size: 1,
                enabled: ko.observable(true)
            }
            if (self.selectedItemDebuff().split('|').length == 2) {
                new_item.debuff = self.selectedItemDebuff().split('|')[1]
            }
            self.items.push(new_item);
            if (self.selectedItemDebuff() === 'ring_of_aquila' || self.selectedItemDebuff() === 'ring_of_basilius') {
                self.toggleItem(undefined, new_item, undefined);
            }
        }
    };
    
    self.getAttributes = function (attributetype) {
        var totalAttribute = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            var size = self.items()[i].size;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_all_stats':
                        totalAttribute += parseInt(attribute.value[0]);
                    break;
                    case 'bonus_stats':
                        totalAttribute += parseInt(attribute.value[0]);
                    break;
                }
                switch(attributetype) {
                    case 'agi':
                        if (attribute.name == 'bonus_agility') {
                            if (item == 'diffusal_blade') {
                                totalAttribute += parseInt(attribute.value[size-1]);
                            }
                            else {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                        }
                        if (attribute.name == 'bonus_stat' && self.items()[i].state() == 2) {totalAttribute += parseInt(attribute.value[0]);};
                        if (attribute.name == 'bonus_agi') {totalAttribute += parseInt(attribute.value[0]);};
                    break;
                    case 'int':
                        if (attribute.name == 'bonus_intellect') {
                            if (item == 'necronomicon') {
                                totalAttribute += parseInt(attribute.value[size-1]);
                            }
                            else if (item == 'diffusal_blade') {
                                totalAttribute += parseInt(attribute.value[size-1]);
                            }
                            else if (item == 'dagon') {
                                totalAttribute += parseInt(attribute.value[size-1]);
                            }
                            else {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                        }
                        if (attribute.name == 'bonus_intelligence') {totalAttribute += parseInt(attribute.value[0]);};
                        if (attribute.name == 'bonus_int') {totalAttribute += parseInt(attribute.value[0]);};
                        if (attribute.name == 'bonus_stat' && self.items()[i].state() == 1) {totalAttribute += parseInt(attribute.value[0]);};
                    break;
                    case 'str':
                        if (attribute.name == 'bonus_strength') {
                            if (item == 'necronomicon') {
                                totalAttribute += parseInt(attribute.value[size-1]);
                            }
                            else {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                        }
                        if (attribute.name == 'bonus_stat' && self.items()[i].state() == 0) {totalAttribute += parseInt(attribute.value[0]);};
                        if (attribute.name == 'bonus_str') {totalAttribute += parseInt(attribute.value[0]);};
                        if (attribute.name == 'unholy_bonus_strength' && isActive) {totalAttribute += parseInt(attribute.value[0]);};
                    break;
                }
            }
        }
        return totalAttribute;
    };
    self.getBash = function (attacktype) {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bash_chance':
                        totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                    break;
                    case 'bash_chance_melee':
                        if (attacktype == 'DOTA_UNIT_CAP_MELEE_ATTACK') { totalAttribute *= (1 - parseInt(attribute.value[0]) / 100); };
                    break;
                    case 'bash_chance_ranged':
                        if (attacktype == 'DOTA_UNIT_CAP_RANGED_ATTACK') { totalAttribute *= (1 - parseInt(attribute.value[0]) / 100); };
                    break;
                }
            }
        }
        return totalAttribute;
    };
    
    self.getCritChance = function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'crit_chance':
                        totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                    break;
                }
            }
        }
        return totalAttribute;
    };
    
    self.getCritSource = function () {
        var sources = {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            switch (item) {
                case 'lesser_crit':
                case 'greater_crit':
                case 'bloodthorn':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'chance': self.getItemAttributeValue(itemData['item_' + item].attributes, 'crit_chance', 0) / 100,
                            'multiplier': self.getItemAttributeValue(itemData['item_' + item].attributes, 'crit_multiplier', 0) / 100,
                            'count': 1,
                            'displayname': itemData['item_' + item].displayname
                        }
                    }
                    else {
                        sources[item].count += 1;
                    }
                break;
            }
            if (item === 'bloodthorn' && isActive) {
                if (sources['soul_rend'] == undefined) {
                    sources['soul_rend'] = {
                        'chance': 1,
                        'multiplier': self.getItemAttributeValue(itemData['item_' + item].attributes, 'target_crit_multiplier', 0) / 100,
                        'count': 1,
                        'displayname': 'Soul Rend'
                    }
                }
                else {
                    sources['soul_rend'].count += 1;
                }
            }
        }
        return sources;
    };

    self.getCleaveSource = function () {
        var sources = {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            switch (item) {
                case 'bfury':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'radius': self.getItemAttributeValue(itemData['item_' + item].attributes, 'cleave_radius', 0),
                            'magnitude': self.getItemAttributeValue(itemData['item_' + item].attributes, 'cleave_damage_percent', 0) / 100,
                            'count': 1,
                            'displayname': itemData['item_' + item].displayname
                        }
                    }
                    else {
                        sources[item].count += 1;
                    }
                break;
            }

        }
        return sources;
    };
    
    self.getBashSource = function (attacktype) {
        var sources = {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            switch (item) {
                case 'javelin':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'damage': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bonus_chance_damage', 1),
                            'damageType': 'magic',
                            'count': 1,
                            'chance': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bonus_chance', 1) / 100,
                            'displayname': itemData['item_' + item].displayname + ' Pierce'
                        }
                    }
                    else {
                        sources[item].count += 1;
                    }
                break;
                case 'monkey_king_bar':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'item': item,
                            'chance': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bash_chance', 0) / 100,
                            'damage': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bash_damage', 0),
                            'duration': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bash_stun', 0),
                            'count': 1,
                            'damageType': 'magic',
                            'displayname': 'Mini-Bash' //itemData['item_' + item].displayname
                        }
                    }
                    else {
                        sources[item].count += 1;
                    }
                break;
                case 'abyssal_blade':
                case 'basher':
                    if (!sources.hasOwnProperty('bash')) {
                        sources['bash'] = {
                            'item': item,
                            'chance': self.getItemAttributeValue(itemData['item_' + item].attributes, (attacktype == 'DOTA_UNIT_CAP_MELEE_ATTACK') ?'bash_chance_melee' : 'bash_chance_ranged', 0) / 100,
                            'damage': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bonus_chance_damage', 0),
                            'duration': self.getItemAttributeValue(itemData['item_' + item].attributes, 'bash_duration', 0),
                            'count': 1,
                            'damageType': 'physical',
                            'displayname': 'Bash' //itemData['item_' + item].displayname
                        }
                    }
                    else {
                        //sources[item].count += 1;
                    }
                break;
            }

        }
        return sources;
    };
    
    self.getOrbProcSource = function () {
        var sources = {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            switch (item) {
                case 'maelstrom':
                case 'mjollnir':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'chance': self.getItemAttributeValue(itemData['item_' + item].attributes, 'chain_chance', 0) / 100,
                            'damage': self.getItemAttributeValue(itemData['item_' + item].attributes, 'chain_damage', 0),
                            'count': 1,
                            'damageType': 'magic',
                            'displayname': itemData['item_' + item].displayname
                        }
                    }
                    else {
                        sources[item].count += 1;
                    }
                break;
            }

        }
        return sources;
    };

    self.getOrbSource = function () {
        var sources = {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            switch (item) {
                case 'diffusal_blade':
                    if (sources[item] == undefined) {
                        sources[item] = {
                            'chance': 1,
                            'damage': self.getItemAttributeValue(itemData['item_' + item].attributes, 'feedback_mana_burn', self.items()[i].size),
                            'count': 1,
                            'damageType': 'physical',
                            'displayname': itemData['item_' + item].displayname
                        }
                    }
                    else {
                        sources[item].count += 1;
                    }
                break;
            }

        }
        return sources;
    };
    
    self.getHealth = function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_health':
                        totalAttribute += parseInt(attribute.value[0]);
                    break;
                }
            }
        }
        return totalAttribute;
    };
    self.getHealthRegen = function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'health_regen':
                    case 'bonus_regen':
                        totalAttribute += parseInt(attribute.value[0]);
                    break;
                    case 'bonus_health_regen':
                        if (item == 'tranquil_boots' && !isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                        else if (item != 'tranquil_boots') {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                    case 'hp_regen':
                        totalAttribute += parseInt(attribute.value[0]);
                    break;
                    case 'health_regen_rate':
                        if (item == 'heart' && isActive) {
                            totalAttribute += (parseInt(attribute.value[0]) / 100) * self.hero.health();
                        }
                    break;
                }
            }
        }
        return totalAttribute;
    };
    self.getHealthRegenAura = function (e) {
        var totalAttribute = 0,
            excludeList = e || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(item + attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'aura_health_regen':
                    case 'hp_regen_aura':
                        totalAttribute += parseInt(attribute.value[0]);
                        excludeList.push(item + attribute.name);
                    break;
                }
            }
        }
        return {value: totalAttribute, excludeList: excludeList};
    };
    
    self.getMana = function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_mana':
                        totalAttribute += parseInt(attribute.value[0]);
                    break;
                }
            }
        }
        return totalAttribute;
    };
    
    self.getManaRegen = function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'aura_mana_regen':
                    case 'mana_regen_aura':
                        totalAttribute += parseFloat(attribute.value[0]);
                    break;
                    case 'mana_regen':
                        if (item == 'infused_raindrop') totalAttribute += parseFloat(attribute.value[0]);
                    break;
                }
            }
        }
        return totalAttribute;    
    };
    self.getManaRegenPercent = function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_mana_regen':
                    case 'mana_regen':
                    case 'bonus_mana_regen_pct':
                        if (item != 'infused_raindrop') totalAttribute += parseFloat(attribute.value[0]);
                    break;
                }
            }
        }
        return totalAttribute / 100;    
    };
    self.getManaRegenBloodstone = function () {
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            if (!self.items()[i].enabled()) continue;
            if (item.indexOf('bloodstone') != -1) {
                return parseInt(self.items()[i].size);
            }
        }
        return 0;
    };
    
    self.getArmor = function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_armor':
                        if (!isActive || (item != 'medallion_of_courage' && item != 'solar_crest')) { totalAttribute += parseInt(attribute.value[0]); };
                    break;
                    case 'unholy_bonus_armor':
                        if (isActive && item == 'armlet') { totalAttribute += parseInt(attribute.value[0]); };
                    break;
                }
            }
        }
        return totalAttribute;
    };
    
    self.getArmorAura = function (aList) {
        var totalAttribute = 0,
            attributeList = aList || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0;j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (attributeList.find(function (a) { return attribute.name == a.name; })) continue;
                switch(attribute.name) {
                    // buckler
                    case 'bonus_aoe_armor':
                        if (isActive) {
                            attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
                        }
                    break;
                    // assault
                    case 'aura_positive_armor':
                        attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
                    break;
                    // ring_of_aquila,ring_of_basilius
                    case 'aura_bonus_armor':
                        if (isActive) {
                            attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
                        }
                    break;
                    // vladmir
                    case 'armor_aura':
                        attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
                    break;
                    // mekansm
                    case 'heal_bonus_armor':
                        if (isActive) {
                            attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
                        }
                    break;
                }
            }
        }
        // remove buckler if there is a mekansm
        if (attributeList.find(function (attribute) { return attribute.name == 'heal_bonus_armor'; })) {
            attributeList = attributeList.filter(function (attribute) {
                return attribute.name !== 'bonus_aoe_armor';
            });
        }
        // remove ring_of_aquila,ring_of_basilius if there is a vladmir
        if (attributeList.find(function (attribute) { return attribute.name == 'armor_aura'; })) {
            attributeList = attributeList.filter(function (attribute) {
                return attribute.name !== 'aura_bonus_armor';
            });
        }
        
        totalAttribute = attributeList.reduce(function (memo, attribute) {
            return memo += attribute.value;
        }, 0);
        return {value: totalAttribute, attributes: attributeList};
    };
    self.getArmorReduction = function (e) {
        var totalAttribute = 0,
            excludeList = e || [],
            selfExcludeList = [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1 || excludeList.indexOf(item + '_' + attribute.name) > -1) continue;
                // self exclusion check only for hero items, not buff items
                if (self.hero && (selfExcludeList.indexOf(attribute.name) > -1 || selfExcludeList.indexOf(item + '_' + attribute.name) > -1)) continue;
                switch(attribute.name) {
                    case 'armor_reduction':
                        if (isActive || (item != 'medallion_of_courage' && item != 'solar_crest')) {
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(item + '_' + attribute.name);
                        }
                    break;
                    case 'aura_negative_armor':
                        totalAttribute += parseInt(attribute.value[0]);
                        excludeList.push(attribute.name);
                    break;
                    case 'corruption_armor':
                        totalAttribute += parseInt(attribute.value[0]);
                        // allow blight_stone and desolator corruption_armor stacking from different sources, but not from same source
                        excludeList.push(item + '_' + attribute.name);
                        selfExcludeList.push(attribute.name);
                    break;
                }
            }
        }
        return {value: totalAttribute, excludeList: excludeList};
    };
    self.getEvasion = function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_evasion':
                        if (!isActive || (item != 'butterfly' && item != 'solar_crest')) { totalAttribute *= (1 - parseInt(attribute.value[0]) / 100); }
                    break;
                }
            }
        }
        return totalAttribute;
    };
    self.getMovementSpeedFlat = function (e) {
        var totalAttribute = 0,
        excludeList = e || [],
        hasBoots = false,
        hasEuls = false,
        hasWindLace = false,
        hasDrums = false,
        bootItems = ['boots','phase_boots','arcane_boots','travel_boots','power_treads','tranquil_boots','guardian_greaves'];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'bonus_movement_speed':
                        if (!hasBoots && bootItems.indexOf(item) >= 0) {
                            if (item != 'tranquil_boots' || (item == 'tranquil_boots' && !isActive)) {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasBoots = true;
                            }
                        }
                        //else if (!hasEuls && item == 'cyclone') {
                        else if (item == 'cyclone') {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasEuls = true;
                        }
                    break;
                    case 'broken_movement_speed':
                        if (!hasBoots && bootItems.indexOf(item) >= 0) {
                            if (item == 'tranquil_boots' && isActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasBoots = true;
                            }
                        }
                    break;
                    case 'bonus_movement':
                        if (!hasBoots && bootItems.indexOf(item) >= 0) {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasBoots = true;
                        }
                    break;
                    case 'movement_speed':
                        if (!hasWindLace && item == 'wind_lace') {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasWindLace = true;
                        }
                    break;
                    case 'bonus_aura_movement_speed':
                        if (!hasDrums && item == 'ancient_janggo') {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasDrums = true;
                            excludeList.push(attribute.name);
                        }
                    break;
                }
            }
        }
        return {value: totalAttribute, excludeList: excludeList};
    };
    self.getMovementSpeedPercent = function (e) {
        var totalAttribute = 0,
            excludeList = e || [],
            hasYasha = false,
            hasDrumsActive = false,
            hasPhaseActive = false,
            hasShadowBladeActive = false,
            hasButterflyActive = false,
            hasMoMActive = false,
            yashaItems = ['manta','yasha','sange_and_yasha'];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'movement_speed_percent_bonus':
                        if (!hasYasha && yashaItems.indexOf(item) >= 0) {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasYasha = true;
                        }
                    break;
                    case 'phase_movement_speed':
                        if (isActive && !hasPhaseActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasPhaseActive = true;
                        }
                    break;
                    case 'bonus_movement_speed_pct':
                        if (isActive && !hasDrumsActive && item == 'ancient_janggo') {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasDrumsActive = true;
                            excludeList.push(attribute.name);
                        }
                    break;
                    case 'windwalk_movement_speed':
                        if (isActive && !hasShadowBladeActive && (item == 'invis_sword' || item == 'silver_edge')) {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasShadowBladeActive = true;
                        }
                    break;
                    case 'berserk_bonus_movement_speed':
                        if (isActive && !hasMoMActive && item == 'mask_of_madness') {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasMoMActive = true;
                        }
                    break;
                    case 'bonus_movement_speed': //manta
                        if (!hasYasha && item == 'manta') {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasYasha = true;
                        }
                        else if (item == 'smoke_of_deceit' && isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                    case 'bonus_move_speed':
                        if (isActive && !hasButterflyActive && item == 'butterfly') {
                            totalAttribute += parseInt(attribute.value[0]);
                            hasButterflyActive = true;
                        }
                    break;
                }
            }
        }
        return {value: totalAttribute/100, excludeList: excludeList};
    };
    
    self.getMovementSpeedPercentReduction = function (e) {
        var totalAttribute = 0,
            excludeList = e || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'movespeed':
                        if (item == 'dust' && isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    case 'blast_movement_speed':
                        if (item == 'shivas_guard' && isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        }
                    case 'cold_movement_speed':
                        if (item == 'skadi') {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                    case 'maim_movement_speed':
                        if (self.items()[i].debuff && self.items()[i].debuff == 'maim') {
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        }
                    break;
                }
            }
        }
        return {value: totalAttribute/100, excludeList: excludeList};
    };
    
    self.getBonusDamage = function () {
        var totalAttribute = 0;
        var sources = {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_damage':
                        totalAttribute += parseInt(attribute.value[0]);
                        if (sources[item] == undefined) {
                            sources[item] = {
                                'damage': parseInt(attribute.value[0]),
                                'damageType': 'physical',
                                'count':1,
                                'displayname': itemData['item_' + item].displayname
                            }                            
                        }
                        else {
                            sources[item].count += 1;
                        }
                    break;
                    case 'unholy_bonus_damage':
                        if (isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                            if (sources[item + '_active'] == undefined) {
                                sources[item + '_active'] = {
                                    'damage': parseInt(attribute.value[0]),
                                    'damageType': 'physical',
                                    'count':1,
                                    'displayname': itemData['item_' + item].displayname + ' Unholy Strength'
                                }                            
                            }
                            else {
                                sources[item].count += 1;
                            }
                        }
                    break;
                }
            }
        }
        return { sources: sources, total: totalAttribute };
    };
    self.getBonusDamagePercent = function (s) {
        s = s || {sources:{},total:0};
        var totalAttribute = s.total || 0;
        var sources = s.sources || {};
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'damage_aura':
                        if (sources[item] == undefined) {
                            totalAttribute += parseInt(attribute.value[0]) / 100;
                            sources[item] = {
                                'damage': parseInt(attribute.value[0]) / 100,
                                'damageType': 'physical',
                                'count':1,
                                'displayname': itemData['item_' + item].displayname
                            }
                        }
                        // else {
                            // sources[item].count += 1;
                        // }
                    break;
                    case 'bottle_doubledamage':
                        if (sources[item] == undefined) {
                            totalAttribute += parseInt(attribute.value[0]) / 100;
                            sources[item] = {
                                'damage': parseInt(attribute.value[0]) / 100,
                                'damageType': 'physical',
                                'count':1,
                                'displayname': itemData['item_' + item].displayname
                            }
                        }
                    break;
                }
            }
        }
        return { sources: sources, total: totalAttribute };
    };
    self.getAttackSpeed = function (e) {
        var totalAttribute = 0,
            hasPowerTreads = false,
            excludeList = e || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'bonus_attack_speed':
                        if (item == 'power_treads') {
                            if (!hasPowerTreads) {
                                totalAttribute += parseInt(attribute.value[0]);
                                hasPowerTreads = true;
                            }
                        }
                        else if (item == 'moon_shard') {
                            if (!isActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                        }
                        else if (item == 'hurricane_pike') {
                            if (isActive) {
                                totalAttribute += parseInt(attribute.value[0]);
                            }
                        }
                        else {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                    case 'consumed_bonus':
                        if (item == 'moon_shard' && isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                    break;
                    case 'bonus_speed':
                        totalAttribute += parseInt(attribute.value[0]);
                    break;
                    // helm_of_the_dominator
                    case 'attack_speed':
                        totalAttribute += parseInt(attribute.value[0]);
                        excludeList.push(attribute.name);
                    break;
                    case 'unholy_bonus_attack_speed':
                        if (isActive) { totalAttribute += parseInt(attribute.value[0]); };
                    break;
                    case 'berserk_bonus_attack_speed':
                        if (isActive) { totalAttribute += parseInt(attribute.value[0]); };
                    break;
                }
            }
        }
        return {value: totalAttribute, excludeList: excludeList};
    };
    
    self.getAttackSpeedAura = function (e) {
        var totalAttribute = 0,
            excludeList = e || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(item + attribute.name) > -1) continue;
                switch(attribute.name) {
                    // helm_of_the_dominator
                    case 'attack_speed_aura':
                        totalAttribute += parseInt(attribute.value[0]);
                        excludeList.push(item + attribute.name);
                    break;
                    // assault_cuirass
                    case 'aura_attack_speed':
                        if (item != 'shivas_guard') { totalAttribute += parseInt(attribute.value[0]); };
                        excludeList.push(item + attribute.name);
                    break;
                    // ancient_janggo
                    case 'bonus_attack_speed_pct':
                        if (isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        }
                    break;
                }
            }
        }
        return {value: totalAttribute, excludeList: excludeList};
    };
    
    self.getAttackSpeedReduction = function (e) {
        var totalAttribute = 0,
            excludeList = e || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'aura_attack_speed':
                        if (item == 'shivas_guard') {
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        }
                    break;
                    case 'cold_attack_speed':
                        if (item == 'skadi') {
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        }
                    break;
                    case 'maim_attack_speed':
                        if (self.items()[i].debuff && self.items()[i].debuff == 'maim') {
                            totalAttribute += parseInt(attribute.value[0]);
                            excludeList.push(attribute.name);
                        }
                    break;
                }
            }
        }
        return {value: totalAttribute, excludeList: excludeList};
    };
    self.getLifesteal = function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'lifesteal_percent':
                        if (item == 'satanic') {
                            if (!isActive) { return parseInt(attribute.value[0]); };
                        }
                        else {
                            return parseInt(attribute.value[0]);
                        }
                    break;
                    case 'unholy_lifesteal_percent':
                        if (isActive) { return parseInt(attribute.value[0]); };
                    break;
                }
            }
        }
        return totalAttribute;
    };
    self.getLifestealAura = function (e) {
        var totalAttribute = 0,
            excludeList = e || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'vampiric_aura':
                        totalAttribute += parseInt(attribute.value[0]);
                        excludeList.push(attribute.name);
                    break;
                }
            }
        }
        return {value: totalAttribute, excludeList: excludeList};
    };
    self.getSpellAmp = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'spell_amp':
                        totalAttribute += parseInt(attribute.value[0]);
                    break;
                }
            }
        }
        return totalAttribute;
    });
    self.getCooldownReductionFlat = ko.computed(function () {
        var totalAttribute = 0;
        /*for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_night_vision':
                        if (item != 'moon_shard' || !isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                }
            }
        }*/
        return totalAttribute;
    });
    self.getCooldownReductionPercent = function (aList) {        
        var totalAttribute = 1,
            attributeList = aList || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0;j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (attributeList.find(function (a) { return attribute.name == a.name; })) continue;
                switch(attribute.name) {
                    // octarine_core
                    case 'bonus_cooldown':
                        attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
                    break;
                }
            }
        }
        
        totalAttribute = attributeList.reduce(function (memo, attribute) {
            return memo *= (1 - attribute.value / 100);
        }, 1);
        return {value: totalAttribute, attributes: attributeList};
    };
    self.getCooldownIncreaseFlat = ko.computed(function () {
        var totalAttribute = 0;
        return totalAttribute;
    });
    self.getCooldownIncreasePercent = function () {
        var totalAttribute = 1;
        return totalAttribute;
    };
    self.getMagicResist = function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_magical_armor':
                        totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                    break;
                    case 'bonus_spell_resist':
                        totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                    break;
                    case 'magic_resistance':
                        totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                    break;
                }
            }
        }
        return totalAttribute;
    };
    self.getMagicResistReductionSelf = function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            if (isActive) {
                for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                    var attribute = itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'extra_spell_damage_percent':
                        case 'ethereal_damage_bonus':
                            return (1 - parseInt(attribute.value[0]) / 100);
                        break;
                    }
                }
            }
        }
        return totalAttribute;
    };   
    self.getMagicResistReduction = function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            if (isActive) {
                for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                    var attribute = itemData['item_' + item].attributes[j];
                    switch(attribute.name) {
                        case 'ethereal_damage_bonus':
                            if (!self.isEthereal()) totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                        case 'resist_debuff':
                            totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                        break;
                    }
                }
            }
        }
        return totalAttribute;
    };        

    self.getVisionRangeNight = ko.computed(function () {
        var totalAttribute = 0;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'bonus_night_vision':
                        if (item != 'moon_shard' || !isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                    // moon_shard
                    case 'consumed_bonus_night_vision':
                        if (item == 'moon_shard' && isActive) {
                            totalAttribute += parseInt(attribute.value[0]);
                        }
                    break;
                }
            }
        }
        return totalAttribute;
    });
    
    self.getAttackRange = function (attacktype, aList) {
        var totalAttribute = 0,
            attributeList = aList || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0;j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (attributeList.find(function (a) { return attribute.name == a.name; })) continue;
                switch(attribute.name) {
                    // dragon_lance
                    case 'base_attack_range':
                        if (attacktype == 'DOTA_UNIT_CAP_RANGED_ATTACK') attributeList.push({'name':attribute.name, 'value': parseInt(attribute.value[0])});
                    break;
                }
            }
        }
        
        totalAttribute = attributeList.reduce(function (memo, attribute) {
            return memo += attribute.value;
        }, 0);
        return {value: totalAttribute, attributes: attributeList};
    };
    
    self.getMissChance = function (e) {
        var totalAttribute = 1,
            excludeList = e || [];
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                if (excludeList.indexOf(attribute.name) > -1) continue;
                switch(attribute.name) {
                    case 'miss_chance':
                        if (item === 'solar_crest' && isActive) {
                            totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                            excludeList.push(attribute.name);
                        }
                    break;
                    case 'blind_pct':
                        totalAttribute *= (1 - parseInt(attribute.value[0]) / 100);
                        excludeList.push(attribute.name);
                    break;
                }
            }
        }
        return {value: totalAttribute, excludeList: excludeList};
    };
    
    self.getBaseDamageReductionPct = function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'backstab_reduction':
                        if (self.items()[i].debuff && self.items()[i].debuff == 'shadow_walk') {
                            totalAttribute *= (1 + parseInt(attribute.value[0]) / 100);
                        }
                    break;
                }
            }
        }
        return totalAttribute;
    };    
    self.getBonusDamageReductionPct = function () {
        var totalAttribute = 1;
        for (var i = 0; i < self.items().length; i++) {
            var item = self.items()[i].item;
            var isActive = self.activeItems.indexOf(self.items()[i]) >= 0 ? true : false;
            if (!self.items()[i].enabled()) continue;
            for (var j = 0; j < itemData['item_' + item].attributes.length; j++) {
                var attribute = itemData['item_' + item].attributes[j];
                switch(attribute.name) {
                    case 'backstab_reduction':
                        if (self.items()[i].debuff && self.items()[i].debuff == 'shadow_walk') {
                            totalAttribute *= (1 + parseInt(attribute.value[0]) / 100);
                        }
                    break;
                }
            }
        }
        return totalAttribute;
    };
    
    self.itemOptions = ko.observableArray(itemOptionsArray.items);
    
    self.itemBuffOptions = ko.observableArray(itemBuffOptions.items);
    self.selectedItemBuff = ko.observable('assault');

    self.itemDebuffOptions = ko.observableArray(itemDebuffOptions.items);
    self.selectedItemDebuff = ko.observable('assault');
    
    return self;
};
InventoryViewModel.prototype = Object.create(BasicInventoryViewModel.prototype);
InventoryViewModel.prototype.constructor = InventoryViewModel;

module.exports = InventoryViewModel;
},{"../herocalc_knockout":17,"./BasicInventoryViewModel":18,"./itemBuffOptions":21,"./itemDebuffOptions":22,"./itemOptionsArray":23,"./levelItems":25,"./stackableItems":26}],20:[function(require,module,exports){
(function (global){
var ko = (typeof window !== "undefined" ? window['ko'] : typeof global !== "undefined" ? global['ko'] : null);

var ItemInput = function (itemData, value, name, debuff) {
    if (itemData['item_' + value].ItemAliases instanceof Array) {
        var itemAlias = itemData['item_' + value].ItemAliases.join(' ');
    }
    else {
        var itemAlias = itemData['item_' + value].ItemAliases;
    }
    this.value = ko.observable(value);
    this.debuff = ko.observable(debuff);
    if (this.debuff()) {
        this.value = ko.observable(value + '|' + debuff.id);
        this.name = ko.observable(name + ' (' + debuff.name + ')');
        this.displayname = ko.observable(name + ' (' + debuff.name + ') <span style="display:none">' + ';' + itemAlias + '</span>');
    }
    else {
        this.value = ko.observable(value);
        this.name = ko.observable(name);
        this.displayname = ko.observable(name + ' <span style="display:none">' + ';' + itemAlias + '</span>');
    }
};

module.exports = ItemInput;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],21:[function(require,module,exports){
var ItemInput = require("./ItemInput");
var itemBuffs = ['assault', 'ancient_janggo', 'headdress', 'mekansm', 'pipe', 'ring_of_aquila', 'vladmir', 'ring_of_basilius', 'buckler', 'solar_crest', 'bottle_doubledamage', 'helm_of_the_dominator'];
var itemBuffOptions = {};

var init = function (itemData) {
    itemBuffOptions.items = itemBuffs.map(function(item) {
        return new ItemInput(itemData, item, itemData['item_' + item].displayname);
    }).sort(function (a, b) {
        if (a.displayname() < b.displayname()) return -1;
        if (a.displayname() > b.displayname()) return 1;
        return 0;
    });
    return itemBuffOptions.items;
}

itemBuffOptions.init = init;

module.exports = itemBuffOptions;
},{"./ItemInput":20}],22:[function(require,module,exports){
var ItemInput = require("./ItemInput");
var itemDebuffs = [
    {item: 'assault', debuff: null},
    {item: 'shivas_guard', debuff: null},
    {item: 'desolator', debuff: null},
    {item: 'blight_stone', debuff: null},
    {item: 'medallion_of_courage', debuff: null},
    {item: 'radiance', debuff: null},
    {item: 'sheepstick', debuff: null},
    {item: 'veil_of_discord', debuff: null},
    {item: 'solar_crest', debuff: null},
    {item: 'silver_edge', debuff: {id: 'shadow_walk', name: 'Shadow Walk'}},
    {item: 'silver_edge', debuff: {id: 'maim', name: 'Lesser Maim'}}
]
var itemDebuffOptions = {};

var init = function (itemData) {
    itemDebuffOptions.items = itemDebuffs.map(function(item) {
        return new ItemInput(itemData, item.item, itemData['item_' + item.item].displayname, item.debuff);
    }).sort(function (a, b) {
        if (a.displayname() < b.displayname()) return -1;
        if (a.displayname() > b.displayname()) return 1;
        return 0;
    });
    return itemDebuffOptions.items;
}

itemDebuffOptions.init = init;

module.exports = itemDebuffOptions;
},{"./ItemInput":20}],23:[function(require,module,exports){
var validItems = require("./validItems");
var ItemInput = require("./ItemInput");

var itemOptionsArray = {};

var init = function (itemData) {
    itemOptionsArray.items = [];
    for (var i = 0; i < validItems.length; i++) {
        itemOptionsArray.items.push(new ItemInput(itemData, validItems[i], itemData['item_' + validItems[i]].displayname));
    }
    return itemOptionsArray.items;
}

itemOptionsArray.init = init;

module.exports = itemOptionsArray;
},{"./ItemInput":20,"./validItems":27}],24:[function(require,module,exports){
module.exports = ['solar_crest', 'heart','smoke_of_deceit','dust','ghost','tranquil_boots','phase_boots','power_treads','buckler','medallion_of_courage','ancient_janggo','mekansm','pipe','veil_of_discord','rod_of_atos','orchid','sheepstick','armlet','invis_sword','ethereal_blade','shivas_guard','manta','mask_of_madness','diffusal_blade','mjollnir','satanic','ring_of_basilius','ring_of_aquila', 'butterfly', 'moon_shard', 'silver_edge','bloodthorn','hurricane_pike'];
},{}],25:[function(require,module,exports){
module.exports = ['necronomicon','dagon','diffusal_blade','travel_boots'];
},{}],26:[function(require,module,exports){
module.exports = ['clarity','flask','dust','ward_observer','ward_sentry','tango','tpscroll','smoke_of_deceit'];
},{}],27:[function(require,module,exports){
module.exports = ["abyssal_blade","ultimate_scepter","courier","arcane_boots","armlet","assault","boots_of_elves","bfury","belt_of_strength","black_king_bar","blade_mail","blade_of_alacrity","blades_of_attack","blink","bloodstone","boots","travel_boots","bottle","bracer","broadsword","buckler","butterfly","chainmail","circlet","clarity","claymore","cloak","lesser_crit","greater_crit","dagon","demon_edge","desolator","diffusal_blade","rapier","ancient_janggo","dust","eagle","energy_booster","ethereal_blade","cyclone","skadi","flying_courier","force_staff","gauntlets","gem","ghost","gloves","hand_of_midas","headdress","flask","heart","heavens_halberd","helm_of_iron_will","helm_of_the_dominator","hood_of_defiance","hyperstone","branches","javelin","sphere","maelstrom","magic_stick","magic_wand","manta","mantle","mask_of_madness","medallion_of_courage","mekansm","mithril_hammer","mjollnir","monkey_king_bar","lifesteal","mystic_staff","necronomicon","null_talisman","oblivion_staff","ward_observer","ogre_axe","orb_of_venom","orchid","pers","phase_boots","pipe","platemail","point_booster","poor_mans_shield","power_treads","quarterstaff","quelling_blade","radiance","reaver","refresher","ring_of_aquila","ring_of_basilius","ring_of_health","ring_of_protection","ring_of_regen","robe","rod_of_atos","relic","sobi_mask","sange","sange_and_yasha","satanic","sheepstick","ward_sentry","shadow_amulet","invis_sword","shivas_guard","basher","slippers","smoke_of_deceit","soul_booster","soul_ring","staff_of_wizardry","stout_shield","talisman_of_evasion","tango","tpscroll","tranquil_boots","ultimate_orb","urn_of_shadows","vanguard","veil_of_discord","vitality_booster","vladmir","void_stone","wraith_band","yasha","crimson_guard","enchanted_mango","lotus_orb","glimmer_cape","guardian_greaves","moon_shard","silver_edge","solar_crest","octarine_core","aether_lens","faerie_fire","iron_talon","dragon_lance","echo_sabre","infused_raindrop","blight_stone","wind_lace","tome_of_knowledge","bloodthorn","hurricane_pike"];
},{}],28:[function(require,module,exports){
var extend = function (out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[i];

        if (!obj)
            continue;

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object')
                    out[key] = extend(out[key], obj[key]);
                else
                    out[key] = obj[key];
            }
        }
    }

    return out;
};

module.exports = extend;
},{}],29:[function(require,module,exports){
var findWhere = function (arr, obj) {
    arrLoop: for (var i = 0; i < arr.length; i++) {
        objLoop: for (var key in obj) {
            if (arr[i][key] != obj[key]) {
                continue arrLoop;
            }
        }
        return arr[i];
    }
}

module.exports = findWhere;
},{}],30:[function(require,module,exports){
(function (global){
(function (factory) {
	// Module systems magic dance.

	if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
		// CommonJS or Node: hard-coded dependency on "knockout"
		factory((typeof window !== "undefined" ? window['ko'] : typeof global !== "undefined" ? global['ko'] : null), exports);
	} else if (typeof define === "function" && define["amd"]) {
		// AMD anonymous module with hard-coded dependency on "knockout"
		define(["knockout", "exports"], factory);
	} else {
		// <script> tag: use the global `ko` object, attaching a `mapping` property
		factory(ko, ko.mapping = {});
	}
}(function (ko, exports) {
	var DEBUG=true;
	var mappingProperty = "__ko_mapping__";
	var realKoDependentObservable = ko.dependentObservable;
	var mappingNesting = 0;
	var dependentObservables;
	var visitedObjects;
	var recognizedRootProperties = ["create", "update", "key", "arrayChanged"];
	var emptyReturn = {};

	var _defaultOptions = {
		include: ["_destroy"],
		ignore: [],
		copy: [],
		observe: []
	};
	var defaultOptions = _defaultOptions;

	// Author: KennyTM @ StackOverflow
	function unionArrays (x, y) {
		var obj = {};
		for (var i = x.length - 1; i >= 0; -- i) obj[x[i]] = x[i];
		for (var i = y.length - 1; i >= 0; -- i) obj[y[i]] = y[i];
		var res = [];

		for (var k in obj) {
			res.push(obj[k]);
		};

		return res;
	}

	function extendObject(destination, source) {
		var destType;

		for (var key in source) {
			if (source.hasOwnProperty(key) && source[key]) {
				destType = exports.getType(destination[key]);
				if (key && destination[key] && destType !== "array" && destType !== "string") {
					extendObject(destination[key], source[key]);
				} else {
					var bothArrays = exports.getType(destination[key]) === "array" && exports.getType(source[key]) === "array";
					if (bothArrays) {
						destination[key] = unionArrays(destination[key], source[key]);
					} else {
						destination[key] = source[key];
					}
				}
			}
		}
	}

	function merge(obj1, obj2) {
		var merged = {};
		extendObject(merged, obj1);
		extendObject(merged, obj2);

		return merged;
	}

	exports.isMapped = function (viewModel) {
		var unwrapped = ko.utils.unwrapObservable(viewModel);
		return unwrapped && unwrapped[mappingProperty];
	}

	exports.fromJS = function (jsObject /*, inputOptions, target*/ ) {
		if (arguments.length == 0) throw new Error("When calling ko.fromJS, pass the object you want to convert.");

		try {
			if (!mappingNesting++) {
				dependentObservables = [];
				visitedObjects = new objectLookup();
			}

			var options;
			var target;

			if (arguments.length == 2) {
				if (arguments[1][mappingProperty]) {
					target = arguments[1];
				} else {
					options = arguments[1];
				}
			}
			if (arguments.length == 3) {
				options = arguments[1];
				target = arguments[2];
			}

			if (target) {
				options = merge(options, target[mappingProperty]);
			}
			options = fillOptions(options);

			var result = updateViewModel(target, jsObject, options);
			if (target) {
				result = target;
			}

			// Evaluate any dependent observables that were proxied.
			// Do this after the model's observables have been created
			if (!--mappingNesting) {
				while (dependentObservables.length) {
					var DO = dependentObservables.pop();
					if (DO) {
						DO();
						
						// Move this magic property to the underlying dependent observable
						DO.__DO["throttleEvaluation"] = DO["throttleEvaluation"];
					}
				}
			}

			// Save any new mapping options in the view model, so that updateFromJS can use them later.
			result[mappingProperty] = merge(result[mappingProperty], options);

			return result;
		} catch(e) {
			mappingNesting = 0;
			throw e;
		}
	};

	exports.fromJSON = function (jsonString /*, options, target*/ ) {
		var parsed = ko.utils.parseJson(jsonString);
		arguments[0] = parsed;
		return exports.fromJS.apply(this, arguments);
	};

	exports.updateFromJS = function (viewModel) {
		throw new Error("ko.mapping.updateFromJS, use ko.mapping.fromJS instead. Please note that the order of parameters is different!");
	};

	exports.updateFromJSON = function (viewModel) {
		throw new Error("ko.mapping.updateFromJSON, use ko.mapping.fromJSON instead. Please note that the order of parameters is different!");
	};

	exports.toJS = function (rootObject, options) {
		if (!defaultOptions) exports.resetDefaultOptions();

		if (arguments.length == 0) throw new Error("When calling ko.mapping.toJS, pass the object you want to convert.");
		if (exports.getType(defaultOptions.ignore) !== "array") throw new Error("ko.mapping.defaultOptions().ignore should be an array.");
		if (exports.getType(defaultOptions.include) !== "array") throw new Error("ko.mapping.defaultOptions().include should be an array.");
		if (exports.getType(defaultOptions.copy) !== "array") throw new Error("ko.mapping.defaultOptions().copy should be an array.");

		// Merge in the options used in fromJS
		options = fillOptions(options, rootObject[mappingProperty]);

		// We just unwrap everything at every level in the object graph
		return exports.visitModel(rootObject, function (x) {
			return ko.utils.unwrapObservable(x)
		}, options);
	};

	exports.toJSON = function (rootObject, options) {
		var plainJavaScriptObject = exports.toJS(rootObject, options);
		return ko.utils.stringifyJson(plainJavaScriptObject);
	};

	exports.defaultOptions = function () {
		if (arguments.length > 0) {
			defaultOptions = arguments[0];
		} else {
			return defaultOptions;
		}
	};

	exports.resetDefaultOptions = function () {
		defaultOptions = {
			include: _defaultOptions.include.slice(0),
			ignore: _defaultOptions.ignore.slice(0),
			copy: _defaultOptions.copy.slice(0)
		};
	};

	exports.getType = function(x) {
		if ((x) && (typeof (x) === "object")) {
			if (x.constructor === Date) return "date";
			if (x.constructor === Array) return "array";
		}
		return typeof x;
	}

	function fillOptions(rawOptions, otherOptions) {
		var options = merge({}, rawOptions);

		// Move recognized root-level properties into a root namespace
		for (var i = recognizedRootProperties.length - 1; i >= 0; i--) {
			var property = recognizedRootProperties[i];
			
			// Carry on, unless this property is present
			if (!options[property]) continue;
			
			// Move the property into the root namespace
			if (!(options[""] instanceof Object)) options[""] = {};
			options[""][property] = options[property];
			delete options[property];
		}

		if (otherOptions) {
			options.ignore = mergeArrays(otherOptions.ignore, options.ignore);
			options.include = mergeArrays(otherOptions.include, options.include);
			options.copy = mergeArrays(otherOptions.copy, options.copy);
			options.observe = mergeArrays(otherOptions.observe, options.observe);
		}
		options.ignore = mergeArrays(options.ignore, defaultOptions.ignore);
		options.include = mergeArrays(options.include, defaultOptions.include);
		options.copy = mergeArrays(options.copy, defaultOptions.copy);
		options.observe = mergeArrays(options.observe, defaultOptions.observe);

		options.mappedProperties = options.mappedProperties || {};
		options.copiedProperties = options.copiedProperties || {};
		return options;
	}

	function mergeArrays(a, b) {
		if (exports.getType(a) !== "array") {
			if (exports.getType(a) === "undefined") a = [];
			else a = [a];
		}
		if (exports.getType(b) !== "array") {
			if (exports.getType(b) === "undefined") b = [];
			else b = [b];
		}

		return ko.utils.arrayGetDistinctValues(a.concat(b));
	}

	// When using a 'create' callback, we proxy the dependent observable so that it doesn't immediately evaluate on creation.
	// The reason is that the dependent observables in the user-specified callback may contain references to properties that have not been mapped yet.
	function withProxyDependentObservable(dependentObservables, callback) {
		var localDO = ko.dependentObservable;
		ko.dependentObservable = function (read, owner, options) {
			options = options || {};

			if (read && typeof read == "object") { // mirrors condition in knockout implementation of DO's
				options = read;
			}

			var realDeferEvaluation = options.deferEvaluation;

			var isRemoved = false;

			// We wrap the original dependent observable so that we can remove it from the 'dependentObservables' list we need to evaluate after mapping has
			// completed if the user already evaluated the DO themselves in the meantime.
			var wrap = function (DO) {
				// Temporarily revert ko.dependentObservable, since it is used in ko.isWriteableObservable
				var tmp = ko.dependentObservable;
				ko.dependentObservable = realKoDependentObservable;
				var isWriteable = ko.isWriteableObservable(DO);
				ko.dependentObservable = tmp;

				var wrapped = realKoDependentObservable({
					read: function () {
						if (!isRemoved) {
							ko.utils.arrayRemoveItem(dependentObservables, DO);
							isRemoved = true;
						}
						return DO.apply(DO, arguments);
					},
					write: isWriteable && function (val) {
						return DO(val);
					},
					deferEvaluation: true
				});
				if (DEBUG) wrapped._wrapper = true;
				wrapped.__DO = DO;
				return wrapped;
			};
			
			options.deferEvaluation = true; // will either set for just options, or both read/options.
			var realDependentObservable = new realKoDependentObservable(read, owner, options);

			if (!realDeferEvaluation) {
				realDependentObservable = wrap(realDependentObservable);
				dependentObservables.push(realDependentObservable);
			}

			return realDependentObservable;
		}
		ko.dependentObservable.fn = realKoDependentObservable.fn;
		ko.computed = ko.dependentObservable;
		var result = callback();
		ko.dependentObservable = localDO;
		ko.computed = ko.dependentObservable;
		return result;
	}

	function updateViewModel(mappedRootObject, rootObject, options, parentName, parent, parentPropertyName, mappedParent) {
		var isArray = exports.getType(ko.utils.unwrapObservable(rootObject)) === "array";

		parentPropertyName = parentPropertyName || "";

		// If this object was already mapped previously, take the options from there and merge them with our existing ones.
		if (exports.isMapped(mappedRootObject)) {
			var previousMapping = ko.utils.unwrapObservable(mappedRootObject)[mappingProperty];
			options = merge(previousMapping, options);
		}

		var callbackParams = {
			data: rootObject,
			parent: mappedParent || parent
		};

		var hasCreateCallback = function () {
			return options[parentName] && options[parentName].create instanceof Function;
		};

		var createCallback = function (data) {
			return withProxyDependentObservable(dependentObservables, function () {
				
				if (ko.utils.unwrapObservable(parent) instanceof Array) {
					return options[parentName].create({
						data: data || callbackParams.data,
						parent: callbackParams.parent,
						skip: emptyReturn
					});
				} else {
					return options[parentName].create({
						data: data || callbackParams.data,
						parent: callbackParams.parent
					});
				}				
			});
		};

		var hasUpdateCallback = function () {
			return options[parentName] && options[parentName].update instanceof Function;
		};

		var updateCallback = function (obj, data) {
			var params = {
				data: data || callbackParams.data,
				parent: callbackParams.parent,
				target: ko.utils.unwrapObservable(obj)
			};

			if (ko.isWriteableObservable(obj)) {
				params.observable = obj;
			}

			return options[parentName].update(params);
		}

		var alreadyMapped = visitedObjects.get(rootObject);
		if (alreadyMapped) {
			return alreadyMapped;
		}

		parentName = parentName || "";

		if (!isArray) {
			// For atomic types, do a direct update on the observable
			if (!canHaveProperties(rootObject)) {
				switch (exports.getType(rootObject)) {
				case "function":
					if (hasUpdateCallback()) {
						if (ko.isWriteableObservable(rootObject)) {
							rootObject(updateCallback(rootObject));
							mappedRootObject = rootObject;
						} else {
							mappedRootObject = updateCallback(rootObject);
						}
					} else {
						mappedRootObject = rootObject;
					}
					break;
				default:
					if (ko.isWriteableObservable(mappedRootObject)) {
						if (hasUpdateCallback()) {
							var valueToWrite = updateCallback(mappedRootObject);
							mappedRootObject(valueToWrite);
							return valueToWrite;
						} else {
							var valueToWrite = ko.utils.unwrapObservable(rootObject);
							mappedRootObject(valueToWrite);
							return valueToWrite;
						}
					} else {
						var hasCreateOrUpdateCallback = hasCreateCallback() || hasUpdateCallback();
						
						if (hasCreateCallback()) {
							mappedRootObject = createCallback();
						} else {
							mappedRootObject = ko.observable(ko.utils.unwrapObservable(rootObject));
						}

						if (hasUpdateCallback()) {
							mappedRootObject(updateCallback(mappedRootObject));
						}
						
						if (hasCreateOrUpdateCallback) return mappedRootObject;
					}
				}

			} else {
				mappedRootObject = ko.utils.unwrapObservable(mappedRootObject);
				if (!mappedRootObject) {
					if (hasCreateCallback()) {
						var result = createCallback();

						if (hasUpdateCallback()) {
							result = updateCallback(result);
						}

						return result;
					} else {
						if (hasUpdateCallback()) {
							return updateCallback(result);
						}

						mappedRootObject = {};
					}
				}

				if (hasUpdateCallback()) {
					mappedRootObject = updateCallback(mappedRootObject);
				}

				visitedObjects.save(rootObject, mappedRootObject);
				if (hasUpdateCallback()) return mappedRootObject;

				// For non-atomic types, visit all properties and update recursively
				visitPropertiesOrArrayEntries(rootObject, function (indexer) {
					var fullPropertyName = parentPropertyName.length ? parentPropertyName + "." + indexer : indexer;

					if (ko.utils.arrayIndexOf(options.ignore, fullPropertyName) != -1) {
						return;
					}

					if (ko.utils.arrayIndexOf(options.copy, fullPropertyName) != -1) {
						mappedRootObject[indexer] = rootObject[indexer];
						return;
					}

					if(typeof rootObject[indexer] != "object" && typeof rootObject[indexer] != "array" && options.observe.length > 0 && ko.utils.arrayIndexOf(options.observe, fullPropertyName) == -1)
					{
						mappedRootObject[indexer] = rootObject[indexer];
						options.copiedProperties[fullPropertyName] = true;
						return;
					}
					
					// In case we are adding an already mapped property, fill it with the previously mapped property value to prevent recursion.
					// If this is a property that was generated by fromJS, we should use the options specified there
					var prevMappedProperty = visitedObjects.get(rootObject[indexer]);
					var retval = updateViewModel(mappedRootObject[indexer], rootObject[indexer], options, indexer, mappedRootObject, fullPropertyName, mappedRootObject);
					var value = prevMappedProperty || retval;
					
					if(options.observe.length > 0 && ko.utils.arrayIndexOf(options.observe, fullPropertyName) == -1)
					{
						mappedRootObject[indexer] = value();
						options.copiedProperties[fullPropertyName] = true;
						return;
					}
					
					if (ko.isWriteableObservable(mappedRootObject[indexer])) {
						value = ko.utils.unwrapObservable(value);
						if (mappedRootObject[indexer]() !== value) {
							mappedRootObject[indexer](value);
						}
					} else {
						value = mappedRootObject[indexer] === undefined ? value : ko.utils.unwrapObservable(value);
						mappedRootObject[indexer] = value;
					}

					options.mappedProperties[fullPropertyName] = true;
				});
			}
		} else { //mappedRootObject is an array
			var changes = [];

			var hasKeyCallback = false;
			var keyCallback = function (x) {
				return x;
			}
			if (options[parentName] && options[parentName].key) {
				keyCallback = options[parentName].key;
				hasKeyCallback = true;
			}

			if (!ko.isObservable(mappedRootObject)) {
				// When creating the new observable array, also add a bunch of utility functions that take the 'key' of the array items into account.
				mappedRootObject = ko.observableArray([]);

				mappedRootObject.mappedRemove = function (valueOrPredicate) {
					var predicate = typeof valueOrPredicate == "function" ? valueOrPredicate : function (value) {
							return value === keyCallback(valueOrPredicate);
						};
					return mappedRootObject.remove(function (item) {
						return predicate(keyCallback(item));
					});
				}

				mappedRootObject.mappedRemoveAll = function (arrayOfValues) {
					var arrayOfKeys = filterArrayByKey(arrayOfValues, keyCallback);
					return mappedRootObject.remove(function (item) {
						return ko.utils.arrayIndexOf(arrayOfKeys, keyCallback(item)) != -1;
					});
				}

				mappedRootObject.mappedDestroy = function (valueOrPredicate) {
					var predicate = typeof valueOrPredicate == "function" ? valueOrPredicate : function (value) {
							return value === keyCallback(valueOrPredicate);
						};
					return mappedRootObject.destroy(function (item) {
						return predicate(keyCallback(item));
					});
				}

				mappedRootObject.mappedDestroyAll = function (arrayOfValues) {
					var arrayOfKeys = filterArrayByKey(arrayOfValues, keyCallback);
					return mappedRootObject.destroy(function (item) {
						return ko.utils.arrayIndexOf(arrayOfKeys, keyCallback(item)) != -1;
					});
				}

				mappedRootObject.mappedIndexOf = function (item) {
					var keys = filterArrayByKey(mappedRootObject(), keyCallback);
					var key = keyCallback(item);
					return ko.utils.arrayIndexOf(keys, key);
				}

				mappedRootObject.mappedGet = function (item) {
					return mappedRootObject()[mappedRootObject.mappedIndexOf(item)];
				}

				mappedRootObject.mappedCreate = function (value) {
					if (mappedRootObject.mappedIndexOf(value) !== -1) {
						throw new Error("There already is an object with the key that you specified.");
					}

					var item = hasCreateCallback() ? createCallback(value) : value;
					if (hasUpdateCallback()) {
						var newValue = updateCallback(item, value);
						if (ko.isWriteableObservable(item)) {
							item(newValue);
						} else {
							item = newValue;
						}
					}
					mappedRootObject.push(item);
					return item;
				}
			}

			var currentArrayKeys = filterArrayByKey(ko.utils.unwrapObservable(mappedRootObject), keyCallback).sort();
			var newArrayKeys = filterArrayByKey(rootObject, keyCallback);
			if (hasKeyCallback) newArrayKeys.sort();
			var editScript = ko.utils.compareArrays(currentArrayKeys, newArrayKeys);

			var ignoreIndexOf = {};
			
			var i, j;

			var unwrappedRootObject = ko.utils.unwrapObservable(rootObject);
			var itemsByKey = {};
			var optimizedKeys = true;
			for (i = 0, j = unwrappedRootObject.length; i < j; i++) {
				var key = keyCallback(unwrappedRootObject[i]);
				if (key === undefined || key instanceof Object) {
					optimizedKeys = false;
					break;
				}
				itemsByKey[key] = unwrappedRootObject[i];
			}

			var newContents = [];
			var passedOver = 0;
			for (i = 0, j = editScript.length; i < j; i++) {
				var key = editScript[i];
				var mappedItem;
				var fullPropertyName = parentPropertyName + "[" + i + "]";
				switch (key.status) {
				case "added":
					var item = optimizedKeys ? itemsByKey[key.value] : getItemByKey(ko.utils.unwrapObservable(rootObject), key.value, keyCallback);
					mappedItem = updateViewModel(undefined, item, options, parentName, mappedRootObject, fullPropertyName, parent);
					if(!hasCreateCallback()) {
						mappedItem = ko.utils.unwrapObservable(mappedItem);
					}

					var index = ignorableIndexOf(ko.utils.unwrapObservable(rootObject), item, ignoreIndexOf);
					
					if (mappedItem === emptyReturn) {
						passedOver++;
					} else {
						newContents[index - passedOver] = mappedItem;
					}
						
					ignoreIndexOf[index] = true;
					break;
				case "retained":
					var item = optimizedKeys ? itemsByKey[key.value] : getItemByKey(ko.utils.unwrapObservable(rootObject), key.value, keyCallback);
					mappedItem = getItemByKey(mappedRootObject, key.value, keyCallback);
					updateViewModel(mappedItem, item, options, parentName, mappedRootObject, fullPropertyName, parent);

					var index = ignorableIndexOf(ko.utils.unwrapObservable(rootObject), item, ignoreIndexOf);
					newContents[index] = mappedItem;
					ignoreIndexOf[index] = true;
					break;
				case "deleted":
					mappedItem = getItemByKey(mappedRootObject, key.value, keyCallback);
					break;
				}

				changes.push({
					event: key.status,
					item: mappedItem
				});
			}

			mappedRootObject(newContents);

			if (options[parentName] && options[parentName].arrayChanged) {
				ko.utils.arrayForEach(changes, function (change) {
					options[parentName].arrayChanged(change.event, change.item);
				});
			}
		}

		return mappedRootObject;
	}

	function ignorableIndexOf(array, item, ignoreIndices) {
		for (var i = 0, j = array.length; i < j; i++) {
			if (ignoreIndices[i] === true) continue;
			if (array[i] === item) return i;
		}
		return null;
	}

	function mapKey(item, callback) {
		var mappedItem;
		if (callback) mappedItem = callback(item);
		if (exports.getType(mappedItem) === "undefined") mappedItem = item;

		return ko.utils.unwrapObservable(mappedItem);
	}

	function getItemByKey(array, key, callback) {
		array = ko.utils.unwrapObservable(array);
		for (var i = 0, j = array.length; i < j; i++) {
			var item = array[i];
			if (mapKey(item, callback) === key) return item;
		}

		throw new Error("When calling ko.update*, the key '" + key + "' was not found!");
	}

	function filterArrayByKey(array, callback) {
		return ko.utils.arrayMap(ko.utils.unwrapObservable(array), function (item) {
			if (callback) {
				return mapKey(item, callback);
			} else {
				return item;
			}
		});
	}

	function visitPropertiesOrArrayEntries(rootObject, visitorCallback) {
		if (exports.getType(rootObject) === "array") {
			for (var i = 0; i < rootObject.length; i++)
			visitorCallback(i);
		} else {
			for (var propertyName in rootObject)
			visitorCallback(propertyName);
		}
	};

	function canHaveProperties(object) {
		var type = exports.getType(object);
		return ((type === "object") || (type === "array")) && (object !== null);
	}

	// Based on the parentName, this creates a fully classified name of a property

	function getPropertyName(parentName, parent, indexer) {
		var propertyName = parentName || "";
		if (exports.getType(parent) === "array") {
			if (parentName) {
				propertyName += "[" + indexer + "]";
			}
		} else {
			if (parentName) {
				propertyName += ".";
			}
			propertyName += indexer;
		}
		return propertyName;
	}

	exports.visitModel = function (rootObject, callback, options) {
		options = options || {};
		options.visitedObjects = options.visitedObjects || new objectLookup();

		var mappedRootObject;
		var unwrappedRootObject = ko.utils.unwrapObservable(rootObject);

		if (!canHaveProperties(unwrappedRootObject)) {
			return callback(rootObject, options.parentName);
		} else {
			options = fillOptions(options, unwrappedRootObject[mappingProperty]);

			// Only do a callback, but ignore the results
			callback(rootObject, options.parentName);
			mappedRootObject = exports.getType(unwrappedRootObject) === "array" ? [] : {};
		}

		options.visitedObjects.save(rootObject, mappedRootObject);

		var parentName = options.parentName;
		visitPropertiesOrArrayEntries(unwrappedRootObject, function (indexer) {
			if (options.ignore && ko.utils.arrayIndexOf(options.ignore, indexer) != -1) return;

			var propertyValue = unwrappedRootObject[indexer];
			options.parentName = getPropertyName(parentName, unwrappedRootObject, indexer);

			// If we don't want to explicitly copy the unmapped property...
			if (ko.utils.arrayIndexOf(options.copy, indexer) === -1) {
				// ...find out if it's a property we want to explicitly include
				if (ko.utils.arrayIndexOf(options.include, indexer) === -1) {
					// The mapped properties object contains all the properties that were part of the original object.
					// If a property does not exist, and it is not because it is part of an array (e.g. "myProp[3]"), then it should not be unmapped.
				    if (unwrappedRootObject[mappingProperty]
				        && unwrappedRootObject[mappingProperty].mappedProperties && !unwrappedRootObject[mappingProperty].mappedProperties[indexer]
				        && unwrappedRootObject[mappingProperty].copiedProperties && !unwrappedRootObject[mappingProperty].copiedProperties[indexer]
				        && !(exports.getType(unwrappedRootObject) === "array")) {
						return;
					}
				}
			}

			var outputProperty;
			switch (exports.getType(ko.utils.unwrapObservable(propertyValue))) {
			case "object":
			case "array":
			case "undefined":
				var previouslyMappedValue = options.visitedObjects.get(propertyValue);
				mappedRootObject[indexer] = (exports.getType(previouslyMappedValue) !== "undefined") ? previouslyMappedValue : exports.visitModel(propertyValue, callback, options);
				break;
			default:
				mappedRootObject[indexer] = callback(propertyValue, options.parentName);
			}
		});

		return mappedRootObject;
	}

	function simpleObjectLookup() {
		var keys = [];
		var values = [];
		this.save = function (key, value) {
			var existingIndex = ko.utils.arrayIndexOf(keys, key);
			if (existingIndex >= 0) values[existingIndex] = value;
			else {
				keys.push(key);
				values.push(value);
			}
		};
		this.get = function (key) {
			var existingIndex = ko.utils.arrayIndexOf(keys, key);
			var value = (existingIndex >= 0) ? values[existingIndex] : undefined;
			return value;
		};
	};
	
	function objectLookup() {
		var buckets = {};
		
		var findBucket = function(key) {
			var bucketKey;
			try {
				bucketKey = key;//JSON.stringify(key);
			}
			catch (e) {
				bucketKey = "$$$";
			}

			var bucket = buckets[bucketKey];
			if (bucket === undefined) {
				bucket = new simpleObjectLookup();
				buckets[bucketKey] = bucket;
			}
			return bucket;
		};
		
		this.save = function (key, value) {
			findBucket(key).save(key, value);
		};
		this.get = function (key) {
			return findBucket(key).get(key);
		};
	};
}));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],31:[function(require,module,exports){
(function (global){
// Knockout Fast Mapping v0.1
// License: MIT (http://www.opensource.org/licenses/mit-license.php)

(function (factory) {
	// Module systems magic dance.

	if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
		// CommonJS or Node: hard-coded dependency on "knockout"
		factory((typeof window !== "undefined" ? window['ko'] : typeof global !== "undefined" ? global['ko'] : null), exports);
	} else if (typeof define === "function" && define["amd"]) {
		// AMD anonymous module with hard-coded dependency on "knockout"
		define(["knockout", "exports"], factory);
	} else {
		// <script> tag: use the global `ko` object, attaching a `wrap` property
		factory(ko, ko.wrap = {});
	}
}(function (ko, exports) {
    
    // this function mimics ko.mapping
    exports.fromJS = function(jsObject, computedFunctions)
    {
        reset();
	return wrap(jsObject, computedFunctions);
    }

    // this function unwraps the outer for assigning the result to an observable
    // see https://github.com/SteveSanderson/knockout/issues/517
    exports.updateFromJS = function(observable, jsObject, computedFunctions)
    {
        reset();
	return observable(ko.utils.unwrapObservable(wrap(jsObject, computedFunctions)));
    }

    exports.fromJSON = function (jsonString, computedFunctions) {
	var parsed = ko.utils.parseJson(jsonString);
	arguments[0] = parsed;
	return exports.fromJS.apply(this, computedFunctions);
    };
    
    exports.toJS = function (observable) {
	return unwrap(observable);
    }

    exports.toJSON = function (observable) {
	var plainJavaScriptObject = exports.toJS(observable);
	return ko.utils.stringifyJson(plainJavaScriptObject);
    };

    function typeOf(value) {
	var s = typeof value;
	if (s === 'object') {
            if (value) {
                if (value.constructor == Date)
                    s = 'date';
		else if (Object.prototype.toString.call(value) == '[object Array]')
                    s = 'array';
            } else {
		s = 'null';
            }
	}
	return s;
    }

    // unwrapping
    function unwrapObject(o)
    {
	var t = {};

	for (var k in o)
	{
	    var v = o[k];

	    if (ko.isComputed(v))
		continue;

	    t[k] = unwrap(v);
	}

	return t;
    }

    function unwrapArray(a)
    {
	var r = [];

	if (!a || a.length == 0)
	    return r;
	
	for (var i = 0, l = a.length; i < l; ++i)
	    r.push(unwrap(a[i]));

	return r;
    }

    function unwrap(v)
    {
	var isObservable = ko.isObservable(v);

	if (isObservable)
	{
	    var val = v();

	    return unwrap(val);
	}
	else
	{
	    if (typeOf(v) == "array")
	    {
		return unwrapArray(v);
	    }
	    else if (typeOf(v) == "object")
	    {
		return unwrapObject(v);
	    }
	    else
	    {
		return v;
	    }
	}
    }

    function reset()
    {
        parents = [{obj: null, wrapped: null, lvl: ""}];
    }    
    
    // wrapping

    function wrapObject(o, computedFunctions)
    {
        // check for infinite recursion
        for (var i = 0; i < parents.length; ++i) {
            if (parents[i].obj === o) {
                return parents[i].wrapped;
            }
        }

	var t = {};

	for (var k in o)
	{
	    var v = o[k];

            parents.push({obj: o, wrapped: t, lvl: currentLvl() + "/" + k});

	    t[k] = wrap(v, computedFunctions);

            parents.pop();
	}

	if (computedFunctions && computedFunctions[currentLvl()])
	    t = computedFunctions[currentLvl()](t);

        if (hasES5Plugin())
            ko.track(t);

	return t;
    }

    function wrapArray(a, computedFunctions)
    {
	var r = ko.observableArray();

	if (!a || a.length == 0)
	    return r;

	for (var i = 0, l = a.length; i < l; ++i)
	    r.push(wrap(a[i], computedFunctions));

	return r;
    }

    // a stack, used for two purposes:
    //  - circular reference checking
    //  - computed functions
    var parents;

    function currentLvl()
    {
	return parents[parents.length-1].lvl;
    }

    function wrap(v, computedFunctions)
    {
	if (typeOf(v) == "array")
	{
	    return wrapArray(v, computedFunctions);
	}
	else if (typeOf(v) == "object")
	{
	    return wrapObject(v, computedFunctions);
	}
	else
	{
            if (!hasES5Plugin() && typeof v !== 'function')
            {
	        var t = ko.observable();
	        t(v);
	        return t;
            } else
                return v;
	}
    }

    function hasES5Plugin()
    {
        return ko.track != null;
    }
}));
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],32:[function(require,module,exports){
/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (typeof define === 'function' && define.amd) {
    define(function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');

},{}],33:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":38}],34:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    getRawTag = require('./_getRawTag'),
    objectToString = require('./_objectToString');

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;

},{"./_Symbol":33,"./_getRawTag":36,"./_objectToString":37}],35:[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],36:[function(require,module,exports){
var Symbol = require('./_Symbol');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;

},{"./_Symbol":33}],37:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;

},{}],38:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":35}],39:[function(require,module,exports){
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;

},{}],40:[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],41:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isArray = require('./isArray'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var stringTag = '[object String]';

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
}

module.exports = isString;

},{"./_baseGetTag":34,"./isArray":39,"./isObjectLike":40}],42:[function(require,module,exports){
/**
 * Checks if `value` is `undefined`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
 * @example
 *
 * _.isUndefined(void 0);
 * // => true
 *
 * _.isUndefined(null);
 * // => false
 */
function isUndefined(value) {
  return value === undefined;
}

module.exports = isUndefined;

},{}],43:[function(require,module,exports){
!function(t,e){if("object"==typeof exports&&"object"==typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var r=e();for(var n in r)("object"==typeof exports?exports:t)[n]=r[n]}}(this,function(){return function(t){function e(n){if(r[n])return r[n].exports;var o=r[n]={exports:{},id:n,loaded:!1};return t[n].call(o.exports,o,o.exports,e),o.loaded=!0,o.exports}var r={};return e.m=t,e.c=r,e.p="",e(0)}([function(t,e,r){t.exports=r(1)},function(t,e,r){"use strict";var n=r(2),o=window&&window._rollbarConfig,i=o&&o.globalAlias||"Rollbar",a=window&&window[i]&&"function"==typeof window[i].shimId&&void 0!==window[i].shimId();if(window&&!window._rollbarStartTime&&(window._rollbarStartTime=(new Date).getTime()),!a&&o){var s=new n(o);window[i]=s}else window.rollbar=n,window._rollbarDidLoad=!0;t.exports=n},function(t,e,r){"use strict";function n(t,e){this.options=s.extend(!0,m,t);var r=new u(this.options,p,f);this.client=e||new a(this.options,r,c),o(this.client.notifier),i(this.client.queue),this.options.captureUncaught&&(l.captureUncaughtExceptions(window,this),l.wrapGlobals(window,this)),this.options.captureUnhandledRejections&&l.captureUnhandledRejections(window,this)}function o(t){t.addTransform(h.handleItemWithError).addTransform(h.ensureItemHasSomethingToSay).addTransform(h.addBaseInfo).addTransform(h.addRequestInfo(window)).addTransform(h.addClientInfo(window)).addTransform(h.addPluginInfo(window)).addTransform(h.addBody).addTransform(h.scrubPayload).addTransform(h.userTransform).addTransform(h.itemToPayload)}function i(t){t.addPredicate(d.checkIgnore).addPredicate(d.userCheckIgnore).addPredicate(d.urlIsWhitelisted).addPredicate(d.messageIsIgnored)}var a=r(3),s=r(6),u=r(10),c=r(12),l=r(15),p=r(16),f=r(17),h=r(18),d=r(22),g=r(19);n.prototype.global=function(t){return this.client.global(t),this},n.prototype.configure=function(t){var e=this.options;return this.options=s.extend(!0,{},e,t),this.client.configure(t),this},n.prototype.log=function(){var t=this._createItem(arguments),e=t.uuid;return this.client.log(t),{uuid:e}},n.prototype.debug=function(){var t=this._createItem(arguments),e=t.uuid;return this.client.debug(t),{uuid:e}},n.prototype.info=function(){var t=this._createItem(arguments),e=t.uuid;return this.client.info(t),{uuid:e}},n.prototype.warn=function(){var t=this._createItem(arguments),e=t.uuid;return this.client.warn(t),{uuid:e}},n.prototype.warning=function(){var t=this._createItem(arguments),e=t.uuid;return this.client.warning(t),{uuid:e}},n.prototype.error=function(){var t=this._createItem(arguments),e=t.uuid;return this.client.error(t),{uuid:e}},n.prototype.critical=function(){var t=this._createItem(arguments),e=t.uuid;return this.client.critical(t),{uuid:e}},n.prototype.handleUncaughtException=function(t,e,r,n,o,i){var a,u=s.makeUnhandledStackInfo(t,e,r,n,o,"onerror","uncaught exception",g);s.isError(o)?(a=this._createItem([t,o,i]),a._unhandledStackInfo=u):s.isError(e)?(a=this._createItem([t,e,i]),a._unhandledStackInfo=u):(a=this._createItem([t,i]),a.stackInfo=u),a.level=this.options.uncaughtErrorLevel,a._isUncaught=!0,this.client.log(a)},n.prototype.handleUnhandledRejection=function(t,e){var r="unhandled rejection was null or undefined!";r=t?t.message||String(t):r;var n,o=t&&t._rollbarContext||e&&e._rollbarContext;s.isError(t)?n=this._createItem([r,t,o]):(n=this._createItem([r,o]),n.stackInfo=s.makeUnhandledStackInfo(r,"",0,0,null,"unhandledrejection","",g)),n.level=this.options.uncaughtErrorLevel,n._isUncaught=!0,this.client.log(n)},n.prototype.wrap=function(t,e){try{var r;if(r=s.isFunction(e)?e:function(){return e||{}},!s.isFunction(t))return t;if(t._isWrap)return t;if(!t._wrapped&&(t._wrapped=function(){try{return t.apply(this,arguments)}catch(n){var e=n;throw s.isType(e,"string")&&(e=new String(e)),e._rollbarContext=r()||{},e._rollbarContext._wrappedSource=t.toString(),window._rollbarWrappedError=e,e}},t._wrapped._isWrap=!0,t.hasOwnProperty))for(var n in t)t.hasOwnProperty(n)&&(t._wrapped[n]=t[n]);return t._wrapped}catch(e){return t}},n.prototype._createItem=function(t){for(var e,r,n,o,i,a=[],u=0,l=t.length;u<l;++u)switch(i=t[u],s.typeName(i)){case"undefined":break;case"string":e?a.push(i):e=i;break;case"function":o=s.wrapRollbarFunction(c,i,this);break;case"date":a.push(i);break;case"error":case"domexception":r?a.push(i):r=i;break;case"object":case"array":if(i instanceof Error||"undefined"!=typeof DOMException&&i instanceof DOMException){r?a.push(i):r=i;break}n?a.push(i):n=i;break;default:if(i instanceof Error||"undefined"!=typeof DOMException&&i instanceof DOMException){r?a.push(i):r=i;break}a.push(i)}a.length>0&&(n=s.extend(!0,{},n),n.extraArgs=a);var p={message:e,err:r,custom:n,timestamp:(new Date).getTime(),callback:o,uuid:s.uuid4()};return p._originalArgs=t,p};var m={version:"2.0.4",scrubFields:["pw","pass","passwd","password","secret","confirm_password","confirmPassword","password_confirmation","passwordConfirmation","access_token","accessToken","secret_key","secretKey","secretToken"],logLevel:"debug",reportLevel:"debug",uncaughtErrorLevel:"error",endpoint:"api.rollbar.com/api/1/",enabled:!0};t.exports=n},function(t,e,r){"use strict";function n(t,e,r){this.options=s.extend(!0,{},t),this.logger=r,this.queue=new i(n.rateLimiter,e,this.options),this.notifier=new a(this.queue,this.options)}var o=r(4),i=r(5),a=r(9),s=r(6),u={maxItems:0,itemsPerMinute:60};n.rateLimiter=new o(u),n.prototype.global=function(t){return n.rateLimiter.configureGlobal(t),this},n.prototype.configure=function(t){this.notifier&&this.notifier.configure(t);var e=this.options;return this.options=s.extend(!0,{},e,t),this},n.prototype.log=function(t){var e=this._defaultLogLevel();return this._log(e,t)},n.prototype.debug=function(t){this._log("debug",t)},n.prototype.info=function(t){this._log("info",t)},n.prototype.warn=function(t){this._log("warning",t)},n.prototype.warning=function(t){this._log("warning",t)},n.prototype.error=function(t){this._log("error",t)},n.prototype.critical=function(t){this._log("critical",t)},n.prototype.wait=function(t){this.queue.wait(t)},n.prototype._log=function(t,e){s.wrapRollbarFunction(this.logger,function(){var r=null;e.callback&&(r=e.callback,delete e.callback),e.level=e.level||t,this.notifier.log(e,r)},this)()},n.prototype._defaultLogLevel=function(){return this.options.logLevel||"debug"},t.exports=n},function(t,e){"use strict";function r(t){this.startTime=(new Date).getTime(),this.counter=0,this.perMinCounter=0,this.configureGlobal(t)}function n(t,e,r){return!t.ignoreRateLimit&&e>=1&&r>=e}function o(t,e,r){var n=null;return t&&(t=new Error(t)),t||e||(n=i(r)),{error:t,shouldSend:e,payload:n}}function i(t){return{message:"maxItems has been hit. Ignoring errors until reset.",err:null,custom:{maxItems:t}}}r.globalSettings={startTime:(new Date).getTime(),maxItems:void 0,itemsPerMinute:void 0},r.prototype.configureGlobal=function(t){void 0!==t.startTime&&(r.globalSettings.startTime=t.startTime),void 0!==t.maxItems&&(r.globalSettings.maxItems=t.maxItems),void 0!==t.itemsPerMinute&&(r.globalSettings.itemsPerMinute=t.itemsPerMinute)},r.prototype.shouldSend=function(t,e){e=e||(new Date).getTime(),e-this.startTime>=6e4&&(this.startTime=e,this.perMinCounter=0);var i=r.globalSettings.maxItems,a=r.globalSettings.itemsPerMinute;if(n(t,i,this.counter))return o(i+" max items reached",!1);if(n(t,a,this.perMinCounter))return o(a+" items per minute reached",!1);this.counter++,this.perMinCounter++;var s=!n(t,i,this.counter);return o(null,s,i)},t.exports=r},function(t,e,r){"use strict";function n(t,e,r){this.rateLimiter=t,this.api=e,this.options=r,this.predicates=[],this.pendingRequests=[],this.retryQueue=[],this.retryHandle=null,this.waitCallback=null}var o=r(6);n.prototype.configure=function(t){this.api&&this.api.configure(t);var e=this.options;return this.options=o.extend(!0,{},e,t),this},n.prototype.addPredicate=function(t){return o.isFunction(t)&&this.predicates.push(t),this},n.prototype.addItem=function(t,e){e&&o.isFunction(e)||(e=function(){});var r=this._applyPredicates(t);if(r.stop)return void e(r.err);if(this.waitCallback)return void e();this.pendingRequests.push(t);try{this._makeApiRequest(t,function(r,n){this._dequeuePendingRequest(t),e(r,n)}.bind(this))}catch(r){this._dequeuePendingRequest(t),e(r)}},n.prototype.wait=function(t){o.isFunction(t)&&(this.waitCallback=t,0==this.pendingRequests.length&&this.waitCallback())},n.prototype._applyPredicates=function(t){for(var e=null,r=0,n=this.predicates.length;r<n;r++)if(e=this.predicates[r](t,this.options),!e||void 0!==e.err)return{stop:!0,err:e.err};return{stop:!1,err:null}},n.prototype._makeApiRequest=function(t,e){var r=this.rateLimiter.shouldSend(t);r.shouldSend?this.api.postItem(t,function(r,n){r?this._maybeRetry(r,t,e):e(r,n)}.bind(this)):r.error?e(r.error):this.api.postItem(r.payload,e)};var i=["ECONNRESET","ENOTFOUND","ESOCKETTIMEDOUT","ETIMEDOUT","ECONNREFUSED","EHOSTUNREACH","EPIPE","EAI_AGAIN"];n.prototype._maybeRetry=function(t,e,r){var n=!1;if(this.options.retryInterval)for(var o=0,a=i.length;o<a;o++)if(t.code===i[o]){n=!0;break}n?this._retryApiRequest(e,r):r(t)},n.prototype._retryApiRequest=function(t,e){this.retryQueue.push({item:t,callback:e}),this.retryHandle||(this.retryHandle=setInterval(function(){for(;this.retryQueue.length;){var t=this.retryQueue.shift();this._makeApiRequest(t.item,t.callback)}}.bind(this),this.options.retryInterval))},n.prototype._dequeuePendingRequest=function(t){for(var e=1==this.pendingRequests.length,r=this.pendingRequests.length;r>=0;r--)if(this.pendingRequests[r]==t)return this.pendingRequests.splice(r,1),void(e&&o.isFunction(this.waitCallback)&&this.waitCallback())},t.exports=n},function(t,e,r){"use strict";function n(){if(!I&&(I=!0,s(JSON)&&(a(JSON.stringify)&&(S.stringify=JSON.stringify),a(JSON.parse)&&(S.parse=JSON.parse)),!a(S.stringify)||!a(S.parse))){var t=r(8);t(S)}}function o(t,e){return e===i(t)}function i(t){var e=typeof t;return"object"!==e?e:t?t instanceof Error?"error":{}.toString.call(t).match(/\s([a-zA-Z]+)/)[1].toLowerCase():"null"}function a(t){return o(t,"function")}function s(t){return!o(t,"undefined")}function u(t){var e=i(t);return"object"===e||"array"===e}function c(t){return o(t,"error")}function l(t,e,r){return function(){var n=r||this;try{return e.apply(n,arguments)}catch(e){t.error(e)}}}function p(t,e){var r,n,i,a=o(t,"object"),s=o(t,"array"),u=[];if(a)for(r in t)Object.prototype.hasOwnProperty.call(t,r)&&u.push(r);else if(s)for(i=0;i<t.length;++i)u.push(i);for(i=0;i<u.length;++i)r=u[i],n=t[r],t[r]=e(r,n);return t}function f(){return"********"}function h(){var t=(new Date).getTime(),e="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var r=(t+16*Math.random())%16|0;return t=Math.floor(t/16),("x"===e?r:7&r|8).toString(16)});return e}function d(t){var e=g(t);return""===e.anchor&&(e.source=e.source.replace("#","")),t=e.source.replace("?"+e.query,"")}function g(t){if(!o(t,"string"))throw new Error("received invalid input");for(var e=j,r=e.parser[e.strictMode?"strict":"loose"].exec(t),n={},i=e.key.length;i--;)n[e.key[i]]=r[i]||"";return n[e.q.name]={},n[e.key[12]].replace(e.q.parser,function(t,r,o){r&&(n[e.q.name][r]=o)}),n}function m(t,e,r){r=r||{},r.access_token=t;var n,o=[];for(n in r)Object.prototype.hasOwnProperty.call(r,n)&&o.push([n,r[n]].join("="));var i="?"+o.sort().join("&");e=e||{},e.path=e.path||"";var a,s=e.path.indexOf("?"),u=e.path.indexOf("#");s!==-1&&(u===-1||u>s)?(a=e.path,e.path=a.substring(0,s)+i+"&"+a.substring(s+1)):u!==-1?(a=e.path,e.path=a.substring(0,u)+i+a.substring(u)):e.path=e.path+i}function v(t,e){if(e=e||t.protocol,!e&&t.port&&(80===t.port?e="http:":443===t.port&&(e="https:")),e=e||"https:",!t.hostname)return null;var r=e+"//"+t.hostname;return t.port&&(r=r+":"+t.port),t.path&&(r+=t.path),r}function y(t,e){var r,n;try{r=S.stringify(t)}catch(o){if(e&&a(e))try{r=e(t)}catch(t){n=t}else n=o}return{error:n,value:r}}function b(t){var e,r;try{e=S.parse(t)}catch(t){r=t}return{error:r,value:e}}function w(t,e,r,n,o,i,a,s){var u={url:e||"",line:r,column:n};u.func=s.guessFunctionName(u.url,u.line),u.context=s.gatherContext(u.url,u.line);var c=document&&document.location&&document.location.href,l=window&&window.navigator&&window.navigator.userAgent;return{mode:i,message:o?String(o):t||a,url:c,stack:[u],useragent:l}}function x(t,e){if(t){var r=e.split("."),n=t;try{for(var o=0,i=r.length;o<i;++o)n=n[r[o]]}catch(t){n=void 0}return n}}function k(t,e,r){if(t){var n=e.split("."),o=n.length;if(!(o<1)){if(1===o)return void(t[n[0]]=r);try{for(var i=t[n[0]]||{},a=i,s=1;s<o-1;s++)i[n[s]]=i[n[s]]||{},i=i[n[s]];i[n[o-1]]=r,t[n[0]]=a}catch(t){return}}}}function E(t,e){function r(t,e,r,n,o,i){return e+f(i)}function n(t){var e;if(o(t,"string"))for(e=0;e<u.length;++e)t=t.replace(u[e],r);return t}function i(t,e){var r;for(r=0;r<s.length;++r)if(s[r].test(t)){e=f(e);break}return e}function a(t,e){var r=i(t,e);return r===e?o(e,"object")||o(e,"array")?p(e,a):n(r):r}e=e||[];var s=T(e),u=O(e);return p(t,a),t}function T(t){for(var e,r=[],n=0;n<t.length;++n)e="\\[?(%5[bB])?"+t[n]+"\\[?(%5[bB])?\\]?(%5[dD])?",r.push(new RegExp(e,"i"));return r}function O(t){for(var e,r=[],n=0;n<t.length;++n)e="\\[?(%5[bB])?"+t[n]+"\\[?(%5[bB])?\\]?(%5[dD])?",r.push(new RegExp("("+e+"=)([^&\\n]+)","igm"));return r}var _=r(7),S={},I=!1;n();var N={debug:0,info:1,warning:2,error:3,critical:4},j={strictMode:!1,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};t.exports={isType:o,typeName:i,isFunction:a,isIterable:u,isError:c,extend:_,traverse:p,redact:f,uuid4:h,wrapRollbarFunction:l,LEVELS:N,sanitizeUrl:d,addParamsAndAccessTokenToPath:m,formatUrl:v,stringify:y,jsonParse:b,makeUnhandledStackInfo:w,get:x,set:k,scrub:E}},function(t,e){"use strict";var r=Object.prototype.hasOwnProperty,n=Object.prototype.toString,o=function(t){return"function"==typeof Array.isArray?Array.isArray(t):"[object Array]"===n.call(t)},i=function(t){if(!t||"[object Object]"!==n.call(t))return!1;var e=r.call(t,"constructor"),o=t.constructor&&t.constructor.prototype&&r.call(t.constructor.prototype,"isPrototypeOf");if(t.constructor&&!e&&!o)return!1;var i;for(i in t);return"undefined"==typeof i||r.call(t,i)};t.exports=function t(){var e,r,n,a,s,u,c=arguments[0],l=1,p=arguments.length,f=!1;for("boolean"==typeof c?(f=c,c=arguments[1]||{},l=2):("object"!=typeof c&&"function"!=typeof c||null==c)&&(c={});l<p;++l)if(e=arguments[l],null!=e)for(r in e)n=c[r],a=e[r],c!==a&&(f&&a&&(i(a)||(s=o(a)))?(s?(s=!1,u=n&&o(n)?n:[]):u=n&&i(n)?n:{},c[r]=t(f,u,a)):"undefined"!=typeof a&&(c[r]=a));return c}},function(t,e){var r=function(t){function e(t){return t<10?"0"+t:t}function r(){return this.valueOf()}function n(t){return i.lastIndex=0,i.test(t)?'"'+t.replace(i,function(t){var e=u[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+t+'"'}function o(t,e){var r,i,u,l,p,f=a,h=e[t];switch(h&&"object"==typeof h&&"function"==typeof h.toJSON&&(h=h.toJSON(t)),"function"==typeof c&&(h=c.call(e,t,h)),typeof h){case"string":return n(h);case"number":return isFinite(h)?String(h):"null";case"boolean":case"null":return String(h);case"object":if(!h)return"null";if(a+=s,p=[],"[object Array]"===Object.prototype.toString.apply(h)){for(l=h.length,r=0;r<l;r+=1)p[r]=o(r,h)||"null";return u=0===p.length?"[]":a?"[\n"+a+p.join(",\n"+a)+"\n"+f+"]":"["+p.join(",")+"]",a=f,u}if(c&&"object"==typeof c)for(l=c.length,r=0;r<l;r+=1)"string"==typeof c[r]&&(i=c[r],u=o(i,h),u&&p.push(n(i)+(a?": ":":")+u));else for(i in h)Object.prototype.hasOwnProperty.call(h,i)&&(u=o(i,h),u&&p.push(n(i)+(a?": ":":")+u));return u=0===p.length?"{}":a?"{\n"+a+p.join(",\n"+a)+"\n"+f+"}":"{"+p.join(",")+"}",a=f,u}}var i=/[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+e(this.getUTCMonth()+1)+"-"+e(this.getUTCDate())+"T"+e(this.getUTCHours())+":"+e(this.getUTCMinutes())+":"+e(this.getUTCSeconds())+"Z":null},Boolean.prototype.toJSON=r,Number.prototype.toJSON=r,String.prototype.toJSON=r);var a,s,u,c;"function"!=typeof t.stringify&&(u={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},t.stringify=function(t,e,r){var n;if(a="",s="","number"==typeof r)for(n=0;n<r;n+=1)s+=" ";else"string"==typeof r&&(s=r);if(c=e,e&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw new Error("JSON.stringify");return o("",{"":t})}),"function"!=typeof t.parse&&(t.parse=function(){function t(t){return t.replace(/\\(?:u(.{4})|([^u]))/g,function(t,e,r){return e?String.fromCharCode(parseInt(e,16)):a[r]})}var e,r,n,o,i,a={"\\":"\\",'"':'"',"/":"/",t:"\t",n:"\n",r:"\r",f:"\f",b:"\b"},s={go:function(){e="ok"},firstokey:function(){o=i,e="colon"},okey:function(){o=i,e="colon"},ovalue:function(){e="ocomma"},firstavalue:function(){e="acomma"},avalue:function(){e="acomma"}},u={go:function(){e="ok"},ovalue:function(){e="ocomma"},firstavalue:function(){e="acomma"},avalue:function(){e="acomma"}},c={"{":{go:function(){r.push({state:"ok"}),n={},e="firstokey"},ovalue:function(){r.push({container:n,state:"ocomma",key:o}),n={},e="firstokey"},firstavalue:function(){r.push({container:n,state:"acomma"}),n={},e="firstokey"},avalue:function(){r.push({container:n,state:"acomma"}),n={},e="firstokey"}},"}":{firstokey:function(){var t=r.pop();i=n,n=t.container,o=t.key,e=t.state},ocomma:function(){var t=r.pop();n[o]=i,i=n,n=t.container,o=t.key,e=t.state}},"[":{go:function(){r.push({state:"ok"}),n=[],e="firstavalue"},ovalue:function(){r.push({container:n,state:"ocomma",key:o}),n=[],e="firstavalue"},firstavalue:function(){r.push({container:n,state:"acomma"}),n=[],e="firstavalue"},avalue:function(){r.push({container:n,state:"acomma"}),n=[],e="firstavalue"}},"]":{firstavalue:function(){var t=r.pop();i=n,n=t.container,o=t.key,e=t.state},acomma:function(){var t=r.pop();n.push(i),i=n,n=t.container,o=t.key,e=t.state}},":":{colon:function(){if(Object.hasOwnProperty.call(n,o))throw new SyntaxError("Duplicate key '"+o+'"');e="ovalue"}},",":{ocomma:function(){n[o]=i,e="okey"},acomma:function(){n.push(i),e="avalue"}},true:{go:function(){i=!0,e="ok"},ovalue:function(){i=!0,e="ocomma"},firstavalue:function(){i=!0,e="acomma"},avalue:function(){i=!0,e="acomma"}},false:{go:function(){i=!1,e="ok"},ovalue:function(){i=!1,e="ocomma"},firstavalue:function(){i=!1,e="acomma"},avalue:function(){i=!1,e="acomma"}},null:{go:function(){i=null,e="ok"},ovalue:function(){i=null,e="ocomma"},firstavalue:function(){i=null,e="acomma"},avalue:function(){i=null,e="acomma"}}};return function(n,o){var a,l=/^[\u0020\t\n\r]*(?:([,:\[\]{}]|true|false|null)|(-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)|"((?:[^\r\n\t\\\"]|\\(?:["\\\/trnfb]|u[0-9a-fA-F]{4}))*)")/;e="go",r=[];try{for(;;){if(a=l.exec(n),!a)break;a[1]?c[a[1]][e]():a[2]?(i=+a[2],u[e]()):(i=t(a[3]),s[e]()),n=n.slice(a[0].length)}}catch(t){e=t}if("ok"!==e||/[^\u0020\t\n\r]/.test(n))throw e instanceof SyntaxError?e:new SyntaxError("JSON");return"function"==typeof o?function t(e,r){var n,a,s=e[r];if(s&&"object"==typeof s)for(n in i)Object.prototype.hasOwnProperty.call(s,n)&&(a=t(s,n),void 0!==a?s[n]=a:delete s[n]);return o.call(e,r,s)}({"":i},""):i}}())};t.exports=r},function(t,e,r){"use strict";function n(t,e){this.queue=t,this.options=e,this.transforms=[]}var o=r(6);n.prototype.configure=function(t){this.queue&&this.queue.configure(t);var e=this.options;return this.options=o.extend(!0,{},e,t),this},n.prototype.addTransform=function(t){return o.isFunction(t)&&this.transforms.push(t),this},n.prototype.log=function(t,e){return e&&o.isFunction(e)||(e=function(){}),this.options.enabled?void this._applyTransforms(t,function(t,r){return t?e(t,null):void this.queue.addItem(r,e)}.bind(this)):e(new Error("Rollbar is not enabled"))},n.prototype._applyTransforms=function(t,e){var r=-1,n=this.transforms.length,o=this.transforms,i=this.options,a=function(t,s){return t?void e(t,null):(r++,r===n?void e(null,s):void o[r](s,i,a))};a(null,t)},t.exports=n},function(t,e,r){"use strict";function n(t,e,r,n){this.options=t,this.transport=e,this.url=r,this.jsonBackup=n,this.accessToken=t.accessToken,this.transportOptions=o(t,r)}function o(t,e){return a.getTransportFromOptions(t,s,e)}var i=r(6),a=r(11),s={hostname:"api.rollbar.com",path:"/api/1",search:null,version:"1",protocol:"https:",port:443};n.prototype.postItem=function(t,e){var r=a.transportOptions(this.transportOptions,"/item/","POST"),n=a.buildPayload(this.accessToken,t,this.jsonBackup);this.transport.post(this.accessToken,r,n,e)},n.prototype.configure=function(t){var e=this.oldOptions;return this.options=i.extend(!0,{},e,t),this.transportOptions=o(this.options,this.url),void 0!==this.options.accessToken&&(this.accessToken=this.options.accessToken),this},t.exports=n},function(t,e,r){"use strict";function n(t,e,r){if(s.isType(e.context,"object")){var n=s.stringify(e.context,r);n.error?e.context="Error: could not serialize 'context'":e.context=n.value||"",e.context.length>255&&(e.context=e.context.substr(0,255))}return{access_token:t,data:e}}function o(t,e,r){var n=e.hostname,o=e.protocol,i=e.port,a=e.path,s=e.search,u=t.proxy;if(t.endpoint){var c=r.parse(t.endpoint);n=c.hostname,o=c.protocol,i=c.port,a=c.pathname,s=c.search}return{hostname:n,protocol:o,port:i,path:a,search:s,proxy:u}}function i(t,e,r){var n=t.protocol||"https:",o=t.port||("http:"===n?80:"https:"===n?443:void 0),i=t.hostname;return e=a(t.path,e),t.search&&(e+=t.search),t.proxy&&(e=n+"//"+i+e,i=t.proxy.host||t.proxy.hostname,o=t.proxy.port,n=t.proxy.protocol||n),{protocol:n,hostname:i,path:e,port:o,method:r}}function a(t,e){var r=/\/$/.test(t),n=/^\//.test(e);return r&&n?e=e.substring(1):r||n||(e="/"+e),t+e}var s=r(6);t.exports={buildPayload:n,getTransportFromOptions:o,transportOptions:i,appendPathToPath:a}},function(t,e,r){"use strict";function n(){var t=Array.prototype.slice.call(arguments,0);t.unshift("Rollbar:"),s.ieVersion()<=8?console.error(a.apply(null,t)):console.error.apply(console,t)}function o(){var t=Array.prototype.slice.call(arguments,0);t.unshift("Rollbar:"),s.ieVersion()<=8?console.info(a.apply(null,t)):console.info.apply(console,t)}function i(){var t=Array.prototype.slice.call(arguments,0);t.unshift("Rollbar:"),s.ieVersion()<=8?console.log(a.apply(null,t)):console.log.apply(console,t)}function a(){for(var t=[],e=0;e<arguments.length;e++){var r=arguments[e];"object"==typeof r?(r=u.stringify(r),r=r.error||r.value,r.length>500&&(r=r.substr(0,500)+"...")):"undefined"==typeof r&&(r="undefined"),t.push(r)}return t.join(" ")}r(13);var s=r(14),u=r(6);t.exports={error:n,info:o,log:i}},function(t,e){!function(t){"use strict";t.console||(t.console={});for(var e,r,n=t.console,o=function(){},i=["memory"],a="assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn".split(",");e=i.pop();)n[e]||(n[e]={});for(;r=a.pop();)n[r]||(n[r]=o)}("undefined"==typeof window?this:window)},function(t,e){"use strict";function r(){var t;if(!document)return t;for(var e=3,r=document.createElement("div"),n=r.getElementsByTagName("i");r.innerHTML="<!--[if gt IE "+ ++e+"]><i></i><![endif]-->",n[0];);return e>4?e:t}var n={ieVersion:r};t.exports=n},function(t,e){"use strict";function r(t,e,r){if(t){var o;"function"==typeof e._rollbarOldOnError?o=e._rollbarOldOnError:t.onerror&&!t.onerror.belongsToShim&&(o=t.onerror,e._rollbarOldOnError=o);var i=function(){var r=Array.prototype.slice.call(arguments,0);n(t,e,o,r)};i.belongsToShim=r,t.onerror=i}}function n(t,e,r,n){t._rollbarWrappedError&&(n[4]||(n[4]=t._rollbarWrappedError),n[5]||(n[5]=t._rollbarWrappedError._rollbarContext),t._rollbarWrappedError=null),e.handleUncaughtException.apply(e,n),r&&r.apply(t,n)}function o(t,e,r){if(t){"function"==typeof t._rollbarURH&&t._rollbarURH.belongsToShim&&t.removeEventListener("unhandledrejection",t._rollbarURH);var n=function(t){var r=t.reason,n=t.promise,o=t.detail;!r&&o&&(r=o.reason,n=o.promise),e&&e.handleUnhandledRejection&&e.handleUnhandledRejection(r,n)};n.belongsToShim=r,t._rollbarURH=n,t.addEventListener("unhandledrejection",n)}}function i(t,e,r){if(t){var n,o,i="EventTarget,Window,Node,ApplicationCache,AudioTrackList,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload".split(",");for(n=0;n<i.length;++n)o=i[n],t[o]&&t[o].prototype&&a(e,t[o].prototype,r)}}function a(t,e,r){if(e.hasOwnProperty&&e.hasOwnProperty("addEventListener")){for(var n=e.addEventListener;n._rollbarOldAdd&&n.belongsToShim;)n=n._rollbarOldAdd;var o=function(e,r,o){n.call(this,e,t.wrap(r),o)};o._rollbarOldAdd=n,o.belongsToShim=r,e.addEventListener=o;for(var i=e.removeEventListener;i._rollbarOldRemove&&i.belongsToShim;)i=i._rollbarOldRemove;var a=function(t,e,r){i.call(this,t,e&&e._wrapped||e,r)};a._rollbarOldRemove=i,a.belongsToShim=r,e.removeEventListener=a}}t.exports={captureUncaughtExceptions:r,captureUnhandledRejections:o,wrapGlobals:i}},function(t,e,r){"use strict";function n(t,e,r,n,o){n&&l.isFunction(n)||(n=function(){}),l.addParamsAndAccessTokenToPath(t,e,r);var a="GET",s=l.formatUrl(e);i(t,s,a,null,n,o)}function o(t,e,r,n,o){if(n&&l.isFunction(n)||(n=function(){}),!r)return n(new Error("Cannot send empty request"));var a=l.stringify(r);if(a.error)return n(a.error);var s=a.value,u="POST",c=l.formatUrl(e);i(t,c,u,s,n,o)}function i(t,e,r,n,o,i){var f;if(f=i?i():a(),!f)return o(new Error("No way to send a request"));try{try{var h=function(){try{if(h&&4===f.readyState){h=void 0;var t=l.jsonParse(f.responseText);if(s(f))return void o(t.error,t.value);if(u(f)){if(403===f.status){var e=t.value&&t.value.message;p.error(e)}o(new Error(String(f.status)))}else{var r="XHR response had no status code (likely connection failure)";o(c(r))}}}catch(t){var n;n=t&&t.stack?t:new Error(t),o(n)}};f.open(r,e,!0),f.setRequestHeader&&(f.setRequestHeader("Content-Type","application/json"),f.setRequestHeader("X-Rollbar-Access-Token",t)),f.onreadystatechange=h,f.send(n)}catch(t){if("undefined"!=typeof XDomainRequest){if(!window||!window.location)return o(new Error("No window available during request, unknown environment"));"http:"===window.location.href.substring(0,5)&&"https"===e.substring(0,5)&&(e="http"+e.substring(5));var d=new XDomainRequest;d.onprogress=function(){},d.ontimeout=function(){var t="Request timed out",e="ETIMEDOUT";o(c(t,e))},d.onerror=function(){o(new Error("Error during request"))},d.onload=function(){var t=l.jsonParse(d.responseText);o(t.error,t.value)},d.open(r,e,!0),d.send(n)}else o(new Error("Cannot find a method to transport a request"))}}catch(t){o(t)}}function a(){var t,e,r=[function(){return new XMLHttpRequest},function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new ActiveXObject("Msxml3.XMLHTTP")},function(){return new ActiveXObject("Microsoft.XMLHTTP")}],n=r.length;for(e=0;e<n;e++)try{t=r[e]();break}catch(t){}return t}function s(t){return t&&t.status&&200===t.status}function u(t){return t&&l.isType(t.status,"number")&&t.status>=400&&t.status<600}function c(t,e){var r=new Error(t);return r.code=e||"ENOTFOUND",r}var l=r(6),p=r(12);t.exports={get:n,post:o}},function(t,e){"use strict";function r(t){var e,r,n={protocol:null,auth:null,host:null,path:null,hash:null,href:t,hostname:null,port:null,pathname:null,search:null,query:null};if(e=t.indexOf("//"),e!==-1?(n.protocol=t.substring(0,e),r=e+2):r=0,e=t.indexOf("@",r),e!==-1&&(n.auth=t.substring(r,e),r=e+1),e=t.indexOf("/",r),e===-1){if(e=t.indexOf("?",r),e===-1)return e=t.indexOf("#",r),e===-1?n.host=t.substring(r):(n.host=t.substring(r,e),n.hash=t.substring(e)),n.hostname=n.host.split(":")[0],n.port=n.host.split(":")[1],n.port&&(n.port=parseInt(n.port,10)),n;n.host=t.substring(r,e),n.hostname=n.host.split(":")[0],n.port=n.host.split(":")[1],n.port&&(n.port=parseInt(n.port,10)),r=e}else n.host=t.substring(r,e),n.hostname=n.host.split(":")[0],n.port=n.host.split(":")[1],n.port&&(n.port=parseInt(n.port,10)),r=e;if(e=t.indexOf("#",r),e===-1?n.path=t.substring(r):(n.path=t.substring(r,e),n.hash=t.substring(e)),n.path){var o=n.path.split("?");n.pathname=o[0],n.query=o[1],n.search=n.query?"?"+n.query:null}return n}t.exports={parse:r}},function(t,e,r){"use strict";function n(t,e,r){if(t.data=t.data||{},t.err)try{t.stackInfo=t.err._savedStackTrace||m.parse(t.err)}catch(e){v.error("Error while parsing the error object.",e),t.message=t.err.message||t.err.description||t.message||String(t.err),delete t.err}r(null,t)}function o(t,e,r){t.message||t.stackInfo||t.custom||r(new Error("No message, stack info, or custom data"),null),r(null,t)}function i(t,e,r){var n=e.environment||e.payload&&e.payload.environment;t.data=g.extend(!0,{},t.data,{environment:n,level:t.level,endpoint:e.endpoint,platform:"browser",framework:"browser-js",language:"javascript",server:{},notifier:{name:"rollbar-browser-js",version:e.version}}),r(null,t)}function a(t){return function(e,r,n){return t&&t.location?(g.set(e,"data.request",{url:t.location.href,query_string:t.location.search,user_ip:"$remote_ip"}),void n(null,e)):n(null,e)}}function s(t){return function(e,r,n){return t?(g.set(e,"data.client",{runtime_ms:e.timestamp-t._rollbarStartTime,timestamp:Math.round(e.timestamp/1e3),javascript:{browser:t.navigator.userAgent,language:t.navigator.language,cookie_enabled:t.navigator.cookieEnabled,screen:{width:t.screen.width,height:t.screen.height}}}),void n(null,e)):n(null,e)}}function u(t){return function(e,r,n){if(!t||!t.navigator)return n(null,e);for(var o,i=[],a=t.navigator.plugins||[],s=0,u=a.length;s<u;++s)o=a[s],i.push({name:o.name,description:o.description});g.set(e,"data.client.javascript.plugins",i),n(null,e)}}function c(t,e,r){t.stackInfo?p(t,e,r):l(t,e,r)}function l(t,e,r){var n=t.message,o=t.custom;if(!n)if(o){var i=e.scrubFields,a=g.stringify(g.scrub(o,i));n=a.error||a.value||""}else n="";var s={body:n};o&&(s.extra=g.extend(!0,{},o)),g.set(t,"data.body",{message:s}),r(null,t)}function p(t,e,r){var n=t.data.description,o=t.stackInfo,i=t.custom,a=m.guessErrorClass(o.message),s=o.name||a[0],u=a[1],c={exception:{class:s,message:u}};n&&(c.exception.description=n||"uncaught exception");var p=o.stack;if(p&&0===p.length&&t._unhandledStackInfo&&t._unhandledStackInfo.stack&&(p=t._unhandledStackInfo.stack),p){var f,h,d,v,y,b,w,x;for(c.frames=[],w=0;w<p.length;++w)f=p[w],h={filename:f.url?g.sanitizeUrl(f.url):"(unknown)",lineno:f.line||null,method:f.func&&"?"!==f.func?f.func:"[anonymous]",colno:f.column},d=v=y=null,b=f.context?f.context.length:0,b&&(x=Math.floor(b/2),v=f.context.slice(0,x),d=f.context[x],y=f.context.slice(x)),d&&(h.code=d),(v||y)&&(h.context={},v&&v.length&&(h.context.pre=v),y&&y.length&&(h.context.post=y)),f.args&&(h.args=f.args),c.frames.push(h);c.frames.reverse(),i&&(c.extra=g.extend(!0,{},i)),g.set(t,"data.body",{trace:c}),r(null,t)}else t.message=s+": "+u,l(t,e,r)}function f(t,e,r){var n=e.scrubFields;g.scrub(t.data,n),r(null,t)}function h(t,e,r){var n=g.extend(!0,{},t);try{g.isFunction(e.transform)&&e.transform(n.data)}catch(n){return e.transform=null,v.error("Error while calling custom transform() function. Removing custom transform().",n),
void r(null,t)}r(null,n)}function d(t,e,r){var n=e.payload||{};n.body&&delete n.body;var o=g.extend(!0,{},t.data,n);t._isUncaught&&(o._isUncaught=!0),r(null,o)}var g=r(6),m=r(19),v=r(12);t.exports={handleItemWithError:n,ensureItemHasSomethingToSay:o,addBaseInfo:i,addRequestInfo:a,addClientInfo:s,addPluginInfo:u,addBody:c,scrubPayload:f,userTransform:h,itemToPayload:d}},function(t,e,r){"use strict";function n(){return l}function o(){return null}function i(t){var e={};return e._stackFrame=t,e.url=t.fileName,e.line=t.lineNumber,e.func=t.functionName,e.column=t.columnNumber,e.args=t.args,e.context=o(e.url,e.line),e}function a(t){function e(){var e=[];try{e=c.parse(t)}catch(t){e=[]}for(var r=[],n=0;n<e.length;n++)r.push(new i(e[n]));return r}return{stack:e(),message:t.message,name:t.name}}function s(t){return new a(t)}function u(t){if(!t)return["Unknown error. There was no error message to display.",""];var e=t.match(p),r="(unknown)";return e&&(r=e[e.length-1],t=t.replace((e[e.length-2]||"")+r+":",""),t=t.replace(/(^[\s]+|[\s]+$)/g,"")),[r,t]}var c=r(20),l="?",p=new RegExp("^(([a-zA-Z0-9-_$ ]*): *)?(Uncaught )?([a-zA-Z0-9-_$ ]*): ");t.exports={guessFunctionName:n,guessErrorClass:u,gatherContext:o,parse:s,Stack:a,Frame:i}},function(t,e,r){var n,o,i;!function(a,s){"use strict";o=[r(21)],n=s,i="function"==typeof n?n.apply(e,o):n,!(void 0!==i&&(t.exports=i))}(this,function(t){"use strict";function e(t,e,r){if("function"==typeof Array.prototype.map)return t.map(e,r);for(var n=new Array(t.length),o=0;o<t.length;o++)n[o]=e.call(r,t[o]);return n}function r(t,e,r){if("function"==typeof Array.prototype.filter)return t.filter(e,r);for(var n=[],o=0;o<t.length;o++)e.call(r,t[o])&&n.push(t[o]);return n}var n=/(^|@)\S+\:\d+/,o=/^\s*at .*(\S+\:\d+|\(native\))/m,i=/^(eval@)?(\[native code\])?$/;return{parse:function(t){if("undefined"!=typeof t.stacktrace||"undefined"!=typeof t["opera#sourceloc"])return this.parseOpera(t);if(t.stack&&t.stack.match(o))return this.parseV8OrIE(t);if(t.stack)return this.parseFFOrSafari(t);throw new Error("Cannot parse given Error object")},extractLocation:function(t){if(t.indexOf(":")===-1)return[t];var e=t.replace(/[\(\)\s]/g,"").split(":"),r=e.pop(),n=e[e.length-1];if(!isNaN(parseFloat(n))&&isFinite(n)){var o=e.pop();return[e.join(":"),o,r]}return[e.join(":"),r,void 0]},parseV8OrIE:function(n){var i=r(n.stack.split("\n"),function(t){return!!t.match(o)},this);return e(i,function(e){e.indexOf("(eval ")>-1&&(e=e.replace(/eval code/g,"eval").replace(/(\(eval at [^\()]*)|(\)\,.*$)/g,""));var r=e.replace(/^\s+/,"").replace(/\(eval code/g,"(").split(/\s+/).slice(1),n=this.extractLocation(r.pop()),o=r.join(" ")||void 0,i="eval"===n[0]?void 0:n[0];return new t(o,void 0,i,n[1],n[2],e)},this)},parseFFOrSafari:function(n){var o=r(n.stack.split("\n"),function(t){return!t.match(i)},this);return e(o,function(e){if(e.indexOf(" > eval")>-1&&(e=e.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g,":$1")),e.indexOf("@")===-1&&e.indexOf(":")===-1)return new t(e);var r=e.split("@"),n=this.extractLocation(r.pop()),o=r.shift()||void 0;return new t(o,void 0,n[0],n[1],n[2],e)},this)},parseOpera:function(t){return!t.stacktrace||t.message.indexOf("\n")>-1&&t.message.split("\n").length>t.stacktrace.split("\n").length?this.parseOpera9(t):t.stack?this.parseOpera11(t):this.parseOpera10(t)},parseOpera9:function(e){for(var r=/Line (\d+).*script (?:in )?(\S+)/i,n=e.message.split("\n"),o=[],i=2,a=n.length;i<a;i+=2){var s=r.exec(n[i]);s&&o.push(new t(void 0,void 0,s[2],s[1],void 0,n[i]))}return o},parseOpera10:function(e){for(var r=/Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i,n=e.stacktrace.split("\n"),o=[],i=0,a=n.length;i<a;i+=2){var s=r.exec(n[i]);s&&o.push(new t(s[3]||void 0,void 0,s[2],s[1],void 0,n[i]))}return o},parseOpera11:function(o){var i=r(o.stack.split("\n"),function(t){return!!t.match(n)&&!t.match(/^Error created at/)},this);return e(i,function(e){var r,n=e.split("@"),o=this.extractLocation(n.pop()),i=n.shift()||"",a=i.replace(/<anonymous function(: (\w+))?>/,"$2").replace(/\([^\)]*\)/g,"")||void 0;i.match(/\(([^\)]*)\)/)&&(r=i.replace(/^[^\(]+\(([^\)]*)\)$/,"$1"));var s=void 0===r||"[arguments not available]"===r?void 0:r.split(",");return new t(a,s,o[0],o[1],o[2],e)},this)}}})},function(t,e,r){var n,o,i;!function(r,a){"use strict";o=[],n=a,i="function"==typeof n?n.apply(e,o):n,!(void 0!==i&&(t.exports=i))}(this,function(){"use strict";function t(t){return!isNaN(parseFloat(t))&&isFinite(t)}function e(t,e,r,n,o,i){void 0!==t&&this.setFunctionName(t),void 0!==e&&this.setArgs(e),void 0!==r&&this.setFileName(r),void 0!==n&&this.setLineNumber(n),void 0!==o&&this.setColumnNumber(o),void 0!==i&&this.setSource(i)}return e.prototype={getFunctionName:function(){return this.functionName},setFunctionName:function(t){this.functionName=String(t)},getArgs:function(){return this.args},setArgs:function(t){if("[object Array]"!==Object.prototype.toString.call(t))throw new TypeError("Args must be an Array");this.args=t},getFileName:function(){return this.fileName},setFileName:function(t){this.fileName=String(t)},getLineNumber:function(){return this.lineNumber},setLineNumber:function(e){if(!t(e))throw new TypeError("Line Number must be a Number");this.lineNumber=Number(e)},getColumnNumber:function(){return this.columnNumber},setColumnNumber:function(e){if(!t(e))throw new TypeError("Column Number must be a Number");this.columnNumber=Number(e)},getSource:function(){return this.source},setSource:function(t){this.source=String(t)},toString:function(){var e=this.getFunctionName()||"{anonymous}",r="("+(this.getArgs()||[]).join(",")+")",n=this.getFileName()?"@"+this.getFileName():"",o=t(this.getLineNumber())?":"+this.getLineNumber():"",i=t(this.getColumnNumber())?":"+this.getColumnNumber():"";return e+r+n+o+i}},e})},function(t,e,r){"use strict";function n(t,e){var r=t.level,n=s.LEVELS[r]||0,o=s.LEVELS[e.reportLevel]||0;return!(n<o)&&(!s.get(e,"plugins.jquery.ignoreAjaxErrors")||!s.get(t,"body.message.extra.isAjax"))}function o(t,e){var r=!!t._isUncaught;delete t._isUncaught;var n=t._originalArgs;delete t._originalArgs;try{if(s.isFunction(e.checkIgnore)&&e.checkIgnore(r,n,t))return!1}catch(t){e.checkIgnore=null,u.error("Error while calling custom checkIgnore(), removing",t)}return!0}function i(t,e){var r,n,o,i,a,c,l,p,f,h;try{if(r=e.hostWhiteList,l=r&&r.length,n=s.get(t,"body.trace"),!r||0===l)return!0;if(!n||!n.frames)return!0;for(a=n.frames.length,f=0;f<a;f++){if(o=n.frames[f],i=o.filename,!s.isType(i,"string"))return!0;for(h=0;h<l;h++)if(c=r[h],p=new RegExp(c),p.test(i))return!0}}catch(t){return e.hostWhiteList=null,u.error("Error while reading your configuration's hostWhiteList option. Removing custom hostWhiteList.",t),!0}return!1}function a(t,e){var r,n,o,i,a,c,l,p,f;try{if(a=!1,o=e.ignoredMessages,!o||0===o.length)return!0;if(l=t.body,p=s.get(l,"trace.exception.message"),f=s.get(l,"message.body"),r=p||f,!r)return!0;for(i=o.length,n=0;n<i&&(c=new RegExp(o[n],"gi"),!(a=c.test(r)));n++);}catch(t){e.ignoredMessages=null,u.error("Error while reading your configuration's ignoredMessages option. Removing custom ignoredMessages.")}return!a}var s=r(6),u=r(12);t.exports={checkIgnore:n,userCheckIgnore:o,urlIsWhitelisted:i,messageIsIgnored:a}}])});
},{}],44:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 *
 * Version: 1.18.4
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *
 */
(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof module === 'object' && module.exports) {
    // Node
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['./punycode', './IPv6', './SecondLevelDomains'], factory);
  } else {
    // Browser globals (root is window)
    root.URI = factory(root.punycode, root.IPv6, root.SecondLevelDomains, root);
  }
}(this, function (punycode, IPv6, SLD, root) {
  'use strict';
  /*global location, escape, unescape */
  // FIXME: v2.0.0 renamce non-camelCase properties to uppercase
  /*jshint camelcase: false */

  // save current URI variable, if any
  var _URI = root && root.URI;

  function URI(url, base) {
    var _urlSupplied = arguments.length >= 1;
    var _baseSupplied = arguments.length >= 2;

    // Allow instantiation without the 'new' keyword
    if (!(this instanceof URI)) {
      if (_urlSupplied) {
        if (_baseSupplied) {
          return new URI(url, base);
        }

        return new URI(url);
      }

      return new URI();
    }

    if (url === undefined) {
      if (_urlSupplied) {
        throw new TypeError('undefined is not a valid argument for URI');
      }

      if (typeof location !== 'undefined') {
        url = location.href + '';
      } else {
        url = '';
      }
    }

    this.href(url);

    // resolve to base according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#constructor
    if (base !== undefined) {
      return this.absoluteTo(base);
    }

    return this;
  }

  URI.version = '1.18.4';

  var p = URI.prototype;
  var hasOwn = Object.prototype.hasOwnProperty;

  function escapeRegEx(string) {
    // https://github.com/medialize/URI.js/commit/85ac21783c11f8ccab06106dba9735a31a86924d#commitcomment-821963
    return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  }

  function getType(value) {
    // IE8 doesn't return [Object Undefined] but [Object Object] for undefined value
    if (value === undefined) {
      return 'Undefined';
    }

    return String(Object.prototype.toString.call(value)).slice(8, -1);
  }

  function isArray(obj) {
    return getType(obj) === 'Array';
  }

  function filterArrayValues(data, value) {
    var lookup = {};
    var i, length;

    if (getType(value) === 'RegExp') {
      lookup = null;
    } else if (isArray(value)) {
      for (i = 0, length = value.length; i < length; i++) {
        lookup[value[i]] = true;
      }
    } else {
      lookup[value] = true;
    }

    for (i = 0, length = data.length; i < length; i++) {
      /*jshint laxbreak: true */
      var _match = lookup && lookup[data[i]] !== undefined
        || !lookup && value.test(data[i]);
      /*jshint laxbreak: false */
      if (_match) {
        data.splice(i, 1);
        length--;
        i--;
      }
    }

    return data;
  }

  function arrayContains(list, value) {
    var i, length;

    // value may be string, number, array, regexp
    if (isArray(value)) {
      // Note: this can be optimized to O(n) (instead of current O(m * n))
      for (i = 0, length = value.length; i < length; i++) {
        if (!arrayContains(list, value[i])) {
          return false;
        }
      }

      return true;
    }

    var _type = getType(value);
    for (i = 0, length = list.length; i < length; i++) {
      if (_type === 'RegExp') {
        if (typeof list[i] === 'string' && list[i].match(value)) {
          return true;
        }
      } else if (list[i] === value) {
        return true;
      }
    }

    return false;
  }

  function arraysEqual(one, two) {
    if (!isArray(one) || !isArray(two)) {
      return false;
    }

    // arrays can't be equal if they have different amount of content
    if (one.length !== two.length) {
      return false;
    }

    one.sort();
    two.sort();

    for (var i = 0, l = one.length; i < l; i++) {
      if (one[i] !== two[i]) {
        return false;
      }
    }

    return true;
  }

  function trimSlashes(text) {
    var trim_expression = /^\/+|\/+$/g;
    return text.replace(trim_expression, '');
  }

  URI._parts = function() {
    return {
      protocol: null,
      username: null,
      password: null,
      hostname: null,
      urn: null,
      port: null,
      path: null,
      query: null,
      fragment: null,
      // state
      duplicateQueryParameters: URI.duplicateQueryParameters,
      escapeQuerySpace: URI.escapeQuerySpace
    };
  };
  // state: allow duplicate query parameters (a=1&a=1)
  URI.duplicateQueryParameters = false;
  // state: replaces + with %20 (space in query strings)
  URI.escapeQuerySpace = true;
  // static properties
  URI.protocol_expression = /^[a-z][a-z0-9.+-]*$/i;
  URI.idn_expression = /[^a-z0-9\.-]/i;
  URI.punycode_expression = /(xn--)/i;
  // well, 333.444.555.666 matches, but it sure ain't no IPv4 - do we care?
  URI.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  // credits to Rich Brown
  // source: http://forums.intermapper.com/viewtopic.php?p=1096#1096
  // specification: http://www.ietf.org/rfc/rfc4291.txt
  URI.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
  // expression used is "gruber revised" (@gruber v2) determined to be the
  // best solution in a regex-golf we did a couple of ages ago at
  // * http://mathiasbynens.be/demo/url-regex
  // * http://rodneyrehm.de/t/url-regex.html
  URI.find_uri_expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?������]))/ig;
  URI.findUri = {
    // valid "scheme://" or "www."
    start: /\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi,
    // everything up to the next whitespace
    end: /[\s\r\n]|$/,
    // trim trailing punctuation captured by end RegExp
    trim: /[`!()\[\]{};:'".,<>?�������]+$/,
    // balanced parens inclusion (), [], {}, <>
    parens: /(\([^\)]*\)|\[[^\]]*\]|\{[^}]*\}|<[^>]*>)/g,
  };
  // http://www.iana.org/assignments/uri-schemes.html
  // http://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports
  URI.defaultPorts = {
    http: '80',
    https: '443',
    ftp: '21',
    gopher: '70',
    ws: '80',
    wss: '443'
  };
  // allowed hostname characters according to RFC 3986
  // ALPHA DIGIT "-" "." "_" "~" "!" "$" "&" "'" "(" ")" "*" "+" "," ";" "=" %encoded
  // I've never seen a (non-IDN) hostname other than: ALPHA DIGIT . -
  URI.invalid_hostname_characters = /[^a-zA-Z0-9\.-]/;
  // map DOM Elements to their URI attribute
  URI.domAttributes = {
    'a': 'href',
    'blockquote': 'cite',
    'link': 'href',
    'base': 'href',
    'script': 'src',
    'form': 'action',
    'img': 'src',
    'area': 'href',
    'iframe': 'src',
    'embed': 'src',
    'source': 'src',
    'track': 'src',
    'input': 'src', // but only if type="image"
    'audio': 'src',
    'video': 'src'
  };
  URI.getDomAttribute = function(node) {
    if (!node || !node.nodeName) {
      return undefined;
    }

    var nodeName = node.nodeName.toLowerCase();
    // <input> should only expose src for type="image"
    if (nodeName === 'input' && node.type !== 'image') {
      return undefined;
    }

    return URI.domAttributes[nodeName];
  };

  function escapeForDumbFirefox36(value) {
    // https://github.com/medialize/URI.js/issues/91
    return escape(value);
  }

  // encoding / decoding according to RFC3986
  function strictEncodeURIComponent(string) {
    // see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
    return encodeURIComponent(string)
      .replace(/[!'()*]/g, escapeForDumbFirefox36)
      .replace(/\*/g, '%2A');
  }
  URI.encode = strictEncodeURIComponent;
  URI.decode = decodeURIComponent;
  URI.iso8859 = function() {
    URI.encode = escape;
    URI.decode = unescape;
  };
  URI.unicode = function() {
    URI.encode = strictEncodeURIComponent;
    URI.decode = decodeURIComponent;
  };
  URI.characters = {
    pathname: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(24|26|2B|2C|3B|3D|3A|40)/ig,
        map: {
          // -._~!'()*
          '%24': '$',
          '%26': '&',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%3A': ':',
          '%40': '@'
        }
      },
      decode: {
        expression: /[\/\?#]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23'
        }
      }
    },
    reserved: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig,
        map: {
          // gen-delims
          '%3A': ':',
          '%2F': '/',
          '%3F': '?',
          '%23': '#',
          '%5B': '[',
          '%5D': ']',
          '%40': '@',
          // sub-delims
          '%21': '!',
          '%24': '$',
          '%26': '&',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '='
        }
      }
    },
    urnpath: {
      // The characters under `encode` are the characters called out by RFC 2141 as being acceptable
      // for usage in a URN. RFC2141 also calls out "-", ".", and "_" as acceptable characters, but
      // these aren't encoded by encodeURIComponent, so we don't have to call them out here. Also
      // note that the colon character is not featured in the encoding map; this is because URI.js
      // gives the colons in URNs semantic meaning as the delimiters of path segements, and so it
      // should not appear unencoded in a segment itself.
      // See also the note above about RFC3986 and capitalalized hex digits.
      encode: {
        expression: /%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/ig,
        map: {
          '%21': '!',
          '%24': '$',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%40': '@'
        }
      },
      // These characters are the characters called out by RFC2141 as "reserved" characters that
      // should never appear in a URN, plus the colon character (see note above).
      decode: {
        expression: /[\/\?#:]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23',
          ':': '%3A'
        }
      }
    }
  };
  URI.encodeQuery = function(string, escapeQuerySpace) {
    var escaped = URI.encode(string + '');
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    return escapeQuerySpace ? escaped.replace(/%20/g, '+') : escaped;
  };
  URI.decodeQuery = function(string, escapeQuerySpace) {
    string += '';
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    try {
      return URI.decode(escapeQuerySpace ? string.replace(/\+/g, '%20') : string);
    } catch(e) {
      // we're not going to mess with weird encodings,
      // give up and return the undecoded original string
      // see https://github.com/medialize/URI.js/issues/87
      // see https://github.com/medialize/URI.js/issues/92
      return string;
    }
  };
  // generate encode/decode path functions
  var _parts = {'encode':'encode', 'decode':'decode'};
  var _part;
  var generateAccessor = function(_group, _part) {
    return function(string) {
      try {
        return URI[_part](string + '').replace(URI.characters[_group][_part].expression, function(c) {
          return URI.characters[_group][_part].map[c];
        });
      } catch (e) {
        // we're not going to mess with weird encodings,
        // give up and return the undecoded original string
        // see https://github.com/medialize/URI.js/issues/87
        // see https://github.com/medialize/URI.js/issues/92
        return string;
      }
    };
  };

  for (_part in _parts) {
    URI[_part + 'PathSegment'] = generateAccessor('pathname', _parts[_part]);
    URI[_part + 'UrnPathSegment'] = generateAccessor('urnpath', _parts[_part]);
  }

  var generateSegmentedPathFunction = function(_sep, _codingFuncName, _innerCodingFuncName) {
    return function(string) {
      // Why pass in names of functions, rather than the function objects themselves? The
      // definitions of some functions (but in particular, URI.decode) will occasionally change due
      // to URI.js having ISO8859 and Unicode modes. Passing in the name and getting it will ensure
      // that the functions we use here are "fresh".
      var actualCodingFunc;
      if (!_innerCodingFuncName) {
        actualCodingFunc = URI[_codingFuncName];
      } else {
        actualCodingFunc = function(string) {
          return URI[_codingFuncName](URI[_innerCodingFuncName](string));
        };
      }

      var segments = (string + '').split(_sep);

      for (var i = 0, length = segments.length; i < length; i++) {
        segments[i] = actualCodingFunc(segments[i]);
      }

      return segments.join(_sep);
    };
  };

  // This takes place outside the above loop because we don't want, e.g., encodeUrnPath functions.
  URI.decodePath = generateSegmentedPathFunction('/', 'decodePathSegment');
  URI.decodeUrnPath = generateSegmentedPathFunction(':', 'decodeUrnPathSegment');
  URI.recodePath = generateSegmentedPathFunction('/', 'encodePathSegment', 'decode');
  URI.recodeUrnPath = generateSegmentedPathFunction(':', 'encodeUrnPathSegment', 'decode');

  URI.encodeReserved = generateAccessor('reserved', 'encode');

  URI.parse = function(string, parts) {
    var pos;
    if (!parts) {
      parts = {};
    }
    // [protocol"://"[username[":"password]"@"]hostname[":"port]"/"?][path]["?"querystring]["#"fragment]

    // extract fragment
    pos = string.indexOf('#');
    if (pos > -1) {
      // escaping?
      parts.fragment = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract query
    pos = string.indexOf('?');
    if (pos > -1) {
      // escaping?
      parts.query = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract protocol
    if (string.substring(0, 2) === '//') {
      // relative-scheme
      parts.protocol = null;
      string = string.substring(2);
      // extract "user:pass@host:port"
      string = URI.parseAuthority(string, parts);
    } else {
      pos = string.indexOf(':');
      if (pos > -1) {
        parts.protocol = string.substring(0, pos) || null;
        if (parts.protocol && !parts.protocol.match(URI.protocol_expression)) {
          // : may be within the path
          parts.protocol = undefined;
        } else if (string.substring(pos + 1, pos + 3) === '//') {
          string = string.substring(pos + 3);

          // extract "user:pass@host:port"
          string = URI.parseAuthority(string, parts);
        } else {
          string = string.substring(pos + 1);
          parts.urn = true;
        }
      }
    }

    // what's left must be the path
    parts.path = string;

    // and we're done
    return parts;
  };
  URI.parseHost = function(string, parts) {
    // Copy chrome, IE, opera backslash-handling behavior.
    // Back slashes before the query string get converted to forward slashes
    // See: https://github.com/joyent/node/blob/386fd24f49b0e9d1a8a076592a404168faeecc34/lib/url.js#L115-L124
    // See: https://code.google.com/p/chromium/issues/detail?id=25916
    // https://github.com/medialize/URI.js/pull/233
    string = string.replace(/\\/g, '/');

    // extract host:port
    var pos = string.indexOf('/');
    var bracketPos;
    var t;

    if (pos === -1) {
      pos = string.length;
    }

    if (string.charAt(0) === '[') {
      // IPv6 host - http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6
      // I claim most client software breaks on IPv6 anyways. To simplify things, URI only accepts
      // IPv6+port in the format [2001:db8::1]:80 (for the time being)
      bracketPos = string.indexOf(']');
      parts.hostname = string.substring(1, bracketPos) || null;
      parts.port = string.substring(bracketPos + 2, pos) || null;
      if (parts.port === '/') {
        parts.port = null;
      }
    } else {
      var firstColon = string.indexOf(':');
      var firstSlash = string.indexOf('/');
      var nextColon = string.indexOf(':', firstColon + 1);
      if (nextColon !== -1 && (firstSlash === -1 || nextColon < firstSlash)) {
        // IPv6 host contains multiple colons - but no port
        // this notation is actually not allowed by RFC 3986, but we're a liberal parser
        parts.hostname = string.substring(0, pos) || null;
        parts.port = null;
      } else {
        t = string.substring(0, pos).split(':');
        parts.hostname = t[0] || null;
        parts.port = t[1] || null;
      }
    }

    if (parts.hostname && string.substring(pos).charAt(0) !== '/') {
      pos++;
      string = '/' + string;
    }

    return string.substring(pos) || '/';
  };
  URI.parseAuthority = function(string, parts) {
    string = URI.parseUserinfo(string, parts);
    return URI.parseHost(string, parts);
  };
  URI.parseUserinfo = function(string, parts) {
    // extract username:password
    var firstSlash = string.indexOf('/');
    var pos = string.lastIndexOf('@', firstSlash > -1 ? firstSlash : string.length - 1);
    var t;

    // authority@ must come before /path
    if (pos > -1 && (firstSlash === -1 || pos < firstSlash)) {
      t = string.substring(0, pos).split(':');
      parts.username = t[0] ? URI.decode(t[0]) : null;
      t.shift();
      parts.password = t[0] ? URI.decode(t.join(':')) : null;
      string = string.substring(pos + 1);
    } else {
      parts.username = null;
      parts.password = null;
    }

    return string;
  };
  URI.parseQuery = function(string, escapeQuerySpace) {
    if (!string) {
      return {};
    }

    // throw out the funky business - "?"[name"="value"&"]+
    string = string.replace(/&+/g, '&').replace(/^\?*&*|&+$/g, '');

    if (!string) {
      return {};
    }

    var items = {};
    var splits = string.split('&');
    var length = splits.length;
    var v, name, value;

    for (var i = 0; i < length; i++) {
      v = splits[i].split('=');
      name = URI.decodeQuery(v.shift(), escapeQuerySpace);
      // no "=" is null according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#collect-url-parameters
      value = v.length ? URI.decodeQuery(v.join('='), escapeQuerySpace) : null;

      if (hasOwn.call(items, name)) {
        if (typeof items[name] === 'string' || items[name] === null) {
          items[name] = [items[name]];
        }

        items[name].push(value);
      } else {
        items[name] = value;
      }
    }

    return items;
  };

  URI.build = function(parts) {
    var t = '';

    if (parts.protocol) {
      t += parts.protocol + ':';
    }

    if (!parts.urn && (t || parts.hostname)) {
      t += '//';
    }

    t += (URI.buildAuthority(parts) || '');

    if (typeof parts.path === 'string') {
      if (parts.path.charAt(0) !== '/' && typeof parts.hostname === 'string') {
        t += '/';
      }

      t += parts.path;
    }

    if (typeof parts.query === 'string' && parts.query) {
      t += '?' + parts.query;
    }

    if (typeof parts.fragment === 'string' && parts.fragment) {
      t += '#' + parts.fragment;
    }
    return t;
  };
  URI.buildHost = function(parts) {
    var t = '';

    if (!parts.hostname) {
      return '';
    } else if (URI.ip6_expression.test(parts.hostname)) {
      t += '[' + parts.hostname + ']';
    } else {
      t += parts.hostname;
    }

    if (parts.port) {
      t += ':' + parts.port;
    }

    return t;
  };
  URI.buildAuthority = function(parts) {
    return URI.buildUserinfo(parts) + URI.buildHost(parts);
  };
  URI.buildUserinfo = function(parts) {
    var t = '';

    if (parts.username) {
      t += URI.encode(parts.username);
    }

    if (parts.password) {
      t += ':' + URI.encode(parts.password);
    }

    if (t) {
      t += '@';
    }

    return t;
  };
  URI.buildQuery = function(data, duplicateQueryParameters, escapeQuerySpace) {
    // according to http://tools.ietf.org/html/rfc3986 or http://labs.apache.org/webarch/uri/rfc/rfc3986.html
    // being �-._~!$&'()*+,;=:@/?� %HEX and alnum are allowed
    // the RFC explicitly states ?/foo being a valid use case, no mention of parameter syntax!
    // URI.js treats the query string as being application/x-www-form-urlencoded
    // see http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type

    var t = '';
    var unique, key, i, length;
    for (key in data) {
      if (hasOwn.call(data, key) && key) {
        if (isArray(data[key])) {
          unique = {};
          for (i = 0, length = data[key].length; i < length; i++) {
            if (data[key][i] !== undefined && unique[data[key][i] + ''] === undefined) {
              t += '&' + URI.buildQueryParameter(key, data[key][i], escapeQuerySpace);
              if (duplicateQueryParameters !== true) {
                unique[data[key][i] + ''] = true;
              }
            }
          }
        } else if (data[key] !== undefined) {
          t += '&' + URI.buildQueryParameter(key, data[key], escapeQuerySpace);
        }
      }
    }

    return t.substring(1);
  };
  URI.buildQueryParameter = function(name, value, escapeQuerySpace) {
    // http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type -- application/x-www-form-urlencoded
    // don't append "=" for null values, according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#url-parameter-serialization
    return URI.encodeQuery(name, escapeQuerySpace) + (value !== null ? '=' + URI.encodeQuery(value, escapeQuerySpace) : '');
  };

  URI.addQuery = function(data, name, value) {
    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          URI.addQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (data[name] === undefined) {
        data[name] = value;
        return;
      } else if (typeof data[name] === 'string') {
        data[name] = [data[name]];
      }

      if (!isArray(value)) {
        value = [value];
      }

      data[name] = (data[name] || []).concat(value);
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }
  };
  URI.removeQuery = function(data, name, value) {
    var i, length, key;

    if (isArray(name)) {
      for (i = 0, length = name.length; i < length; i++) {
        data[name[i]] = undefined;
      }
    } else if (getType(name) === 'RegExp') {
      for (key in data) {
        if (name.test(key)) {
          data[key] = undefined;
        }
      }
    } else if (typeof name === 'object') {
      for (key in name) {
        if (hasOwn.call(name, key)) {
          URI.removeQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (value !== undefined) {
        if (getType(value) === 'RegExp') {
          if (!isArray(data[name]) && value.test(data[name])) {
            data[name] = undefined;
          } else {
            data[name] = filterArrayValues(data[name], value);
          }
        } else if (data[name] === String(value) && (!isArray(value) || value.length === 1)) {
          data[name] = undefined;
        } else if (isArray(data[name])) {
          data[name] = filterArrayValues(data[name], value);
        }
      } else {
        data[name] = undefined;
      }
    } else {
      throw new TypeError('URI.removeQuery() accepts an object, string, RegExp as the first parameter');
    }
  };
  URI.hasQuery = function(data, name, value, withinArray) {
    switch (getType(name)) {
      case 'String':
        // Nothing to do here
        break;

      case 'RegExp':
        for (var key in data) {
          if (hasOwn.call(data, key)) {
            if (name.test(key) && (value === undefined || URI.hasQuery(data, key, value))) {
              return true;
            }
          }
        }

        return false;

      case 'Object':
        for (var _key in name) {
          if (hasOwn.call(name, _key)) {
            if (!URI.hasQuery(data, _key, name[_key])) {
              return false;
            }
          }
        }

        return true;

      default:
        throw new TypeError('URI.hasQuery() accepts a string, regular expression or object as the name parameter');
    }

    switch (getType(value)) {
      case 'Undefined':
        // true if exists (but may be empty)
        return name in data; // data[name] !== undefined;

      case 'Boolean':
        // true if exists and non-empty
        var _booly = Boolean(isArray(data[name]) ? data[name].length : data[name]);
        return value === _booly;

      case 'Function':
        // allow complex comparison
        return !!value(data[name], name, data);

      case 'Array':
        if (!isArray(data[name])) {
          return false;
        }

        var op = withinArray ? arrayContains : arraysEqual;
        return op(data[name], value);

      case 'RegExp':
        if (!isArray(data[name])) {
          return Boolean(data[name] && data[name].match(value));
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      case 'Number':
        value = String(value);
        /* falls through */
      case 'String':
        if (!isArray(data[name])) {
          return data[name] === value;
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      default:
        throw new TypeError('URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter');
    }
  };


  URI.joinPaths = function() {
    var input = [];
    var segments = [];
    var nonEmptySegments = 0;

    for (var i = 0; i < arguments.length; i++) {
      var url = new URI(arguments[i]);
      input.push(url);
      var _segments = url.segment();
      for (var s = 0; s < _segments.length; s++) {
        if (typeof _segments[s] === 'string') {
          segments.push(_segments[s]);
        }

        if (_segments[s]) {
          nonEmptySegments++;
        }
      }
    }

    if (!segments.length || !nonEmptySegments) {
      return new URI('');
    }

    var uri = new URI('').segment(segments);

    if (input[0].path() === '' || input[0].path().slice(0, 1) === '/') {
      uri.path('/' + uri.path());
    }

    return uri.normalize();
  };

  URI.commonPath = function(one, two) {
    var length = Math.min(one.length, two.length);
    var pos;

    // find first non-matching character
    for (pos = 0; pos < length; pos++) {
      if (one.charAt(pos) !== two.charAt(pos)) {
        pos--;
        break;
      }
    }

    if (pos < 1) {
      return one.charAt(0) === two.charAt(0) && one.charAt(0) === '/' ? '/' : '';
    }

    // revert to last /
    if (one.charAt(pos) !== '/' || two.charAt(pos) !== '/') {
      pos = one.substring(0, pos).lastIndexOf('/');
    }

    return one.substring(0, pos + 1);
  };

  URI.withinString = function(string, callback, options) {
    options || (options = {});
    var _start = options.start || URI.findUri.start;
    var _end = options.end || URI.findUri.end;
    var _trim = options.trim || URI.findUri.trim;
    var _parens = options.parens || URI.findUri.parens;
    var _attributeOpen = /[a-z0-9-]=["']?$/i;

    _start.lastIndex = 0;
    while (true) {
      var match = _start.exec(string);
      if (!match) {
        break;
      }

      var start = match.index;
      if (options.ignoreHtml) {
        // attribut(e=["']?$)
        var attributeOpen = string.slice(Math.max(start - 3, 0), start);
        if (attributeOpen && _attributeOpen.test(attributeOpen)) {
          continue;
        }
      }

      var end = start + string.slice(start).search(_end);
      var slice = string.slice(start, end);
      // make sure we include well balanced parens
      var parensEnd = -1;
      while (true) {
        var parensMatch = _parens.exec(slice);
        if (!parensMatch) {
          break;
        }

        var parensMatchEnd = parensMatch.index + parensMatch[0].length;
        parensEnd = Math.max(parensEnd, parensMatchEnd);
      }

      if (parensEnd > -1) {
        slice = slice.slice(0, parensEnd) + slice.slice(parensEnd + 1).replace(_trim, '');
      } else {
        slice = slice.replace(_trim, '');
      }

      if (options.ignore && options.ignore.test(slice)) {
        continue;
      }

      end = start + slice.length;
      var result = callback(slice, start, end, string);
      if (result === undefined) {
        _start.lastIndex = end;
        continue;
      }

      result = String(result);
      string = string.slice(0, start) + result + string.slice(end);
      _start.lastIndex = start + result.length;
    }

    _start.lastIndex = 0;
    return string;
  };

  URI.ensureValidHostname = function(v) {
    // Theoretically URIs allow percent-encoding in Hostnames (according to RFC 3986)
    // they are not part of DNS and therefore ignored by URI.js

    if (v.match(URI.invalid_hostname_characters)) {
      // test punycode
      if (!punycode) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-] and Punycode.js is not available');
      }

      if (punycode.toASCII(v).match(URI.invalid_hostname_characters)) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }
    }
  };

  // noConflict
  URI.noConflict = function(removeAll) {
    if (removeAll) {
      var unconflicted = {
        URI: this.noConflict()
      };

      if (root.URITemplate && typeof root.URITemplate.noConflict === 'function') {
        unconflicted.URITemplate = root.URITemplate.noConflict();
      }

      if (root.IPv6 && typeof root.IPv6.noConflict === 'function') {
        unconflicted.IPv6 = root.IPv6.noConflict();
      }

      if (root.SecondLevelDomains && typeof root.SecondLevelDomains.noConflict === 'function') {
        unconflicted.SecondLevelDomains = root.SecondLevelDomains.noConflict();
      }

      return unconflicted;
    } else if (root.URI === this) {
      root.URI = _URI;
    }

    return this;
  };

  p.build = function(deferBuild) {
    if (deferBuild === true) {
      this._deferred_build = true;
    } else if (deferBuild === undefined || this._deferred_build) {
      this._string = URI.build(this._parts);
      this._deferred_build = false;
    }

    return this;
  };

  p.clone = function() {
    return new URI(this);
  };

  p.valueOf = p.toString = function() {
    return this.build(false)._string;
  };


  function generateSimpleAccessor(_part){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        this._parts[_part] = v || null;
        this.build(!build);
        return this;
      }
    };
  }

  function generatePrefixAccessor(_part, _key){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        if (v !== null) {
          v = v + '';
          if (v.charAt(0) === _key) {
            v = v.substring(1);
          }
        }

        this._parts[_part] = v;
        this.build(!build);
        return this;
      }
    };
  }

  p.protocol = generateSimpleAccessor('protocol');
  p.username = generateSimpleAccessor('username');
  p.password = generateSimpleAccessor('password');
  p.hostname = generateSimpleAccessor('hostname');
  p.port = generateSimpleAccessor('port');
  p.query = generatePrefixAccessor('query', '?');
  p.fragment = generatePrefixAccessor('fragment', '#');

  p.search = function(v, build) {
    var t = this.query(v, build);
    return typeof t === 'string' && t.length ? ('?' + t) : t;
  };
  p.hash = function(v, build) {
    var t = this.fragment(v, build);
    return typeof t === 'string' && t.length ? ('#' + t) : t;
  };

  p.pathname = function(v, build) {
    if (v === undefined || v === true) {
      var res = this._parts.path || (this._parts.hostname ? '/' : '');
      return v ? (this._parts.urn ? URI.decodeUrnPath : URI.decodePath)(res) : res;
    } else {
      if (this._parts.urn) {
        this._parts.path = v ? URI.recodeUrnPath(v) : '';
      } else {
        this._parts.path = v ? URI.recodePath(v) : '/';
      }
      this.build(!build);
      return this;
    }
  };
  p.path = p.pathname;
  p.href = function(href, build) {
    var key;

    if (href === undefined) {
      return this.toString();
    }

    this._string = '';
    this._parts = URI._parts();

    var _URI = href instanceof URI;
    var _object = typeof href === 'object' && (href.hostname || href.path || href.pathname);
    if (href.nodeName) {
      var attribute = URI.getDomAttribute(href);
      href = href[attribute] || '';
      _object = false;
    }

    // window.location is reported to be an object, but it's not the sort
    // of object we're looking for:
    // * location.protocol ends with a colon
    // * location.query != object.search
    // * location.hash != object.fragment
    // simply serializing the unknown object should do the trick
    // (for location, not for everything...)
    if (!_URI && _object && href.pathname !== undefined) {
      href = href.toString();
    }

    if (typeof href === 'string' || href instanceof String) {
      this._parts = URI.parse(String(href), this._parts);
    } else if (_URI || _object) {
      var src = _URI ? href._parts : href;
      for (key in src) {
        if (hasOwn.call(this._parts, key)) {
          this._parts[key] = src[key];
        }
      }
    } else {
      throw new TypeError('invalid input');
    }

    this.build(!build);
    return this;
  };

  // identification accessors
  p.is = function(what) {
    var ip = false;
    var ip4 = false;
    var ip6 = false;
    var name = false;
    var sld = false;
    var idn = false;
    var punycode = false;
    var relative = !this._parts.urn;

    if (this._parts.hostname) {
      relative = false;
      ip4 = URI.ip4_expression.test(this._parts.hostname);
      ip6 = URI.ip6_expression.test(this._parts.hostname);
      ip = ip4 || ip6;
      name = !ip;
      sld = name && SLD && SLD.has(this._parts.hostname);
      idn = name && URI.idn_expression.test(this._parts.hostname);
      punycode = name && URI.punycode_expression.test(this._parts.hostname);
    }

    switch (what.toLowerCase()) {
      case 'relative':
        return relative;

      case 'absolute':
        return !relative;

      // hostname identification
      case 'domain':
      case 'name':
        return name;

      case 'sld':
        return sld;

      case 'ip':
        return ip;

      case 'ip4':
      case 'ipv4':
      case 'inet4':
        return ip4;

      case 'ip6':
      case 'ipv6':
      case 'inet6':
        return ip6;

      case 'idn':
        return idn;

      case 'url':
        return !this._parts.urn;

      case 'urn':
        return !!this._parts.urn;

      case 'punycode':
        return punycode;
    }

    return null;
  };

  // component specific input validation
  var _protocol = p.protocol;
  var _port = p.port;
  var _hostname = p.hostname;

  p.protocol = function(v, build) {
    if (v !== undefined) {
      if (v) {
        // accept trailing ://
        v = v.replace(/:(\/\/)?$/, '');

        if (!v.match(URI.protocol_expression)) {
          throw new TypeError('Protocol "' + v + '" contains characters other than [A-Z0-9.+-] or doesn\'t start with [A-Z]');
        }
      }
    }
    return _protocol.call(this, v, build);
  };
  p.scheme = p.protocol;
  p.port = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      if (v === 0) {
        v = null;
      }

      if (v) {
        v += '';
        if (v.charAt(0) === ':') {
          v = v.substring(1);
        }

        if (v.match(/[^0-9]/)) {
          throw new TypeError('Port "' + v + '" contains characters other than [0-9]');
        }
      }
    }
    return _port.call(this, v, build);
  };
  p.hostname = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      var x = {};
      var res = URI.parseHost(v, x);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      v = x.hostname;
    }
    return _hostname.call(this, v, build);
  };

  // compound accessors
  p.origin = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      var protocol = this.protocol();
      var authority = this.authority();
      if (!authority) {
        return '';
      }

      return (protocol ? protocol + '://' : '') + this.authority();
    } else {
      var origin = URI(v);
      this
        .protocol(origin.protocol())
        .authority(origin.authority())
        .build(!build);
      return this;
    }
  };
  p.host = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildHost(this._parts) : '';
    } else {
      var res = URI.parseHost(v, this._parts);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      this.build(!build);
      return this;
    }
  };
  p.authority = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildAuthority(this._parts) : '';
    } else {
      var res = URI.parseAuthority(v, this._parts);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      this.build(!build);
      return this;
    }
  };
  p.userinfo = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      var t = URI.buildUserinfo(this._parts);
      return t ? t.substring(0, t.length -1) : t;
    } else {
      if (v[v.length-1] !== '@') {
        v += '@';
      }

      URI.parseUserinfo(v, this._parts);
      this.build(!build);
      return this;
    }
  };
  p.resource = function(v, build) {
    var parts;

    if (v === undefined) {
      return this.path() + this.search() + this.hash();
    }

    parts = URI.parse(v);
    this._parts.path = parts.path;
    this._parts.query = parts.query;
    this._parts.fragment = parts.fragment;
    this.build(!build);
    return this;
  };

  // fraction accessors
  p.subdomain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    // convenience, return "www" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // grab domain and add another segment
      var end = this._parts.hostname.length - this.domain().length - 1;
      return this._parts.hostname.substring(0, end) || '';
    } else {
      var e = this._parts.hostname.length - this.domain().length;
      var sub = this._parts.hostname.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(sub));

      if (v && v.charAt(v.length - 1) !== '.') {
        v += '.';
      }

      if (v) {
        URI.ensureValidHostname(v);
      }

      this._parts.hostname = this._parts.hostname.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.domain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // convenience, return "example.org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // if hostname consists of 1 or 2 segments, it must be the domain
      var t = this._parts.hostname.match(/\./g);
      if (t && t.length < 2) {
        return this._parts.hostname;
      }

      // grab tld and add another segment
      var end = this._parts.hostname.length - this.tld(build).length - 1;
      end = this._parts.hostname.lastIndexOf('.', end -1) + 1;
      return this._parts.hostname.substring(end) || '';
    } else {
      if (!v) {
        throw new TypeError('cannot set domain empty');
      }

      URI.ensureValidHostname(v);

      if (!this._parts.hostname || this.is('IP')) {
        this._parts.hostname = v;
      } else {
        var replace = new RegExp(escapeRegEx(this.domain()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.tld = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // return "org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      var pos = this._parts.hostname.lastIndexOf('.');
      var tld = this._parts.hostname.substring(pos + 1);

      if (build !== true && SLD && SLD.list[tld.toLowerCase()]) {
        return SLD.get(this._parts.hostname) || tld;
      }

      return tld;
    } else {
      var replace;

      if (!v) {
        throw new TypeError('cannot set TLD empty');
      } else if (v.match(/[^a-zA-Z0-9-]/)) {
        if (SLD && SLD.is(v)) {
          replace = new RegExp(escapeRegEx(this.tld()) + '$');
          this._parts.hostname = this._parts.hostname.replace(replace, v);
        } else {
          throw new TypeError('TLD "' + v + '" contains characters other than [A-Z0-9]');
        }
      } else if (!this._parts.hostname || this.is('IP')) {
        throw new ReferenceError('cannot set TLD on non-domain host');
      } else {
        replace = new RegExp(escapeRegEx(this.tld()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.directory = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path && !this._parts.hostname) {
        return '';
      }

      if (this._parts.path === '/') {
        return '/';
      }

      var end = this._parts.path.length - this.filename().length - 1;
      var res = this._parts.path.substring(0, end) || (this._parts.hostname ? '/' : '');

      return v ? URI.decodePath(res) : res;

    } else {
      var e = this._parts.path.length - this.filename().length;
      var directory = this._parts.path.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(directory));

      // fully qualifier directories begin with a slash
      if (!this.is('relative')) {
        if (!v) {
          v = '/';
        }

        if (v.charAt(0) !== '/') {
          v = '/' + v;
        }
      }

      // directories always end with a slash
      if (v && v.charAt(v.length - 1) !== '/') {
        v += '/';
      }

      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.filename = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var pos = this._parts.path.lastIndexOf('/');
      var res = this._parts.path.substring(pos+1);

      return v ? URI.decodePathSegment(res) : res;
    } else {
      var mutatedDirectory = false;

      if (v.charAt(0) === '/') {
        v = v.substring(1);
      }

      if (v.match(/\.?\//)) {
        mutatedDirectory = true;
      }

      var replace = new RegExp(escapeRegEx(this.filename()) + '$');
      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);

      if (mutatedDirectory) {
        this.normalizePath(build);
      } else {
        this.build(!build);
      }

      return this;
    }
  };
  p.suffix = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var filename = this.filename();
      var pos = filename.lastIndexOf('.');
      var s, res;

      if (pos === -1) {
        return '';
      }

      // suffix may only contain alnum characters (yup, I made this up.)
      s = filename.substring(pos+1);
      res = (/^[a-z0-9%]+$/i).test(s) ? s : '';
      return v ? URI.decodePathSegment(res) : res;
    } else {
      if (v.charAt(0) === '.') {
        v = v.substring(1);
      }

      var suffix = this.suffix();
      var replace;

      if (!suffix) {
        if (!v) {
          return this;
        }

        this._parts.path += '.' + URI.recodePath(v);
      } else if (!v) {
        replace = new RegExp(escapeRegEx('.' + suffix) + '$');
      } else {
        replace = new RegExp(escapeRegEx(suffix) + '$');
      }

      if (replace) {
        v = URI.recodePath(v);
        this._parts.path = this._parts.path.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.segment = function(segment, v, build) {
    var separator = this._parts.urn ? ':' : '/';
    var path = this.path();
    var absolute = path.substring(0, 1) === '/';
    var segments = path.split(separator);

    if (segment !== undefined && typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (segment !== undefined && typeof segment !== 'number') {
      throw new Error('Bad segment "' + segment + '", must be 0-based integer');
    }

    if (absolute) {
      segments.shift();
    }

    if (segment < 0) {
      // allow negative indexes to address from the end
      segment = Math.max(segments.length + segment, 0);
    }

    if (v === undefined) {
      /*jshint laxbreak: true */
      return segment === undefined
        ? segments
        : segments[segment];
      /*jshint laxbreak: false */
    } else if (segment === null || segments[segment] === undefined) {
      if (isArray(v)) {
        segments = [];
        // collapse empty elements within array
        for (var i=0, l=v.length; i < l; i++) {
          if (!v[i].length && (!segments.length || !segments[segments.length -1].length)) {
            continue;
          }

          if (segments.length && !segments[segments.length -1].length) {
            segments.pop();
          }

          segments.push(trimSlashes(v[i]));
        }
      } else if (v || typeof v === 'string') {
        v = trimSlashes(v);
        if (segments[segments.length -1] === '') {
          // empty trailing elements have to be overwritten
          // to prevent results such as /foo//bar
          segments[segments.length -1] = v;
        } else {
          segments.push(v);
        }
      }
    } else {
      if (v) {
        segments[segment] = trimSlashes(v);
      } else {
        segments.splice(segment, 1);
      }
    }

    if (absolute) {
      segments.unshift('');
    }

    return this.path(segments.join(separator), build);
  };
  p.segmentCoded = function(segment, v, build) {
    var segments, i, l;

    if (typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (v === undefined) {
      segments = this.segment(segment, v, build);
      if (!isArray(segments)) {
        segments = segments !== undefined ? URI.decode(segments) : undefined;
      } else {
        for (i = 0, l = segments.length; i < l; i++) {
          segments[i] = URI.decode(segments[i]);
        }
      }

      return segments;
    }

    if (!isArray(v)) {
      v = (typeof v === 'string' || v instanceof String) ? URI.encode(v) : v;
    } else {
      for (i = 0, l = v.length; i < l; i++) {
        v[i] = URI.encode(v[i]);
      }
    }

    return this.segment(segment, v, build);
  };

  // mutating query string
  var q = p.query;
  p.query = function(v, build) {
    if (v === true) {
      return URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    } else if (typeof v === 'function') {
      var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
      var result = v.call(this, data);
      this._parts.query = URI.buildQuery(result || data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else if (v !== undefined && typeof v !== 'string') {
      this._parts.query = URI.buildQuery(v, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else {
      return q.call(this, v, build);
    }
  };
  p.setQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);

    if (typeof name === 'string' || name instanceof String) {
      data[name] = value !== undefined ? value : null;
    } else if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          data[key] = name[key];
        }
      }
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }

    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.addQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.addQuery(data, name, value === undefined ? null : value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.removeQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.removeQuery(data, name, value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.hasQuery = function(name, value, withinArray) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    return URI.hasQuery(data, name, value, withinArray);
  };
  p.setSearch = p.setQuery;
  p.addSearch = p.addQuery;
  p.removeSearch = p.removeQuery;
  p.hasSearch = p.hasQuery;

  // sanitizing URLs
  p.normalize = function() {
    if (this._parts.urn) {
      return this
        .normalizeProtocol(false)
        .normalizePath(false)
        .normalizeQuery(false)
        .normalizeFragment(false)
        .build();
    }

    return this
      .normalizeProtocol(false)
      .normalizeHostname(false)
      .normalizePort(false)
      .normalizePath(false)
      .normalizeQuery(false)
      .normalizeFragment(false)
      .build();
  };
  p.normalizeProtocol = function(build) {
    if (typeof this._parts.protocol === 'string') {
      this._parts.protocol = this._parts.protocol.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizeHostname = function(build) {
    if (this._parts.hostname) {
      if (this.is('IDN') && punycode) {
        this._parts.hostname = punycode.toASCII(this._parts.hostname);
      } else if (this.is('IPv6') && IPv6) {
        this._parts.hostname = IPv6.best(this._parts.hostname);
      }

      this._parts.hostname = this._parts.hostname.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizePort = function(build) {
    // remove port of it's the protocol's default
    if (typeof this._parts.protocol === 'string' && this._parts.port === URI.defaultPorts[this._parts.protocol]) {
      this._parts.port = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizePath = function(build) {
    var _path = this._parts.path;
    if (!_path) {
      return this;
    }

    if (this._parts.urn) {
      this._parts.path = URI.recodeUrnPath(this._parts.path);
      this.build(!build);
      return this;
    }

    if (this._parts.path === '/') {
      return this;
    }

    _path = URI.recodePath(_path);

    var _was_relative;
    var _leadingParents = '';
    var _parent, _pos;

    // handle relative paths
    if (_path.charAt(0) !== '/') {
      _was_relative = true;
      _path = '/' + _path;
    }

    // handle relative files (as opposed to directories)
    if (_path.slice(-3) === '/..' || _path.slice(-2) === '/.') {
      _path += '/';
    }

    // resolve simples
    _path = _path
      .replace(/(\/(\.\/)+)|(\/\.$)/g, '/')
      .replace(/\/{2,}/g, '/');

    // remember leading parents
    if (_was_relative) {
      _leadingParents = _path.substring(1).match(/^(\.\.\/)+/) || '';
      if (_leadingParents) {
        _leadingParents = _leadingParents[0];
      }
    }

    // resolve parents
    while (true) {
      _parent = _path.search(/\/\.\.(\/|$)/);
      if (_parent === -1) {
        // no more ../ to resolve
        break;
      } else if (_parent === 0) {
        // top level cannot be relative, skip it
        _path = _path.substring(3);
        continue;
      }

      _pos = _path.substring(0, _parent).lastIndexOf('/');
      if (_pos === -1) {
        _pos = _parent;
      }
      _path = _path.substring(0, _pos) + _path.substring(_parent + 3);
    }

    // revert to relative
    if (_was_relative && this.is('relative')) {
      _path = _leadingParents + _path.substring(1);
    }

    this._parts.path = _path;
    this.build(!build);
    return this;
  };
  p.normalizePathname = p.normalizePath;
  p.normalizeQuery = function(build) {
    if (typeof this._parts.query === 'string') {
      if (!this._parts.query.length) {
        this._parts.query = null;
      } else {
        this.query(URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace));
      }

      this.build(!build);
    }

    return this;
  };
  p.normalizeFragment = function(build) {
    if (!this._parts.fragment) {
      this._parts.fragment = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizeSearch = p.normalizeQuery;
  p.normalizeHash = p.normalizeFragment;

  p.iso8859 = function() {
    // expect unicode input, iso8859 output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = escape;
    URI.decode = decodeURIComponent;
    try {
      this.normalize();
    } finally {
      URI.encode = e;
      URI.decode = d;
    }
    return this;
  };

  p.unicode = function() {
    // expect iso8859 input, unicode output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = strictEncodeURIComponent;
    URI.decode = unescape;
    try {
      this.normalize();
    } finally {
      URI.encode = e;
      URI.decode = d;
    }
    return this;
  };

  p.readable = function() {
    var uri = this.clone();
    // removing username, password, because they shouldn't be displayed according to RFC 3986
    uri.username('').password('').normalize();
    var t = '';
    if (uri._parts.protocol) {
      t += uri._parts.protocol + '://';
    }

    if (uri._parts.hostname) {
      if (uri.is('punycode') && punycode) {
        t += punycode.toUnicode(uri._parts.hostname);
        if (uri._parts.port) {
          t += ':' + uri._parts.port;
        }
      } else {
        t += uri.host();
      }
    }

    if (uri._parts.hostname && uri._parts.path && uri._parts.path.charAt(0) !== '/') {
      t += '/';
    }

    t += uri.path(true);
    if (uri._parts.query) {
      var q = '';
      for (var i = 0, qp = uri._parts.query.split('&'), l = qp.length; i < l; i++) {
        var kv = (qp[i] || '').split('=');
        q += '&' + URI.decodeQuery(kv[0], this._parts.escapeQuerySpace)
          .replace(/&/g, '%26');

        if (kv[1] !== undefined) {
          q += '=' + URI.decodeQuery(kv[1], this._parts.escapeQuerySpace)
            .replace(/&/g, '%26');
        }
      }
      t += '?' + q.substring(1);
    }

    t += URI.decodeQuery(uri.hash(), true);
    return t;
  };

  // resolving relative and absolute URLs
  p.absoluteTo = function(base) {
    var resolved = this.clone();
    var properties = ['protocol', 'username', 'password', 'hostname', 'port'];
    var basedir, i, p;

    if (this._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    if (!(base instanceof URI)) {
      base = new URI(base);
    }

    if (!resolved._parts.protocol) {
      resolved._parts.protocol = base._parts.protocol;
    }

    if (this._parts.hostname) {
      return resolved;
    }

    for (i = 0; (p = properties[i]); i++) {
      resolved._parts[p] = base._parts[p];
    }

    if (!resolved._parts.path) {
      resolved._parts.path = base._parts.path;
      if (!resolved._parts.query) {
        resolved._parts.query = base._parts.query;
      }
    } else {
      if (resolved._parts.path.substring(-2) === '..') {
        resolved._parts.path += '/';
      }

      if (resolved.path().charAt(0) !== '/') {
        basedir = base.directory();
        basedir = basedir ? basedir : base.path().indexOf('/') === 0 ? '/' : '';
        resolved._parts.path = (basedir ? (basedir + '/') : '') + resolved._parts.path;
        resolved.normalizePath();
      }
    }

    resolved.build();
    return resolved;
  };
  p.relativeTo = function(base) {
    var relative = this.clone().normalize();
    var relativeParts, baseParts, common, relativePath, basePath;

    if (relative._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    base = new URI(base).normalize();
    relativeParts = relative._parts;
    baseParts = base._parts;
    relativePath = relative.path();
    basePath = base.path();

    if (relativePath.charAt(0) !== '/') {
      throw new Error('URI is already relative');
    }

    if (basePath.charAt(0) !== '/') {
      throw new Error('Cannot calculate a URI relative to another relative URI');
    }

    if (relativeParts.protocol === baseParts.protocol) {
      relativeParts.protocol = null;
    }

    if (relativeParts.username !== baseParts.username || relativeParts.password !== baseParts.password) {
      return relative.build();
    }

    if (relativeParts.protocol !== null || relativeParts.username !== null || relativeParts.password !== null) {
      return relative.build();
    }

    if (relativeParts.hostname === baseParts.hostname && relativeParts.port === baseParts.port) {
      relativeParts.hostname = null;
      relativeParts.port = null;
    } else {
      return relative.build();
    }

    if (relativePath === basePath) {
      relativeParts.path = '';
      return relative.build();
    }

    // determine common sub path
    common = URI.commonPath(relativePath, basePath);

    // If the paths have nothing in common, return a relative URL with the absolute path.
    if (!common) {
      return relative.build();
    }

    var parents = baseParts.path
      .substring(common.length)
      .replace(/[^\/]*$/, '')
      .replace(/.*?\//g, '../');

    relativeParts.path = (parents + relativeParts.path.substring(common.length)) || './';

    return relative.build();
  };

  // comparing URIs
  p.equals = function(uri) {
    var one = this.clone();
    var two = new URI(uri);
    var one_map = {};
    var two_map = {};
    var checked = {};
    var one_query, two_query, key;

    one.normalize();
    two.normalize();

    // exact match
    if (one.toString() === two.toString()) {
      return true;
    }

    // extract query string
    one_query = one.query();
    two_query = two.query();
    one.query('');
    two.query('');

    // definitely not equal if not even non-query parts match
    if (one.toString() !== two.toString()) {
      return false;
    }

    // query parameters have the same length, even if they're permuted
    if (one_query.length !== two_query.length) {
      return false;
    }

    one_map = URI.parseQuery(one_query, this._parts.escapeQuerySpace);
    two_map = URI.parseQuery(two_query, this._parts.escapeQuerySpace);

    for (key in one_map) {
      if (hasOwn.call(one_map, key)) {
        if (!isArray(one_map[key])) {
          if (one_map[key] !== two_map[key]) {
            return false;
          }
        } else if (!arraysEqual(one_map[key], two_map[key])) {
          return false;
        }

        checked[key] = true;
      }
    }

    for (key in two_map) {
      if (hasOwn.call(two_map, key)) {
        if (!checked[key]) {
          // two contains a parameter not present in one
          return false;
        }
      }
    }

    return true;
  };

  // state
  p.duplicateQueryParameters = function(v) {
    this._parts.duplicateQueryParameters = !!v;
    return this;
  };

  p.escapeQuerySpace = function(v) {
    this._parts.escapeQuerySpace = !!v;
    return this;
  };

  return URI;
}));
},{}],45:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var ko = (typeof window !== "undefined" ? window['ko'] : typeof global !== "undefined" ? global['ko'] : null);
//var HeroCalc = require('dota-hero-calculator-library');
var HeroModel = require('dota-hero-calculator-library/src/herocalc/hero/HeroModel');
var HeroOptions = require('dota-hero-calculator-library/src/herocalc/hero/heroOptionsArray');
var BitArray = require('bit-array-js');
var URI = require('urijs');
var Slider = require('./slider');
var responsiveVoice = require('./responsivevoice');

require('./ko.bindingHandlers.checkbox');
require('./ko.bindingHandlers.radio');
require('./ko.extenders.urlSync');

var rollbar = require('./rollbar');
var buildDate = "2017-06-29 12:33:31 UTC";
//document.getElementById('buildDate').innerHTML = buildDate;

var releaseTag = "0.8.0";
//document.getElementById('releaseTag').innerHTML = releaseTag;

var App = function () {

    //HeroCalc.init(null, null, null, function () {
        var attributeOptions = [
            {id: "totalArmorPhysical", name: "Armor"},
            {id: "totalArmorPhysicalReduction", name: "Physical Damage Reduction"},
            {id: "totalMagicResistance", name: "Magic Resistance"},
            {id: "totalattackrange", name: "Attack Range"},
            {id: "totalAgi", name: "Agility"},
            {id: "totalInt", name: "Intelligence"},
            {id: "totalStr", name: "Strength"},
            {id: "health", name: "HP"},
            {id: "mana", name: "Mana"},
            {id: "healthregen", name: "HP Regeneration"},
            {id: "manaregen", name: "Mana Regeneration"},
            {id: "totalMovementSpeed", name: "Movement Speed"},
            {id: "totalTurnRate", name: "Turn Rate"},
            {id: "baseDamageMin", name: "Attack Damage Min"},
            {id: "baseDamageMax", name: "Attack Damage Max"},
            {id: "baseDamageAvg", name: "Attack Damage Avg"},
            {id: "ehpPhysical", name: "EHP"},
            {id: "ehpMagical", name: "Magical EHP"},
            {id: "primaryAttribute", name: "Primary Attribute"},
            {id: "projectilespeed", name: "Missile Speed"},
            {id: "attributeagilitygain", name: "Agility Gain"},
            {id: "attributestrengthgain", name: "Strength Gain"},
            {id: "attributeintelligencegain", name: "Intelligence Gain"},
            {id: "attributebaseagility", name: "Base Agility"},
            {id: "attributebaseintelligence", name: "Base Intelligence"},
            {id: "attributebasestrength", name: "Base Strength"},
            {id: "visionrangeday", name: "Day Vision Range"},
            {id: "visionrangenight", name: "Night Vision Range"},
        ];
        
        
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        
        function shuffle(array) {
            var counter = array.length,
                temp, index;

            // While there are elements in the array
            while (counter > 0) {
                // Pick a random index
                index = Math.floor(Math.random() * counter);

                // Decrease counter by 1
                counter--;

                // And swap the last element with it
                temp = array[counter];
                array[counter] = array[index];
                array[index] = temp;
            }

            return array;
        };
        
        function getAttributeValue(heroModel, attribute) {
            //console.log('getAttributeValue', heroModel, attribute);
            if (heroModel.hasOwnProperty(attribute)) {
                return heroModel[attribute]();
            }
            else {
                return heroModel.heroData()[attribute];
            }
        }
        
        function formatValue(value) {
            switch (value) {
                case 'agi':
                    return 'Agility';
                break;
                case 'str':
                    return 'Strength';
                break;
                case 'int':
                    return 'Intelligence';
                break;
            }
            return parseFloat(parseFloat(value).toFixed(2)).toString();
        }
        
        var attributes = attributeOptions.map(function (a) { return a.id; });
        
        function getHeroID(hero) {
            return HeroCalcData.heroData['npc_dota_hero_' + hero].HeroID;
        }

        var heroData = HeroCalcData.heroData;
        var heroOptions = HeroOptions.init(HeroCalcData.heroData);
        var heroIds = heroOptions.map(function (hero) { return hero.heroName });
        var heroModel = new HeroModel(HeroCalcData.heroData, HeroCalcData.itemData, 'abaddon');
        
        function buildDeck() {
            var DECK = [];
            for (var i = 0; i < heroIds.length; i++) {
                for (var j = 0; j < 25; j++) {
                    for (var k = 0; k < attributes.length; k++) {
                        var card = {
                            id: i * heroIds.length + j * 25 + k,
                            kind: 'attributes',
                            hero: heroIds[i],
                            name: attributes[k],
                            level: j + 1
                        }
                        //card.correct = 0;
                        //card.wrong = 0;
                        DECK.push(card);
                    }
                }
            }
            
            var c = heroIds.length * attributes.length * 25;
            for (var i = 0; i < heroIds.length; i++) {
                var heroId = heroIds[i];
                var abilities = heroData['npc_dota_hero_' + heroId].abilities;
                for (var j = 0; j < abilities.length; j++) {
                    var ability = abilities[j];
                    if (ability.displayname === 'Attribute Bonus' || ability.displayname === '' || ability.displayname === 'Empty') continue;
                    
                    var maxAbilityLevel = heroModel.getAbilityLevelMax(ability);
                    for (var k = 0; k < ability.attributes.length; k++) {
                        var attribute = ability.attributes[k];
                        if (!attribute.hasOwnProperty('tooltip')) continue;
                        
                        for (var l = 0; l < maxAbilityLevel; l++) {
                            DECK.push({
                                id: c,
                                kind: 'abilities',
                                hero: heroId,
                                name: ability.name,
                                property: attribute.name,
                                level: l + 1
                            });
                            c++;
                        }
                    }
                    
                    for (var m = 0; m < maxAbilityLevel; m++) {
                        DECK.push({
                            id: c,
                            kind: 'abilities',
                            hero: heroId,
                            name: ability.name,
                            property: 'cooldown',
                            level: m + 1
                        });
                        c++;
                    }
                    
                    for (var n = 0; n < maxAbilityLevel; n++) {
                        DECK.push({
                            id: c,
                            kind: 'abilities',
                            hero: heroId,
                            name: ability.name,
                            property: 'manacost',
                            level: n + 1
                        });
                        c++;
                    }
                }
            }
            return DECK;
        }
        //var t0 = performance.now();
        var DECK = buildDeck();
        console.log(DECK);
        //var t1 = performance.now();
        //alert("Deck build took " + (t1 - t0) + "ms.")
        
        function filterDeck(DECK, heroIds, attributes, minLevel, maxLevel, abilityQuestionTypes) {
            return DECK.filter(function (card) {
                if (heroIds.indexOf(card.hero) === -1) return false;
                switch (card.kind) {
                    case 'attributes':
                        return card.level >= minLevel && card.level <= maxLevel && attributes.indexOf(card.name) !== -1;
                    break;
                    case 'abilities':
                        switch (card.property) {
                            case 'manacost':
                            case 'cooldown':
                                return abilityQuestionTypes.indexOf(card.property) !== -1;
                            break;
                            default:
                                return abilityQuestionTypes.indexOf('attributes') !== -1;
                            break;
                        }
                    break;
                }
            });
        }
        
        function formatCard(card) {
            var heroName = heroData['npc_dota_hero_' + card.hero].displayname;
            switch (card.kind) {
                case 'attributes':
                    return 'Level ' + card.level + '<br>' + heroName + '<br>' + attributeOptions.filter(function(a) {
                        return a.id == card.name;
                    })[0].name;
                break;
                case 'abilities':
                    var ability = heroData['npc_dota_hero_' + card.hero].abilities.filter(function (ability) { return ability.name == card.name })[0]
                    switch (card.property) {
                        case 'manacost':
                            tooltip = 'Mana Cost';
                        break;
                        case 'cooldown':
                            tooltip = 'Cooldown';
                        break;
                        default:
                            var attribute = ability.attributes.filter(function (attribute) { return attribute.name == card.property })[0];
                            tooltip = attribute.tooltip;
                        break;
                    }
                    if (tooltip.slice(-1) == ':') {
                        tooltip = tooltip.slice(0, -1);
                    }
                    return heroName + '<br>' + ability.displayname + '<br>Level ' + card.level + '<br>' + tooltip;
                break;
            }
        }
        
        function getCardAnswer(card) {
            heroModel.heroId(card.hero);
            switch (card.kind) {
                case 'attributes':
                    heroModel.selectedHeroLevel(card.level);
                    return formatValue(getAttributeValue(heroModel, card.name));
                break;
                case 'abilities':
                    var ability = heroData['npc_dota_hero_' + card.hero].abilities.filter(function (ability) { return ability.name == card.name })[0]
                    var values;
                    switch (card.property) {
                        case 'manacost':
                        case 'cooldown':
                            values = ability[card.property];
                        break;
                        default:
                            var attribute = ability.attributes.filter(function (attribute) { return attribute.name == card.property })[0];
                            values = attribute.value;
                        break;
                    }
                    if (card.level > values.length) {
                        var value = values[0];
                    }
                    else {
                        var value = values[Math.max(0, card.level - 1)];
                    }
                
                    return formatValue(value);
                break;
            }
        }
        
        function formatSpeech(text) {
            return text.toString()
                        .replace(/<br>/g, ' ')
                        .replace(/Avg/g, 'Average')
                        .replace(/Shaman/g, 'Shahman')
                        .replace(/Techies/g, 'Tekkies')
                        .replace(/Alchemist/g, 'Alkemist')
                        .replace(/Jakiro/g, 'Jah-keer-roe')
                        .replace(/Huskar/g, 'Husk-R')
                        .replace(/Omniknight/g, 'Omni-knight')
                        .replace(/Aphotic/g, 'Afotic')
                        .replace(/Avernus/g, 'Ahvernus')
                        .replace(/Malefice/g, 'Malifice')
                        .replace(/Chronosphere/g, 'Chrohnosphere')
                        .replace(/Omnislash/g, 'Omni-slash')
                        .replace(/Degen Aura/g, 'D-gen Aura')
                        .replace(/Coup de Grace/g, 'Coup de Grahs')
                        .replace(/Squad, Attack!/g, 'Squad Attack!')
                        .replace(/Sigil/g, 'Frozen Sijhil')
                        .replace(/Grave Chill/g, 'Graiyv Chill')
                        .replace(/Familiars/g, 'Familiarz.');
        }

        function ViewModel() {
            var self = this;
            this.attributes = ko.observableArray(attributeOptions);
            this.heroes = heroOptions.sort(function (a, b) {
                if (a.heroDisplayName < b.heroDisplayName) return -1;
                if (a.heroDisplayName > b.heroDisplayName) return 1;
                return 0;
            });
            var uri = new URI();
            this.selectedAttributesBitArray = new BitArray(32);
            this.selectedAttributesBitArray.fromBase64UrlSafe(uri.query(true)['attributes']);
            this.selectedAttributes = ko.observableArray(self.attributes().map(function(a) {
                return a.id;
            }).filter(function(h, i) {
                return self.selectedAttributesBitArray.value(i);
            })).extend({ deferred: true });
            this.selectedAttributes.subscribe(function(changes) {
                changes.forEach(function(change) {
                    if (change.status === 'added' || change.status === 'deleted') {
                        for (var i = 0; i < self.attributes().length; i++) {
                            var attr = self.attributes()[i];
                            if (attr.id == change.value) {
                                self.selectedAttributesBitArray.value(i, change.status === 'added');
                                break;
                            }
                        }
                    }
                });
                uri.setSearch("attributes", self.selectedAttributesBitArray.toBase64UrlSafe());
                window.history.replaceState({}, "", uri.toString());
            }, null, "arrayChange");

            this.selectedHeroesBitArray = new BitArray(128);
            this.selectedHeroesBitArray.fromBase64UrlSafe(uri.query(true)['heroes']);
            this.selectedHeroes = ko.observableArray(
                this.heroes.map(function (o) { return o.heroName; }).filter(function (h) { return self.selectedHeroesBitArray.value(getHeroID(h)); })
            ).extend({ deferred: true });
            this.selectedHeroes.subscribe(function(changes) {
                changes.forEach(function(change) {
                    if (change.status === 'added' || change.status === 'deleted') {
                        self.selectedHeroesBitArray.value(getHeroID(change.value), change.status === 'added');
                    }
                });
                uri.setSearch("heroes", self.selectedHeroesBitArray.toBase64UrlSafe());
                window.history.replaceState({}, "", uri.toString());
            }, null, "arrayChange");
            
            this.deck = [];
            this.card = null;
            this.state = ko.observable(0);
            this.text = ko.observable('<i>Tap to start</i>');
            this.textToSpeech = ko.observable(false).extend({ urlSync: {
                    param: 'speech',
                    read: function (value) {
                        return value != false && value !== 'false';
                    }
                }
            });
            this.minLevel = ko.observable(1).extend({ numeric: {defaultValue: 1}, urlSync: {
                    param: 'minlevel',
                    read: function (value) {
                        return parseInt(value);
                    }
                }
            });
            this.minLevel.subscribe(function (newValue) {
                if (parseInt(newValue) > parseInt(self.maxLevel())) {
                    self.maxLevel(self.minLevel()); 
                }
            });
            this.maxLevel = ko.observable(1).extend({ numeric: {defaultValue: 1}, urlSync: {
                    param: 'maxlevel',
                    read: function (value) {
                        return parseInt(value);
                    }
                }
            });
            this.maxLevel.subscribe(function (newValue) {
                if (parseInt(newValue) < parseInt(self.minLevel())) {
                    self.minLevel(self.maxLevel());
                }
            });
            
            this.reset = function () {
                this.state(0);
                this.stats.correct(0);
                this.stats.wrong(0);
                if (this.card) {
                    this.deck.push(this.card);
                }
                this.card = null;
                this.text('<i>Tap to start</i>');
            }
            
            this.isWrong = ko.observable(false);
            this.run = function () {
                if (!this.deck.length && !this.card) {
                    alert('No heroes or attributes selected.');
                    return;
                }

                // when state is 0, pick random card to show
                if (this.state() === 0) {
                    
                    // put old card back in deck
                    if (this.card) {
                        var index;
                        switch (this.drawStrategy()) {
                            case 'back':
                                index = 0;
                            break;
                            case 'random':
                                // inserts at random position excluding the very end
                                index = Math.floor(Math.random() * this.deck.length);
                            break;
                            case 'training':
                                var minP = Math.min(this.deck.length, 5);
                                var maxP = Math.min(this.deck.length, 10);
                                if (this.isWrong()) {
                                    index = this.deck.length - getRandomInt(minP, maxP);
                                }
                                else {
                                    index = getRandomInt(0, this.deck.length - maxP);
                                }
                            break;
                        }
                        this.deck.splice(index, 0, this.card);
                        
                        if (this.isWrong()) {
                            this.stats.wrong(this.stats.wrong()+1);
                        }
                        else {
                            this.stats.correct(this.stats.correct()+1);
                        }
                    }
                
                    this.card = this.deck.pop();
                    console.log(this.card);
                    this.text(formatCard(this.card));
                    this.isWrong(false);
                }
                // when state is 1, we show the answer
                else if (this.state() === 1) {
                    this.text(getCardAnswer(this.card));
                }
                console.log(this.text());

                this.state((this.state() + 1) % 2);

                if (this.textToSpeech()) {
                    responsiveVoice.speak(formatSpeech(this.text()), 'US English Female', {"onend": this.loop});
                }
                else {
                    this.loop();
                }
            };
            
            this.loop = function () {
                if (self.autoPlay() && self.activeTab() === '#home') {
                    clearTimeout(self.autoPlayInterval);
                    self.autoPlayInterval = setTimeout(function () {
                        self.slider.next();
                    }, self.autoPlayDelay());
                }            
            }

            this.selectAllHeroes = function () {
                self.selectedHeroes(self.heroes.map(function (o) { return o.heroName; }));
            }
            this.deselectAllHeroes = function () {
                this.selectedHeroes.removeAll();
            }
            this.selectAllAttributes = function () {
                self.selectedAttributes(self.attributes().map(function (o) { return o.id; }));
            }
            this.deselectAllAttributes = function () {
                this.selectedAttributes.removeAll();
            }

            this.correct = function () {
                //console.log('btn correct');
                clearTimeout(this.autoPlayInterval);
                this.run();
            }

            this.wrong = function () {
                //console.log('btn wrong');
                clearTimeout(this.autoPlayInterval);
                this.isWrong(true);
                this.slider.next();
            }

            this.infoBarVisible = ko.observable(true).extend({ urlSync: {
                    param: 'infobar',
                    read: function (value) {
                        return value != false && value !== 'false';
                    }
                }
            });

            this.autoPlay = ko.observable(false).extend({ urlSync: {
                    param: 'autoplay',
                    read: function (value) {
                        return value != false && value !== 'false';
                    }
                }
            });
            this.autoPlayDelay = ko.observable(3000).extend({ numeric: {defaultValue: 3000}, urlSync: {
                    param: 'autodelay',
                    read: function (value) {
                        return parseInt(value);
                    }
                }
            });
            this.autoPlayInterval;
            this.autoPlay.subscribe(function(newValue) {
                if (!newValue) {
                    clearTimeout(self.autoPlayInterval);
                }
            });
            
            this.drawStrategy = ko.observable('training').extend({ urlSync: {
                    param: 'shuffle',
                    read: function (value) {
                        value = value.toLowerCase();
                        return ['training', 'back', 'random'].indexOf(value) !== -1 ? value : 'training';
                    }
                }
            });
            
            this.questionTypes = ko.observableArray(['attributes']).extend({ urlSync: {
                    param: 'categories',
                    read: function (value) {
                        value = [].concat(value).map(function (o) { return o.toLowerCase(); }).filter(function (o) { return ['attributes', 'abilities'].indexOf(o) !== -1 });
                        return value.length ? value : ['attributes'];
                    }
                }
            });
            this.questionTypes.subscribe(function(changes) {
                if (self.questionTypes().length === 0) {
                    var arr = [];
                    changes.forEach(function(change) {
                        if (change.status === 'deleted') arr.push(change.value);
                    });
                    self.questionTypes(arr);
                }
            }, null, "arrayChange");
            
            this.abilityQuestionTypes = ko.observableArray(['attributes']).extend({ urlSync: {
                    param: 'abilities',
                    read: function (value) {
                        value = [].concat(value).map(function (o) { return o.toLowerCase(); }).filter(function (o) { return ['attributes', 'cooldown', 'manacost'].indexOf(o) !== -1 });
                        return value.length ? value : ['abilities'];
                    }
                }
            });
            this.abilityQuestionTypes.subscribe(function(changes) {
                if (self.abilityQuestionTypes().length === 0) {
                    var arr = [];
                    changes.forEach(function(change) {
                        if (change.status === 'deleted') arr.push(change.value);
                    });
                    self.abilityQuestionTypes(arr);
                }
            }, null, "arrayChange");
            this.abilityQuestionTypesVisible = ko.computed(function () {
                return self.questionTypes().indexOf('abilities') !== -1;
            });

            this.stats = {
                deck: ko.observable(0),
                correct: ko.observable(0),
                wrong: ko.observable(0)
            }
            
            // serialized deck settings string, used to check if settings have changed
            this.deckSettingsState = '';
            
            this.serializeDeckSettings = function () {
                return ko.toJSON({
                    heroes: self.selectedHeroesBitArray.toBase64UrlSafe(),
                    attributes: self.selectedAttributesBitArray.toBase64UrlSafe(),
                    minLevel: self.minLevel(),
                    maxLevel: self.maxLevel(),
                    autoPlay: self.autoPlay(),
                    autoPlayDelay: self.autoPlayDelay(),
                    drawStrategy: self.drawStrategy(),
                    questionTypes: self.questionTypes(),
                    abilityQuestionTypes: self.abilityQuestionTypes()
                });
            }
            
            this.updateDeck = function () {
                var selectedAttributes = (this.questionTypes.indexOf('attributes') !== -1) ? this.selectedAttributes() : [];
                var abilityQuestionTypes = (this.questionTypes.indexOf('abilities') !== -1) ? this.abilityQuestionTypes() : [];
                this.reset();
                this.deck = shuffle(filterDeck(DECK, this.selectedHeroes(), selectedAttributes, parseInt(this.minLevel()), parseInt(this.maxLevel()), abilityQuestionTypes));
                this.deckSettingsState = this.serializeDeckSettings();
                this.stats.deck(this.deck.length);
            }
            this.updateDeck();
            
            this.shuffleDeck = function () {
                this.reset();
                this.deck = shuffle(this.deck);
            }
            
            this.slider = new Slider('#slider', {
                onPanStart: function () {
                    clearTimeout(self.autoPlayInterval);
                },
                onGoTo: function (bChanged) {
                    if (bChanged) {
                        self.correct();
                    }
                    else {
                        self.loop();
                    }
                }
            });
            
            this.activeTab = ko.observable('#home');
        }
        var vm = new ViewModel();
        ko.applyBindings(vm);
        
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            var target = $(e.target).attr("href") // activated tab
            vm.activeTab(target);
            if (target === '#home') {
                //console.log(vm.serializeDeckSettings(), vm.deckSettingsState, vm.serializeDeckSettings() !== vm.deckSettingsState);
                if (vm.serializeDeckSettings() !== vm.deckSettingsState) {
                    vm.updateDeck();
                }
            }
            else {
                clearTimeout(vm.autoPlayInterval);
            }
        });
    //});
};
console.log('bundle.js');
module.exports = App;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./ko.bindingHandlers.checkbox":46,"./ko.bindingHandlers.radio":47,"./ko.extenders.urlSync":48,"./responsivevoice":49,"./rollbar":50,"./slider":51,"bit-array-js":1,"dota-hero-calculator-library/src/herocalc/hero/HeroModel":9,"dota-hero-calculator-library/src/herocalc/hero/heroOptionsArray":13,"urijs":44}],46:[function(require,module,exports){
(function (global){
var ko = (typeof window !== "undefined" ? window['ko'] : typeof global !== "undefined" ? global['ko'] : null);

// Knockout checked binding doesn't work with Bootstrap checkboxes
ko.bindingHandlers.checkbox = {
    init: function (element, valueAccessor) {
        var $element = $(element),
            handler = function (e) {
            // we need to handle change event after bootsrap will handle its event
            // to prevent incorrect changing of checkbox state
            setTimeout(function () {
                var $checkbox = $(e.target),
                    value = valueAccessor(),
                    data = $checkbox.val(),
                    isChecked = $checkbox.parent().hasClass('active');
                
                if(!$checkbox.prop('disbled')) {
                    if (ko.unwrap(value) instanceof Array) {
                        var index = ko.utils.arrayIndexOf(ko.unwrap(value), (data));

                        if (isChecked && (index === -1)) {
                            value.push(data);
                        } else if (!isChecked && (index !== -1)) {
                            value.splice(index, 1);
                        }
                    } else {
                        value(isChecked);
                    }
                }
            }, 0);
        };

        if ($element.attr('data-toggle') === 'buttons' && $element.find('input:checkbox').length) {

            if (!(ko.unwrap(valueAccessor()) instanceof Array)) {
                throw new Error('checkbox binding should be used only with array or observableArray values in this case');
            }

            $element.on('change', 'input:checkbox', handler);
        } else if ($element.attr('type') === 'checkbox') {

            if (!ko.isObservable(valueAccessor())) {
                throw new Error('checkbox binding should be used only with observable values in this case');
            }

            $element.on('change', handler);
        } else {
            throw new Error('checkbox binding should be used only with bootstrap checkboxes');
        }
    },

    update: function (element, valueAccessor) {
        var $element = $(element),
            value = ko.unwrap(valueAccessor()),
            isChecked;

        if (value instanceof Array) {
            if ($element.attr('data-toggle') === 'buttons') {
                $element.find('input:checkbox').each(function (index, el) {
                    isChecked = ko.utils.arrayIndexOf(value, el.value) !== -1;
                    $(el).parent().toggleClass('active', isChecked);
                    el.checked = isChecked;
                });
            } else {
                isChecked = ko.utils.arrayIndexOf(value, $element.val()) !== -1;
                $element.toggleClass('active', isChecked);
                $element.find('input').prop('checked', isChecked);
            }
        } else {
            isChecked = !!value;
            $element.prop('checked', isChecked);
            $element.parent().toggleClass('active', isChecked);
        }
    }
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],47:[function(require,module,exports){
(function (global){
var ko = (typeof window !== "undefined" ? window['ko'] : typeof global !== "undefined" ? global['ko'] : null);

// Knockout checked binding doesn't work with Bootstrap radio-buttons
ko.bindingHandlers.radio = {
    init: function (element, valueAccessor) {

        if (!ko.isObservable(valueAccessor())) {
            throw new Error('radio binding should be used only with observable values');
        }

        $(element).on('change', 'input:radio', function (e) {
            // we need to handle change event after bootsrap will handle its event
            // to prevent incorrect changing of radio button styles
            setTimeout(function() {
                var radio = $(e.target),
                    value = valueAccessor(),
                    newValue = radio.val();

                // we shouldn't change value for disables buttons
                if (!radio.prop('disabled')) {
                    value(newValue);
                }
            }, 0);
        });
    },

    update: function (element, valueAccessor) {
        var value = ko.unwrap(valueAccessor()) || '',
            $radioButton = $(element).find('input[value="' + value.replace(/"/g, '\\"') + '"]'),
            $radioButtonWrapper;

        if ($radioButton.length) {
            $radioButtonWrapper = $radioButton.parent();

            $radioButtonWrapper.siblings().removeClass('active');
            $radioButtonWrapper.addClass('active');

            $radioButton.prop('checked', true);
        } else {
            $radioButtonWrapper = $(element).find('.active');
            $radioButtonWrapper.removeClass('active');
            $radioButtonWrapper.find('input').prop('checked', false);
        }
    }
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],48:[function(require,module,exports){
(function (global){
var ko = (typeof window !== "undefined" ? window['ko'] : typeof global !== "undefined" ? global['ko'] : null);
var URI = require('urijs');
var isString = require('lodash/isString');
var isUndefined = require('lodash/isUndefined');

ko.extenders.urlSync = function(target, options) {
    if (isString(options)) {
        options = {
            param: options
        };
    }
    else {
        options = options || {};
    }
    options.read = options.read || function(value) {
        return value;
    };
    options.write = options.write || function(value) {
        return value;
    };

    if (isUndefined(options.param)) return target;

    // retrieve from URI
    var uri = new URI();
    var paramValueQuery = uri.query(true)[options.param];
    if (!isUndefined(paramValueQuery)) {
        var readValue = options.read(paramValueQuery);
        target(readValue);
        uri.setSearch(options.param, options.write(readValue));
        window.history.replaceState({}, "", uri.toString());
    }

    target.subscribe(function(newValue) {
        var uri = new URI();
        var writtenValue = options.write(newValue);
        uri.setSearch(options.param, writtenValue);

        // update hash
        window.history.replaceState({}, "", uri.toString());
    });
    return target;
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"lodash/isString":41,"lodash/isUndefined":42,"urijs":44}],49:[function(require,module,exports){
/*
 ResponsiveVoice JS v1.5.0

 (c) 2015-2016 LearnBrite

 License: http://responsivevoice.org/license
*/
if("undefined"!=typeof responsiveVoice)console.log("ResponsiveVoice already loaded"),console.log(responsiveVoice);else var ResponsiveVoice=function(){var a=this;a.version="1.5.0";console.log("ResponsiveVoice r"+a.version);a.responsivevoices=[{name:"UK English Female",flag:"gb",gender:"f",voiceIDs:[3,5,1,6,7,171,201,8]},{name:"UK English Male",flag:"gb",gender:"m",voiceIDs:[0,4,2,75,202,159,6,7]},{name:"US English Female",flag:"us",gender:"f",voiceIDs:[39,40,41,42,43,173,205,204,235,44]},{name:"Arabic Male",
flag:"ar",gender:"m",voiceIDs:[96,95,97,196,98],deprecated:!0},{name:"Arabic Female",flag:"ar",gender:"f",voiceIDs:[96,95,97,196,98]},{name:"Armenian Male",flag:"hy",gender:"f",voiceIDs:[99]},{name:"Australian Female",flag:"au",gender:"f",voiceIDs:[87,86,5,201,88]},{name:"Brazilian Portuguese Female",flag:"br",gender:"f",voiceIDs:[245,124,123,125,186,223,126]},{name:"Chinese Female",flag:"cn",gender:"f",voiceIDs:[249,58,59,60,155,191,231,61]},{name:"Chinese (Hong Kong) Female",flag:"hk",gender:"f",
voiceIDs:[192,193,232,250,251,252]},{name:"Chinese Taiwan Female",flag:"tw",gender:"f",voiceIDs:[252,194,233,253,254,255]},{name:"Czech Female",flag:"cz",gender:"f",voiceIDs:[101,100,102,197,103]},{name:"Danish Female",flag:"dk",gender:"f",voiceIDs:[105,104,106,198,107]},{name:"Deutsch Female",flag:"de",gender:"f",voiceIDs:[27,28,29,30,31,78,170,199,32]},{name:"Dutch Female",flag:"nl",gender:"f",voiceIDs:[243,219,84,157,158,184,45]},{name:"Finnish Female",flag:"fi",gender:"f",voiceIDs:[90,89,91,209,
92]},{name:"French Female",flag:"fr",gender:"f",voiceIDs:[240,21,22,23,77,178,210,26]},{name:"Greek Female",flag:"gr",gender:"f",voiceIDs:[62,63,80,200,64]},{name:"Hatian Creole Female",flag:"ht",gender:"f",voiceIDs:[109]},{name:"Hindi Female",flag:"hi",gender:"f",voiceIDs:[247,66,154,179,213,67]},{name:"Hungarian Female",flag:"hu",gender:"f",voiceIDs:[9,10,81,214,11]},{name:"Indonesian Female",flag:"id",gender:"f",voiceIDs:[241,111,112,180,215,113]},{name:"Italian Female",flag:"it",gender:"f",voiceIDs:[242,
33,34,35,36,37,79,181,216,38]},{name:"Japanese Female",flag:"jp",gender:"f",voiceIDs:[248,50,51,52,153,182,217,53]},{name:"Korean Female",flag:"kr",gender:"f",voiceIDs:[54,55,56,156,183,218,57]},{name:"Latin Female",flag:"va",gender:"f",voiceIDs:[114]},{name:"Norwegian Female",flag:"no",gender:"f",voiceIDs:[72,73,221,74]},{name:"Polish Female",flag:"pl",gender:"f",voiceIDs:[244,120,119,121,185,222,122]},{name:"Portuguese Female",flag:"br",gender:"f",voiceIDs:[128,127,129,187,224,130]},{name:"Romanian Male",
flag:"ro",gender:"m",voiceIDs:[151,150,152,225,46]},{name:"Russian Female",flag:"ru",gender:"f",voiceIDs:[246,47,48,83,188,226,49]},{name:"Slovak Female",flag:"sk",gender:"f",voiceIDs:[133,132,134,227,135]},{name:"Spanish Female",flag:"es",gender:"f",voiceIDs:[19,238,16,17,18,20,76,174,207,15]},{name:"Spanish Latin American Female",flag:"es",gender:"f",voiceIDs:[239,137,136,138,175,208,139]},{name:"Swedish Female",flag:"sv",gender:"f",voiceIDs:[85,148,149,228,65]},{name:"Tamil Male",flag:"hi",gender:"m",
voiceIDs:[141]},{name:"Thai Female",flag:"th",gender:"f",voiceIDs:[143,142,144,189,229,145]},{name:"Turkish Female",flag:"tr",gender:"f",voiceIDs:[69,70,82,190,230,71]},{name:"Afrikaans Male",flag:"af",gender:"m",voiceIDs:[93]},{name:"Albanian Male",flag:"sq",gender:"m",voiceIDs:[94]},{name:"Bosnian Male",flag:"bs",gender:"m",voiceIDs:[14]},{name:"Catalan Male",flag:"catalonia",gender:"m",voiceIDs:[68]},{name:"Croatian Male",flag:"hr",gender:"m",voiceIDs:[13]},{name:"Czech Male",flag:"cz",gender:"m",
voiceIDs:[161]},{name:"Danish Male",flag:"da",gender:"m",voiceIDs:[162],deprecated:!0},{name:"Esperanto Male",flag:"eo",gender:"m",voiceIDs:[108]},{name:"Finnish Male",flag:"fi",gender:"m",voiceIDs:[160],deprecated:!0},{name:"Greek Male",flag:"gr",gender:"m",voiceIDs:[163],deprecated:!0},{name:"Hungarian Male",flag:"hu",gender:"m",voiceIDs:[164]},{name:"Icelandic Male",flag:"is",gender:"m",voiceIDs:[110]},{name:"Latin Male",flag:"va",gender:"m",voiceIDs:[165],deprecated:!0},{name:"Latvian Male",flag:"lv",
gender:"m",voiceIDs:[115]},{name:"Macedonian Male",flag:"mk",gender:"m",voiceIDs:[116]},{name:"Moldavian Male",flag:"md",gender:"m",voiceIDs:[117]},{name:"Montenegrin Male",flag:"me",gender:"m",voiceIDs:[118]},{name:"Norwegian Male",flag:"no",gender:"m",voiceIDs:[166]},{name:"Serbian Male",flag:"sr",gender:"m",voiceIDs:[12]},{name:"Serbo-Croatian Male",flag:"hr",gender:"m",voiceIDs:[131]},{name:"Slovak Male",flag:"sk",gender:"m",voiceIDs:[167],deprecated:!0},{name:"Swahili Male",flag:"sw",gender:"m",
voiceIDs:[140]},{name:"Swedish Male",flag:"sv",gender:"m",voiceIDs:[168],deprecated:!0},{name:"Vietnamese Male",flag:"vi",gender:"m",voiceIDs:[146],deprecated:!0},{name:"Welsh Male",flag:"cy",gender:"m",voiceIDs:[147]},{name:"US English Male",flag:"us",gender:"m",voiceIDs:[0,4,2,6,7,75,159,234,236,237]},{name:"Fallback UK Female",flag:"gb",gender:"f",voiceIDs:[8]}];a.voicecollection=[{name:"Google UK English Male"},{name:"Agnes"},{name:"Daniel Compact"},{name:"Google UK English Female"},{name:"en-GB",
rate:.25,pitch:1},{name:"en-AU",rate:.25,pitch:1},{name:"ingl\u00e9s Reino Unido"},{name:"English United Kingdom"},{name:"Fallback en-GB Female",lang:"en-GB",fallbackvoice:!0},{name:"Eszter Compact"},{name:"hu-HU",rate:.4},{name:"Fallback Hungarian",lang:"hu",fallbackvoice:!0,service:"g2"},{name:"Fallback Serbian",lang:"sr",fallbackvoice:!0},{name:"Fallback Croatian",lang:"hr",fallbackvoice:!0},{name:"Fallback Bosnian",lang:"bs",fallbackvoice:!0},{name:"Fallback Spanish",lang:"es",fallbackvoice:!0},
{name:"Spanish Spain"},{name:"espa\u00f1ol Espa\u00f1a"},{name:"Diego Compact",rate:.3},{name:"Google Espa\u00f1ol"},{name:"es-ES",rate:.2},{name:"Google Fran\u00e7ais"},{name:"French France"},{name:"franc\u00e9s Francia"},{name:"Virginie Compact",rate:.5},{name:"fr-FR",rate:.25},{name:"Fallback French",lang:"fr",fallbackvoice:!0},{name:"Google Deutsch"},{name:"German Germany"},{name:"alem\u00e1n Alemania"},{name:"Yannick Compact",rate:.5},{name:"de-DE",rate:.25},{name:"Fallback Deutsch",lang:"de",
fallbackvoice:!0},{name:"Google Italiano"},{name:"Italian Italy"},{name:"italiano Italia"},{name:"Paolo Compact",rate:.5},{name:"it-IT",rate:.25},{name:"Fallback Italian",lang:"it",fallbackvoice:!0},{name:"Google US English",timerSpeed:1},{name:"English United States"},{name:"ingl\u00e9s Estados Unidos"},{name:"Vicki"},{name:"en-US",rate:.2,pitch:1,timerSpeed:1.3},{name:"Fallback English",lang:"en-US",fallbackvoice:!0,timerSpeed:0},{name:"Fallback Dutch",lang:"nl",fallbackvoice:!0,timerSpeed:0},{name:"Fallback Romanian",
lang:"ro",fallbackvoice:!0},{name:"Milena Compact"},{name:"ru-RU",rate:.25},{name:"Fallback Russian",lang:"ru",fallbackvoice:!0},{name:"Google \u65e5\u672c\u4eba",timerSpeed:1},{name:"Kyoko Compact"},{name:"ja-JP",rate:.25},{name:"Fallback Japanese",lang:"ja",fallbackvoice:!0},{name:"Google \ud55c\uad6d\uc758",timerSpeed:1},{name:"Narae Compact"},{name:"ko-KR",rate:.25},{name:"Fallback Korean",lang:"ko",fallbackvoice:!0},{name:"Google \u4e2d\u56fd\u7684",timerSpeed:1},{name:"Ting-Ting Compact"},{name:"zh-CN",
rate:.25},{name:"Fallback Chinese",lang:"zh-CN",fallbackvoice:!0},{name:"Alexandros Compact"},{name:"el-GR",rate:.25},{name:"Fallback Greek",lang:"el",fallbackvoice:!0,service:"g2"},{name:"Fallback Swedish",lang:"sv",fallbackvoice:!0,service:"g2"},{name:"hi-IN",rate:.25},{name:"Fallback Hindi",lang:"hi",fallbackvoice:!0},{name:"Fallback Catalan",lang:"ca",fallbackvoice:!0},{name:"Aylin Compact"},{name:"tr-TR",rate:.25},{name:"Fallback Turkish",lang:"tr",fallbackvoice:!0},{name:"Stine Compact"},{name:"no-NO",
rate:.25},{name:"Fallback Norwegian",lang:"no",fallbackvoice:!0,service:"g2"},{name:"Daniel"},{name:"Monica"},{name:"Amelie"},{name:"Anna"},{name:"Alice"},{name:"Melina"},{name:"Mariska"},{name:"Yelda"},{name:"Milena"},{name:"Xander"},{name:"Alva"},{name:"Lee Compact"},{name:"Karen"},{name:"Fallback Australian",lang:"en-AU",fallbackvoice:!0},{name:"Mikko Compact"},{name:"Satu"},{name:"fi-FI",rate:.25},{name:"Fallback Finnish",lang:"fi",fallbackvoice:!0,service:"g2"},{name:"Fallback Afrikans",lang:"af",
fallbackvoice:!0},{name:"Fallback Albanian",lang:"sq",fallbackvoice:!0},{name:"Maged Compact"},{name:"Tarik"},{name:"ar-SA",rate:.25},{name:"Fallback Arabic",lang:"ar",fallbackvoice:!0,service:"g2"},{name:"Fallback Armenian",lang:"hy",fallbackvoice:!0,service:"g2"},{name:"Zuzana Compact"},{name:"Zuzana"},{name:"cs-CZ",rate:.25},{name:"Fallback Czech",lang:"cs",fallbackvoice:!0,service:"g2"},{name:"Ida Compact"},{name:"Sara"},{name:"da-DK",rate:.25},{name:"Fallback Danish",lang:"da",fallbackvoice:!0,
service:"g2"},{name:"Fallback Esperanto",lang:"eo",fallbackvoice:!0},{name:"Fallback Hatian Creole",lang:"ht",fallbackvoice:!0},{name:"Fallback Icelandic",lang:"is",fallbackvoice:!0},{name:"Damayanti"},{name:"id-ID",rate:.25},{name:"Fallback Indonesian",lang:"id",fallbackvoice:!0},{name:"Fallback Latin",lang:"la",fallbackvoice:!0,service:"g2"},{name:"Fallback Latvian",lang:"lv",fallbackvoice:!0},{name:"Fallback Macedonian",lang:"mk",fallbackvoice:!0},{name:"Fallback Moldavian",lang:"mo",fallbackvoice:!0,
service:"g2"},{name:"Fallback Montenegrin",lang:"sr-ME",fallbackvoice:!0},{name:"Agata Compact"},{name:"Zosia"},{name:"pl-PL",rate:.25},{name:"Fallback Polish",lang:"pl",fallbackvoice:!0},{name:"Raquel Compact"},{name:"Luciana"},{name:"pt-BR",rate:.25},{name:"Fallback Brazilian Portugese",lang:"pt-BR",fallbackvoice:!0,service:"g2"},{name:"Joana Compact"},{name:"Joana"},{name:"pt-PT",rate:.25},{name:"Fallback Portuguese",lang:"pt-PT",fallbackvoice:!0},{name:"Fallback Serbo-Croation",lang:"sh",fallbackvoice:!0,
service:"g2"},{name:"Laura Compact"},{name:"Laura"},{name:"sk-SK",rate:.25},{name:"Fallback Slovak",lang:"sk",fallbackvoice:!0,service:"g2"},{name:"Javier Compact"},{name:"Paulina"},{name:"es-MX",rate:.25},{name:"Fallback Spanish (Latin American)",lang:"es-419",fallbackvoice:!0,service:"g2"},{name:"Fallback Swahili",lang:"sw",fallbackvoice:!0},{name:"Fallback Tamil",lang:"ta",fallbackvoice:!0},{name:"Narisa Compact"},{name:"Kanya"},{name:"th-TH",rate:.25},{name:"Fallback Thai",lang:"th",fallbackvoice:!0},
{name:"Fallback Vietnamese",lang:"vi",fallbackvoice:!0},{name:"Fallback Welsh",lang:"cy",fallbackvoice:!0},{name:"Oskar Compact"},{name:"sv-SE",rate:.25},{name:"Simona Compact"},{name:"Ioana"},{name:"ro-RO",rate:.25},{name:"Kyoko"},{name:"Lekha"},{name:"Ting-Ting"},{name:"Yuna"},{name:"Xander Compact"},{name:"nl-NL",rate:.25},{name:"Fallback UK English Male",lang:"en-GB",fallbackvoice:!0,service:"g1",voicename:"rjs"},{name:"Finnish Male",lang:"fi",fallbackvoice:!0,service:"g1",voicename:""},{name:"Czech Male",
lang:"cs",fallbackvoice:!0,service:"g1",voicename:""},{name:"Danish Male",lang:"da",fallbackvoice:!0,service:"g1",voicename:""},{name:"Greek Male",lang:"el",fallbackvoice:!0,service:"g1",voicename:"",rate:.25},{name:"Hungarian Male",lang:"hu",fallbackvoice:!0,service:"g1",voicename:""},{name:"Latin Male",lang:"la",fallbackvoice:!0,service:"g1",voicename:""},{name:"Norwegian Male",lang:"no",fallbackvoice:!0,service:"g1",voicename:""},{name:"Slovak Male",lang:"sk",fallbackvoice:!0,service:"g1",voicename:""},
{name:"Swedish Male",lang:"sv",fallbackvoice:!0,service:"g1",voicename:""},{name:"Fallback US English Male",lang:"en",fallbackvoice:!0,service:"tts-api",voicename:""},{name:"German Germany",lang:"de_DE"},{name:"English United Kingdom",lang:"en_GB"},{name:"English India",lang:"en_IN"},{name:"English United States",lang:"en_US"},{name:"Spanish Spain",lang:"es_ES"},{name:"Spanish Mexico",lang:"es_MX"},{name:"Spanish United States",lang:"es_US"},{name:"French Belgium",lang:"fr_BE"},{name:"French France",
lang:"fr_FR"},{name:"Hindi India",lang:"hi_IN"},{name:"Indonesian Indonesia",lang:"in_ID"},{name:"Italian Italy",lang:"it_IT"},{name:"Japanese Japan",lang:"ja_JP"},{name:"Korean South Korea",lang:"ko_KR"},{name:"Dutch Netherlands",lang:"nl_NL"},{name:"Polish Poland",lang:"pl_PL"},{name:"Portuguese Brazil",lang:"pt_BR"},{name:"Portuguese Portugal",lang:"pt_PT"},{name:"Russian Russia",lang:"ru_RU"},{name:"Thai Thailand",lang:"th_TH"},{name:"Turkish Turkey",lang:"tr_TR"},{name:"Chinese China",lang:"zh_CN_#Hans"},
{name:"Chinese Hong Kong",lang:"zh_HK_#Hans"},{name:"Chinese Hong Kong",lang:"zh_HK_#Hant"},{name:"Chinese Taiwan",lang:"zh_TW_#Hant"},{name:"Alex"},{name:"Maged",lang:"ar-SA"},{name:"Zuzana",lang:"cs-CZ"},{name:"Sara",lang:"da-DK"},{name:"Anna",lang:"de-DE"},{name:"Melina",lang:"el-GR"},{name:"Karen",lang:"en-AU"},{name:"Daniel",lang:"en-GB"},{name:"Moira",lang:"en-IE"},{name:"Samantha (Enhanced)",lang:"en-US"},{name:"Samantha",lang:"en-US"},{name:"Tessa",lang:"en-ZA"},{name:"Monica",lang:"es-ES"},
{name:"Paulina",lang:"es-MX"},{name:"Satu",lang:"fi-FI"},{name:"Amelie",lang:"fr-CA"},{name:"Thomas",lang:"fr-FR"},{name:"Carmit",lang:"he-IL"},{name:"Lekha",lang:"hi-IN"},{name:"Mariska",lang:"hu-HU"},{name:"Damayanti",lang:"id-ID"},{name:"Alice",lang:"it-IT"},{name:"Kyoko",lang:"ja-JP"},{name:"Yuna",lang:"ko-KR"},{name:"Ellen",lang:"nl-BE"},{name:"Xander",lang:"nl-NL"},{name:"Nora",lang:"no-NO"},{name:"Zosia",lang:"pl-PL"},{name:"Luciana",lang:"pt-BR"},{name:"Joana",lang:"pt-PT"},{name:"Ioana",
lang:"ro-RO"},{name:"Milena",lang:"ru-RU"},{name:"Laura",lang:"sk-SK"},{name:"Alva",lang:"sv-SE"},{name:"Kanya",lang:"th-TH"},{name:"Yelda",lang:"tr-TR"},{name:"Ting-Ting",lang:"zh-CN"},{name:"Sin-Ji",lang:"zh-HK"},{name:"Mei-Jia",lang:"zh-TW"},{name:"Microsoft David Mobile - English (United States)",lang:"en-US"},{name:"Microsoft Zira Mobile - English (United States)",lang:"en-US"},{name:"Microsoft Mark Mobile - English (United States)",lang:"en-US"},{name:"native",lang:""},{name:"Google espa\u00f1ol"},
{name:"Google espa\u00f1ol de Estados Unidos"},{name:"Google fran\u00e7ais"},{name:"Google Bahasa Indonesia"},{name:"Google italiano"},{name:"Google Nederlands"},{name:"Google polski"},{name:"Google portugu\u00eas do Brasil"},{name:"Google \u0440\u0443\u0441\u0441\u043a\u0438\u0439"},{name:"Google \u0939\u093f\u0928\u094d\u0926\u0940"},{name:"Google \u65e5\u672c\u8a9e"},{name:"Google \u666e\u901a\u8bdd\uff08\u4e2d\u56fd\u5927\u9646\uff09"},{name:"Google \u7ca4\u8a9e\uff08\u9999\u6e2f\uff09"},{name:"zh-HK",
rate:.25},{name:"Fallback Chinese (Hong Kong) Female",lang:"zh-HK",fallbackvoice:!0,service:"g1"},{name:"Google \u7ca4\u8a9e\uff08\u9999\u6e2f\uff09"},{name:"zh-TW",rate:.25},{name:"Fallback Chinese (Taiwan) Female",lang:"zh-TW",fallbackvoice:!0,service:"g1"}];a.iOS=/(iPad|iPhone|iPod)/g.test(navigator.userAgent);a.iOS9=/(iphone|ipod|ipad).* os 9_/.test(navigator.userAgent.toLowerCase())||/(iphone|ipod|ipad).* os 10_/.test(navigator.userAgent.toLowerCase());a.is_chrome=-1<navigator.userAgent.indexOf("Chrome");
a.is_safari=-1<navigator.userAgent.indexOf("Safari");a.is_chrome&&a.is_safari&&(a.is_safari=!1);a.is_opera=!!window.opera||0<=navigator.userAgent.indexOf(" OPR/");a.is_android=-1<navigator.userAgent.toLowerCase().indexOf("android");a.iOS_initialized=!1;a.iOS9_initialized=!1;a.cache_ios_voices=[{name:"he-IL",voiceURI:"he-IL",lang:"he-IL"},{name:"th-TH",voiceURI:"th-TH",lang:"th-TH"},{name:"pt-BR",voiceURI:"pt-BR",lang:"pt-BR"},{name:"sk-SK",voiceURI:"sk-SK",lang:"sk-SK"},{name:"fr-CA",voiceURI:"fr-CA",
lang:"fr-CA"},{name:"ro-RO",voiceURI:"ro-RO",lang:"ro-RO"},{name:"no-NO",voiceURI:"no-NO",lang:"no-NO"},{name:"fi-FI",voiceURI:"fi-FI",lang:"fi-FI"},{name:"pl-PL",voiceURI:"pl-PL",lang:"pl-PL"},{name:"de-DE",voiceURI:"de-DE",lang:"de-DE"},{name:"nl-NL",voiceURI:"nl-NL",lang:"nl-NL"},{name:"id-ID",voiceURI:"id-ID",lang:"id-ID"},{name:"tr-TR",voiceURI:"tr-TR",lang:"tr-TR"},{name:"it-IT",voiceURI:"it-IT",lang:"it-IT"},{name:"pt-PT",voiceURI:"pt-PT",lang:"pt-PT"},{name:"fr-FR",voiceURI:"fr-FR",lang:"fr-FR"},
{name:"ru-RU",voiceURI:"ru-RU",lang:"ru-RU"},{name:"es-MX",voiceURI:"es-MX",lang:"es-MX"},{name:"zh-HK",voiceURI:"zh-HK",lang:"zh-HK"},{name:"sv-SE",voiceURI:"sv-SE",lang:"sv-SE"},{name:"hu-HU",voiceURI:"hu-HU",lang:"hu-HU"},{name:"zh-TW",voiceURI:"zh-TW",lang:"zh-TW"},{name:"es-ES",voiceURI:"es-ES",lang:"es-ES"},{name:"zh-CN",voiceURI:"zh-CN",lang:"zh-CN"},{name:"nl-BE",voiceURI:"nl-BE",lang:"nl-BE"},{name:"en-GB",voiceURI:"en-GB",lang:"en-GB"},{name:"ar-SA",voiceURI:"ar-SA",lang:"ar-SA"},{name:"ko-KR",
voiceURI:"ko-KR",lang:"ko-KR"},{name:"cs-CZ",voiceURI:"cs-CZ",lang:"cs-CZ"},{name:"en-ZA",voiceURI:"en-ZA",lang:"en-ZA"},{name:"en-AU",voiceURI:"en-AU",lang:"en-AU"},{name:"da-DK",voiceURI:"da-DK",lang:"da-DK"},{name:"en-US",voiceURI:"en-US",lang:"en-US"},{name:"en-IE",voiceURI:"en-IE",lang:"en-IE"},{name:"hi-IN",voiceURI:"hi-IN",lang:"hi-IN"},{name:"el-GR",voiceURI:"el-GR",lang:"el-GR"},{name:"ja-JP",voiceURI:"ja-JP",lang:"ja-JP"}];a.cache_ios9_voices=[{name:"Maged",voiceURI:"com.apple.ttsbundle.Maged-compact",
lang:"ar-SA",localService:!0,"default":!0},{name:"Zuzana",voiceURI:"com.apple.ttsbundle.Zuzana-compact",lang:"cs-CZ",localService:!0,"default":!0},{name:"Sara",voiceURI:"com.apple.ttsbundle.Sara-compact",lang:"da-DK",localService:!0,"default":!0},{name:"Anna",voiceURI:"com.apple.ttsbundle.Anna-compact",lang:"de-DE",localService:!0,"default":!0},{name:"Melina",voiceURI:"com.apple.ttsbundle.Melina-compact",lang:"el-GR",localService:!0,"default":!0},{name:"Karen",voiceURI:"com.apple.ttsbundle.Karen-compact",
lang:"en-AU",localService:!0,"default":!0},{name:"Daniel",voiceURI:"com.apple.ttsbundle.Daniel-compact",lang:"en-GB",localService:!0,"default":!0},{name:"Moira",voiceURI:"com.apple.ttsbundle.Moira-compact",lang:"en-IE",localService:!0,"default":!0},{name:"Samantha (Enhanced)",voiceURI:"com.apple.ttsbundle.Samantha-premium",lang:"en-US",localService:!0,"default":!0},{name:"Samantha",voiceURI:"com.apple.ttsbundle.Samantha-compact",lang:"en-US",localService:!0,"default":!0},{name:"Tessa",voiceURI:"com.apple.ttsbundle.Tessa-compact",
lang:"en-ZA",localService:!0,"default":!0},{name:"Monica",voiceURI:"com.apple.ttsbundle.Monica-compact",lang:"es-ES",localService:!0,"default":!0},{name:"Paulina",voiceURI:"com.apple.ttsbundle.Paulina-compact",lang:"es-MX",localService:!0,"default":!0},{name:"Satu",voiceURI:"com.apple.ttsbundle.Satu-compact",lang:"fi-FI",localService:!0,"default":!0},{name:"Amelie",voiceURI:"com.apple.ttsbundle.Amelie-compact",lang:"fr-CA",localService:!0,"default":!0},{name:"Thomas",voiceURI:"com.apple.ttsbundle.Thomas-compact",
lang:"fr-FR",localService:!0,"default":!0},{name:"Carmit",voiceURI:"com.apple.ttsbundle.Carmit-compact",lang:"he-IL",localService:!0,"default":!0},{name:"Lekha",voiceURI:"com.apple.ttsbundle.Lekha-compact",lang:"hi-IN",localService:!0,"default":!0},{name:"Mariska",voiceURI:"com.apple.ttsbundle.Mariska-compact",lang:"hu-HU",localService:!0,"default":!0},{name:"Damayanti",voiceURI:"com.apple.ttsbundle.Damayanti-compact",lang:"id-ID",localService:!0,"default":!0},{name:"Alice",voiceURI:"com.apple.ttsbundle.Alice-compact",
lang:"it-IT",localService:!0,"default":!0},{name:"Kyoko",voiceURI:"com.apple.ttsbundle.Kyoko-compact",lang:"ja-JP",localService:!0,"default":!0},{name:"Yuna",voiceURI:"com.apple.ttsbundle.Yuna-compact",lang:"ko-KR",localService:!0,"default":!0},{name:"Ellen",voiceURI:"com.apple.ttsbundle.Ellen-compact",lang:"nl-BE",localService:!0,"default":!0},{name:"Xander",voiceURI:"com.apple.ttsbundle.Xander-compact",lang:"nl-NL",localService:!0,"default":!0},{name:"Nora",voiceURI:"com.apple.ttsbundle.Nora-compact",
lang:"no-NO",localService:!0,"default":!0},{name:"Zosia",voiceURI:"com.apple.ttsbundle.Zosia-compact",lang:"pl-PL",localService:!0,"default":!0},{name:"Luciana",voiceURI:"com.apple.ttsbundle.Luciana-compact",lang:"pt-BR",localService:!0,"default":!0},{name:"Joana",voiceURI:"com.apple.ttsbundle.Joana-compact",lang:"pt-PT",localService:!0,"default":!0},{name:"Ioana",voiceURI:"com.apple.ttsbundle.Ioana-compact",lang:"ro-RO",localService:!0,"default":!0},{name:"Milena",voiceURI:"com.apple.ttsbundle.Milena-compact",
lang:"ru-RU",localService:!0,"default":!0},{name:"Laura",voiceURI:"com.apple.ttsbundle.Laura-compact",lang:"sk-SK",localService:!0,"default":!0},{name:"Alva",voiceURI:"com.apple.ttsbundle.Alva-compact",lang:"sv-SE",localService:!0,"default":!0},{name:"Kanya",voiceURI:"com.apple.ttsbundle.Kanya-compact",lang:"th-TH",localService:!0,"default":!0},{name:"Yelda",voiceURI:"com.apple.ttsbundle.Yelda-compact",lang:"tr-TR",localService:!0,"default":!0},{name:"Ting-Ting",voiceURI:"com.apple.ttsbundle.Ting-Ting-compact",
lang:"zh-CN",localService:!0,"default":!0},{name:"Sin-Ji",voiceURI:"com.apple.ttsbundle.Sin-Ji-compact",lang:"zh-HK",localService:!0,"default":!0},{name:"Mei-Jia",voiceURI:"com.apple.ttsbundle.Mei-Jia-compact",lang:"zh-TW",localService:!0,"default":!0}];a.systemvoices=null;a.CHARACTER_LIMIT=100;a.VOICESUPPORT_ATTEMPTLIMIT=5;a.voicesupport_attempts=0;a.fallbackMode=!1;a.WORDS_PER_MINUTE=130;a.fallback_parts=null;a.fallback_part_index=0;a.fallback_audio=null;a.fallback_playbackrate=1;a.def_fallback_playbackrate=
a.fallback_playbackrate;a.fallback_audiopool=[];a.msgparameters=null;a.timeoutId=null;a.OnLoad_callbacks=[];a.useTimer=!1;a.utterances=[];a.tstCompiled=function(a){return eval("typeof xy === 'undefined'")};a.fallbackServicePath="https://code.responsivevoice.org/"+(a.tstCompiled()?"":"develop/")+"getvoice.php";a.default_rv=a.responsivevoices[0];a.debug=!1;a.log=function(b){a.debug&&console.log(b)};a.init=function(){a.is_android&&(a.useTimer=!0);a.is_opera||"undefined"===typeof speechSynthesis?(console.log("RV: Voice synthesis not supported"),
a.enableFallbackMode()):setTimeout(function(){var b=setInterval(function(){var c=window.speechSynthesis.getVoices();0!=c.length||null!=a.systemvoices&&0!=a.systemvoices.length?(console.log("RV: Voice support ready"),a.systemVoicesReady(c),clearInterval(b)):(console.log("Voice support NOT ready"),a.voicesupport_attempts++,a.voicesupport_attempts>a.VOICESUPPORT_ATTEMPTLIMIT&&(clearInterval(b),null!=window.speechSynthesis?a.iOS?(a.iOS9?a.systemVoicesReady(a.cache_ios9_voices):a.systemVoicesReady(a.cache_ios_voices),
console.log("RV: Voice support ready (cached)")):(console.log("RV: speechSynthesis present but no system voices found"),a.enableFallbackMode()):a.enableFallbackMode()))},100)},100);a.Dispatch("OnLoad")};a.systemVoicesReady=function(b){a.systemvoices=b;a.mapRVs();null!=a.OnVoiceReady&&a.OnVoiceReady.call();a.Dispatch("OnReady");window.hasOwnProperty("dispatchEvent")&&window.dispatchEvent(new Event("ResponsiveVoice_OnReady"))};a.enableFallbackMode=function(){a.fallbackMode=!0;console.log("RV: Enabling fallback mode");
a.mapRVs();null!=a.OnVoiceReady&&a.OnVoiceReady.call();a.Dispatch("OnReady");window.hasOwnProperty("dispatchEvent")&&window.dispatchEvent(new Event("ResponsiveVoice_OnReady"))};a.getVoices=function(){for(var b=[],c=0;c<a.responsivevoices.length;c++)b.push({name:a.responsivevoices[c].name});return b};a.speak=function(b,c,e){if(a.iOS9&&!a.iOS9_initialized)a.log("Initializing ios9"),setTimeout(function(){a.speak(b,c,e)},100),a.clickEvent(),a.iOS9_initialized=!0;else{a.isPlaying()&&(a.log("Cancelling previous speech"),
a.cancel());a.fallbackMode&&0<a.fallback_audiopool.length&&a.clearFallbackPool();b=b.replace(/[\"\`]/gm,"'");a.msgparameters=e||{};a.msgtext=b;a.msgvoicename=c;a.onstartFired=!1;var h=[];if(b.length>a.CHARACTER_LIMIT){for(var f=b;f.length>a.CHARACTER_LIMIT;){var g=f.search(/[:!?.;]+/),d="";if(-1==g||g>=a.CHARACTER_LIMIT)g=f.search(/[,]+/);-1==g&&-1==f.search(" ")&&(g=99);if(-1==g||g>=a.CHARACTER_LIMIT)for(var k=f.split(" "),g=0;g<k.length&&!(d.length+k[g].length+1>a.CHARACTER_LIMIT);g++)d+=(0!=g?
" ":"")+k[g];else d=f.substr(0,g+1);f=f.substr(d.length,f.length-d.length);h.push(d)}0<f.length&&h.push(f)}else h.push(b);a.multipartText=h;g=null==c?a.default_rv:a.getResponsiveVoice(c);!0===g.deprecated&&console.warn("ResponsiveVoice: Voice "+g.name+" is deprecated and will be removed in future releases");f={};if(null!=g.mappedProfile)f=g.mappedProfile;else if(f.systemvoice=a.getMatchedVoice(g),f.collectionvoice={},null==f.systemvoice){console.log("RV: ERROR: No voice found for: "+c);return}a.msgprofile=
f;a.utterances=[];for(g=0;g<h.length;g++)if(a.fallbackMode){a.fallback_playbackrate=a.def_fallback_playbackrate;var d=a.selectBest([f.collectionvoice.pitch,f.systemvoice.pitch,1]),k=a.selectBest([a.iOS9?1:null,f.collectionvoice.rate,f.systemvoice.rate,1]),l=a.selectBest([f.collectionvoice.volume,f.systemvoice.volume,1]),m;null!=e&&(d*=null!=e.pitch?e.pitch:1,k*=null!=e.rate?e.rate:1,l*=null!=e.volume?e.volume:1,m=e.extraParams||null);d/=2;k/=2;l*=2;d=Math.min(Math.max(d,0),1);k=Math.min(Math.max(k,
0),1);l=Math.min(Math.max(l,0),1);d=a.fallbackServicePath+"?t="+encodeURIComponent(h[g])+"&tl="+(f.collectionvoice.lang||f.systemvoice.lang||"en-US")+"&sv="+(f.collectionvoice.service||f.systemvoice.service||"")+"&vn="+(f.collectionvoice.voicename||f.systemvoice.voicename||"")+"&pitch="+d.toString()+"&rate="+k.toString()+"&vol="+l.toString();m&&(d+="&extraParams="+JSON.stringify(m));k=document.createElement("AUDIO");k.src=d;k.playbackRate=a.fallback_playbackrate;k.preload="auto";k.load();a.fallback_parts.push(k)}else a.log("Using SpeechSynthesis"),
d=new SpeechSynthesisUtterance,d.voiceURI=f.systemvoice.voiceURI,d.volume=a.selectBest([f.collectionvoice.volume,f.systemvoice.volume,1]),d.rate=a.selectBest([a.iOS9?1:null,f.collectionvoice.rate,f.systemvoice.rate,1]),d.pitch=a.selectBest([f.collectionvoice.pitch,f.systemvoice.pitch,1]),d.text=h[g],d.lang=a.selectBest([f.collectionvoice.lang,f.systemvoice.lang]),d.rvIndex=g,d.rvTotal=h.length,0==g&&(d.onstart=a.speech_onstart),a.msgparameters.onendcalled=!1,null!=e?(d.voice="undefined"!==typeof e.voice?
e.voice:f.systemvoice,g<h.length-1&&1<h.length?(d.onend=a.onPartEnd,d.hasOwnProperty("addEventListener")&&d.addEventListener("end",a.onPartEnd)):(d.onend=a.speech_onend,d.hasOwnProperty("addEventListener")&&d.addEventListener("end",a.speech_onend)),d.onerror=e.onerror||function(b){a.log("RV: Unknow Error");a.log(b)},d.onpause=e.onpause,d.onresume=e.onresume,d.onmark=e.onmark,d.onboundary=e.onboundary||a.onboundary,d.pitch=null!=e.pitch?e.pitch:d.pitch,d.rate=a.iOS?(null!=e.rate?e.rate*e.rate:1)*d.rate:
(null!=e.rate?e.rate:1)*d.rate,d.volume=null!=e.volume?e.volume:d.volume):(a.log("No Params received for current Utterance"),d.voice=f.systemvoice,d.onend=a.speech_onend,d.onboundary=a.onboundary,d.onerror=function(b){a.log("RV: Unknow Error");a.log(b)}),a.utterances.push(d),0==g&&(a.currentMsg=d),console.log(d),a.tts_speak(d);a.fallbackMode&&(a.fallback_part_index=0,a.fallback_startPart())}};a.startTimeout=function(b,c){var e=a.msgprofile.collectionvoice.timerSpeed;null==a.msgprofile.collectionvoice.timerSpeed&&
(e=1);0>=e||(a.timeoutId=setTimeout(c,a.getEstimatedTimeLength(b,e)),a.log("Timeout ID: "+a.timeoutId))};a.checkAndCancelTimeout=function(){null!=a.timeoutId&&(clearTimeout(a.timeoutId),a.timeoutId=null)};a.speech_timedout=function(){a.cancel();a.cancelled=!1;a.speech_onend()};a.speech_onend=function(){a.checkAndCancelTimeout();!0===a.cancelled?a.cancelled=!1:(a.log("on end fired"),null!=a.msgparameters&&null!=a.msgparameters.onend&&1!=a.msgparameters.onendcalled&&(a.log("Speech on end called  -"+
a.msgtext),a.msgparameters.onendcalled=!0,a.msgparameters.onend()))};a.speech_onstart=function(){if(!a.onstartFired){a.onstartFired=!0;a.log("Speech start");if(a.iOS||a.is_safari||a.useTimer)a.fallbackMode||a.startTimeout(a.msgtext,a.speech_timedout);a.msgparameters.onendcalled=!1;if(null!=a.msgparameters&&null!=a.msgparameters.onstart)a.msgparameters.onstart()}};a.fallback_startPart=function(){0==a.fallback_part_index&&a.speech_onstart();a.fallback_audio=a.fallback_parts[a.fallback_part_index];if(null==
a.fallback_audio)a.log("RV: Fallback Audio is not available");else{var b=a.fallback_audio;a.fallback_audiopool.push(b);setTimeout(function(){b.playbackRate=a.fallback_playbackrate},50);b.onloadedmetadata=function(){b.play();b.playbackRate=a.fallback_playbackrate};a.fallback_errors&&(a.log("RV: Speech cancelled due to errors"),a.speech_onend());a.fallback_audio.play();a.fallback_audio.addEventListener("ended",a.fallback_finishPart);a.useTimer&&a.startTimeout(a.multipartText[a.fallback_part_index],
a.fallback_finishPart)}};a.isFallbackAudioPlaying=function(){var b;for(b=0;b<a.fallback_audiopool.length;b++)if(!a.fallback_audiopool[b].paused)return!0;return!1};a.fallback_finishPart=function(b){a.isFallbackAudioPlaying()?(a.checkAndCancelTimeout(),a.timeoutId=setTimeout(a.fallback_finishPart,1E3*(a.fallback_audio.duration-a.fallback_audio.currentTime))):(a.checkAndCancelTimeout(),a.fallback_part_index<a.fallback_parts.length-1?(a.fallback_part_index++,a.fallback_startPart()):a.speech_onend())};
a.cancel=function(){a.checkAndCancelTimeout();a.fallbackMode?(null!=a.fallback_audio&&a.fallback_audio.pause(),a.clearFallbackPool()):(a.cancelled=!0,speechSynthesis.cancel())};a.voiceSupport=function(){return"speechSynthesis"in window};a.OnFinishedPlaying=function(b){if(null!=a.msgparameters&&null!=a.msgparameters.onend)a.msgparameters.onend()};a.setDefaultVoice=function(b){b=a.getResponsiveVoice(b);null!=b&&(a.default_rv=b)};a.mapRVs=function(){for(var b=0;b<a.responsivevoices.length;b++)for(var c=
a.responsivevoices[b],e=0;e<c.voiceIDs.length;e++){var h=a.voicecollection[c.voiceIDs[e]];if(1!=h.fallbackvoice){var f=a.getSystemVoice(h.name);if(null!=f){c.mappedProfile={systemvoice:f,collectionvoice:h};break}}else{c.mappedProfile={systemvoice:{},collectionvoice:h};break}}};a.getMatchedVoice=function(b){for(var c=0;c<b.voiceIDs.length;c++){var e=a.getSystemVoice(a.voicecollection[b.voiceIDs[c]].name);if(null!=e)return e}return null};a.getSystemVoice=function(b){var c=String.fromCharCode(160);b=
b.replace(new RegExp("\\s+|"+c,"g"),"");if("undefined"===typeof a.systemvoices||null===a.systemvoices)return null;for(var e=0;e<a.systemvoices.length;e++)if(0===a.systemvoices[e].name.replace(new RegExp("\\s+|"+c,"g"),"").localeCompare(b))return a.systemvoices[e];return null};a.getResponsiveVoice=function(b){for(var c=0;c<a.responsivevoices.length;c++)if(a.responsivevoices[c].name==b)return!0===a.responsivevoices[c].mappedProfile.collectionvoice.fallbackvoice||!0===a.fallbackMode?(a.fallbackMode=
!0,a.fallback_parts=[]):a.fallbackMode=!1,a.responsivevoices[c];return null};a.Dispatch=function(b){if(a.hasOwnProperty(b+"_callbacks")&&null!=a[b+"_callbacks"]&&0<a[b+"_callbacks"].length){for(var c=a[b+"_callbacks"],e=0;e<c.length;e++)c[e]();return!0}var h=b+"_callbacks_timeout",f=b+"_callbacks_timeoutCount";a.hasOwnProperty(h)||(a[f]=10,a[h]=setInterval(function(){--a[f];(a.Dispatch(b)||0>a[f])&&clearTimeout(a[h])},50));return!1};a.AddEventListener=function(b,c){a.hasOwnProperty(b+"_callbacks")||
(a[b+"_callbacks"]=[]);a[b+"_callbacks"].push(c)};a.addEventListener=a.AddEventListener;a.clickEvent=function(){if(a.iOS&&!a.iOS_initialized){a.log("Initializing iOS click event");var b=new SpeechSynthesisUtterance(" ");speechSynthesis.speak(b);a.iOS_initialized=!0}};a.isPlaying=function(){return a.fallbackMode?null!=a.fallback_audio&&!a.fallback_audio.ended&&!a.fallback_audio.paused:speechSynthesis.speaking};a.clearFallbackPool=function(){for(var b=0;b<a.fallback_audiopool.length;b++)null!=a.fallback_audiopool[b]&&
(a.fallback_audiopool[b].pause(),a.fallback_audiopool[b].src="");a.fallback_audiopool=[]};"complete"===document.readyState?a.init():document.addEventListener("DOMContentLoaded",function(){a.init()});a.selectBest=function(a){for(var b=0;b<a.length;b++)if(null!=a[b])return a[b];return null};a.pause=function(){a.fallbackMode?null!=a.fallback_audio&&a.fallback_audio.pause():speechSynthesis.pause()};a.resume=function(){a.fallbackMode?null!=a.fallback_audio&&a.fallback_audio.play():speechSynthesis.resume()};
a.tts_speak=function(b){setTimeout(function(){a.cancelled=!1;speechSynthesis.speak(b)},.01)};a.setVolume=function(b){if(a.isPlaying())if(a.fallbackMode){for(var c=0;c<a.fallback_parts.length;c++)a.fallback_parts[c].volume=b;for(c=0;c<a.fallback_audiopool.length;c++)a.fallback_audiopool[c].volume=b;a.fallback_audio.volume=b}else for(c=0;c<a.utterances.length;c++)a.utterances[c].volume=b};a.onPartEnd=function(b){if(null!=a.msgparameters&&null!=a.msgparameters.onchuckend)a.msgparameters.onchuckend();
a.Dispatch("OnPartEnd");b=a.utterances.indexOf(b.utterance);a.currentMsg=a.utterances[b+1]};a.onboundary=function(b){a.log("On Boundary");a.iOS&&!a.onstartFired&&a.speech_onstart()};a.numToWords=function(b){function c(a){if(Array.isArray(a)){for(var b=0,c=Array(a.length);b<a.length;b++)c[b]=a[b];return c}return Array.from(a)}var e=function(){return function(a,b){if(Array.isArray(a))return a;if(Symbol.iterator in Object(a)){var c=[],d=!0,e=!1,f=void 0;try{for(var g=a[Symbol.iterator](),h;!(d=(h=g.next()).done)&&
(c.push(h.value),!b||c.length!==b);d=!0);}catch(r){e=!0,f=r}finally{try{if(!d&&g["return"])g["return"]()}finally{if(e)throw f;}}return c}throw new TypeError("Invalid attempt to destructure non-iterable instance");}}(),h=function(a){return 0===a.length},f=function(a){return function(b){return b.slice(0,a)}},g=function(a){return function(b){return b.slice(a)}},d=function(a){return a.slice(0).reverse()},k=function(a){return function(b){return function(c){return a(b(c))}}},l=function(a){return!a},m=function q(a){return function(b){return h(b)?
[]:[f(a)(b)].concat(c(q(a)(g(a)(b))))}},n=" one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" "),p="  twenty thirty forty fifty sixty seventy eighty ninety".split(" "),t=" thousand million billion trillion quadrillion quintillion sextillion septillion octillion nonillion".split(" "),u=function(a){var b=e(a,3);a=b[0];var c=b[1],b=b[2];return[0===(Number(b)||0)?"":n[b]+" hundred ",0===(Number(a)||0)?p[c]:p[c]&&p[c]+
"-"||"",n[c+a]||n[a]].join("")},v=function(a,b){return""===a?a:a+" "+t[b]};return"number"===typeof b?a.numToWords(String(b)):"0"===b?"zero":k(m(3))(d)(Array.from(b)).map(u).map(v).filter(k(l)(h)).reverse().join(" ").trim()};a.getWords=function(b){for(var c=b.split(/\s+/),e=0;e<c.length;e++)null!=(b=c[e].toString().match(/\d+/))&&(c.splice(e,1),a.numToWords(+b[0]).split(/\s+/).map(function(a){c.push(a)}));return c};a.getEstimatedTimeLength=function(b,c){var e=a.getWords(b),h=0,f=a.fallbackMode?1300:
700;c=c||1;e.map(function(a,b){h+=(a.toString().match(/[^ ]/igm)||a).length});var g=e.length,d=60/a.WORDS_PER_MINUTE*c*1E3*g;5>g&&(d=c*(f+50*h));a.log("Estimated time length: "+d+" ms, words: ["+e+"], charsCount: "+h);return d}},responsiveVoice=new ResponsiveVoice;

module.exports = responsiveVoice;
},{}],50:[function(require,module,exports){
var Rollbar = require("rollbar");

var rollbarConfig = {
    accessToken: "d2c7ea5208bf4b5b8df4c6f4ccc61fb6",
    captureUncaught: true,
    payload: {
        environment: "development",
        client: {
            javascript: {
                source_map_enabled: true,
                code_version: "1e9575b8465b12f5243f2a24f718d072d7d4cb0d",
                // Optionally have Rollbar guess which frames the error was thrown from
                // when the browser does not provide line and column numbers.
                guess_uncaught_frames: true
            }
        }
    }
};

var rollbar = new Rollbar(rollbarConfig);

module.exports = rollbar;
},{"rollbar":43}],51:[function(require,module,exports){
var Hammer = require('hammerjs');

// From https://blog.madewithenvy.com/build-your-own-touch-slider-with-hammerjs-af99665d2869

// 1. Basic object for our stuff
function Slider(selector, opts) {
    this.sliderPanelSelector = '.slider-panel';
    this.sensitivity = 25 // horizontal % needed to trigger swipe

    // 2. Placeholder to remember which slide we�re on
    this.activeSlide = 0;

    // 3. Slide counter
    this.slideCount = 0;
    
    this.onGoTo = opts.onGoTo;
    this.onPanStart = opts.onPanStart;
    
    this.init(selector);
}

// 4. Initialization + event listener
Slider.prototype.init = function(selector) {

    // 4a. Find the container
    this.sliderEl = document.querySelector(selector);

    // 4b. Count stuff
    this.slideCount = this.sliderEl.querySelectorAll(this.sliderPanelSelector).length;

    // 4c. Set up HammerJS
    var sliderManager = new Hammer.Manager(this.sliderEl);
    var pan = new Hammer.Pan({
        threshold: 5,
        pointers: 0
    })
    sliderManager.add(pan);
    var tap = new Hammer.Tap({
        interval: 0
    })
    sliderManager.add(tap);
    
    pan.requireFailure(tap);
    
    var self = this;
    
    // Tap triggers a next slide change
    sliderManager.on('tap', function(e) {
        self.next();
    });
    
    sliderManager.on('panstart', function(e) {
        if (self.onPanStart) self.onPanStart();
    });
    
    sliderManager.on('pan', function(e) {
        
        // 4d. Calculate pixel movements into 1:1 screen percents so gestures track with motion
        var percentage = 100 / self.slideCount * e.deltaX / window.innerWidth;

        // 4e. Multiply percent by # of slide we�re on
        var percentageCalculated = percentage - 100 / self.slideCount * self.activeSlide;

        // 4f. Apply transformation
        self.sliderEl.style.transform = 'translateX( ' + percentageCalculated + '% )';

        // 4g. Snap to slide when done
        if (e.isFinal) {
            if (e.velocityX > 1) {
                self.goTo(self.activeSlide - 1);
            } else if (e.velocityX < -1) {
                self.goTo(self.activeSlide + 1)
            } else {
                if (percentage <= -(self.sensitivity / self.slideCount))
                    self.goTo(self.activeSlide + 1);
                else if (percentage >= (self.sensitivity / self.slideCount))
                    self.goTo(self.activeSlide - 1);
                else
                    self.goTo(self.activeSlide);
            }
        }
    });
    
    // Start slider in the middle, suppress change event
    this.goTo(1, true);
};

Slider.prototype.next = function() {
    this.goTo(this.activeSlide + 1);
}

// 5. Update current slide
Slider.prototype.goTo = function(number, bSuppressChangeEvent) {
    var bChanged = this.activeSlide !== number;
    
    // 5a. Stop it from doing weird things like moving to slides that don�t exist
    if (number < 0) {
        this.activeSlide = 0;
    }
    else if (number > this.slideCount - 1) {
        this.activeSlide = this.slideCount - 1;
    }
    else {
        this.activeSlide = number;
    }
    // 5b. Apply transformation & smoothly animate via .is-animating CSS
    this.sliderEl.classList.add('is-animating');
    var percentage = -(100 / this.slideCount) * this.activeSlide;
    this.sliderEl.style.transform = 'translateX( ' + percentage + '% )';
    clearTimeout(this.timer);
    
    var self = this;
    this.timer = setTimeout(function() {
        self.sliderEl.classList.remove('is-animating');
    
        // 6. Rearrange slides
        // 6a. If on last slide, move first slide to end
        if (self.activeSlide == self.slideCount - 1) {
            var slides = self.sliderEl.querySelectorAll(self.sliderPanelSelector);
            self.sliderEl.appendChild(slides[0])
            self.activeSlide--;
            var percentage = -(100 / self.slideCount) * self.activeSlide;
            self.sliderEl.style.transform = 'translateX( ' + percentage + '% )';
        }
        // 6b. If on first slide, move last slide to front
        if (self.activeSlide == 0) {
            var slides = self.sliderEl.querySelectorAll(self.sliderPanelSelector);
            self.sliderEl.insertBefore(slides[slides.length - 1], slides[0])
            self.activeSlide++;
            var percentage = -(100 / self.slideCount) * self.activeSlide;
            self.sliderEl.style.transform = 'translateX( ' + percentage + '% )';
        }
    }, 400);
    
    // Slide change callback
    if (this.onGoTo && !bSuppressChangeEvent) this.onGoTo(bChanged);
};

module.exports = Slider;
},{"hammerjs":32}]},{},[45])(45)
});
//# sourceMappingURL=bundle.js.map
