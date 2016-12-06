var $ = require('jquery');
var ko = require('knockout');
var HeroCalc = require('dota-hero-calculator-library');
var BitArray = require('bit-array-js');

$(function () {
    
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
            this.attributeOverride = {};
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
                    // also set attributeOverride for the hero to currentAttribute so the same question will be asked next time the hero is picked.
                    if (this.insertFront()) {
                        position = getRandomInt(i + 1, Math.max(i + 1, this.remainingHeroes().length - 3));
                        this.attributeOverride[this.currentHero()] = {
                            attribute: this.currentAttribute(),
                            level: this.heroModel.selectedHeroLevel()
                        };
                    }
                    // when insertFront is false we want to put the hero into the back portion of the remainingHeroes list
                    // the question was answered correctly so the hero should not appear again too soon.
                    else {
                        position = getRandomInt(0, i);
                        delete this.attributeOverride[this.currentHero()];
                    }
                    
                    console.log('insertFront', this.insertFront(), i, position, this.currentHero(), this.attributeOverride[this.currentHero()]);
                    this.insertFront(false);
                    this.remainingHeroes().splice(position, 0, this.currentHero());
                    this.currentHero(this.remainingHeroes.pop());
                    this.heroModel.heroId(this.currentHero());
                    if (this.attributeOverride[this.currentHero()]) {
                        this.currentAttribute(this.attributeOverride[this.currentHero()].attribute);
                        this.heroModel.selectedHeroLevel(this.attributeOverride[this.currentHero()].level);
                    } else {
                        this.currentAttribute(self.selectedAttributes()[Math.floor(Math.random() * self.selectedAttributes().length)]);
                        this.heroModel.selectedHeroLevel(getRandomInt(parseInt(self.minLevel()), parseInt(self.maxLevel())));
                    }
                    console.log(this.heroModel.heroData().displayname, this.currentAttribute());
                    this.text('Level ' + this.heroModel.selectedHeroLevel() + ' ' + this.heroModel.heroData().displayname + '<br>' + attributeOptions.filter(function(a) {
                        return a.id == self.currentAttribute();
                    })[0].name);
                }
                // when state is 1, we show the answer
                else if (this.state() === 1) {
                    this.text(getAttributeValue(this.heroModel, this.currentAttribute()));
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
        }
        var vm = new ViewModel();
        ko.applyBindings(vm);
    });
});