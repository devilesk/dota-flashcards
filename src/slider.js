var Hammer = require('hammerjs');

// From https://blog.madewithenvy.com/build-your-own-touch-slider-with-hammerjs-af99665d2869

// 1. Basic object for our stuff
function Slider(selector, opts) {
    this.sliderPanelSelector = '.slider-panel';
    this.sensitivity = 25 // horizontal % needed to trigger swipe

    // 2. Placeholder to remember which slide we’re on
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

        // 4e. Multiply percent by # of slide we’re on
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
    
    // 5a. Stop it from doing weird things like moving to slides that don’t exist
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