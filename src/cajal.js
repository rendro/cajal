/**
 * cajal is a javascript library for drawing and animating pixelgrahics
 * on the canvas element as specified in the html5 standard.
 * Being completely object orientated you can draw the same item objects an animations
 * to several cajal instances, each linked with a different canvas element.
 *
 *
 * @author Robert Fleischmann
 * @version 1.0.1
 */
(function() {
    /**
     * Constructor for a new cajal instance
     * @param element id of the canvas element or the DOM-object that should be drawn on
     * @return cajal instance
     */
    var cajal = this.cajal = function(element, options) {
        this.init(element, options);
    };

    /**
     * Copy of the extend function from jquery to combine multiple objects
     * @param objects to combine
     * @return combined object
     */
    cajal.extend = function() {
        // copy reference to target object
        var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && !cajal.isFunction(target)) {
            target = {};
        }

        // extend cajal itself if only one argument is passed
        if (length === i) {
            target = this;
            --i;
        }

        for ( ; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) !== null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging object literal values or arrays
                    if (deep && copy && (cajal.isPlainObject(copy) || cajal.isArray(copy))) {
                        var clone = src && (cajal.isPlainObject(src) || cajal.isArray(src)) ? src
                            : cajal.isArray(copy) ? [] : {};

                        // Never move original objects, clone them
                        target[name] = cajal.extend(deep, clone, copy);

                    // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };

    //extend the cajal object with static funcitons
    cajal.extend({
        /**
         * Default options for cajal
         */
        defaultOptions: {
            /**
             * flag weather the canvas will be cleared before each call of the draw method
             */
            autoClearCanvas: true,

            /**
             * Global Alpha (will be applied to all objects drawn on the canvas)
             */
            globalAlpha: 1,

            /**
             * Global composite operation
             * valid values: source-over, source-atop, source-in, source-out, destination-atop, destination-in, destination-out, destination-over, copy, darker, lighter, xor
             */
            globalCompositeOperation: 'source-over',

            /**
             * FPS for the animation loop
             */
            loopFps: 30
        },
        isEmptyObject: function(obj) {
            for (var name in obj) {
                return false;
            }
            return true;
        },

        isFunction: function(obj) {
            return Object.prototype.toString.call(obj) === "[object Function]";
        },

        isArray: function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },

        isPlainObject: function(obj) {
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that DOM nodes and window objects don't pass through, as well
            if (!obj || Object.prototype.toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval) {
                return false;
            }

            // Not own constructor property must be Object
            if (obj.constructor &&
                !Object.prototype.hasOwnProperty.call(obj, "constructor") &&
                !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.

            var key;
            for (key in obj) {}

            return key === undefined || Object.prototype.hasOwnProperty.call(obj, key);
        }
    });

    //extend the cajal instance by basic functions
    cajal.extend(cajal.prototype, {

        /**
         * Internal constructor to set up basic variables and clear the canvas
         * @param element id of the canvas element or DOM-object that should be drawn on
         * @param options literal object with global settings (boolean autoClearCanvas, boolean isEmpty, double globalAlpha [between 0 and 1], string globalCompositeOperation, integer loopFps, integer loopFrame)
         */
        init: function(element, options) {
            /**
             * canvas DOM Element
             */
            if (typeof(element) === 'string') {
                //element represents the canvas id attribute
                this.canvas = document.getElementById(element);
            } else {
                //element represents the canvas DOM
                this.canvas = element;
            }

            /**
             * canvas 2D rendering context
             */
            this.ctx = this.canvas.getContext('2d');

            /**
             * Array of all Items
             * The Item object contains the itemId variable that must be unique and the item object itsself
             */
            this.items = [];

            /**
             * Array with all current animations
             */
            this.loopAnimations = [];
            /**
             * Array with frame numbers for each animation
             */
            this.loopAnimationFrames = [];

            /**
             * Global frame number
             */
            this.loopFrame = 0;

            /**
             * Cajal options
             */
            this.options = cajal.extend(true, {}, cajal.defaultOptions, options);

            /**
             * Flag if canvas is not empty. In that case it has to be cleared before drawing
             */
            this.isEmpty = true;

            /**
             * Clear the complete canvas
             */
            this.clear();

        },

        /**
         * Adds an item to the item array
         * @param itemId Name of the item (unique value)
         * @param item item object
         * @return cajal instance or false if itemId already exists or param item is no object
         */
        add: function() {
            if (typeof(arguments[0]) === 'object' && arguments.length === 1) {
                this.items.push({
                    item: arguments[0]
                });
            } else if (typeof(arguments[1]) === 'object' && arguments.length === 2) {
                var itemId = "" + arguments[0];
                if (this.get(itemId)) {
                    this.remove(itemId);
                }
                this.items.push({
                    itemId: itemId,
                    item: arguments[1]
                });
            }
            return this;
        },

        /**
         * Get the item with specific itemId
         * @param itemId item id of the specific item
         * @return the item with specific itemId or false
         */
        get: function(itemId) {
            for (var i in this.items) {
                if (this.items[i].itemId === itemId) {
                    return this.items[i].item;
                }
            }
            return false;
        },

        /**
         * Delete item from item array
         * @param item item id of the item or the item object
         * @return cajal instance on success or false if item does not exist
         */
        remove: function(item) {
            var i = this.index(item);
            if (false !== i) {
                var rest = this.items.slice(i+1);
                this.items.length = i;
                this.items.push.apply(this.items, rest);
                return this;
            }
            return false;
        },

        /**
         * Get the key of the item in the item array
         * @param item item id of the item or the item object
         * @return key of the item or false if item does not exist
         */
        index: function(item) {
            for (var i in this.items) {
                if (typeof(item) === 'object') {
                    if (this.items[i].item === item) {
                        return parseInt(i, 10);
                    }
                } else {
                    if (this.items[i].itemId === item) {
                        return parseInt(i, 10);
                    }
                }
            }
            return false;
        },

        /**
         * Move item one layer up
         * @param item item id of the item or the item object
         * @return cajal instance on success or false
         */
        up: function(item) {
            var i;
            if ((i = this.index(item)) !== false) {
                var cur = this.items[i++];
                this.remove(item);
                this.items.splice(i, 0, cur);
                return this;
            }
            return false;
        },

        /**
         * Move item one layer down
         * @param item item id of the item or the item object
         * @return cajal instance on success or false
         */
        down: function(item) {
            var i;
            if ((i = this.index(item)) !== false) {
                if (i === 0) {
                    return this;
                }
                var cur = this.items[i--];
                this.remove(item);
                this.items.splice(i, 0, cur);
                return this;
            }
            return false;
        },

        /**
         * Move item on the top
         * @param item item id of the item or the item object
         * @return cajal instance on success or false
         */
        top: function(item) {
            var i;
            if ((i = this.index(item)) !== false) {
                var cur = this.items[i];
                this.remove(item);
                this.items.push(cur);
                return this;
            }
            return false;
        },

        /**
         * Move item to the bottom
         * @param item item id of the item or the item object
         * @return cajal instance on success or false
         */
        bottom: function(item) {
            var i;
            if ((i = this.index(item)) !== false) {
                var cur = this.items[i];
                this.remove(item);
                this.items.splice(0, 0, cur);
                return this;
            }
            return false;
        },

        /**
         * Draw all Objects stored in the item array to the canvas
         * The canvas will be cleared if the flag "autoClearCanvas" is true
         * @param options literal object with draw options that will override the draw options of each item for this draw call
         * @return cajal instance
         */
        draw: function(options) {
            if (this.isEmpty === false && this.options.autoClearCanvas === true) {
                this.clear();
            }
            this.isEmpty = false;
            for (var i in this.items) {
                this.items[i].item.draw(this, options);
            }
            return this;
        },

        /**
         * Clears the complete canvas
         * @return cajal instance
         */
        clear: function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.isEmpty = true;
            return this;
        },

        /**
         * Triggers the given animation with specific duration
         * @param animation callback function
         * @param duration duration of the animation in frames
         * @return cajal instance
         */
        animate: function(animation, duration) {
            duration = duration || -1;
            var rfxnum = /^([\d+.]+)([smhf]{1})$/;
            var parts = rfxnum.exec(duration);
            if (parts) {
                var time = parseFloat(parts[1]),
                    unit = parts[2];
                switch (unit) {

                    case 's':
                        time *= this.options.loopFps;
                        break;

                    case 'm':
                        time *= this.options.loopFps * 60;
                        break;

                    case 'h':
                        time *= this.options.loopFps * 3600;
                        break;
                }
                duration = parseInt(time, 10);
            } else {
                duration = parseInt(duration, 10);
            }
            
            this.loopAnimations.push({
                callback: animation,
                duration: duration || -1,
                frame: 0
            });

            //start loop if not running
            if (this.loopInterval === null) {
                var obj = this;
                this.loopInterval = setInterval(function(){
                    obj.loop();
                }, Math.round(1000 / this.options.loopFps));
            }
            return this;
        },

        /**
         * Stops animation
         * @param animation callback function or true for stopping all animatinos
         * @return cajal instance
         */
        stop: function(animation) {
            if (animation === true) {
                this.loopAnimations = [];
            }
            for (var i in this.loopAnimations) {
                if (this.loopAnimations[i].callback === animation) {
                    if (this.loopAnimations.length === 1) {
                        this.loopAnimations = [];
                    } else {
                        delete(this.loopAnimations[i]);
                    }
                }
            }
            if (this.loopAnimations.length === 0) {
                clearInterval(this.loopInterval);
                this.loopInterval = null;
            }
            return this;
        },

        /**
         * Interval reference
         */
        loopInterval: null,

        /**
         * Loop routine that calls each animation callback, increments the frame number,
         * removes animations that reached their duration limit, and stops the loop
         * interval if no animations are left in the loop
         */
        loop: function() {
            this.loopFrame++;
            for (var i in this.loopAnimations) {
                var animation = this.loopAnimations[i];
                animation.frame++;
                if (animation.duration > 0 && animation.frame > animation.duration) {
                    if (this.loopAnimations.length === 1) {
                        this.loopAnimations = [];
                    } else {
                        delete(this.loopAnimations[i]);
                    }
                } else {
                    animation.callback.apply(this, [animation.frame, animation.duration]);
                }
            }
            this.draw();
            //stop loop if all animations are over
            if (this.loopAnimations.length === 0) {
                clearInterval(this.loopInterval);
                this.loopInterval = null;
            }
        },

        /**
         * This algorithm returns the top item at position x, y or null
         * 
         * At first it is checked, if any item was hit. In that case, the algorithm loops through all items
         * checking 8 items per loop by drawing them on a hidden canvas in 8 different colors. Retrieving
         * the color at position x, y tells us not only if an item was found, but exacly wich one.
         * @param cajalInstance the cajal instance to look for items
         * @param x x coordinate of the event
         * @param y y coordinate of the event
         * @return item instance or null
         */
        getItemAtPoint: function (cajalInstance, x, y) {

            var convertToHex = function (r, g, b)
            {
                r /= 255;
                r = Math.round(r) * 255;
                r = r.toString(16).replace('0','00');

                g /= 255;
                g = Math.round(g) * 255;
                g = g.toString(16).replace('0','00');

                b /= 255;
                b = Math.round(b) * 255;
                b = b.toString(16).replace('0','00');

                return '#' + r + g + b;
            };

            //create hitmap canvas
            var map = cajalInstance.canvas.cloneNode(true);

            //check if any item was hit
            var imageData = cajalInstance.ctx.getImageData(x, y, 1, 1).data;
            
            if (imageData[0] === 0 && imageData[1] === 0 && imageData[2] === 0 && imageData[3] === 0) {
                return null;
            }
            //otherwise an item was found, so we have to check which one

            //create cajal instance to draw the hitMap
            var c = new cajal(map);

            //the colors to fill the regions with
            var colors = [
                '#ff0000',
                '#00ff00',
                '#0000ff',
                '#ffff00',
                '#ff00ff',
                '#00ffff',
                '#000000',
                '#ffffff'
            ];

            //loop through blocks of 8 items
            for (var i = cajalInstance.items.length-1; i >= 0 ; i-=8) {
                //determine start and end for slice function
                var start, end;
                if (i <= 8) {
                    start = 0;
                    end = i + 1;
                } else {
                    start = i - 7;
                    end = i + 1;
                }
                //clear temp canvas
                c.clear();
                //empty items array
                c.items = [];
                // draw all 8 items of the block to the temp canvas using the 8 different colors for stroke and fill
                var restItems = cajalInstance.items.slice(start, end);
                for (var j = 0; j < restItems.length; j++) {
                    c.add(restItems[j].item.clone().options({
                        fill: colors[j],
                        stroke: colors[j]
                    }));
                }
                c.draw();

                //analyze imageData
                var tempImageData = c.ctx.getImageData(x, y, 1, 1).data;
                if (tempImageData[3] !== 0) {
                    var detectedColor = convertToHex(tempImageData[0], tempImageData[1], tempImageData[2]);
                    for (var color in colors) {
                        if (colors[color] === detectedColor) {
                            return restItems[color].item;
                        }
                    }
                }
            }
            return null;
        }

    });

    /**
     * Create a linear gradient
     * color stops can be added using the colorStop method
     * @param x1 x coordinate for the gradient start
     * @param y1 y coordinate for the gradient start
     * @param x2 x coordinate for the gradient end
     * @param y2 y coordinate for the gradient end
     * @return gradient object
     */
    cajal.LinearGradient = function(x1, y1, x2, y2) {
        this.properties = {
            start: {
                x: x1,
                y: y1
            },
            end: {
                x: x2,
                y: y2
            },
            colorStops: []
        };
        return this;
    };

    //extend the linear gradient object by methods
    cajal.extend(cajal.LinearGradient.prototype, {
        /**
         * add a color stop to the gradient
         * @param pos float number between 0 and 1 where the color is located on the gradient
         * @param color hex or rgb(a) value of the color
         * @return gradient instance
         */
        colorStop: function(pos, color) {
            this.properties.colorStops.push({
                pos: pos,
                color: color
            });
            return this;
        },

        /**
         * Get the canvas gradient object for drawing the gradient
         * @param context 2D rendering context
         * @return the canvas gradient object
         */
        draw: function(context) {
            var gradient = context.createLinearGradient(this.properties.start.x, this.properties.start.y, this.properties.end.x, this.properties.end.y);
            for (var i in this.properties.colorStops) {
                gradient.addColorStop(this.properties.colorStops[i].pos, this.properties.colorStops[i].color);
            }
            return gradient;
        }
    });

    /**
     * Create a radial gradient
     * color stops can be added using the colorStop method
     * @param x1 x coordinate for the gradient start
     * @param y1 y coordinate for the gradient start
     * @param r1 radius for the gradient start
     * @param x2 x coordinate for the gradient end
     * @param y2 y coordinate for the gradient end
     * @param r2 radius for the gradient end
     * @return gradient object
     */
    cajal.RadialGradient = function(x1, y1, r1, x2, y2, r2) {
        this.properties = {
            start: {
                x: x1,
                y: y1,
                r: r1
            },
            end: {
                x: x2,
                y: y2,
                r: r2
            },
            colorStops: []
        };
        return this;
    };
    cajal.extend(cajal.RadialGradient.prototype, {
        /**
         * add a color stop to the gradient
         * @param pos float number between 0 and 1 where the color is located on the gradient
         * @param color hex or rgb(a) value of the color
         * @return gradient instance
         */
        colorStop: function(pos, color) {
            this.properties.colorStops.push({
                pos: pos,
                color: color
            });
            return this;
        },

        /**
         * Get the canvas gradient object for drawing the gradient
         * @param context 2D rendering context
         */
        draw: function(context) {
            var gradient = context.createRadialGradient(this.properties.start.x, this.properties.start.y, this.properties.start.r, this.properties.end.x, this.properties.end.y, this.properties.end.r);
            for (var i in this.properties.colorStops) {
                gradient.addColorStop(this.properties.colorStops[i].pos, this.properties.colorStops[i].color);
            }
            return gradient;
        }
    });


    /**
     * Default values for the drawing options
     */
    cajal.defaultDrawOptions = {
        stroke: null,
        fill: null,
        width: 1,
        font: '13px sans-serif',
        textAlign: 'left',
        lineCap: 'butt', //butt,square,round
        lineJoin: 'miter', //bevel,miter,round
        miterLimit: 10,
        shadowX: 0,
        shadowY: 0,
        shadowBlur: 0,
        shadow: null
    };

    /**
     * Default values for the item options
     */
    cajal.defaultItemOptions  = {
        translate: null,
        scale: null,
        rotate: {
            angle: null
        },
        matrix: null,
        hidden: false
    };

    /**
     * Basic item methods
     * Each item hase those methods
     */
    cajal.Item = {

        /**
         * Clone the item
         * @return clone of the item
         */
        clone: function() {
            return cajal.extend(true, {}, this);
        },

        /**
         * Hide item
         * Hidden items are not drawn to the canvas
         * @return item instance
         */
        hide: function() {
            this.itemOptions.hidden = true;
            return this;
        },

        /**
         * Show item if hidden
         * @return item instance
         */
        show: function() {
            this.itemOptions.hidden = false;
            return this;
        },

        /**
         * Change the matrix of the canvas element for this item by multiplication with current matrix
         * By applying a custom matrix you can translate, scale and rotate items in one step
         * @param values of the 3x3 matrix (dx and dy are m13 and m23 values of the matrix)
         * @return item instance
         */
        changeMatrix: function(m11, m12, m21, m22, dx, dy) {
             //identity
            var m = {
                m11: 1,
                m12: 0,
                dx: 0,
                m21: 0,
                m22: 1,
                dy: 0
            };
            //override the identity if matrix is given
            if (this.itemOptions.matrix !== null) {
                m = this.itemOptions.matrix;
            }
            //simple matrix multiplication
            this.itemOptions.matrix = {
                m11: m.m11 * m11 + m.m12 * m21,
                m12: m.m11 * m21 + m.m12 * m22,
                dx : m.m11 * dx  + m.m12 * dy  + m.dx,
                m21: m.m21 * m11 + m.m22 * m21,
                m22: m.m21 * m21 + m.m22 * m22,
                dy : m.m21 * dx  + m.m22 * dy  + m.dy
            };
            return this;
        },

        /**
         * Set the matrix of the canvas element for this item
         * Current matrix will be overwritten
         * By applying a custom matrix you can translate, scale and rotate items in one step
         * @param values of the 3x3 matrix (dx and dy are m13 and m23 values of the matrix)
         * @return item instance
         */
        setMatrix: function(m11, m12, m21, m22, dx, dy) {
            if (m11 === 1 && m12 === 0 && m21 === 0 && m22 === 1 && dx === 0 && dy === 0) { //identity
                this.itemOptions.matrix = null;
            } else {
                this.itemOptions.matrix = {
                    m11: m11,
                    m12: m12,
                    m21: m21,
                    m22: m22,
                    dx: dx,
                    dy: dy
                };
            }
            return this;
        },

        /**
         * Rotate item by an angle
         * @param angle rotation angle in degree
         * @return item instance
         */
        rotateBy: function(angle, point) {
            if (this.itemOptions.rotate.angle !== null) {
                this.itemOptions.rotate.angle += Math.PI * angle / 180;
                if (point !== undefined) {
                    this.itemOptions.rotate.point = point;
                }
            } else {
                return this.rotate(angle, point);
            }
            return this;
        },

        /**
         * Set rotation of item to an angle
         * @param angle rotation angle in degree
         * @return item instance
         */
        rotate: function(angle, point) {
            if (angle === 0) {
                this.itemOptions.rotate.angle = null;
            } else {
                this.itemOptions.rotate.angle = Math.PI * angle / 180;
                if (point !== undefined) {
                    this.itemOptions.rotate.point = point;
                }
            }
            return this;
        },

        /**
         * Scale item by given value
         * 0.1 would be +10% size
         * @param dx scale values for x axis
         * @param dy scale values for y axis
         * @return item instance
         */
        scaleBy: function(dx, dy) {
            if (this.itemOptions.scale !== null) {
                this.itemOptions.scale.dx += dx;
                this.itemOptions.scale.dy += dy;
            } else {
                return this.scale(1 + dx, 1 + dy);
            }
            return this;
        },

        /**
         * Scale item to given facor
         * 0.1 would be 10% of original size
         * @param x scale values for x axis
         * @param y scale values for y axis
         * @return item instance
         */
        scale: function(x, y) {
            if (x === 1 && y === 1) {
                this.itemOptions.scale = null;
            } else {
                this.itemOptions.scale = {
                    dx: x,
                    dy: y
                };
            }
            return this;
        },

        /**
         * Move item by given pixels
         * @param dx pixel offset for x axis
         * @param dy pixel offset for y axis
         * @return item instance
         */
        moveBy: function(dx, dy) {
            if (this.itemOptions.translate !== null) {
                this.itemOptions.translate.x += dx;
                this.itemOptions.translate.y += dy;
            }else {
                return this.move(dx, dy);
            }
            return this;
        },

        /**
         * Move item to given coordinates
         * @param dx pixel offset for x axis
         * @param dy pixel offset for y axis
         * @return item instance
         */
        move: function(x, y) {
            if (x === 0 && x === 0) {
                this.itemOptions.translate = null;
            }else {
                this.itemOptions.translate = {
                    x: x,
                    y: y
                };
            }
            return this;
        },

        /**
         * Set draw options for the item
         * @param options literal object of the options
         * @return item instance
         */
        options: function(options) {
            cajal.extend(this.drawOptions, options);
            return this;
        },

        prepare: function (canvas, options) {
            var ctx = canvas.ctx;
            ctx.save();
            //globalAlpha and globalCompositeOperation
            ctx.globalAlpha = canvas.options.globalAlpha;
            ctx.globalCompositeOperation = canvas.options.globalCompositeOperation;

            //dont draw if hidden
            if (this.itemOptions.hidden === true) {
                return;
            }

            if (options !== undefined) {
                options = cajal.extend({}, this.drawOptions, options);
            } else {
                options = this.drawOptions;
            }

            if (options.fill !== null) {
                if (typeof(options.fill) === 'object') {
                    ctx.fillStyle = options.fill.draw(ctx);
                } else if (cajal.isFunction(options.fill)) {
                    ctx.fillStyle = options.fill.apply(this, [ctx]);
                } else {
                    ctx.fillStyle = options.fill;
                }
            }

            if (options.stroke !== null) {
                if (typeof(options.stroke) === 'object') {
                    ctx.strokeStyle = options.stroke.draw(ctx);
                } else if (cajal.isFunction(options.stroke)) {
                    ctx.strokeStyle = options.stroke.apply(this, [ctx]);
                } else {
                    ctx.strokeStyle = options.stroke;
                }
                ctx.lineWidth = options.width;
                ctx.lineCap = options.lineCap;
                ctx.lineJoin = options.lineJoin;
                ctx.miterLimit = options.miterLimit;
            }

            if (options.shadow !== null) {
                ctx.shadowOffsetX = options.shadowX;
                ctx.shadowOffsetY = options.shadowY;
                ctx.shadowBlur = options.shadowBlur;
                ctx.shadowColor = options.shadow;
            }

            ctx.setTransform(1, 0, 0, 1, 0, 0);

            //handle matrix changes
            //matrix changes
            if (this.itemOptions.matrix !== null) {
                var m = this.itemOptions.matrix;
                ctx.setTransform(m.m11, m.m12, m.m21, m.m22, m.dx, m.dy);
            }
            //center of object
            var center = this.center(ctx);
            //translate
            if (this.itemOptions.translate !== null) {
                ctx.translate(this.itemOptions.translate.x, this.itemOptions.translate.y);
            }
            // rotate round center of object or specific point
            if (this.itemOptions.rotate.angle !== null) {
                var point = this.itemOptions.rotate.point || {};
                //translate to the center of the object
                ctx.translate(point.x || center.x, point.y || center.y);
                //rotate
                ctx.rotate(this.itemOptions.rotate.angle);
                //translate back
                ctx.translate(-(point.x || center.x), -(point.y || center.y));
            }
            //scale form center of object
            if (this.itemOptions.scale !== null) {
                //translate to the center of the object
                ctx.translate(center.x, center.y);
                //scale
                ctx.scale(this.itemOptions.scale.dx, this.itemOptions.scale.dy);
                //translate back
                ctx.translate(-center.x, -center.y);
            }

            ctx.beginPath();

            return options;
        },

        finalize: function (canvas, options) {
            var ctx = canvas.ctx;
            if (options.stroke !== null) {
                ctx.stroke();
            }

            if (options.fill !== null) {
                ctx.fill();
            }

            ctx.restore();
        }
    };

    /**
     * Create a circle
     * @param x position in pixel
     * @param y position in pixel
     * @param r radius of the circle
     * @return circle item instance
     */
    cajal.Circle = function(x, y, r) {
        this.drawOptions = cajal.extend(true, {}, cajal.defaultDrawOptions);
        this.itemOptions = cajal.extend(true, {}, cajal.defaultItemOptions);
        this.radius = r;
        this.move(x, y);
    };

    cajal.extend(cajal.Circle.prototype, cajal.Item, {
        /**
         * Get the center of the item for rotation
         * @return point object of the center
         */
        center: function() {
            return {
                x: 0,
                y: 0
            };
        },
        
        /**
         * Draw routine for the item
         * @param canvas cajal instance
         * @param options draw options for this draw call
         */
        draw: function(canvas, options) {
            var ctx = canvas.ctx;
            options = this.prepare(canvas, options);
            
            ctx.moveTo(this.radius, 0);
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
            ctx.closePath();

            this.finalize(canvas, options);
        }

    });

    /**
     * Create a rectangle
     * Optional with rounded corners if radius is set
     * @param x position on the x axis in pixel
     * @param y position on the y axis in pixel
     * @param w height of the rectangle in pixel
     * @param h width of the rectangle in pixel
     * @param r (optional) radius for rounded corners
     * @return rectangle item instance
     */
    cajal.Rect = function(x, y, w, h, r) {
        this.drawOptions = cajal.extend(true, {}, cajal.defaultDrawOptions);
        this.itemOptions = cajal.extend(true, {}, cajal.defaultItemOptions);
        this.rect = {
            w: w,
            h: h
        };
        if (r !== undefined) { //rounded rect
            this.rect.r = r;
        }
        this.move(x, y);
    };

    cajal.extend(cajal.Rect.prototype, cajal.Item, {
        /**
         * Get the center of the item for rotation
         * @return point object of the center
         */
        center: function() {
            return {
                x: this.rect.w / 2,
                y: this.rect.h / 2
            };
        },
        /**
         * Get the height of the rectangle
         */
        height: function() {
            return this.rect.h;
        },
        /**
         * Get the width of the rectangle
         */
        width: function() {
            return this.rect.w;
        },
        /**
         * Draw routine for the item
         * @param canvas cajal instance
         * @param options draw options for this draw call
         */
        draw: function(canvas, options) {
            var ctx = canvas.ctx;
            options = this.prepare(canvas, options);

            if (this.rect.r !== undefined) {
                ctx.moveTo(this.rect.r, 0);
                ctx.arcTo (this.rect.w, 0, this.rect.w, this.rect.r, this.rect.r);
                ctx.arcTo (this.rect.w, this.rect.h, this.rect.r, this.rect.h, this.rect.r);
                ctx.arcTo (0, this.rect.h, 0, this.rect.r, this.rect.r);
                ctx.arcTo (0, 0, this.rect.r, 0, this.rect.r);
            } else {
                ctx.rect(0, 0, this.rect.w, this.rect.h);
            }
            ctx.closePath();

            this.finalize(canvas, options);
        }
    });

    /**
     * Create a path
     * @param x start of the path at position x in pixel
     * @param y start of the path at position y in pixel
     * @return path item instance
     */
    cajal.Path = function(x, y) {
        this.drawOptions = cajal.extend(true, {}, cajal.defaultDrawOptions);
        this.itemOptions = cajal.extend(true, {}, cajal.defaultItemOptions);
        this.isClosed = false;
        this.offset = {
            x: x || 0,
            y: y || 0
        };
        this.pointStack = [{type: 'start'}];
        this.move(x, y);
    };

    cajal.extend(cajal.Path.prototype, cajal.Item, {

        /**
         * Array for the points in the path
         */
        pointStack: [],

        /**
         * Create a line to (x, y)
         * @param x position of the end point on the x-axis in pixel
         * @param y position of the end point on the y-axis in pixel
         * @return path item instance
         */
        line: function(x, y) {
            var p = {
                type: 'point',
                x: x - this.offset.x,
                y: y - this.offset.y
            };
            this.pointStack.push(p);
            return this;
        },

        /**
         * Create a line to (x, y)
         * @param x position of the end point on the x-axis in pixel
         * @param y position of the end point on the y-axis in pixel
         * @return path item instance
         */
        to: function(x, y) {
            return this.line(x, y);
        },

        /**
         * Close the path
         * @return path item instance
         */
        close: function() {
            this.isClosed = true;
            return this;
        },

        /**
         * Create a quadratic bezier curve to (x, y) with the control point (cx, cy)
         * @param x position of the end point on the x-axis in pixel
         * @param y position of the end point on the y-axis in pixel
         * @param cx position of the control point on the x-axis in pixel
         * @param cy position of the control point on the y-axis in pixel
         * @return path item instance
         */
        quadraticCurve: function(x, y, cx, cy) {
            var p = {
                type: 'quadratic',
                x:  x - this.offset.x,
                y:  y - this.offset.y,
                cx: cx - this.offset.x,
                cy: cy - this.offset.y
            };
            this.pointStack.push(p);
            return this;
        },

        /**
         * Create a bezier curve to (x, y) with the control points (c1x, c1y) and (c2x, c2y)
         * @param x position of the end point on the x-axis in pixel
         * @param y position of the end point on the y-axis in pixel
         * @param c1x position of the first control point on the x-axis in pixel
         * @param c1y position of the first control point on the y-axis in pixel
         * @param c2x position of the second control point on the x-axis in pixel
         * @param c2y position of the second control point on the y-axis in pixel
         * @return path item instance
         */
        bezierCurve: function(x, y, c1x, c1y, c2x, c2y) {
            var p = {
                type: 'bezier',
                x: x - this.offset.x,
                y: y - this.offset.y,
                c1x: c1x - this.offset.x,
                c1y: c1y - this.offset.y,
                c2x: c2x - this.offset.x,
                c2y: c2y - this.offset.y
            };
            this.pointStack.push(p);
            return this;
        },

        /**
         * Get the approximate center of the path for rotation
         * @return point object of the center
         */
        center: function() { //only aprox. because bezier and quadradic curves can not be measured exacly
            //calculate center of every subpath
            var polygon = {
                i: 0,
                x: 0,
                y: 0
            };
            for (var i = 0; i < this.pointStack.length; i++) {
                var p = this.pointStack[i];

                switch (p.type) {

                    case 'point':
                        polygon.i++;
                        polygon.x += p.x;
                        polygon.y += p.y;
                        break;

                    case 'quadratic':
                        polygon.i += 2;
                        polygon.x += p.x + p.cx;
                        polygon.y += p.y + p.cy;
                        break;

                    case 'bezier':
                        polygon.i += 3;
                        polygon.x += p.x + p.c1x + p.c2x;
                        polygon.y += p.y + p.c1y + p.c2y;
                        break;
                    default:
                        break;
                }
            }
            return {
                x: polygon.x / polygon.i,
                y: polygon.y / polygon.i
            };
        },

        /**
         * Draw routine for the item
         * @param canvas cajal instance
         * @param options draw options for this draw call
         */
        draw: function(canvas, options) {
            var ctx = canvas.ctx;
            options = this.prepare(canvas, options);

            for (var i in this.pointStack) {
                var p = this.pointStack[i];

                switch (p.type) {

                    case 'start':
                        ctx.moveTo(0, 0);
                        break;

                    case 'point':
                        ctx.lineTo(p.x, p.y);
                        break;

                    case 'quadratic':
                        ctx.quadraticCurveTo(p.cx, p.cy, p.x, p.y);
                        break;

                    case 'bezier':
                        ctx.bezierCurveTo(p.c1x, p.c1y, p.c2x, p.c2y, p.x, p.y);
                        break;
                }
            }

            if (this.isClosed) {
                ctx.closePath();
            }

            this.finalize(canvas, options);
        }
    });

    /**
     * Create a text item
     * @param x position on x axis in pixel
     * @param y position on y axis in pixel
     * @param text Text to draw
     * @return text item instance
     */
    cajal.Text = function(x, y, text) {
        this.drawOptions = cajal.extend(true, {}, cajal.defaultDrawOptions);
        this.itemOptions = cajal.extend(true, {}, cajal.defaultItemOptions);
        this.move(x, y);
        this.t = text;
    };

    cajal.extend(cajal.Text.prototype, cajal.Item, {

        /**
         * Append text to the current text
         * @param text Text to add
         * @return text item instance
         */
        append: function(text) {
            this.t += ("" + text);
            return this;
        },

        /**
         * Prepend text to the current text
         * @param text Text to prepend
         * @return text item instance
         */
        prepend: function(text) {
            this.t = "" + text + this.t;
            return this;
        },

        /**
         * Set text to the current text
         * @param text Text to draw
         * @return text item instance
         */
        text: function(text) {
            this.t = "" + text;
            return this;
        },

        /**
         * Get the center of the text for rotation
         * @return point object of the center
         */
        center: function(ctx) {
            ctx.save();
            ctx.font = this.drawOptions.font;
            ctx.textAlign = this.drawOptions.textAlign;
            var size = ctx.measureText(this.t);
            ctx.restore();
            return {
                x: size.width / 2,
                y: 0
            };
        },

        /**
         * Draw routine for the item
         * @param canvas cajal instance
         * @param options draw options for this draw call
         */
        draw: function(canvas, options) {
            var ctx = canvas.ctx;
            options = this.prepare(canvas, options);

            ctx.font = options.font;
            if (options.stroke !== null) {
                ctx.strokeText (this.t, 0, 0);
            }
            if (options.fill !== null) {
                ctx.fillText(this.t, 0, 0);
            }
            ctx.closePath();
            this.finalize(canvas, options);
        }
    });

    /**
     * Create a symmetric polygon
     * @param x Position on x-axis in pixel
     * @param y Position on y-axis in pixel
     * @param n Number of edges
     * @param r Radius of the polygon
     * @return polygon item instance
     */
    cajal.Polygon = function(x, y, n, r) {
        this.drawOptions = cajal.extend(true, {}, cajal.defaultDrawOptions);
        this.itemOptions = cajal.extend(true, {}, cajal.defaultItemOptions);
        this.pointStack = [];
        this.move(x, y);
        this.setPoints(n, r);
    };

    cajal.extend(cajal.Polygon.prototype, cajal.Item, {

        /**
         * Get the center of the item for rotation
         * @return point object of the center
         */
        center: function() {
            return {
                x: 0,
                y: 0
            };
        },

        /**
         * Manipulate the polygon by setting a new radius and new number of edges
         * @param n new number of edges
         * @param r new radius
         * @return polygon item instance
         */
        setPoints: function(n, r) {
            this.pointStack = [];
            var angle = Math.PI * 2 / n;
            for (var i = 0; i < n; i++) {
                this.pointStack.push({
                    x: r * Math.cos(i * angle),
                    y: r * Math.sin(i * angle)
                });
            }
            return this;
        },

        /**
         * Draw routine for the item
         * @param canvas cajal instance
         * @param options draw options for this draw call
         */
        draw: function(canvas, options) {
            var ctx = canvas.ctx;
            options = this.prepare(canvas, options);

            for (var i in this.pointStack) {
                var p = this.pointStack[i];
                ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            this.finalize(canvas, options);
        }
    });
    
    /**
     * Create a circular segment
     * @param x position in pixel
     * @param y position in pixel
     * @param r radius of the circle
     * @param angle angle of the segment
     * @return circle item instance
     */
    cajal.CircleSegment = function(x, y, r, angle) {
        this.drawOptions = cajal.extend(true, {}, cajal.defaultDrawOptions);
        this.itemOptions = cajal.extend(true, {}, cajal.defaultItemOptions);
        this.p = {
            radius: r,
            angle: angle
        };
        this.isClosed = false;
        this.move(x, y);
    };

    cajal.extend(cajal.CircleSegment.prototype, cajal.Item, {
        /**
         * Get the center of the item for rotation
         * @return point object of the center
         */
        center: function() {
            return {
                x: 0,
                y: 0
            };
        },
        
        /**
         * Close the path
         * @return path item instance
         */
        close: function () {
            this.isClosed = true;
            return this;
        },
        
        /**
         * Draw routine for the item
         * @param canvas cajal instance
         * @param options draw options for this draw call
         */
        draw: function(canvas, options) {
            var ctx = canvas.ctx;
            options = this.prepare(canvas, options);
            
            ctx.moveTo(this.p.radius, 0);
            var angle = this.p.angle%360 * (Math.PI / 180);
            ctx.arc(0, 0, this.p.radius, 0, angle, false);
            if (this.isClosed) {
                ctx.closePath();
            }

            this.finalize(canvas, options);
        }

    });

    /**
     * Create a circular sector
     * @param x position in pixel
     * @param y position in pixel
     * @param r radius of the circle
     * @param angle angle of the sector
     * @return circle item instance
     */
    cajal.CircleSector = function(x, y, r, angle) {
        this.drawOptions = cajal.extend(true, {}, cajal.defaultDrawOptions);
        this.itemOptions = cajal.extend(true, {}, cajal.defaultItemOptions);
        this.p = {
            radius: r,
            angle: angle
        };
        this.move(x, y);
    };

    cajal.extend(cajal.CircleSector.prototype, cajal.Item, {
        /**
         * Get the center of the item for rotation
         * @return point object of the center
         */
        center: function() {
            return {
                x: 0,
                y: 0
            };
        },

        /**
         * Draw routine for the item
         * @param canvas cajal instance
         * @param options draw options for this draw call
         */
        draw: function(canvas, options) {
            var ctx = canvas.ctx;
            options = this.prepare(canvas, options);

            ctx.moveTo(0,0);
            ctx.lineTo(this.p.radius, 0);
            var angle = this.p.angle%360 * (Math.PI / 180);
            ctx.arc(0, 0, this.p.radius, 0, angle, false);
            ctx.closePath();

            this.finalize(canvas, options);
        }

    });

})();
