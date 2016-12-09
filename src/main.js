var $ = require('jquery');
var ko = require('knockout');
var HeroCalc = require('dota-hero-calculator-library');
var BitArray = require('bit-array-js');
var URI = require('urijs');
var Slider = require('./slider');

require('./ko.bindingHandlers.checkbox');
require('./ko.bindingHandlers.radio');
require('./ko.extenders.urlSync');

$(function () {

    HeroCalc.init("/media/js/herodata.json","/media/js/itemdata.json","/media/js/unitdata.json", function () {
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
            return HeroCalc.Data.heroData['npc_dota_hero_' + hero].HeroID;
        }

        var heroData = HeroCalc.Data.heroData;
        var heroIds = HeroCalc.HeroOptions.map(function (hero) { return hero.heroName });
        var heroModel = new HeroCalc.HeroModel('abaddon');
        
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
            this.heroes = HeroCalc.HeroOptions.sort(function (a, b) {
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
                        
                        /*if (this.isWrong()) {
                            this.card.wrong++;
                        }
                        else {
                            this.card.correct++;
                        }*/
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
    });
});