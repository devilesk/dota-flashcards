var $ = require('jquery');
var ko = require('knockout');
var HeroCalc = require('dota-hero-calculator-library');
require('./ko.extenders.numeric');
require('./ko.bindingHandlers.checkbox');
var BitArray = require('bit-array-js');
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
            {id: "healthregen", name: "HP Regen"},
            {id: "manaregen", name: "Mana Regen"},
            {id: "totalMovementSpeed", name: "Movement Speed"},
            {id: "totalTurnRate", name: "Turn Rate"},
            {id: "baseDamageMin", name: "Attack Damage Min"},
            {id: "baseDamageMax", name: "Attack Damage Max"},
            {id: "baseDamageAvg", name: "Attack Damage Avg"},
            {id: "ehpPhysical", name: "EHP"},
            {id: "ehpMagical", name: "Magical EHP"},
            {id: "primaryAttribute", name: "Primary Attr"},
            {id: "projectilespeed", name: "Missile Speed"},
            {id: "attributeagilitygain", name: "Agi Gain"},
            {id: "attributestrengthgain", name: "Str Gain"},
            {id: "attributeintelligencegain", name: "Int Gain"},
            {id: "attributebaseagility", name: "Base Agi"},
            {id: "attributebaseintelligence", name: "Base Int"},
            {id: "attributebasestrength", name: "Base Str"},
            {id: "visionrangeday", name: "Day Vision Range"},
            {id: "visionrangenight", name: "Night Vision Range"},
        ];
        
        var query_string = (function(a) {
            if (a == "") return {};
            var b = {};
            for (var i = 0; i < a.length; ++i)
            {
                var p=a[i].split('=', 2);
                if (p.length == 1)
                    b[p[0]] = "";
                else
                    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
            return b;
        })(window.location.search.substr(1).split('&'));
        
        // Explicitly save/update a url parameter using HTML5's replaceState().
        function updateQueryStringParam(key, value) {
            baseUrl = [location.protocol, '//', location.host, location.pathname].join('');
            urlQueryString = document.location.search;
            var newParam = key + '=' + value,
                params = '?' + newParam;

            // If the "search" string exists, then build params from it
            if (urlQueryString) {
                keyRegex = new RegExp('([\?&])' + key + '[^&]*');
                // If param exists already, update it
                if (urlQueryString.match(keyRegex) !== null) {
                    params = urlQueryString.replace(keyRegex, "$1" + newParam);
                } else { // Otherwise, add it to end of query string
                    params = urlQueryString + '&' + newParam;
                }
            }
            window.history.replaceState({}, "", baseUrl + params);
        }
        
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
        
        var attributes = attributeOptions.map(function (a) { return a.id; });
        
        function getHeroID(hero) {
            return HeroCalc.Data.heroData['npc_dota_hero_' + hero].HeroID;
        }

        function ViewModel() {
            var self = this;
            this.attributes = ko.observableArray(attributeOptions);
            this.heroes = HeroCalc.HeroOptions;

            this.selectedAttributesBitArray = new BitArray(32);
            this.selectedAttributesBitArray.fromBase64UrlSafe(query_string['attributes']);
            this.selectedAttributes = ko.observableArray(self.attributes().map(function(a) {
                return a.id;
            }).filter(function(h, i) {
                return self.selectedAttributesBitArray.value(i);
            }));
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
                        updateQueryStringParam("attributes", self.selectedAttributesBitArray.toBase64UrlSafe());
                    }
                });
            }, null, "arrayChange");

            this.selectedHeroesBitArray = new BitArray(128);
            this.selectedHeroesBitArray.fromBase64UrlSafe(query_string['heroes']);
            this.selectedHeroes = ko.observableArray(
                this.heroes.map(function (o) { return o.heroName; }).filter(function (h) { return self.selectedHeroesBitArray.value(getHeroID(h)); })
            );
            this.selectedHeroes.subscribe(function(changes) {
                changes.forEach(function(change) {
                    if (change.status === 'added' || change.status === 'deleted') {
                        self.selectedHeroesBitArray.value(getHeroID(change.value), change.status === 'added');
                        updateQueryStringParam("heroes", self.selectedHeroesBitArray.toBase64UrlSafe());

                        self.remainingHeroes(shuffle(self.selectedHeroes().slice(0)));
                    }
                });
            }, null, "arrayChange");

            this.state = ko.observable(0);
            this.currentAttribute = ko.observable(null);
            this.currentHero = ko.observable(null);
            this.text = ko.observable('<i>Tap to start</i>');
            this.remainingHeroes = ko.observableArray(shuffle(self.selectedHeroes().slice(0)));
            this.insertFront = ko.observable(false);
            this.questionStore = {};
            this.textToSpeech = ko.observable(query_string['tts'] == 1 ? true : false);
            this.textToSpeech.subscribe(function (newValue) {
                updateQueryStringParam("tts", newValue ? 1 : 0);
            });
            
            this.minLevel = ko.observable(parseInt(query_string['minLevel'])).extend({ numeric: {defaultValue: 1} });
            this.minLevel.subscribe(function (newValue) {
                updateQueryStringParam("minLevel", parseInt(self.minLevel()));
                if (parseInt(newValue) > parseInt(self.maxLevel())) {
                    self.maxLevel(self.minLevel()); 
                    updateQueryStringParam("maxLevel", parseInt(self.maxLevel()));
                }
            });
            this.maxLevel = ko.observable(parseInt(query_string['maxLevel'])).extend({ numeric: {defaultValue: 1} });
            this.maxLevel.subscribe(function (newValue) {
                updateQueryStringParam("maxLevel", parseInt(self.maxLevel()));
                if (parseInt(newValue) < parseInt(self.minLevel())) {
                    self.minLevel(self.maxLevel());
                    updateQueryStringParam("minLevel", parseInt(self.minLevel()));
                }
            });
            
            this.heroModel = new HeroCalc.HeroModel('abaddon');
            
            this.questionGenerator = {};
            this.questionGenerator.attributes = function (heroModel, hero, attributes, minLevel, maxLevel, abilityQuestionTypes) {
                var attribute = attributes[Math.floor(Math.random() * attributes.length)];
                var level = getRandomInt(minLevel, maxLevel);
                heroModel.heroId(hero);
                heroModel.selectedHeroLevel(level);
                var question = 'Level ' + level + ' ' + self.heroModel.heroData().displayname + '<br>' + attributeOptions.filter(function(a) {
                        return a.id == attribute;
                    })[0].name;
                var answer = getAttributeValue(heroModel, attribute);
                
                return { question: question, answer: answer };
            }
            
            this.questionGenerator.abilities = function (heroModel, hero, attributes, minLevel, maxLevel, abilityQuestionTypes) {
                var abilityQuestionType = abilityQuestionTypes[Math.floor(Math.random() * abilityQuestionTypes.length)];
                heroModel.heroId(hero);
                var ability;
                while (!ability) {
                    ability = heroModel.ability().abilities()[Math.floor(Math.random() * heroModel.ability().abilities().length)];
                    
                    if (ability.displayname === 'Attribute Bonus' || ability.displayname === '' || ability.displayname === 'Empty' ||
                        !ability.hasOwnProperty(abilityQuestionType) || ability[abilityQuestionType].length === 0) {
                        ability = null;
                        continue;
                    }
                    switch (abilityQuestionType) {
                        case 'attributes':
                            var abilityAttributes = ability.attributes.filter(function(a) {
                                return a.hasOwnProperty('tooltip');
                            });
                            if (abilityAttributes.length === 0) {
                                ability = null;
                                continue;
                            }
                            var abilityAttribute = abilityAttributes[Math.floor(Math.random() * abilityAttributes.length)];
                            //console.log(abilityAttribute);
                            var values = abilityAttribute.value;
                            var tooltip = abilityAttribute.tooltip;
                        break;
                        case 'cooldown':
                            var tooltip = 'Cooldown';
                            var values = ability[abilityQuestionType];
                        break;
                        case 'manacost':
                            var tooltip = 'Mana Cost';
                            var values = ability[abilityQuestionType];
                        break;
                    }
                }
                
                var maxAbilityLevel = heroModel.getAbilityLevelMax(ability);
                var abilityLevel = getRandomInt(1, maxAbilityLevel);
                if (abilityLevel > values.length) {
                    var value = values[0];
                }
                else {
                    var value = values[Math.max(0, abilityLevel - 1)];
                }
                
                var question = self.heroModel.heroData().displayname + '<br>' + ability.displayname + '<br>Level ' + abilityLevel + ' ' + tooltip;
                //console.log(question, values, value);
                return { question: question, answer: value };
            }
            //this.questionGenerator.abilities(this.heroModel, 'abaddon', [], 1, 1);
            
            this.createQuestion = function () {
                var questionType = self.questionTypes()[Math.floor(Math.random() * self.questionTypes().length)];
                //console.log('questionType', questionType, self.questionTypes());
                return this.questionGenerator[questionType](self.heroModel, self.currentHero(), self.selectedAttributes(), parseInt(self.minLevel()), parseInt(self.maxLevel()), self.abilityQuestionTypes());
            }
            
            this.getQuestion = function () {
                if (!self.currentAttribute()) return;
                //console.log(self.heroModel.selectedHeroLevel(), self.heroModel.heroData().displayname, self.currentAttribute());
                return 'Level ' + self.heroModel.selectedHeroLevel() + ' ' + self.heroModel.heroData().displayname + '<br>' + attributeOptions.filter(function(a) {
                        return a.id == self.currentAttribute();
                    })[0].name;
            }
            
            this.question;
            
            this.run = function () {
                if (this.selectedHeroes().length === 0 || this.selectedAttributes().length === 0) {
                    alert('No heroes or attributes selected.');
                    return;
                }

                if (this.currentHero() == null) {
                    if (!this.remainingHeroes().length) {
                        this.remainingHeroes(shuffle(self.selectedHeroes().slice(0)));
                    }
                    this.currentHero(this.remainingHeroes.pop());
                }

                this.heroModel.heroId(this.currentHero());
                
                // when state is 0, we need to place currentHero, which represents the previous hero, back into the remainingHeroes list
                // then we set a new currentHero popped from remainingHeroes
                // a new currentAttribute and level is also set
                if (this.state() === 0) {
                    var position;
                    var i = Math.floor(this.remainingHeroes().length * 4 / 5);
                    
                    // insertFront is set to true when the previous question was not answered or incorrect
                    // this indicates that the hero in question should be placed back into the remainingHeroes list near the front so it will be asked again sooner
                    // also store question in questionStore for the hero so the same question will be asked next time the hero is picked.
                    if (this.insertFront()) {
                        position = getRandomInt(i + 1, Math.max(i + 1, this.remainingHeroes().length - 3));
                        this.questionStore[this.currentHero()] = this.question;
                    }
                    // when insertFront is false we want to put the hero into the back portion of the remainingHeroes list
                    // the question was answered correctly so the hero should not appear again too soon.
                    else {
                        position = getRandomInt(0, i);
                        delete this.questionStore[this.currentHero()];
                    }
                    
                    //console.log('insertFront', this.insertFront(), i, position, this.currentHero(), this.questionStore[this.currentHero()]);
                    this.insertFront(false);
                    this.remainingHeroes().splice(position, 0, this.currentHero());
                    this.currentHero(this.remainingHeroes.pop());
                    //this.heroModel.heroId(this.currentHero());
                    //this.currentAttribute(self.selectedAttributes()[Math.floor(Math.random() * self.selectedAttributes().length)]);
                    //this.heroModel.selectedHeroLevel(getRandomInt(parseInt(self.minLevel()), parseInt(self.maxLevel())));
                    /*if (this.questionStore[this.currentHero()]) {
                        this.currentAttribute(this.questionStore[this.currentHero()].attribute);
                        this.heroModel.selectedHeroLevel(this.questionStore[this.currentHero()].level);
                    }
                    else {
                        this.currentAttribute(self.selectedAttributes()[Math.floor(Math.random() * self.selectedAttributes().length)]);
                        this.heroModel.selectedHeroLevel(getRandomInt(parseInt(self.minLevel()), parseInt(self.maxLevel())));
                    }
                    console.log(this.heroModel.heroData().displayname, this.currentAttribute());*/
                    if (self.questionStore[self.currentHero()]) {
                        this.text(self.questionStore[self.currentHero()].question);
                    }
                    else {
                        this.question = this.createQuestion();
                        this.text(this.question.question);
                    }
                }
                // when state is 1, we show the answer
                else if (this.state() === 1) {
                    if (self.questionStore[self.currentHero()]) {
                        this.text(self.questionStore[self.currentHero()].answer);
                    }
                    else {
                        this.text(this.question.answer);
                    }
                }

                this.state((this.state() + 1) % 2);

                if (this.textToSpeech()) {
                    responsiveVoice.speak(this.text().toString().replace('<br>', ' '), 'US English Female', {"onend": this.loop});
                }
                else {
                    this.loop();
                }
            };
            
            this.loop = function () {
                if (self.autoPlay()) {
                    clearTimeout(self.autoPlayInterval);
                    self.autoPlayInterval = setTimeout(function () {
                        self.run();
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

            this.wrong = function () {
                this.insertFront(true);
                clearTimeout(this.autoPlayInterval);
                this.run();
            }

            this.autoPlay = ko.observable(query_string['auto'] == 1 ? true : false);
            this.autoPlay.subscribe(function (newValue) {
                updateQueryStringParam("auto", newValue ? 1 : 0);
            });
            this.autoPlayDelay = ko.observable(parseInt(query_string['delay'])).extend({ numeric: {defaultValue: 3000} });
            this.autoPlayDelay.subscribe(function (newValue) {
                updateQueryStringParam("delay", newValue);
            });
            this.autoPlayInterval;
            this.autoPlay.subscribe(function(newValue) {
                if (!newValue) {
                    clearInterval(self.autoPlayInterval);
                }
            });
            
            this.questionTypes = ko.observableArray(['attributes']);
            this.questionTypes.subscribe(function(changes) {
                if (self.questionTypes().length === 0) {
                    var arr = [];
                    changes.forEach(function(change) {
                        if (change.status === 'deleted') arr.push(change.value);
                    });
                    self.questionTypes(arr);
                }
            }, null, "arrayChange");
            
            this.abilityQuestionTypes = ko.observableArray(['attributes']);
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
        }
        var vm = new ViewModel();
        ko.applyBindings(vm);
    });
});