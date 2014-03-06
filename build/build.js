"use strict";

/*eslint no-underscore-dangle: 1, eqeqeq:1*/
// This is a modified version of component-require.
// https://github.com/component/require
//
// This will likely be completely rewritten in the future to handle requires
// across all package ecosystems (famous, npm, component, bower, etc.);
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */
function require(path, parent, orig) {
    var resolved = require.resolve(path);
    // lookup failed
    if (null == resolved) {
        orig = orig || path;
        parent = parent || "root";
        var err = new Error("Failed to require '" + orig + "' from '" + parent + "'");
        err.path = orig;
        err.parent = parent;
        err.require = true;
        throw err;
    }
    var module = require.modules[resolved];
    // perform real require()
    // by invoking the module's
    // registered function
    if (!module._resolving && !module.exports) {
        var mod = {};
        mod.exports = {};
        mod.client = mod.component = true;
        module._resolving = true;
        module.call(this, mod.exports, require.relative(resolved), mod);
        delete module._resolving;
        module.exports = mod.exports;
    }
    return module.exports;
}

/**
 * Registered modules.
 */
require.modules = {};

/**
 * Registered aliases.
 */
require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */
require.resolve = function(path) {
    if (require.modules.hasOwnProperty(path)) {
        return path;
    }
    if (require.aliases.hasOwnProperty(path)) {
        return require.aliases[path];
    }
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */
require.register = function(path, definition) {
    require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */
require.alias = function(from, to) {
    if (!require.modules.hasOwnProperty(from)) {
        throw new Error("Failed to alias '" + from + "', it does not exist");
    }
    require.aliases[to] = from;
};

/**
 * This is meant to mimic the "map" property of the requirejs.config object
 * ref: http://requirejs.org/docs/api.html#config-map
 *
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
require.config = function(config) {
    config = config || {};
    if (config.map) {
        var DAG = config.map;
        for (var key in DAG) {
            if (DAG.hasOwnProperty(key)) {
                var depMap = DAG[key];
                for (var dep in depMap) {
                    if (depMap.hasOwnProperty(dep)) {
                        var from = depMap[dep];
                        var to = [ key, dep ].join(":");
                        require.alias(from, to);
                    }
                }
            }
        }
    }
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */
require.relative = function(parent) {
    // this lambda is localRequire
    return function(path) {
        var resolved = [ parent, path ].join(":");
        return require(resolved, parent, path);
    };
};

require.register("famous_modules/famous/polyfills/_git_master/index.js", function(exports, require, module) {
    require("./classList.js");
    require("./functionPrototypeBind.js");
    require("./requestAnimationFrame.js");
});

require.register("famous_modules/famous/polyfills/_git_master/classList.js", function(exports, require, module) {
    /*
     * classList.js: Cross-browser full element.classList implementation.
     * 2011-06-15
     *
     * By Eli Grey, http://eligrey.com
     * Public Domain.
     * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
     */
    /*global self, document, DOMException */
    /*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/
    if (typeof document !== "undefined" && !("classList" in document.createElement("a"))) {
        (function(view) {
            "use strict";
            var classListProp = "classList", protoProp = "prototype", elemCtrProto = (view.HTMLElement || view.Element)[protoProp], objCtr = Object, strTrim = String[protoProp].trim || function() {
                return this.replace(/^\s+|\s+$/g, "");
            }, arrIndexOf = Array[protoProp].indexOf || function(item) {
                var i = 0, len = this.length;
                for (;i < len; i++) {
                    if (i in this && this[i] === item) {
                        return i;
                    }
                }
                return -1;
            }, DOMEx = function(type, message) {
                this.name = type;
                this.code = DOMException[type];
                this.message = message;
            }, checkTokenAndGetIndex = function(classList, token) {
                if (token === "") {
                    throw new DOMEx("SYNTAX_ERR", "An invalid or illegal string was specified");
                }
                if (/\s/.test(token)) {
                    throw new DOMEx("INVALID_CHARACTER_ERR", "String contains an invalid character");
                }
                return arrIndexOf.call(classList, token);
            }, ClassList = function(elem) {
                var trimmedClasses = strTrim.call(elem.className), classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [], i = 0, len = classes.length;
                for (;i < len; i++) {
                    this.push(classes[i]);
                }
                this._updateClassName = function() {
                    elem.className = this.toString();
                };
            }, classListProto = ClassList[protoProp] = [], classListGetter = function() {
                return new ClassList(this);
            };
            // Most DOMException implementations don't allow calling DOMException's toString()
            // on non-DOMExceptions. Error's toString() is sufficient here.
            DOMEx[protoProp] = Error[protoProp];
            classListProto.item = function(i) {
                return this[i] || null;
            };
            classListProto.contains = function(token) {
                token += "";
                return checkTokenAndGetIndex(this, token) !== -1;
            };
            classListProto.add = function(token) {
                token += "";
                if (checkTokenAndGetIndex(this, token) === -1) {
                    this.push(token);
                    this._updateClassName();
                }
            };
            classListProto.remove = function(token) {
                token += "";
                var index = checkTokenAndGetIndex(this, token);
                if (index !== -1) {
                    this.splice(index, 1);
                    this._updateClassName();
                }
            };
            classListProto.toggle = function(token) {
                token += "";
                if (checkTokenAndGetIndex(this, token) === -1) {
                    this.add(token);
                } else {
                    this.remove(token);
                }
            };
            classListProto.toString = function() {
                return this.join(" ");
            };
            if (objCtr.defineProperty) {
                var classListPropDesc = {
                    get: classListGetter,
                    enumerable: true,
                    configurable: true
                };
                try {
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                } catch (ex) {
                    // IE 8 doesn't support enumerable:true
                    if (ex.number === -2146823252) {
                        classListPropDesc.enumerable = false;
                        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                    }
                }
            } else if (objCtr[protoProp].__defineGetter__) {
                elemCtrProto.__defineGetter__(classListProp, classListGetter);
            }
        })(self);
    }
});

require.register("famous_modules/famous/polyfills/_git_master/functionPrototypeBind.js", function(exports, require, module) {
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }
            var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function() {}, fBound = function() {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
            };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
    }
});

require.register("famous_modules/famous/polyfills/_git_master/requestAnimationFrame.js", function(exports, require, module) {
    // adds requestAnimationFrame functionality
    // Source: http://strd6.com/2011/05/better-window-requestanimationframe-shim/
    window.requestAnimationFrame || (window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
        return window.setTimeout(function() {
            callback(+new Date());
        }, 1e3 / 60);
    });
});

require.register("famous_modules/famous/entity/_git_master/index.js", function(exports, require, module) {
    /**
     * @class Entity.
     * @description A singleton class that maintains a 
     *    global registry of rendered surfaces
     * @name Entity
     * 
     */
    var entities = [];
    function register(entity) {
        var id = entities.length;
        set(id, entity);
        return id;
    }
    function get(id) {
        return entities[id];
    }
    function set(id, entity) {
        entities[id] = entity;
    }
    module.exports = {
        register: register,
        get: get,
        set: set
    };
});

require.register("famous_modules/famous/event-handler/_git_master/index.js", function(exports, require, module) {
    /**
     * @class EventHandler 
     * @description This object gives the user the opportunity to explicitly 
     *   control event propagation in their application. EventHandler forwards received events to a set of 
     *   provided callback functions. It allows events to be captured, processed,
     *   and optionally piped through to other event handlers.
     *
     * @name EventHandler
     * @constructor
     * 
     * @example
     *   var Engine = require('famous/Engine');
     *   var Surface = require('famous/Surface');
     *   var EventHandler = require('famous/EventHandler');
     *
     *   var Context = Engine.createContext();
     *
     *   var surface = new Surface({
     *       size: [200,200],
     *       properties: {
     *           backgroundColor: '#3cf'
     *       },
     *       content: 'test'
     *   });
     *
     *   eventListener = new EventHandler();
     *   surface.pipe(eventListener);
     *
     *   Context.add(surface);
     *
     *   eventInput.on('click', function(){
     *     alert('received click');
     *   });
     * 
     */
    function EventHandler() {
        this.listeners = {};
        this.downstream = [];
        // downstream event handlers
        this.downstreamFn = [];
        // downstream functions
        this.upstream = [];
        // upstream event handlers
        this.upstreamListeners = {};
        // upstream listeners
        this.owner = this;
    }
    /**
     * Send event data to all handlers matching provided 'type' key. If handler 
     *    is not set to "capture", pass on to any next handlers also. Event's 
     *    "origin" field is set to this object if not yet set.
     *
     * @name EventHandler#emit
     * @function
     * @param {string} type event type key (for example, 'click')
     * @param {Object} event received event data
     * @returns {boolean} true if this event has been handled by any handler
     */
    EventHandler.prototype.emit = function(type, event) {
        if (!event) event = {};
        var handlers = this.listeners[type];
        var handled = false;
        if (handlers) {
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i].call(this.owner, event)) handled = true;
            }
        }
        return _emitNext.call(this, type, event) || handled;
    };
    /**
     * Send event data to downstream handlers responding to this event type.
     *
     * @name _emitNext
     * @function
     * @private
     * @param {string} type event type key (for example, 'click')
     * @param {Object} event received event data
     * @returns {boolean} true if this event has been handled by any 
     *   downstream handler
     */
    function _emitNext(type, event) {
        var handled = false;
        for (var i = 0; i < this.downstream.length; i++) {
            handled = this.downstream[i].emit(type, event) || handled;
        }
        for (var i = 0; i < this.downstreamFn.length; i++) {
            handled = this.downstreamFn[i](type, event) || handled;
        }
        return handled;
    }
    /**
     * Add handler function to set of callback functions for the provided 
     *   event type.  
     *   The handler will receive the original emitted event data object
     *   as its sole argument.
     * 
     * @name EventHandler#on
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param  {function(string, Object)} handler handler function
     * @returns {EventHandler} this
     */
    EventHandler.prototype.on = function(type, handler) {
        if (!(type in this.listeners)) {
            this.listeners[type] = [];
            var upstreamListener = this.emit.bind(this, type);
            this.upstreamListeners[type] = upstreamListener;
            for (var i = 0; i < this.upstream.length; i++) {
                this.upstream[i].on(type, upstreamListener);
            }
        }
        var index = this.listeners[type].indexOf(handler);
        if (index < 0) this.listeners[type].push(handler);
        return this;
    };
    /**
     * Remove handler function from set of callback functions for the provided 
     *   event type. 
     * Undoes work of {@link EventHandler#on}
     * 
     * @name EventHandler#unbind
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param  {function(string, Object)} handler
     */
    EventHandler.prototype.unbind = function(type, handler) {
        var index = this.listeners[type].indexOf(handler);
        if (index >= 0) this.listeners[type].splice(index, 1);
    };
    /** 
     * Add handler object to set of DOWNSTREAM handlers.
     * 
     * @name EventHandler#pipe
     * @function
     * @param {emitterObject} target target emitter object
     */
    EventHandler.prototype.pipe = function(target) {
        if (target.subscribe instanceof Function) return target.subscribe(this);
        var downstreamCtx = target instanceof Function ? this.downstreamFn : this.downstream;
        var index = downstreamCtx.indexOf(target);
        if (index < 0) downstreamCtx.push(target);
        if (target instanceof Function) target("pipe"); else target.emit && target.emit("pipe");
        return target;
    };
    /**
     * Remove handler object from set of DOWNSTREAM handlers.
     * Undoes work of {@link EventHandler#pipe}
     * 
     * @name EventHandler#unpipe
     * @function
     * @param {emitterObject} target target emitter object
     */
    EventHandler.prototype.unpipe = function(target) {
        if (target.unsubscribe instanceof Function) return target.unsubscribe(this);
        var downstreamCtx = target instanceof Function ? this.downstreamFn : this.downstream;
        var index = downstreamCtx.indexOf(target);
        if (index >= 0) {
            downstreamCtx.splice(index, 1);
            if (target instanceof Function) target("unpipe"); else target.emit && target.emit("unpipe");
            return target;
        } else return false;
    };
    /**
     * Automatically listen to events from an UPSTREAM event handler
     *
     * @name EventHandler#subscribe
     * @function
     * @param {emitterObject} source source emitter object
     */
    EventHandler.prototype.subscribe = function(source) {
        var index = this.upstream.indexOf(source);
        if (index < 0) {
            this.upstream.push(source);
            for (var type in this.upstreamListeners) {
                source.on(type, this.upstreamListeners[type]);
            }
        }
        return this;
    };
    /**
     * Stop listening to events from an UPSTREAM event handler
     *
     * @name EventHandler#unsubscribe
     * @function
     * @param {emitterObject} source source emitter object
     */
    EventHandler.prototype.unsubscribe = function(source) {
        var index = this.upstream.indexOf(source);
        if (index >= 0) {
            this.upstream.splice(index, 1);
            for (var type in this.upstreamListeners) {
                source.unbind(type, this.upstreamListeners[type]);
            }
        }
        return this;
    };
    /**
     * Call event handlers with this set to owner
     *
     * @name EventHandler#bindThis
     * @function
     * @param {Object} owner object this EventHandler belongs to
     */
    EventHandler.prototype.bindThis = function(owner) {
        this.owner = owner;
    };
    /**
     * Assign an event handler to receive an object's events. 
     *
     * @name EventHandler#setInputHandler
     * @static
     * @function
     * @param {Object} object object to mix in emit function
     * @param {emitterObject} handler assigned event handler
     */
    EventHandler.setInputHandler = function(object, handler) {
        object.emit = handler.emit.bind(handler);
        if (handler.subscribe && handler.unsubscribe) {
            object.subscribe = handler.subscribe.bind(handler);
            object.unsubscribe = handler.unsubscribe.bind(handler);
        }
    };
    /**
     * Assign an event handler to emit an object's events
     *
     * @name EventHandler#setOutputHandler
     * @static
     * @function
     * @param {Object} object object to mix in pipe/unpipe/on/unbind functions
     * @param {emitterObject} handler assigned event emitter
     */
    EventHandler.setOutputHandler = function(object, handler) {
        if (handler instanceof EventHandler) handler.bindThis(object);
        object.pipe = handler.pipe.bind(handler);
        object.unpipe = handler.unpipe.bind(handler);
        object.on = handler.on.bind(handler);
        object.unbind = handler.unbind.bind(handler);
    };
    module.exports = EventHandler;
});

require.register("famous_modules/famous/options-manager/_git_master/index.js", function(exports, require, module) {
    var EventHandler = require("famous/event-handler");
    /**
     * @class OptionsManager
     * @description 
     *   A collection of methods for setting options which can be extended
     *   onto other classes
     *
     * @name OptionsManager
     * @constructor
     *
     *  **** WARNING **** 
     *  You can only pass through objects that will compile into valid JSON. 
     *
     *  Valid options: 
     *      Strings,
     *      Arrays,
     *      Objects,
     *      Numbers,
     *      Nested Objects,
     *      Nested Arrays
     *
     *  This excludes: 
     *      Document Fragments,
     *      Functions
     */
    function OptionsManager(value) {
        this._value = value;
        this.eventOutput = null;
    }
    OptionsManager.patch = function(source, patch) {
        var manager = new OptionsManager(source);
        for (var i = 1; i < arguments.length; i++) manager.patch(arguments[i]);
        return source;
    };
    function _createEventOutput() {
        this.eventOutput = new EventHandler();
        this.eventOutput.bindThis(this);
        EventHandler.setOutputHandler(this, this.eventOutput);
    }
    OptionsManager.prototype.patch = function() {
        var myState = this._value;
        for (var i = 0; i < arguments.length; i++) {
            var patch = arguments[i];
            for (var k in patch) {
                if (k in myState && patch[k] && patch[k].constructor === Object && myState[k] && myState[k].constructor === Object) {
                    if (!myState.hasOwnProperty(k)) myState[k] = Object.create(myState[k]);
                    this.key(k).patch(patch[k]);
                    if (this.eventOutput) this.eventOutput.emit("change", {
                        id: k,
                        value: this.key(k).value()
                    });
                } else this.set(k, patch[k]);
            }
        }
        return this;
    };
    OptionsManager.prototype.setOptions = OptionsManager.prototype.patch;
    OptionsManager.prototype.key = function(key) {
        var result = new OptionsManager(this._value[key]);
        if (!(result._value instanceof Object) || result._value instanceof Array) result._value = {};
        return result;
    };
    OptionsManager.prototype.get = function(key) {
        return this._value[key];
    };
    OptionsManager.prototype.getOptions = OptionsManager.prototype.get;
    OptionsManager.prototype.set = function(key, value) {
        var originalValue = this.get(key);
        this._value[key] = value;
        if (this.eventOutput && value !== originalValue) this.eventOutput.emit("change", {
            id: key,
            value: value
        });
        return this;
    };
    OptionsManager.prototype.value = function() {
        return this._value;
    };
    /* These will be overridden once this.eventOutput is created */
    OptionsManager.prototype.on = function() {
        _createEventOutput.call(this);
        return this.on.apply(this, arguments);
    };
    OptionsManager.prototype.unbind = function() {
        _createEventOutput.call(this);
        return this.unbind.apply(this, arguments);
    };
    OptionsManager.prototype.pipe = function() {
        _createEventOutput.call(this);
        return this.pipe.apply(this, arguments);
    };
    OptionsManager.prototype.unpipe = function() {
        _createEventOutput.call(this);
        return this.unpipe.apply(this, arguments);
    };
    module.exports = OptionsManager;
});

require.register("famous_modules/famous/element-allocator/_git_master/index.js", function(exports, require, module) {
    /**
     * @class Helper object to {@link Context} that handles the process of 
     *   creating and allocating DOM elements within a managed div.  
     * @description
     * @name ElementAllocator
     * @constructor
     * 
     */
    function ElementAllocator(container) {
        if (!container) container = document.createDocumentFragment();
        this.container = container;
        this.detachedNodes = {};
        this.nodeCount = 0;
    }
    ElementAllocator.prototype.migrate = function(container) {
        var oldContainer = this.container;
        if (container === oldContainer) return;
        if (oldContainer instanceof DocumentFragment) {
            container.appendChild(oldContainer);
        } else {
            while (oldContainer.hasChildNodes()) {
                container.appendChild(oldContainer.removeChild(oldContainer.firstChild));
            }
        }
        this.container = container;
    };
    ElementAllocator.prototype.allocate = function(type) {
        type = type.toLowerCase();
        if (!(type in this.detachedNodes)) this.detachedNodes[type] = [];
        var nodeStore = this.detachedNodes[type];
        var result;
        if (nodeStore.length > 0) {
            result = nodeStore.pop();
        } else {
            result = document.createElement(type);
            this.container.appendChild(result);
        }
        this.nodeCount++;
        return result;
    };
    ElementAllocator.prototype.deallocate = function(element) {
        var nodeType = element.nodeName.toLowerCase();
        var nodeStore = this.detachedNodes[nodeType];
        nodeStore.push(element);
        this.nodeCount--;
    };
    ElementAllocator.prototype.getNodeCount = function() {
        return this.nodeCount;
    };
    module.exports = ElementAllocator;
});

require.register("famous_modules/famous/transform/_git_master/index.js", function(exports, require, module) {
    /**
     * @namespace Matrix
     * 
     * @description 
     *  * A high-performance matrix math library used to calculate 
     *   affine transforms on surfaces and other renderables.
     *   Famous uses 4x4 matrices corresponding directly to
     *   WebKit matrices (column-major order)
     *    
     *    The internal "type" of a Matrix is a 16-long float array in 
     *    row-major order, with:
     *      * elements [0],[1],[2],[4],[5],[6],[8],[9],[10] forming the 3x3
     *          transformation matrix
     *      * elements [12], [13], [14] corresponding to the t_x, t_y, t_z 
     *          affine translation.
     *      * element [15] always set to 1.
     * 
     * Scope: Ideally, none of these functions should be visible below the 
     * component developer level.
     *
     * @static
     * 
     * @name Matrix
     */
    var Transform = {};
    // WARNING: these matrices correspond to WebKit matrices, which are
    //    transposed from their math counterparts
    Transform.precision = 1e-6;
    Transform.identity = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
    /**
     * Multiply two or more Matrix types to return a Matrix.
     *
     * @name Matrix#multiply4x4
     * @function
     * @param {Transform} a left matrix
     * @param {Transform} b right matrix
     * @returns {Transform} the resulting matrix
     */
    Transform.multiply4x4 = function multiply4x4(a, b) {
        var result = [ a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3], a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3], a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3], a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3], a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7], a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7], a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7], a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7], a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11], a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11], a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11], a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11], a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15], a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15], a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15], a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15] ];
        if (arguments.length <= 2) return result; else return multiply4x4.apply(null, [ result ].concat(Array.prototype.slice.call(arguments, 2)));
    };
    /**
     * Fast-multiply two or more Matrix types to return a
     *    Matrix, assuming bottom row on each is [0 0 0 1].
     *    
     * @name Matrix#multiply
     * @function
     * @param {Transform} a left matrix
     * @param {Transform} b right matrix
     * @returns {Transform} the resulting matrix
     */
    Transform.multiply = function multiply(a, b) {
        if (!a || !b) return a || b;
        var result = [ a[0] * b[0] + a[4] * b[1] + a[8] * b[2], a[1] * b[0] + a[5] * b[1] + a[9] * b[2], a[2] * b[0] + a[6] * b[1] + a[10] * b[2], 0, a[0] * b[4] + a[4] * b[5] + a[8] * b[6], a[1] * b[4] + a[5] * b[5] + a[9] * b[6], a[2] * b[4] + a[6] * b[5] + a[10] * b[6], 0, a[0] * b[8] + a[4] * b[9] + a[8] * b[10], a[1] * b[8] + a[5] * b[9] + a[9] * b[10], a[2] * b[8] + a[6] * b[9] + a[10] * b[10], 0, a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12], a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13], a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14], 1 ];
        if (arguments.length <= 2) return result; else return multiply.apply(null, [ result ].concat(Array.prototype.slice.call(arguments, 2)));
    };
    /**
     * Return a Matrix translated by additional amounts in each
     *    dimension. This is equivalent to the result of
     *   
     *    Matrix.multiply(Matrix.translate(t[0], t[1], t[2]), m)
     *    
     * @name Matrix#move
     * @function
     * @param {Transform} m a matrix
     * @param {Array.<number>} t delta vector (array of floats && 
     *    array.length == 2 || 3)
     * @returns {Transform} the resulting translated matrix
     */
    Transform.move = function(m, t) {
        if (!t[2]) t[2] = 0;
        return [ m[0], m[1], m[2], 0, m[4], m[5], m[6], 0, m[8], m[9], m[10], 0, m[12] + t[0], m[13] + t[1], m[14] + t[2], 1 ];
    };
    /**
     * Return a Matrix which represents the result of a transform matrix
     *    applied after a move. This is faster than the equivalent multiply.
     *    This is equivalent to the result of
     *
     *    Matrix.multiply(m, Matrix.translate(t[0], t[1], t[2]))
     * 
     * @name Matrix#moveThen
     * @function
     *
     * @param {Array.number} v vector representing initial movement
     * @param {Transform} m matrix to apply afterwards
     * @returns {Transform} the resulting matrix
     */
    Transform.moveThen = function(v, m) {
        if (!v[2]) v[2] = 0;
        var t0 = v[0] * m[0] + v[1] * m[4] + v[2] * m[8];
        var t1 = v[0] * m[1] + v[1] * m[5] + v[2] * m[9];
        var t2 = v[0] * m[2] + v[1] * m[6] + v[2] * m[10];
        return Transform.move(m, [ t0, t1, t2 ]);
    };
    /**
     * Return a Matrix which represents a translation by specified
     *    amounts in each dimension.
     *    
     * @name Matrix#translate
     * @function
     * @param {number} x x translation (delta_x)
     * @param {number} y y translation (delta_y)
     * @param {number} z z translation (delta_z)
     * @returns {Transform} the resulting matrix
     */
    Transform.translate = function(x, y, z) {
        if (z === undefined) z = 0;
        return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1 ];
    };
    /**
     * Return a Matrix which represents a scale by specified amounts
     *    in each dimension.
     *    
     * @name Matrix#scale
     * @function  
     *
     * @param {number} x x scale factor
     * @param {number} y y scale factor
     * @param {number} z z scale factor
     * @returns {Transform} the resulting matrix
     */
    Transform.scale = function(x, y, z) {
        if (z === undefined) z = 1;
        return [ x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1 ];
    };
    /**
     * Return a Matrix which represents a specified clockwise
     *    rotation around the x axis.
     *    
     * @name Matrix#rotateX
     * @function
     *
     * @param {number} theta radians
     * @returns {Transform} the resulting matrix
     */
    Transform.rotateX = function(theta) {
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        return [ 1, 0, 0, 0, 0, cosTheta, sinTheta, 0, 0, -sinTheta, cosTheta, 0, 0, 0, 0, 1 ];
    };
    /**
     * Return a Matrix which represents a specified clockwise
     *    rotation around the y axis.
     *    
     * @name Matrix#rotateY
     * @function
     *
     * @returns {Transform} the resulting matrix
     */
    Transform.rotateY = function(theta) {
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        return [ cosTheta, 0, -sinTheta, 0, 0, 1, 0, 0, sinTheta, 0, cosTheta, 0, 0, 0, 0, 1 ];
    };
    /**
     * Return a Matrix which represents a specified clockwise
     *    rotation around the z axis.
     *    
     * @name Matrix#rotateZ
     * @function
     *
     * @param {number} theta radians
     * @returns {Transform} the resulting matrix
     */
    Transform.rotateZ = function(theta) {
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        return [ cosTheta, sinTheta, 0, 0, -sinTheta, cosTheta, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
    };
    /**
     * Return a Matrix which represents composed clockwise
     *    rotations along each of the axes. Equivalent to the result of
     *    multiply(rotateX(phi), rotateY(theta), rotateZ(psi))
     *    
     * @name Matrix#rotate
     * @function
     *
     * @param {number} phi radians to rotate about the positive x axis
     * @param {number} theta radians to rotate about the positive y axis
     * @param {number} psi radians to rotate about the positive z axis
     * @returns {Transform} the resulting matrix
     */
    Transform.rotate = function(phi, theta, psi) {
        var cosPhi = Math.cos(phi);
        var sinPhi = Math.sin(phi);
        var cosTheta = Math.cos(theta);
        var sinTheta = Math.sin(theta);
        var cosPsi = Math.cos(psi);
        var sinPsi = Math.sin(psi);
        var result = [ cosTheta * cosPsi, cosPhi * sinPsi + sinPhi * sinTheta * cosPsi, sinPhi * sinPsi - cosPhi * sinTheta * cosPsi, 0, -cosTheta * sinPsi, cosPhi * cosPsi - sinPhi * sinTheta * sinPsi, sinPhi * cosPsi + cosPhi * sinTheta * sinPsi, 0, sinTheta, -sinPhi * cosTheta, cosPhi * cosTheta, 0, 0, 0, 0, 1 ];
        return result;
    };
    /**
     * Return a Matrix which represents an axis-angle rotation
     *
     * @name Matrix#rotateAxis
     * @function
     *
     * @param {Array.number} v unit vector representing the axis to rotate about
     * @param {number} theta radians to rotate clockwise about the axis
     * @returns {Transform} the resulting matrix
     */
    Transform.rotateAxis = function(v, theta) {
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        var verTheta = 1 - cosTheta;
        // versine of theta
        var xxV = v[0] * v[0] * verTheta;
        var xyV = v[0] * v[1] * verTheta;
        var xzV = v[0] * v[2] * verTheta;
        var yyV = v[1] * v[1] * verTheta;
        var yzV = v[1] * v[2] * verTheta;
        var zzV = v[2] * v[2] * verTheta;
        var xs = v[0] * sinTheta;
        var ys = v[1] * sinTheta;
        var zs = v[2] * sinTheta;
        var result = [ xxV + cosTheta, xyV + zs, xzV - ys, 0, xyV - zs, yyV + cosTheta, yzV + xs, 0, xzV + ys, yzV - xs, zzV + cosTheta, 0, 0, 0, 0, 1 ];
        return result;
    };
    /**
     * Return a Matrix which represents a transform matrix applied about
     * a separate origin point.
     * 
     * @name Matrix#aboutOrigin
     * @function
     *
     * @param {Array.number} v origin point to apply matrix
     * @param {Transform} m matrix to apply
     * @returns {Transform} the resulting matrix
     */
    Transform.aboutOrigin = function(v, m) {
        var t0 = v[0] - (v[0] * m[0] + v[1] * m[4] + v[2] * m[8]);
        var t1 = v[1] - (v[0] * m[1] + v[1] * m[5] + v[2] * m[9]);
        var t2 = v[2] - (v[0] * m[2] + v[1] * m[6] + v[2] * m[10]);
        return Transform.move(m, [ t0, t1, t2 ]);
    };
    /**
     * Return a Matrix's webkit css representation to be used with the
     *    CSS3 -webkit-transform style. 
     * @example: -webkit-transform: matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,716,243,0,1)
     *
     * @name Matrix#formatCSS
     * @function
     * 
     * @param {Transform} m a Famous matrix
     * @returns {string} matrix3d CSS style representation of the transform
     */
    Transform.formatCSS = function(m) {
        var result = "matrix3d(";
        for (var i = 0; i < 15; i++) {
            result += m[i] < 1e-6 && m[i] > -1e-6 ? "0," : m[i] + ",";
        }
        result += m[15] + ")";
        return result;
    };
    /**
     * Return a Matrix representation of a skew transformation
     *
     * @name Matrix#skew
     * @function
     * 
     * @param {number} psi radians skewed about the yz plane
     * @param {number} theta radians skewed about the xz plane
     * @param {number} phi radians skewed about the xy plane
     * @returns {Transform} the resulting matrix
     */
    Transform.skew = function(phi, theta, psi) {
        return [ 1, 0, 0, 0, Math.tan(psi), 1, 0, 0, Math.tan(theta), Math.tan(phi), 1, 0, 0, 0, 0, 1 ];
    };
    /**
     * Returns a perspective matrix
     *
     * @name Matrix#perspective
     * @function
     *
     * @param {number} focusZ z position of focal point
     * @returns {Transform} the resulting matrix
     */
    Transform.perspective = function(focusZ) {
        return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -1 / focusZ, 0, 0, 0, 1 ];
    };
    /**
     * Return translation vector component of given Matrix
     * 
     * @name Matrix#getTranslate
     * @function
     *
     * @param {Transform} m matrix
     * @returns {Array.<number>} the translation vector [t_x, t_y, t_z]
     */
    Transform.getTranslate = function(m) {
        return [ m[12], m[13], m[14] ];
    };
    /**
     * Return inverse affine matrix for given Matrix. 
     * Note: This assumes m[3] = m[7] = m[11] = 0, and m[15] = 1. 
     *       Incorrect results if not invertable or preconditions not met.
     *
     * @name Matrix#inverse
     * @function
     * 
     * @param {Transform} m matrix
     * @returns {Transform} the resulting inverted matrix
     */
    Transform.inverse = function(m) {
        var result = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ];
        // only need to consider 3x3 section for affine
        var c0 = m[5] * m[10] - m[6] * m[9];
        var c1 = m[4] * m[10] - m[6] * m[8];
        var c2 = m[4] * m[9] - m[5] * m[8];
        var c4 = m[1] * m[10] - m[2] * m[9];
        var c5 = m[0] * m[10] - m[2] * m[8];
        var c6 = m[0] * m[9] - m[1] * m[8];
        var c8 = m[1] * m[6] - m[2] * m[5];
        var c9 = m[0] * m[6] - m[2] * m[4];
        var c10 = m[0] * m[5] - m[1] * m[4];
        var detM = m[0] * c0 - m[1] * c1 + m[2] * c2;
        var invD = 1 / detM;
        var result = [ invD * c0, -invD * c4, invD * c8, 0, -invD * c1, invD * c5, -invD * c9, 0, invD * c2, -invD * c6, invD * c10, 0, 0, 0, 0, 1 ];
        result[12] = -m[12] * result[0] - m[13] * result[4] - m[14] * result[8];
        result[13] = -m[12] * result[1] - m[13] * result[5] - m[14] * result[9];
        result[14] = -m[12] * result[2] - m[13] * result[6] - m[14] * result[10];
        return result;
    };
    /**
     * Returns the transpose of a 4x4 matrix
     *
     * @name Matrix#inverse
     * @function
     * 
     * @param {Transform} m matrix
     * @returns {Transform} the resulting transposed matrix
     */
    Transform.transpose = function(m) {
        return [ m[0], m[4], m[8], m[12], m[1], m[5], m[9], m[13], m[2], m[6], m[10], m[14], m[3], m[7], m[11], m[15] ];
    };
    /**
     * Decompose Matrix into separate .translate, .rotate, .scale,
     *    .skew components.
     *    
     * @name Matrix#interpret
     * @function
     *
     * @param {Matrix} M matrix
     * @returns {matrixSpec} object with component matrices .translate,
     *    .rotate, .scale, .skew
     */
    function _normSquared(v) {
        return v.length === 2 ? v[0] * v[0] + v[1] * v[1] : v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    }
    function _norm(v) {
        return Math.sqrt(_normSquared(v));
    }
    function _sign(n) {
        return n < 0 ? -1 : 1;
    }
    Transform.interpret = function(M) {
        // QR decomposition via Householder reflections
        //FIRST ITERATION
        //default Q1 to the identity matrix;
        var x = [ M[0], M[1], M[2] ];
        // first column vector
        var sgn = _sign(x[0]);
        // sign of first component of x (for stability)
        var xNorm = _norm(x);
        // norm of first column vector
        var v = [ x[0] + sgn * xNorm, x[1], x[2] ];
        // v = x + sign(x[0])|x|e1
        var mult = 2 / _normSquared(v);
        // mult = 2/v'v
        //bail out if our Matrix is singular
        if (mult >= Infinity) {
            return {
                translate: Transform.getTranslate(M),
                rotate: [ 0, 0, 0 ],
                scale: [ 0, 0, 0 ],
                skew: [ 0, 0, 0 ]
            };
        }
        //evaluate Q1 = I - 2vv'/v'v
        var Q1 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ];
        //diagonals
        Q1[0] = 1 - mult * v[0] * v[0];
        // 0,0 entry
        Q1[5] = 1 - mult * v[1] * v[1];
        // 1,1 entry
        Q1[10] = 1 - mult * v[2] * v[2];
        // 2,2 entry
        //upper diagonal
        Q1[1] = -mult * v[0] * v[1];
        // 0,1 entry
        Q1[2] = -mult * v[0] * v[2];
        // 0,2 entry
        Q1[6] = -mult * v[1] * v[2];
        // 1,2 entry
        //lower diagonal
        Q1[4] = Q1[1];
        // 1,0 entry
        Q1[8] = Q1[2];
        // 2,0 entry
        Q1[9] = Q1[6];
        // 2,1 entry
        //reduce first column of M
        var MQ1 = Transform.multiply(Q1, M);
        //SECOND ITERATION on (1,1) minor
        var x2 = [ MQ1[5], MQ1[6] ];
        var sgn2 = _sign(x2[0]);
        // sign of first component of x (for stability)
        var x2Norm = _norm(x2);
        // norm of first column vector
        var v2 = [ x2[0] + sgn2 * x2Norm, x2[1] ];
        // v = x + sign(x[0])|x|e1
        var mult2 = 2 / _normSquared(v2);
        // mult = 2/v'v
        //evaluate Q2 = I - 2vv'/v'v
        var Q2 = [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ];
        //diagonal
        Q2[5] = 1 - mult2 * v2[0] * v2[0];
        // 1,1 entry
        Q2[10] = 1 - mult2 * v2[1] * v2[1];
        // 2,2 entry
        //off diagonals
        Q2[6] = -mult2 * v2[0] * v2[1];
        // 2,1 entry
        Q2[9] = Q2[6];
        // 1,2 entry
        //calc QR decomposition. Q = Q1*Q2, R = Q'*M
        var Q = Transform.multiply(Q2, Q1);
        //note: really Q transpose
        var R = Transform.multiply(Q, M);
        //remove negative scaling
        var remover = Transform.scale(R[0] < 0 ? -1 : 1, R[5] < 0 ? -1 : 1, R[10] < 0 ? -1 : 1);
        R = Transform.multiply(R, remover);
        Q = Transform.multiply(remover, Q);
        //decompose into rotate/scale/skew matrices
        var result = {};
        result.translate = Transform.getTranslate(M);
        result.rotate = [ Math.atan2(-Q[6], Q[10]), Math.asin(Q[2]), Math.atan2(-Q[1], Q[0]) ];
        if (!result.rotate[0]) {
            result.rotate[0] = 0;
            result.rotate[2] = Math.atan2(Q[4], Q[5]);
        }
        result.scale = [ R[0], R[5], R[10] ];
        result.skew = [ Math.atan2(R[9], result.scale[2]), Math.atan2(R[8], result.scale[2]), Math.atan2(R[4], result.scale[0]) ];
        //double rotation workaround
        if (Math.abs(result.rotate[0]) + Math.abs(result.rotate[2]) > 1.5 * Math.PI) {
            result.rotate[1] = Math.PI - result.rotate[1];
            if (result.rotate[1] > Math.PI) result.rotate[1] -= 2 * Math.PI;
            if (result.rotate[1] < -Math.PI) result.rotate[1] += 2 * Math.PI;
            if (result.rotate[0] < 0) result.rotate[0] += Math.PI; else result.rotate[0] -= Math.PI;
            if (result.rotate[2] < 0) result.rotate[2] += Math.PI; else result.rotate[2] -= Math.PI;
        }
        return result;
    };
    /**
     * Weighted average between two matrices by averaging their
     *     translation, rotation, scale, skew components.
     *     f(M1,M2,t) = (1 - t) * M1 + t * M2
     *
     * @name Matrix#average
     * @function
     *
     * @param {Transform} M1 f(M1,M2,0) = M1
     * @param {Transform} M2 f(M1,M2,1) = M2
     * @param {number} t
     * @returns {Transform}
     */
    Transform.average = function(M1, M2, t) {
        t = t === undefined ? .5 : t;
        var specM1 = Transform.interpret(M1);
        var specM2 = Transform.interpret(M2);
        var specAvg = {
            translate: [ 0, 0, 0 ],
            rotate: [ 0, 0, 0 ],
            scale: [ 0, 0, 0 ],
            skew: [ 0, 0, 0 ]
        };
        for (var i = 0; i < 3; i++) {
            specAvg.translate[i] = (1 - t) * specM1.translate[i] + t * specM2.translate[i];
            specAvg.rotate[i] = (1 - t) * specM1.rotate[i] + t * specM2.rotate[i];
            specAvg.scale[i] = (1 - t) * specM1.scale[i] + t * specM2.scale[i];
            specAvg.skew[i] = (1 - t) * specM1.skew[i] + t * specM2.skew[i];
        }
        return Transform.build(specAvg);
    };
    /**
     * Compose .translate, .rotate, .scale, .skew components into into
     *    Matrix
     *    
     * @name Matrix#build
     * @function
     *
     * @param {matrixSpec} spec object with component matrices .translate,
     *    .rotate, .scale, .skew
     * @returns {Transform} composed martix
     */
    Transform.build = function(spec) {
        var scaleMatrix = Transform.scale(spec.scale[0], spec.scale[1], spec.scale[2]);
        var skewMatrix = Transform.skew(spec.skew[0], spec.skew[1], spec.skew[2]);
        var rotateMatrix = Transform.rotate(spec.rotate[0], spec.rotate[1], spec.rotate[2]);
        return Transform.move(Transform.multiply(rotateMatrix, skewMatrix, scaleMatrix), spec.translate);
    };
    /**
     * Determine if two affine Transforms are component-wise equal
     * Warning: breaks on perspective Transforms
     * 
     * @name Transform#equals
     * @function
     * 
     * @param {Transform} a matrix
     * @param {Transform} b matrix
     * @returns {boolean} 
     */
    Transform.equals = function(a, b) {
        return !Transform.notEquals(a, b);
    };
    /**
     * Determine if two affine Transforms are component-wise unequal
     * Warning: breaks on perspective Transforms
     *
     * @name Transform#notEquals
     * @name function
     *
     * @param {Transform} a matrix
     * @param {Transform} b matrix
     * @returns {boolean} 
     */
    Transform.notEquals = function(a, b) {
        if (a === b) return false;
        if (!(a && b)) return true;
        // shortci
        return !(a && b) || a[12] !== b[12] || a[13] !== b[13] || a[14] !== b[14] || a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2] || a[4] !== b[4] || a[5] !== b[5] || a[6] !== b[6] || a[8] !== b[8] || a[9] !== b[9] || a[10] !== b[10];
    };
    /**
     * Constrain angle-trio components to range of [-pi, pi).
     *
     * @name Matrix#normalizeRotation
     * @function
     * 
     * @param {Array.<number>} rotation phi, theta, psi (array of floats 
     *    && array.length == 3)
     * @returns {Array.<number>} new phi, theta, psi triplet
     *    (array of floats && array.length == 3)
     */
    Transform.normalizeRotation = function(rotation) {
        var result = rotation.slice(0);
        if (result[0] == Math.PI / 2 || result[0] == -Math.PI / 2) {
            result[0] = -result[0];
            result[1] = Math.PI - result[1];
            result[2] -= Math.PI;
        }
        if (result[0] > Math.PI / 2) {
            result[0] = result[0] - Math.PI;
            result[1] = Math.PI - result[1];
            result[2] -= Math.PI;
        }
        if (result[0] < -Math.PI / 2) {
            result[0] = result[0] + Math.PI;
            result[1] = -Math.PI - result[1];
            result[2] -= Math.PI;
        }
        while (result[1] < -Math.PI) result[1] += 2 * Math.PI;
        while (result[1] >= Math.PI) result[1] -= 2 * Math.PI;
        while (result[2] < -Math.PI) result[2] += 2 * Math.PI;
        while (result[2] >= Math.PI) result[2] -= 2 * Math.PI;
        return result;
    };
    module.exports = Transform;
});

require.register("famous_modules/famous/surface/_git_master/index.js", function(exports, require, module) {
    var Entity = require("famous/entity");
    var EventHandler = require("famous/event-handler");
    var Transform = require("famous/transform");
    var usePrefix = document.body.style.webkitTransform !== undefined;
    /**
     * @class Surface
     * @description A base class for viewable content and event
     *    targets inside a Famous applcation, containing a renderable document
     *    fragment. Like an HTML div, it can accept internal markup,
     *    properties, classes, and handle events. This is a public
     *    interface and can be extended.
     * 
     * @name Surface
     * @constructor
     * 
     * @param {Array.<number>} size Width and height in absolute pixels (array of ints)
     * @param {string} content Document content (e.g. HTML) managed by this
     *    surface.
     */
    function Surface(options) {
        this.options = {};
        this.properties = {};
        this.content = "";
        this.classList = [];
        this.size = undefined;
        this._classesDirty = true;
        this._stylesDirty = true;
        this._sizeDirty = true;
        this._contentDirty = true;
        this._dirtyClasses = [];
        this._matrix = undefined;
        this._opacity = 1;
        this._origin = undefined;
        this._size = undefined;
        /** @ignore */
        this.eventForwarder = function(event) {
            this.emit(event.type, event);
        }.bind(this);
        this.eventHandler = new EventHandler();
        this.eventHandler.bindThis(this);
        this.id = Entity.register(this);
        if (options) this.setOptions(options);
        this._currTarget = undefined;
    }
    Surface.prototype.elementType = "div";
    Surface.prototype.elementClass = "famous-surface";
    /**
     * Bind a handler function to occurrence of event type on this surface.
     *   Document events have the opportunity to first be intercepted by the 
     *   on() method of the Surface upon which the event occurs, then 
     *   by the on() method of the FamousContext containing that surface, and
     *   finally as a default, the FamousEngine itself.
     * 
     * @name Surface#on
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler callback
     */
    Surface.prototype.on = function(type, fn) {
        if (this._currTarget) this._currTarget.addEventListener(type, this.eventForwarder);
        this.eventHandler.on(type, fn);
    };
    /**
     * Unbind an event by type and handler.  
     *   This undoes the work of {@link Surface#on}
     * 
     * @name Surface#unbind
     * @function
     * @param {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler 
     */
    Surface.prototype.unbind = function(type, fn) {
        this.eventHandler.unbind(type, fn);
    };
    /**
     * Trigger an event, sending to all downstream handlers
     *   matching provided 'type' key.
     * 
     * @name Surface#emit
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param  {Object} event event data
     * @returns {boolean}  true if event was handled along the event chain.
     */
    Surface.prototype.emit = function(type, event) {
        if (event && !event.origin) event.origin = this;
        var handled = this.eventHandler.emit(type, event);
        if (handled && event.stopPropagation) event.stopPropagation();
        return handled;
    };
    /**
     * Pipe all events to a target {@link emittoerObject}
     *
     * @name Surface#pipe
     * @function
     * @param {emitterObject} target emitter object
     * @returns {emitterObject} target (to allow for chaining)
     */
    Surface.prototype.pipe = function(target) {
        return this.eventHandler.pipe(target);
    };
    /**
     * Stop piping all events at the FamousEngine level to a target emitter 
     *   object.  Undoes the work of #pipe.
     * 
     * @name Surface#unpipe
     * @function
     * @param {emitterObject} target emitter object
     */
    Surface.prototype.unpipe = function(target) {
        return this.eventHandler.unpipe(target);
    };
    /**
     * Return spec for this surface. Note that for a base surface, this is
     *    simply an id.
     * 
     * (Scope: Device developers and deeper)
     * @name Surface#render
     * @function
     * @returns {number} Spec for this surface (spec id)
     */
    Surface.prototype.render = function() {
        return this.id;
    };
    /**
     * Set CSS-style properties on this Surface. Note that this will cause
     *    dirtying and thus re-rendering, even if values do not change (confirm)
     *    
     * @name Surface#setProperties
     * @function
     * @param {Object} properties property dictionary of "key" => "value"
     */
    Surface.prototype.setProperties = function(properties) {
        for (var n in properties) {
            this.properties[n] = properties[n];
        }
        this._stylesDirty = true;
    };
    /**
     * Get CSS-style properties on this Surface.
     * 
     * @name Surface#getProperties
     * @function
     * @returns {Object} Dictionary of properties of this Surface.
     */
    Surface.prototype.getProperties = function() {
        return this.properties;
    };
    /**
     * Add CSS-style class to the list of classes on this Surface. Note
     *   this will map directly to the HTML property of the actual
     *   corresponding rendered <div>. 
     *   These will be deployed to the document on call to .setup().
     *    
     * @param {string} className name of class to add
     */
    Surface.prototype.addClass = function(className) {
        if (this.classList.indexOf(className) < 0) {
            this.classList.push(className);
            this._classesDirty = true;
        }
    };
    /**
     * Remove CSS-style class from the list of classes on this Surface.
     *   Note this will map directly to the HTML property of the actual
     *   corresponding rendered <div>. 
     *   These will be deployed to the document on call to #setup().
     *    
     * @name Surface#removeClass
     * @function
     * @param {string} className name of class to remove
     */
    Surface.prototype.removeClass = function(className) {
        var i = this.classList.indexOf(className);
        if (i >= 0) {
            this._dirtyClasses.push(this.classList.splice(i, 1)[0]);
            this._classesDirty = true;
        }
    };
    Surface.prototype.setClasses = function(classList) {
        var removal = [];
        for (var i = 0; i < this.classList.length; i++) {
            if (classList.indexOf(this.classList[i]) < 0) removal.push(this.classList[i]);
        }
        for (var i = 0; i < removal.length; i++) this.removeClass(removal[i]);
        // duplicates are already checked by addClass()
        for (var i = 0; i < classList.length; i++) this.addClass(classList[i]);
    };
    /**
     * Get array of CSS-style classes attached to this div.
     * 
     * @name Surface#getClasslist
     * @function
     * @returns {Array.<string>} Returns an array of classNames
     */
    Surface.prototype.getClassList = function() {
        return this.classList;
    };
    /**
     * Set or overwrite inner (HTML) content of this surface. Note that this
     *    causes a re-rendering if the content has changed.
     * 
     * @name Surface#setContent
     * @function
     *    
     * @param {string} content HTML content
     */
    Surface.prototype.setContent = function(content) {
        if (this.content != content) {
            this.content = content;
            this._contentDirty = true;
        }
    };
    /**
     * Return inner (HTML) content of this surface.
     * 
     * @name Surface#getContent
     * @function
     * 
     * @returns {string} inner (HTML) content
     */
    Surface.prototype.getContent = function() {
        return this.content;
    };
    /**
     * Set options for this surface
     *
     * @name Surface#setOptions
     * @function
     *
     * @param {Object} options options hash
     */
    Surface.prototype.setOptions = function(options) {
        if (options.size) this.setSize(options.size);
        if (options.classes) this.setClasses(options.classes);
        if (options.properties) this.setProperties(options.properties);
        if (options.content) this.setContent(options.content);
    };
    /**
     *   Attach Famous event handling to document events emanating from target
     *     document element.  This occurs just after deployment to the document.
     *     Calling this enables methods like #on and #pipe.
     *    
     * @private
     * @param {Element} target document element
     */
    function _bindEvents(target) {
        for (var i in this.eventHandler.listeners) {
            target.addEventListener(i, this.eventForwarder);
        }
    }
    /**
     *   Detach Famous event handling from document events emanating from target
     *     document element.  This occurs just before recall from the document.
     *     Calling this enables methods like #on and #pipe.
     *    
     * 
     * @name Surface#_unbindEvents
     * @function
     * @private
     * @param {Element} target document element
     */
    function _unbindEvents(target) {
        for (var i in this.eventHandler.listeners) {
            target.removeEventListener(i, this.eventForwarder);
        }
    }
    /**
     *  Apply to document all changes from #removeClass since last #setup().
     *    
     * @name Surface#_cleanupClasses
     * @function
     * @private
     * @param {Element} target document element
     */
    function _cleanupClasses(target) {
        for (var i = 0; i < this._dirtyClasses.length; i++) target.classList.remove(this._dirtyClasses[i]);
        this._dirtyClasses = [];
    }
    /**
     * Apply values of all Famous-managed styles to the document element.
     *   These will be deployed to the document on call to #setup().
     * 
     * @name Surface#_applyStyles
     * @function
     * @private
     * @param {Element} target document element
     */
    function _applyStyles(target) {
        for (var n in this.properties) {
            target.style[n] = this.properties[n];
        }
    }
    /**
     * Clear all Famous-managed styles from the document element.
     *   These will be deployed to the document on call to #setup().
     * 
     * @name Surface#_cleanupStyles
     * @function
     * @private
     * @param {Element} target document element
     */
    function _cleanupStyles(target) {
        for (var n in this.properties) {
            target.style[n] = "";
        }
    }
    var _setMatrix;
    var _setOrigin;
    var _setInvisible;
    /**
     * Directly apply given FamousMatrix to the document element as the 
     *   appropriate webkit CSS style.
     * 
     * @name SurfaceManager#setMatrix
     * @function
     * @static
     * @private
     * @param {Element} element document element
     * @param {FamousMatrix} matrix 
     */
    if (usePrefix) _setMatrix = function(element, matrix) {
        element.style.webkitTransform = Transform.formatCSS(matrix);
    }; else _setMatrix = function(element, matrix) {
        element.style.transform = Transform.formatCSS(matrix);
    };
    /**
     * Directly apply given origin coordinates to the document element as the 
     *   appropriate webkit CSS style.
     * 
     * @name SurfaceManager#setOrigin
     * @function
     * @static
     * @private
     * @param {Element} element document element
     * @param {FamousMatrix} matrix 
     */
    if (usePrefix) _setOrigin = function(element, origin) {
        element.style.webkitTransformOrigin = _formatCSSOrigin(origin);
    }; else _setOrigin = function(element, origin) {
        element.style.transformOrigin = _formatCSSOrigin(origin);
    };
    /**
     * Shrink given document element until it is effectively invisible.   
     *   This destroys any existing transform properties.  
     *   Note: Is this the ideal implementation?
     *
     * @name SurfaceManager#setInvisible
     * @function
     * @static
     * @private
     * @param {Element} element document element
     */
    if (usePrefix) _setInvisible = function(element) {
        element.style.webkitTransform = "scale3d(0.0001,0.0001,1)";
        element.style.opacity = 0;
    }; else _setInvisible = function(element) {
        element.style.transform = "scale3d(0.0001,0.0001,1)";
        element.style.opacity = 0;
    };
    function _xyNotEquals(a, b) {
        if (!(a && b)) return a !== b;
        return a[0] !== b[0] || a[1] !== b[1];
    }
    function _formatCSSOrigin(origin) {
        return (100 * origin[0]).toFixed(6) + "% " + (100 * origin[1]).toFixed(6) + "%";
    }
    /**
     * Sets up an element to be ready for commits
     *  
     * (Scope: Device developers and deeper)
     * @name Surface#setup
     * @function
     * 
     * @param {Element} target document element
     */
    Surface.prototype.setup = function(allocator) {
        var target = allocator.allocate(this.elementType);
        if (this.elementClass) {
            if (this.elementClass instanceof Array) {
                for (var i = 0; i < this.elementClass.length; i++) {
                    target.classList.add(this.elementClass[i]);
                }
            } else {
                target.classList.add(this.elementClass);
            }
        }
        _bindEvents.call(this, target);
        _setOrigin(target, [ 0, 0 ]);
        // handled internally
        this._currTarget = target;
        this._stylesDirty = true;
        this._classesDirty = true;
        this._sizeDirty = true;
        this._contentDirty = true;
        this._matrix = undefined;
        this._opacity = undefined;
        this._origin = undefined;
        this._size = undefined;
    };
    /**
     * Apply all changes stored in the Surface object to the actual element
     * This includes changes to classes, styles, size, and content, but not
     * transforms or opacities, which are managed by (@link SurfaceManager).
     * 
     * (Scope: Device developers and deeper)
     * @name Surface#commit
     * @function
     */
    Surface.prototype.commit = function(context) {
        if (!this._currTarget) this.setup(context.allocator);
        var target = this._currTarget;
        var matrix = context.transform;
        var opacity = context.opacity;
        var origin = context.origin;
        var size = context.size;
        if (this.size) {
            var origSize = size;
            size = [ this.size[0], this.size[1] ];
            if (size[0] === undefined && origSize[0]) size[0] = origSize[0];
            if (size[1] === undefined && origSize[1]) size[1] = origSize[1];
        }
        if (_xyNotEquals(this._size, size)) {
            this._size = [ size[0], size[1] ];
            this._sizeDirty = true;
        }
        if (!matrix && this._matrix) {
            this._matrix = undefined;
            this._opacity = 0;
            _setInvisible(target);
            return;
        }
        if (this._opacity !== opacity) {
            this._opacity = opacity;
            target.style.opacity = Math.min(opacity, .999999);
        }
        if (_xyNotEquals(this._origin, origin) || Transform.notEquals(this._matrix, matrix)) {
            if (!matrix) matrix = Transform.identity;
            if (!origin) origin = [ 0, 0 ];
            this._origin = [ origin[0], origin[1] ];
            this._matrix = matrix;
            var aaMatrix = matrix;
            if (origin) {
                aaMatrix = Transform.moveThen([ -this._size[0] * origin[0], -this._size[1] * origin[1] ], matrix);
            }
            _setMatrix(target, aaMatrix);
        }
        if (!(this._classesDirty || this._stylesDirty || this._sizeDirty || this._contentDirty)) return;
        if (this._classesDirty) {
            _cleanupClasses.call(this, target);
            var classList = this.getClassList();
            for (var i = 0; i < classList.length; i++) target.classList.add(classList[i]);
            this._classesDirty = false;
        }
        if (this._stylesDirty) {
            _applyStyles.call(this, target);
            this._stylesDirty = false;
        }
        if (this._sizeDirty) {
            if (this._size) {
                target.style.width = this._size[0] !== true ? this._size[0] + "px" : "";
                target.style.height = this._size[1] !== true ? this._size[1] + "px" : "";
            }
            this._sizeDirty = false;
        }
        if (this._contentDirty) {
            this.deploy(target);
            this.eventHandler.emit("deploy");
            this._contentDirty = false;
        }
    };
    /**
     *  Remove all Famous-relevant attributes from a document element.
     *    This is called by SurfaceManager's detach().
     *    This is in some sense the reverse of .deploy().
     *    Note: If you're trying to destroy a surface, don't use this. 
     *    Just remove it from the render tree.
     * 
     * (Scope: Device developers and deeper)
     * @name Surface#cleanup
     * @function
     * @param {Element} target target document element
     */
    Surface.prototype.cleanup = function(allocator) {
        var target = this._currTarget;
        this.eventHandler.emit("recall");
        this.recall(target);
        target.style.width = "";
        target.style.height = "";
        this._size = undefined;
        _cleanupStyles.call(this, target);
        var classList = this.getClassList();
        _cleanupClasses.call(this, target);
        for (var i = 0; i < classList.length; i++) target.classList.remove(classList[i]);
        if (this.elementClass) {
            if (this.elementClass instanceof Array) {
                for (var i = 0; i < this.elementClass.length; i++) {
                    target.classList.remove(this.elementClass[i]);
                }
            } else {
                target.classList.remove(this.elementClass);
            }
        }
        _unbindEvents.call(this, target);
        this._currTarget = undefined;
        allocator.deallocate(target);
        _setInvisible(target);
    };
    /**
     * Directly output this surface's fully prepared inner document content to 
     *   the provided containing parent element.
     *   This translates to innerHTML in the DOM sense.
     * 
     * (Scope: Device developers and deeper)
     * @name Surface#deploy
     * @function
     * @param {Element} target Document parent of this container
     */
    Surface.prototype.deploy = function(target) {
        var content = this.getContent();
        if (content instanceof Node) {
            while (target.hasChildNodes()) target.removeChild(target.firstChild);
            target.appendChild(content);
        } else target.innerHTML = content;
    };
    /**
     * Remove any contained document content associated with this surface 
     *   from the actual document.  
     * 
     * (Scope: Device developers and deeper)
     * @name Surface#recall
     * @function
     */
    Surface.prototype.recall = function(target) {
        var df = document.createDocumentFragment();
        while (target.hasChildNodes()) df.appendChild(target.firstChild);
        this.setContent(df);
    };
    /** 
     *  Get the x and y dimensions of the surface.  This normally returns
     *    the size of the rendered surface unless setSize() was called
     *    more recently than setup().
     * 
     * @name Surface#getSize
     * @function
     * @param {boolean} actual return actual size
     * @returns {Array.<number>} [x,y] size of surface
     */
    Surface.prototype.getSize = function(actual) {
        if (actual) return this._size; else return this.size || this._size;
    };
    /**
     * Set x and y dimensions of the surface.  This takes effect upon
     *   the next call to this.{#setup()}.
     * 
     * @name Surface#setSize
     * @function
     * @param {Array.<number>} size x,y size array
     */
    Surface.prototype.setSize = function(size) {
        this.size = size ? [ size[0], size[1] ] : undefined;
        this._sizeDirty = true;
    };
    module.exports = Surface;
});

require.register("famous_modules/famous/spec-parser/_git_master/index.js", function(exports, require, module) {
    var Transform = require("famous/transform");
    /**
     * @class SpecParser 
     * 
     * @description 
     *   This object translates the rendering instructions of type 
     *   {@link renderSpec} that {@link renderableComponent} objects generate 
     *   into direct document update instructions of type {@link updateSpec} 
     *   for the {@link SurfaceManager}.
     *   Scope: The {@link renderSpec} should be visible to component developers
     *   and deeper.  However, SpecParser This should not be visible below the 
     *   level of device developer.
     *
     * @name SpecParser
     * @constructor
     * 
     * @example 
     *   var parsedSpec = SpecParser.parse(spec);
     *   this.surfaceManager.update(parsedSpec);
     */
    function SpecParser() {
        this.reset();
    }
    /**
     * Convert a {@link renderSpec} coming from the context's render chain to an
     *    update spec for the update chain. This is the only major entrypoint
     *    for a consumer of this class. An optional callback of signature
     *    "function({@link updateSpec})" can be provided for call upon parse
     *    completion.
     *    
     * @name SpecParser#parse
     * @function
     * @static
     * 
     * @param {renderSpec} spec input render spec
     * @param {function(Object)} callback updateSpec-accepting function for 
     *   call on  completion
     * @returns {updateSpec} the resulting update spec (if no callback 
     *   specified, else none)
     */
    SpecParser.parse = function(spec, context, callback) {
        var sp = new SpecParser();
        var result = sp.parse(spec, context, Transform.identity);
        if (callback) callback(result); else return result;
    };
    /**
     * Convert a renderSpec coming from the context's render chain to an update
     *    spec for the update chain. This is the only major entrypoint for a
     *    consumer of this class.
     *    
     * @name SpecParser#parse
     * @function
     * 
     * @param {renderSpec} spec input render spec
     * @returns {updateSpec} the resulting update spec
     */
    SpecParser.prototype.parse = function(spec, context) {
        this.reset();
        this._parseSpec(spec, context, Transform.identity);
        return this.result;
    };
    /**
     * Prepare SpecParser for re-use (or first use) by setting internal state 
     *  to blank.
     *    
     * @name SpecParser#reset
     * @function
     */
    SpecParser.prototype.reset = function() {
        this.result = {};
    };
    /**
     * Transforms a delta vector to apply inside the context of another transform
     *
     * @name _vecInContext
     * @function
     * @private
     *
     * @param {Array.number} vector to apply
     * @param {FamousMatrix} matrix context 
     * @returns {Array.number} transformed delta vector
     */
    function _vecInContext(v, m) {
        return [ v[0] * m[0] + v[1] * m[4] + v[2] * m[8], v[0] * m[1] + v[1] * m[5] + v[2] * m[9], v[0] * m[2] + v[1] * m[6] + v[2] * m[10] ];
    }
    var _originZeroZero = [ 0, 0 ];
    /**
     * From the provided renderSpec tree, recursively compose opacities,
     *    origins, transforms, and groups corresponding to each surface id from
     *    the provided renderSpec tree structure. On completion, those
     *    properties of 'this' object should be ready to use to build an
     *    updateSpec.
     *    
     *    
     * @name SpecParser#_parseSpec
     * @function
     * @private
     * 
     * @param {renderSpec} spec input render spec for a node in the render tree.
     * @param {number|undefined} group group id to apply to this subtree
     * @param {FamousMatrix} parentTransform positional transform to apply to
     *    this subtree.
     * @param {origin=} parentOrigin origin behavior to apply to this subtree
     */
    SpecParser.prototype._parseSpec = function(spec, parentContext, sizeCtx) {
        if (spec === undefined) {} else if (typeof spec === "number") {
            var id = spec;
            var transform = parentContext.transform;
            if (parentContext.size && parentContext.origin && (parentContext.origin[0] || parentContext.origin[1])) {
                var originAdjust = [ parentContext.origin[0] * parentContext.size[0], parentContext.origin[1] * parentContext.size[1], 0 ];
                transform = Transform.move(transform, _vecInContext(originAdjust, sizeCtx));
            }
            this.result[id] = {
                transform: transform,
                opacity: parentContext.opacity,
                origin: parentContext.origin || _originZeroZero,
                size: parentContext.size
            };
        } else if (spec instanceof Array) {
            for (var i = 0; i < spec.length; i++) {
                this._parseSpec(spec[i], parentContext, sizeCtx);
            }
        } else if (spec.target !== undefined) {
            var target = spec.target;
            var transform = parentContext.transform;
            var opacity = parentContext.opacity;
            var origin = parentContext.origin;
            var size = parentContext.size;
            if (spec.opacity !== undefined) opacity = parentContext.opacity * spec.opacity;
            if (spec.transform) transform = Transform.multiply(parentContext.transform, spec.transform);
            if (spec.origin) origin = spec.origin;
            if (spec.size) {
                size = spec.size;
                var parentSize = parentContext.size;
                if (parentSize && origin && (origin[0] || origin[1])) {
                    size = [ spec.size[0] || parentSize[0], spec.size[1] || parentSize[1] ];
                    transform = Transform.move(transform, _vecInContext([ origin[0] * parentSize[0], origin[1] * parentSize[1], 0 ], sizeCtx));
                    transform = Transform.moveThen([ -origin[0] * size[0], -origin[1] * size[1], 0 ], transform);
                }
                origin = null;
            }
            this._parseSpec(target, {
                transform: transform,
                opacity: opacity,
                origin: origin,
                size: size
            }, parentContext.transform);
        }
    };
    module.exports = SpecParser;
});

require.register("famous_modules/famous/render-node/_git_master/index.js", function(exports, require, module) {
    var Entity = require("famous/entity");
    var SpecParser = require("famous/spec-parser");
    /**
     * @class A tree node wrapping a
     *   {@link renderableComponent} (like a {@link FamousTransform} or
     *   {@link FamousSurface}) for insertion into the render tree.
     *
     * @description Note that class may be removed in the near future.
     *
     * Scope: Ideally, RenderNode should not be visible below the level
     * of component developer.
     *
     * @name RenderNode
     * @constructor
     *
     * @example  < This should not be used by component engineers >
     *
     * @param {renderableComponent} child Target renderable component
     */
    function RenderNode(object) {
        this._object = object ? object : null;
        this._child = null;
        this._hasCached = false;
        this._resultCache = {};
        this._prevResults = {};
        this._childResult = null;
    }
    /**
     * Append a renderable to its children.
     *
     * @name RenderNode#add
     * @function
     *
     * @returns {RenderNode} this render node
     */
    RenderNode.prototype.add = function(child) {
        var childNode = child instanceof RenderNode ? child : new RenderNode(child);
        if (this._child instanceof Array) this._child.push(childNode); else if (this._child) {
            this._child = [ this._child, childNode ];
            this._childResult = [];
        } else this._child = childNode;
        return childNode;
    };
    RenderNode.prototype.get = function() {
        return this._object || this._child.get();
    };
    RenderNode.prototype.getSize = function() {
        var target = this.get();
        if (target && target.getSize) {
            return target.getSize();
        } else {
            return this._child && this._child.getSize ? this._child.getSize() : null;
        }
    };
    RenderNode.prototype.commit = function(context) {
        var renderResult = this.render(undefined, this._hasCached);
        if (renderResult !== true) {
            // free up some divs from the last loop
            for (var i in this._prevResults) {
                if (!(i in this._resultCache)) {
                    var object = Entity.get(i);
                    if (object.cleanup) object.cleanup(context.allocator);
                }
            }
            this._prevResults = this._resultCache;
            this._resultCache = {};
            _applyCommit(renderResult, context, this._resultCache);
            this._hasCached = true;
        }
    };
    function _applyCommit(spec, context, cacheStorage) {
        var result = SpecParser.parse(spec, context);
        for (var i in result) {
            var childNode = Entity.get(i);
            var commitParams = result[i];
            commitParams.allocator = context.allocator;
            var commitResult = childNode.commit(commitParams);
            if (commitResult) _applyCommit(commitResult, context, cacheStorage); else cacheStorage[i] = commitParams;
        }
    }
    /**
     * Render the component wrapped directly by this node.
     *
     * @name RenderNode#render
     * @function
     *
     * @returns {renderSpec} render specification for the component subtree
     *    only under this node.
     */
    RenderNode.prototype.render = function() {
        if (this._object && this._object.render) return this._object.render();
        var result = null;
        if (this._child instanceof Array) {
            result = this._childResult;
            var children = this._child;
            for (var i = 0; i < children.length; i++) {
                result[i] = children[i].render();
            }
        } else if (this._child) {
            result = this._child.render();
        }
        if (this._object && this._object.modify) result = this._object.modify(result);
        return result;
    };
    module.exports = RenderNode;
});

require.register("famous_modules/famous/utilities/utility/_git_master/index.js", function(exports, require, module) {
    /**
     * @namespace Utility
     *
     * TODO: combine with Utility.js into single utilities object?
     *
     * @description This namespace holds standalone functionality. 
     *    Currently includes 
     *    name mapping for transition curves, name mapping for origin 
     *    pairs, and the after() function.
     *    
     * @static
     * @name Utility
     */
    var Utility = {};
    /**
     * Transition curves mapping independent variable t from domain [0,1] to a
     *    range within [0,1]. Includes functions 'linear', 'easeIn', 'easeOut',
     *    'easeInOut', 'easeOutBounce', 'spring'.
     *
     *    TODO: move these into famous-transitions
     *    
     * @name Utility#curves
     * @deprecated
     * @field
     */
    Utility.Curve = {
        linear: function(t) {
            return t;
        },
        easeIn: function(t) {
            return t * t;
        },
        easeOut: function(t) {
            return t * (2 - t);
        },
        easeInOut: function(t) {
            if (t <= .5) return 2 * t * t; else return -2 * t * t + 4 * t - 1;
        },
        easeOutBounce: function(t) {
            return t * (3 - 2 * t);
        },
        spring: function(t) {
            return (1 - t) * Math.sin(6 * Math.PI * t) + t;
        }
    };
    Utility.Direction = {
        X: 0,
        Y: 1,
        Z: 2
    };
    /**
     * Table of strings mapping origin string types to origin pairs. Includes
     *    concepts of center and combinations of top, left, bottom, right, as
     *    'tl', 't', 'tr', 'l', 'c', 'r', 'bl', 'b', 'br'.
     *
     *    TODO: move these into famous-transitions
     *
     * @name Utility#Origin
     * @deprecated
     * @field
     */
    Utility.Origin = {
        tl: [ 0, 0 ],
        t: [ .5, 0 ],
        tr: [ 1, 0 ],
        l: [ 0, .5 ],
        c: [ .5, .5 ],
        r: [ 1, .5 ],
        bl: [ 0, 1 ],
        b: [ .5, 1 ],
        br: [ 1, 1 ]
    };
    /** 
     * Return wrapper around callback function. Once the wrapper is called N
     *    times, invoke the callback function. Arguments and scope preserved.
     *    
     * @name Utility#after
     * @function 
     * @param {number} count number of calls before callback function invoked
     * @param {Function} callback wrapped callback function
     */
    Utility.after = function(count, callback) {
        var counter = count;
        return function() {
            counter--;
            if (counter === 0) callback.apply(this, arguments);
        };
    };
    /**
     * Load a URL and return its contents in a callback
     * 
     * @name Utility#loadURL
     * @function
     * @param {string} url URL of object
     * @param {function} callback callback to dispatch with content
     */
    Utility.loadURL = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (callback) callback(this.responseText);
            }
        };
        xhr.open("GET", url);
        xhr.send();
    };
    //TODO: can this be put into transform.js
    /** @const */
    Utility.transformInFrontMatrix = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1 ];
    Utility.transformInFront = {
        modify: function(input) {
            return {
                transform: Utility.transformInFrontMatrix,
                target: input
            };
        }
    };
    //TODO: can this be put into transform.js
    /** @const */
    Utility.transformBehindMatrix = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1, 1 ];
    Utility.transformBehind = {
        modify: function(input) {
            return {
                transform: Utility.transformBehindMatrix,
                target: input
            };
        }
    };
    /**
     * Create a new component based on an existing component configured with custom options
     *
     * @name Utility#customizeComponent
     * @function
     * @param {Object} component Base component class
     * @param {Object} customOptions Options to apply
     * @param {function} initialize Initialization function to run on creation
     * @returns {Object} customized component
     * @deprecated
     */
    Utility.customizeComponent = function(component, customOptions, initialize) {
        var result = function(options) {
            component.call(this, customOptions);
            if (options) this.setOptions(options);
            if (initialize) initialize.call(this);
        };
        result.prototype = Object.create(component.prototype);
        return result;
    };
    /**
     * Create a document fragment from a string of HTML
     *
     * @name Utility#createDocumentFragmentFromHTML
     * @function
     * @param {string} html HTML to convert to DocumentFragment
     * @returns {DocumentFragment} DocumentFragment representing input HTML
     */
    Utility.createDocumentFragmentFromHTML = function(html) {
        var element = document.createElement("div");
        element.innerHTML = html;
        var result = document.createDocumentFragment();
        while (element.hasChildNodes()) result.appendChild(element.firstChild);
        return result;
    };
    /**
     * @deprecated
     */
    Utility.rad2deg = function(rad) {
        return rad * 57.2957795;
    };
    /**
     * @deprecated
     */
    Utility.deg2rad = function(deg) {
        return deg * .0174532925;
    };
    /**
     * @deprecated
     */
    Utility.distance = function(x1, y1, x2, y2) {
        var deltaX = x2 - x1;
        var deltaY = y2 - y1;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    };
    /**
     * @deprecated
     */
    Utility.distance3D = function(x1, y1, z1, x2, y2, z2) {
        var deltaX = x2 - x1;
        var deltaY = y2 - y1;
        var deltaZ = z2 - z1;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    };
    //TODO: can this use inRange, outRange arrays instead
    Utility.map = function(value, inputMin, inputMax, outputMin, outputMax, clamp) {
        var outValue = (value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin;
        if (clamp) {
            if (outputMax > outputMin) {
                if (outValue > outputMax) {
                    outValue = outputMax;
                } else if (outValue < outputMin) {
                    outValue = outputMin;
                }
            } else {
                if (outValue < outputMax) {
                    outValue = outputMax;
                } else if (outValue > outputMin) {
                    outValue = outputMin;
                }
            }
        }
        return outValue;
    };
    //TODO: can this be put into the matrix library?
    /**
     * @deprecated
     */
    Utility.perspective = function(fovy, aspect, near, far) {
        var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
        return [ f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0 ];
    };
    //TODO: can this be put into the matrix library?
    /**
     * @deprecated
     */
    Utility.ortho = function(left, right, bottom, top, near, far) {
        var tx = -(right + left) / (right - left);
        var ty = -(top + bottom) / (top - bottom);
        var tz = -(far + near) / (far - near);
        return [ 2 / (right - left), 0, 0, 0, 0, 2 / (top - bottom), 0, 0, 0, 0, -2 / (far - near), -1, tx, ty, tz, 1 ];
    };
    //TODO: can this be put into the matrix library?
    /**
     * @deprecated
     */
    Utility.normalFromFM = function(out, a) {
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32, // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) {
            return null;
        }
        det = 1 / det;
        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        return out;
    };
    //TODO: convert to min/max array
    Utility.clamp = function(v, min, max) {
        return Math.max(Math.min(v, max), min);
    };
    /**
     * @deprecated
     */
    Utility.isMobile = function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    };
    /**
     * @deprecated
     */
    Utility.extend = function(a, b) {
        for (var key in b) {
            a[key] = b[key];
        }
        return a;
    };
    Utility.getDevicePixelRatio = function() {
        return window.devicePixelRatio ? window.devicePixelRatio : 1;
    };
    /**
     * @deprecated
     */
    Utility.supportsWebGL = function() {
        return /Android|Chrome|Mozilla/i.test(navigator.appCodeName) && !!window.WebGLRenderingContext && !/iPhone|iPad|iPod/i.test(navigator.userAgent);
    };
    /**
     * @deprecated
     */
    Utility.getSurfacePosition = function getSurfacePosition(surface) {
        var currTarget = surface._currTarget;
        var totalDist = [ 0, 0, 0 ];
        function getAllTransforms(elem) {
            var transform = getTransform(elem);
            if (transform !== "" && transform !== undefined) {
                var offset = parseTransform(transform);
                totalDist[0] += offset[0];
                totalDist[1] += offset[1];
                totalDist[2] += offset[2];
            }
            if (elem.parentElement !== document.body) {
                getAllTransforms(elem.parentNode);
            }
        }
        function parseTransform(transform) {
            var translate = [];
            transform = removeMatrix3d(transform);
            translate[0] = parseInt(transform[12].replace(" ", ""));
            translate[1] = parseInt(transform[13].replace(" ", ""));
            translate[2] = parseInt(transform[14].replace(" ", ""));
            for (var i = 0; i < translate.length; i++) {
                if (typeof translate[i] == "undefined") {
                    translate[i] = 0;
                }
            }
            return translate;
        }
        function removeMatrix3d(mtxString) {
            mtxString = mtxString.replace("matrix3d(", "");
            mtxString = mtxString.replace(")", "");
            return mtxString.split(",");
        }
        function getTransform(elem) {
            var transform = elem["style"]["webkitTransform"] || elem["style"]["transform"];
            return transform;
        }
        if (currTarget) {
            getAllTransforms(currTarget);
        } else {
            return undefined;
        }
        return totalDist;
    };
    /**
     * @deprecated
     */
    Utility.hasUserMedia = function() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    };
    /**
     * @deprecated
     */
    Utility.getUserMedia = function() {
        return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    };
    /**
     * @deprecated
     */
    Utility.isWebkit = function() {
        return !!window.webkitURL;
    };
    /**
     * @deprecated
     */
    Utility.isAndroid = function() {
        var userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf("android") > -1;
    };
    /**
     * @deprecated
     */
    Utility.hasLocalStorage = function() {
        return !!window.localStorage;
    };
    /**
     * TODO: move to time utilities library
     * @deprecated
     */
    Utility.timeSince = function(time) {
        var now = Date.now();
        var difference = now - time;
        var minute = 6e4;
        var hour = 60 * minute;
        var day = 24 * hour;
        if (difference < minute) {
            return "Just Now";
        } else if (difference < hour) {
            var minutes = ~~(difference / minute);
            return minutes + "m";
        } else if (difference < day) {
            var hours = ~~(difference / hour);
            return hours + "h";
        } else {
            var days = ~~(difference / day);
            return days + "d";
        }
    };
    module.exports = Utility;
});

require.register("famous_modules/famous/transitions/multiple-transition/_git_master/index.js", function(exports, require, module) {
    var Utility = require("famous/utilities/utility");
    /**
     * @class Multiple value transition method
     * @description Transition meta-method to support transitioning multiple 
     *   values with scalar-only methods
     *
     * @name MultipleTransition
     * @constructor
     *
     * @param {Object} method Transionable class to multiplex
     */
    function MultipleTransition(method) {
        this.method = method;
        this._instances = [];
        this.state = [];
    }
    MultipleTransition.SUPPORTS_MULTIPLE = true;
    MultipleTransition.prototype.get = function() {
        for (var i = 0; i < this._instances.length; i++) {
            this.state[i] = this._instances[i].get();
        }
        return this.state;
    };
    MultipleTransition.prototype.set = function(endState, transition, callback) {
        var _allCallback = Utility.after(endState.length, callback);
        for (var i = 0; i < endState.length; i++) {
            if (!this._instances[i]) this._instances[i] = new this.method();
            this._instances[i].set(endState[i], transition, _allCallback);
        }
    };
    MultipleTransition.prototype.reset = function(startState) {
        for (var i = 0; i < startState.length; i++) {
            if (!this._instances[i]) this._instances[i] = new this.method();
            this._instances[i].reset(startState[i]);
        }
    };
    module.exports = MultipleTransition;
});

require.register("famous_modules/famous/transitions/tween-transition/_git_master/index.js", function(exports, require, module) {
    var Utility = require("famous/utilities/utility");
    /**
     *
     * @class A state maintainer for a smooth transition between 
     *    numerically-specified states. 
     *
     * @description  Example numeric states include floats or
     *    {@link FamousMatrix} objects. TweenTransitions form the basis
     *    of {@link FamousTransform} objects.
     *
     * An initial state is set with the constructor or set(startValue). A
     *    corresponding end state and transition are set with set(endValue,
     *    transition). Subsequent calls to set(endValue, transition) begin at
     *    the last state. Calls to get(timestamp) provide the _interpolated state
     *    along the way.
     *
     * Note that there is no event loop here - calls to get() are the only way
     *    to find out state projected to the current (or provided) time and are
     *    the only way to trigger callbacks. Usually this kind of object would
     *    be part of the render() path of a visible component.
     *
     * @name TweenTransition
     * @constructor
     *   
     * @param {number|Array.<number>|Object.<number|string, number>} start 
     *    beginning state
     */
    function TweenTransition(options) {
        this.options = Object.create(TweenTransition.DEFAULT_OPTIONS);
        if (options) this.setOptions(options);
        this._startTime = 0;
        this._startValue = 0;
        this._updateTime = 0;
        this._endValue = 0;
        this._curve = undefined;
        this._duration = 0;
        this._active = false;
        this._callback = undefined;
        this.state = 0;
        this.velocity = undefined;
    }
    TweenTransition.SUPPORTS_MULTIPLE = true;
    TweenTransition.DEFAULT_OPTIONS = {
        curve: Utility.Curve.linear,
        duration: 500,
        speed: 0
    };
    var registeredCurves = {};
    /**
     * Add "unit" curve to internal dictionary of registered curves.
     * 
     * @name TweenTransition#registerCurve
     * @function
     * @static
     * 
     * @param {string} curveName dictionary key
     * @param {unitCurve} curve function of one numeric variable mapping [0,1]
     *    to range inside [0,1]
     * @returns {boolean} false if key is taken, else true
     */
    TweenTransition.registerCurve = function(curveName, curve) {
        if (!registeredCurves[curveName]) {
            registeredCurves[curveName] = curve;
            return true;
        } else {
            return false;
        }
    };
    /**
     * Remove object with key "curveName" from internal dictionary of registered
     *    curves.
     * 
     * @name TweenTransition#unregisterCurve
     * @function
     * @static
     * 
     * @param {string} curveName dictionary key
     * @returns {boolean} false if key has no dictionary value
     */
    TweenTransition.unregisterCurve = function(curveName) {
        if (registeredCurves[curveName]) {
            delete registeredCurves[curveName];
            return true;
        } else {
            return false;
        }
    };
    /**
     * Retrieve function with key "curveName" from internal dictionary of
     *    registered curves. Default curves are defined in the 
     *    {@link Utility.Curve} array, where the values represent {@link
     *    unitCurve} functions.
     *    
     * @name TweenTransition#getCurve
     * @function
     * @static
     * 
     * @param {string} curveName dictionary key
     * @returns {unitCurve} curve function of one numeric variable mapping [0,1]
     *    to range inside [0,1]
     */
    TweenTransition.getCurve = function(curveName) {
        return registeredCurves[curveName];
    };
    /**
     * Retrieve all available curves.
     *    
     * @name TweenTransition#getCurves
     * @function
     * @static
     * 
     * @returns {object} curve functions of one numeric variable mapping [0,1]
     *    to range inside [0,1]
     */
    TweenTransition.getCurves = function() {
        return registeredCurves;
    };
    /**
     * Interpolate: If a linear function f(0) = a, f(1) = b, then return f(t)
     *
     * 
     * @name _interpolate
     * @function
     * @static
     * @private 
     * @param {number} a f(0) = a
     * @param {number} b f(1) = b
     * @param {number} t independent variable 
     * @returns {number} f(t) assuming f is linear
     */
    function _interpolate(a, b, t) {
        return (1 - t) * a + t * b;
    }
    function _clone(obj) {
        if (obj instanceof Object) {
            if (obj instanceof Array) return obj.slice(0); else return Object.create(obj);
        } else return obj;
    }
    /**
     * Fill in missing properties in "transition" with those in defaultTransition, and
     *    convert internal named curve to function object, returning as new
     *    object.
     *    
     * 
     * @name _normalize
     * @function
     * @static
     * @private
     * 
     * @param {transition} transition shadowing transition
     * @param {transition} defaultTransition transition with backup properties
     * @returns {transition} newly normalized transition
     */
    function _normalize(transition, defaultTransition) {
        var result = {
            curve: defaultTransition.curve
        };
        if (defaultTransition.duration) result.duration = defaultTransition.duration;
        if (defaultTransition.speed) result.speed = defaultTransition.speed;
        if (transition instanceof Object) {
            if (transition.duration !== undefined) result.duration = transition.duration;
            if (transition.curve) result.curve = transition.curve;
            if (transition.speed) result.speed = transition.speed;
        }
        if (typeof result.curve === "string") result.curve = TweenTransition.getCurve(result.curve);
        return result;
    }
    /**
     * Copy object to internal "default" transition. Missing properties in
     *    provided transitions inherit from this default.
     * 
     * @name TweenTransition#setOptions
     * @function
     *    
     * @param {transition} transition {duration: number, curve: f[0,1] -> [0,1]}
     */
    TweenTransition.prototype.setOptions = function(options) {
        if (options.curve !== undefined) this.options.curve = options.curve;
        if (options.duration !== undefined) this.options.duration = options.duration;
        if (options.speed !== undefined) this.options.speed = options.speed;
    };
    /**
     * Add transition to end state to the queue of pending transitions. Special
     *    Use: calling without a transition resets the object to that state with
     *    no pending actions
     * 
     * @name TweenTransition#set
     * @function
     *    
     * @param {number|FamousMatrix|Array.<number>|Object.<number, number>} endValue
     *    end state to which we _interpolate
     * @param {transition=} transition object of type {duration: number, curve:
     *    f[0,1] -> [0,1] or name}. If transition is omitted, change will be 
     *    instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    TweenTransition.prototype.set = function(endValue, transition, callback) {
        if (!transition) {
            this.reset(endValue);
            if (callback) callback();
            return;
        }
        this._startValue = _clone(this.get());
        transition = _normalize(transition, this.options);
        if (transition.speed) {
            var startValue = this._startValue;
            if (startValue instanceof Object) {
                var variance = 0;
                for (var i in startValue) variance += (endValue[i] - startValue[i]) * (endValue[i] - startValue[i]);
                transition.duration = Math.sqrt(variance) / transition.speed;
            } else {
                transition.duration = Math.abs(endValue - startValue) / transition.speed;
            }
        }
        this._startTime = Date.now();
        this._endValue = _clone(endValue);
        this._startVelocity = _clone(transition.velocity);
        this._duration = transition.duration;
        this._curve = transition.curve;
        this._active = true;
        this._callback = callback;
    };
    /**
     * Cancel all transitions and reset to a stable state
     *
     * @name TweenTransition#reset
     * @function
     *
     * @param {number|Array.<number>|Object.<number, number>} startValue
     *    stable state to set to
     */
    TweenTransition.prototype.reset = function(startValue, startVelocity) {
        if (this._callback) {
            var callback = this._callback;
            this._callback = undefined;
            callback();
        }
        this.state = _clone(startValue);
        this.velocity = _clone(startVelocity);
        this._startTime = 0;
        this._duration = 0;
        this._updateTime = 0;
        this._startValue = this.state;
        this._startVelocity = this.velocity;
        this._endValue = this.state;
        this._active = false;
    };
    TweenTransition.prototype.getVelocity = function() {
        return this.velocity;
    };
    /**
     * Get _interpolated state of current action at provided time. If the last
     *    action has completed, invoke its callback.
     * 
     * @name TweenTransition#get
     * @function
     *    
     * @param {number=} timestamp Evaluate the curve at a normalized version of this
     *    time. If omitted, use current time. (Unix epoch time)
     * @returns {number|Object.<number|string, number>} beginning state
     *    _interpolated to this point in time.
     */
    TweenTransition.prototype.get = function(timestamp) {
        this.update(timestamp);
        return this.state;
    };
    /**
     * Update internal state to the provided timestamp. This may invoke the last
     *    callback and begin a new action.
     * 
     * @name TweenTransition#update
     * @function
     * 
     * @param {number=} timestamp Evaluate the curve at a normalized version of this
     *    time. If omitted, use current time. (Unix epoch time)
     */
    function _calculateVelocity(current, start, curve, duration, t) {
        var velocity;
        var eps = 1e-7;
        var speed = (curve(t) - curve(t - eps)) / eps;
        if (current instanceof Array) {
            velocity = [];
            for (var i = 0; i < current.length; i++) velocity[i] = speed * (current[i] - start[i]) / duration;
        } else velocity = speed * (current - start) / duration;
        return velocity;
    }
    function _calculateState(start, end, t) {
        var state;
        if (start instanceof Array) {
            state = [];
            for (var i = 0; i < start.length; i++) state[i] = _interpolate(start[i], end[i], t);
        } else state = _interpolate(start, end, t);
        return state;
    }
    TweenTransition.prototype.update = function(timestamp) {
        if (!this._active) {
            if (this._callback) {
                var callback = this._callback;
                this._callback = undefined;
                callback();
            }
            return;
        }
        if (!timestamp) timestamp = Date.now();
        if (this._updateTime >= timestamp) return;
        this._updateTime = timestamp;
        var timeSinceStart = timestamp - this._startTime;
        if (timeSinceStart >= this._duration) {
            this.state = this._endValue;
            this.velocity = _calculateVelocity(this.state, this._startValue, this._curve, this._duration, 1);
            this._active = false;
        } else if (timeSinceStart < 0) {
            this.state = this._startValue;
            this.velocity = this._startVelocity;
        } else {
            var t = timeSinceStart / this._duration;
            this.state = _calculateState(this._startValue, this._endValue, this._curve(t));
            this.velocity = _calculateVelocity(this.state, this._startValue, this._curve, this._duration, t);
        }
    };
    /**
     * Is there at least one action pending completion?
     * 
     * @name TweenTransition#isActive
     * @function
     * 
     * @returns {boolean} 
     */
    TweenTransition.prototype.isActive = function() {
        return this._active;
    };
    /**
     * Halt transition at current state and erase all pending actions.
     * 
     * @name TweenTransition#halt
     * @function
     */
    TweenTransition.prototype.halt = function() {
        this.reset(this.get());
    };
    /* Register all the default curves */
    TweenTransition.registerCurve("linear", Utility.Curve.linear);
    TweenTransition.registerCurve("easeIn", Utility.Curve.easeIn);
    TweenTransition.registerCurve("easeOut", Utility.Curve.easeOut);
    TweenTransition.registerCurve("easeInOut", Utility.Curve.easeInOut);
    TweenTransition.registerCurve("easeOutBounce", Utility.Curve.easeOutBounce);
    TweenTransition.registerCurve("spring", Utility.Curve.spring);
    TweenTransition.customCurve = function(v1, v2) {
        v1 = v1 || 0;
        v2 = v2 || 0;
        return function(t) {
            return v1 * t + (-2 * v1 - v2 + 3) * t * t + (v1 + v2 - 2) * t * t * t;
        };
    };
    module.exports = TweenTransition;
});

require.register("famous_modules/famous/transitions/transitionable/_git_master/index.js", function(exports, require, module) {
    var Utility = require("famous/utilities/utility");
    var MultipleTransition = require("famous/transitions/multiple-transition");
    var TweenTransition = require("famous/transitions/tween-transition");
    /**
     *
     * @class Transitionable 
     *
     * @description  An engineInstance maintainer for a smooth transition between 
     *    numerically-specified engineInstances. Example numeric engineInstances include floats or
     *    {@link FamousMatrix} objects. Transitionables form the basis
     *    of {@link FamousTransform} objects.
     *
     * An initial engineInstance is set with the constructor or set(startState). A
     *    corresponding end engineInstance and transition are set with set(endState,
     *    transition). Subsequent calls to set(endState, transition) begin at
     *    the last engineInstance. Calls to get(timestamp) provide the interpolated engineInstance
     *    along the way.
     *
     * Note that there is no event loop here - calls to get() are the only way
     *    to find engineInstance projected to the current (or provided) time and are
     *    the only way to trigger callbacks. Usually this kind of object would
     *    be part of the render() path of a visible component.
     * 
     * @name Transitionable
     * @constructor
     * @example 
     *   function FamousFader(engineInstance, transition) { 
     *     if(typeof engineInstance == 'undefined') engineInstance = 0; 
     *     if(typeof transition == 'undefined') transition = true; 
     *     this.transitionHelper = new Transitionable(engineInstance);
     *     this.transition = transition; 
     *   }; 
     *   
     *   FamousFader.prototype = { 
     *     show: function(callback) { 
     *       this.set(1, this.transition, callback); 
     *     }, 
     *     hide: function(callback) { 
     *       this.set(0, this.transition, callback); 
     *     }, 
     *     set: function(engineInstance, transition, callback) { 
     *       this.transitionHelper.halt();
     *       this.transitionHelper.set(engineInstance, transition, callback); 
     *     }, 
     *     render: function(target) { 
     *       var currOpacity = this.transitionHelper.get();
     *       return {opacity: currOpacity, target: target}; 
     *     } 
     *   };
     *   
     * @param {number|Array.<number>|Object.<number|string, number>} start 
     *    beginning engineInstance
     */
    function Transitionable(start) {
        this.currentAction = null;
        this.actionQueue = [];
        this.callbackQueue = [];
        this.state = 0;
        this.velocity = undefined;
        this._callback = undefined;
        this._engineInstance = null;
        this._currentMethod = null;
        this.set(start);
    }
    var transitionMethods = {};
    Transitionable.registerMethod = function(name, engineClass) {
        if (!(name in transitionMethods)) {
            transitionMethods[name] = engineClass;
            return true;
        } else return false;
    };
    Transitionable.unregisterMethod = function(name) {
        if (name in transitionMethods) {
            delete transitionMethods[name];
            return true;
        } else return false;
    };
    function _loadNext() {
        if (this._callback) {
            var callback = this._callback;
            this._callback = undefined;
            callback();
        }
        if (this.actionQueue.length <= 0) {
            this.set(this.get());
            // no update required
            return;
        }
        this.currentAction = this.actionQueue.shift();
        this._callback = this.callbackQueue.shift();
        var method = null;
        var endValue = this.currentAction[0];
        var transition = this.currentAction[1];
        if (transition instanceof Object && transition.method) {
            method = transition.method;
            if (typeof method === "string") method = transitionMethods[method];
        } else {
            method = TweenTransition;
        }
        if (this._currentMethod !== method) {
            if (!(endValue instanceof Object) || method.SUPPORTS_MULTIPLE === true || endValue.length <= method.SUPPORTS_MULTIPLE) {
                this._engineInstance = new method();
            } else {
                this._engineInstance = new MultipleTransition(method);
            }
            this._currentMethod = method;
        }
        this._engineInstance.reset(this.state, this.velocity);
        if (this.velocity !== undefined) transition.velocity = this.velocity;
        this._engineInstance.set(endValue, transition, _loadNext.bind(this));
    }
    /**
     * Add transition to end engineInstance to the queue of pending transitions. Special
     *    Use: calling without a transition resets the object to that engineInstance with
     *    no pending actions
     * 
     * @name Transitionable#set
     * @function
     *    
     * @param {number|FamousMatrix|Array.<number>|Object.<number, number>} endState
     *    end engineInstance to which we interpolate
     * @param {transition=} transition object of type {duration: number, curve:
     *    f[0,1] -> [0,1] or name}. If transition is omitted, change will be 
     *    instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Transitionable.prototype.set = function(endState, transition, callback) {
        if (!transition) {
            this.reset(endState);
            if (callback) callback();
            return this;
        }
        var action = [ endState, transition ];
        this.actionQueue.push(action);
        this.callbackQueue.push(callback);
        if (!this.currentAction) _loadNext.call(this);
        return this;
    };
    /**
     * Cancel all transitions and reset to a stable engineInstance
     *
     * @name Transitionable#reset
     * @function
     *
     * @param {number|Array.<number>|Object.<number, number>} startState
     *    stable engineInstance to set to
     */
    Transitionable.prototype.reset = function(startState, startVelocity) {
        this._currentMethod = null;
        this._engineInstance = null;
        this.state = startState;
        this.velocity = startVelocity;
        this.currentAction = null;
        this.actionQueue = [];
        this.callbackQueue = [];
    };
    /**
     * Add delay action to the pending action queue queue.
     * 
     * @name Transitionable#delay
     * @function
     * 
     * @param {number} duration delay time (ms)
     * @param {function()} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Transitionable.prototype.delay = function(duration, callback) {
        this.set(this._engineInstance.get(), {
            duration: duration,
            curve: function() {
                return 0;
            }
        }, callback);
    };
    /**
     * Get interpolated engineInstance of current action at provided time. If the last
     *    action has completed, invoke its callback. TODO: What if people want
     *    timestamp == 0?
     * 
     * @name Transitionable#get
     * @function
     *    
     * @param {number=} timestamp Evaluate the curve at a normalized version of this
     *    time. If omitted, use current time. (Unix epoch time)
     * @returns {number|Object.<number|string, number>} beginning engineInstance
     *    interpolated to this point in time.
     */
    Transitionable.prototype.get = function(timestamp) {
        if (this._engineInstance) {
            if (this._engineInstance.getVelocity) this.velocity = this._engineInstance.getVelocity();
            this.state = this._engineInstance.get(timestamp);
        }
        return this.state;
    };
    /**
     * Is there at least one action pending completion?
     * 
     * @name Transitionable#isActive
     * @function
     * 
     * @returns {boolean} 
     */
    Transitionable.prototype.isActive = function() {
        return !!this.currentAction;
    };
    /**
     * Halt transition at current engineInstance and erase all pending actions.
     * 
     * @name Transitionable#halt
     * @function
     */
    Transitionable.prototype.halt = function() {
        this.set(this.get());
    };
    module.exports = Transitionable;
});

require.register("famous_modules/famous/modifier/_git_master/index.js", function(exports, require, module) {
    var Transform = require("famous/transform");
    var Transitionable = require("famous/transitions/transitionable");
    var Utility = require("famous/utilities/utility");
    /**
     *
     * @class Modifier
     *
     * @description A collection of visual changes to be
     *    applied to another renderable component. This collection includes a
     *    transform matrix, an opacity constant, and an origin specifier. These
     *    are all managed separately inside this object, and each operates
     *    independently. Modifier objects can be linked within any context or view
     *    capable of displaying renderables. Objects' subsequent siblings and children
     *    are transformed by the amounts specified in the modifier's properties.
     *
     * Renaming suggestion: Change parameters named "transform" to 
     * "transformMatrix" in here.
     *    
     * @name Modifier
     * @constructor
     * @example
     *   var Engine         = require('famous/Engine');
     *   var FamousSurface  = require('famous/Surface');
     *   var Modifier       = require('famous/Modifier');
     *   var FM             = require('famous/Matrix');
     *
     *   var Context = Engine.createContext();
     *
     *   var surface = new FamousSurface({
     *       size: [200,200],
     *       properties: {
     *           backgroundColor: '#3cf'
     *       },
     *       content: 'test'
     *   });
     *   
     *   var modifier = new Modifier({
     *       origin: [0,0],
     *       transform: FM.translate(400,0,0)
     *   })
     *
     *   Context.link(modifier).link(surface);
     */
    function Modifier(opts) {
        var transform = Transform.identity;
        var opacity = 1;
        var origin = undefined;
        var size = undefined;
        /* maintain backwards compatibility for scene compiler */
        if (arguments.length > 1 || arguments[0] instanceof Array) {
            if (arguments[0] !== undefined) transform = arguments[0];
            if (arguments[1] !== undefined) opacity = arguments[1];
            origin = arguments[2];
            size = arguments[3];
        } else if (opts) {
            if (opts.transform) transform = opts.transform;
            if (opts.opacity !== undefined) opacity = opts.opacity;
            if (opts.origin) origin = opts.origin;
            if (opts.size) size = opts.size;
        }
        this.transformTranslateState = new Transitionable([ 0, 0, 0 ]);
        this.transformRotateState = new Transitionable([ 0, 0, 0 ]);
        this.transformSkewState = new Transitionable([ 0, 0, 0 ]);
        this.transformScaleState = new Transitionable([ 1, 1, 1 ]);
        this.opacityState = new Transitionable(opacity);
        this.originState = new Transitionable([ 0, 0 ]);
        this.sizeState = new Transitionable([ 0, 0 ]);
        this._originEnabled = false;
        this._sizeEnabled = false;
        this.setTransform(transform);
        this.setOpacity(opacity);
        this.setOrigin(origin);
        this.setSize(size);
    }
    /**
     * Get current interpolated positional transform matrix at this point in
     *    time.
     * (Scope: Component developers and deeper)
     *
     * @name Modifier#getTransform
     * @function
     *  
     * @returns {FamousMatrix} webkit-compatible positional transform matrix.
     */
    Modifier.prototype.getTransform = function() {
        if (this.isActive()) {
            return Transform.build({
                translate: this.transformTranslateState.get(),
                rotate: this.transformRotateState.get(),
                skew: this.transformSkewState.get(),
                scale: this.transformScaleState.get()
            });
        } else return this.getFinalTransform();
    };
    /**
     * Get most recently provided end state positional transform matrix.
     * (Scope: Component developers and deeper)
     * 
     * @name Modifier#getFinalTransform
     * @function
     * 
     * @returns {FamousMatrix} webkit-compatible positional transform matrix.
     */
    Modifier.prototype.getFinalTransform = function() {
        return this._finalTransform;
    };
    /**
     * Add positional transformation to the internal queue. Special Use: calling
     *    without a transition resets the object to that state with no pending
     *    actions Note: If we called setTransform in that "start state" way,
     *    then called with a transition, we begin form that start state.
     * 
     * @name Modifier#setTransform
     * @function
     *    
     * @param {FamousMatrix} transform end state positional transformation to
     *    which we interpolate
     * @param {transition=} transition object of type {duration: number, curve:
     *    f[0,1] -> [0,1] or name}
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Modifier.prototype.setTransform = function(transform, transition, callback) {
        var _callback = callback ? Utility.after(4, callback) : undefined;
        if (transition) {
            if (this._transformDirty) {
                var startState = Transform.interpret(this.getFinalTransform());
                this.transformTranslateState.set(startState.translate);
                this.transformRotateState.set(startState.rotate);
                this.transformSkewState.set(startState.skew);
                this.transformScaleState.set(startState.scale);
                this._transformDirty = false;
            }
            var endState = Transform.interpret(transform);
            this.transformTranslateState.set(endState.translate, transition, _callback);
            this.transformRotateState.set(endState.rotate, transition, _callback);
            this.transformSkewState.set(endState.skew, transition, _callback);
            this.transformScaleState.set(endState.scale, transition, _callback);
        } else {
            this.transformTranslateState.halt();
            this.transformRotateState.halt();
            this.transformSkewState.halt();
            this.transformScaleState.halt();
            this._transformDirty = true;
        }
        this._finalTransform = transform;
    };
    /**
     * Get current interpolated opacity constant at this point in time.
     * 
     * @name Modifier#getOpacity
     * @function
     * 
     * @returns {number} interpolated opacity number. float w/ range [0..1]
     */
    Modifier.prototype.getOpacity = function() {
        return this.opacityState.get();
    };
    /**
     * Add opacity transformation to the internal queue. Special Use: calling
     *    without a transition resets the object to that state with no pending
     *    actions.
     * 
     * @name Modifier#setOpacity
     * @function
     *    
     * @param {number} opacity end state opacity constant to which we interpolate
     * @param {transition=} transition object of type 
     *    {duration: number, curve: f[0,1] -> [0,1] or name}. If undefined, 
     *    opacity change is instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Modifier.prototype.setOpacity = function(opacity, transition, callback) {
        this.opacityState.set(opacity, transition, callback);
    };
    /**
     * Get current interpolated origin pair at this point in time.
     *
     * @returns {Array.<number>} interpolated origin pair
     */
    Modifier.prototype.getOrigin = function() {
        return this._originEnabled ? this.originState.get() : undefined;
    };
    /**
     * Add origin transformation to the internal queue. Special Use: calling
     *    without a transition resets the object to that state with no pending
     *    actions
     * 
     * @name Modifier#setOrigin
     * @function
     *    
     * @param {Array.<number>} origin end state origin pair to which we interpolate
     * @param {transition=} transition object of type 
     *    {duration: number, curve: f[0,1] -> [0,1] or name}. if undefined, 
     *    opacity change is instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Modifier.prototype.setOrigin = function(origin, transition, callback) {
        this._originEnabled = !!origin;
        if (!origin) origin = [ 0, 0 ];
        if (!(origin instanceof Array)) origin = Utility.origins[origin];
        this.originState.set(origin, transition, callback);
    };
    /**
     * Get current interpolated size at this point in time.
     *
     * @returns {Array.<number>} interpolated size
     */
    Modifier.prototype.getSize = function() {
        return this._sizeEnabled ? this.sizeState.get() : undefined;
    };
    /**
     * Add size transformation to the internal queue. Special Use: calling
     *    without a transition resets the object to that state with no pending
     *    actions
     * 
     * @name Modifier#setSize
     * @function
     *    
     * @param {Array.<number>} size end state size to which we interpolate
     * @param {transition=} transition object of type 
     *    {duration: number, curve: f[0,1] -> [0,1] or name}. if undefined, 
     *    opacity change is instantaneous.
     * @param {function()=} callback Zero-argument function to call on observed
     *    completion (t=1)
     */
    Modifier.prototype.setSize = function(size, transition, callback) {
        this._sizeEnabled = !!size;
        if (!size) size = [ 0, 0 ];
        this.sizeState.set(size, transition, callback);
    };
    /**
     * Copy object to internal "default" transition. Missing properties in
     *    provided transitions inherit from this default.
     * 
     * (Scope: Component developers and deeper)
     * @name Modifier#setDefaultTransition
     * @function
     *    
     * @param {transition} transition {duration: number, curve: f[0,1] -> [0,1]}
     */
    Modifier.prototype.setDefaultTransition = function(transition) {
        this.transformTranslateState.setDefault(transition);
        this.transformRotateState.setDefault(transition);
        this.transformSkewState.setDefault(transition);
        this.transformScaleState.setDefault(transition);
        this.opacityState.setDefault(transition);
        this.originState.setDefault(transition);
        this.sizeState.setDefault(transition);
    };
    /**
     * Halt the entire transformation at current state.
     * (Scope: Component developers and deeper)
     * 
     * @name Modifier#halt
     * @function
     */
    Modifier.prototype.halt = function() {
        this.transformTranslateState.halt();
        this.transformRotateState.halt();
        this.transformSkewState.halt();
        this.transformScaleState.halt();
        this.opacityState.halt();
        this.originState.halt();
        this.sizeState.halt();
    };
    /**
     * Have we reached our end state in the motion transform?
     * 
     * @name Modifier#isActive
     * @function
     * 
     * @returns {boolean} 
     */
    Modifier.prototype.isActive = function() {
        return this.transformTranslateState.isActive() || this.transformRotateState.isActive() || this.transformSkewState.isActive() || this.transformScaleState.isActive();
    };
    /**
     * * Return {@renderSpec} for this Modifier, applying to the provided
     *    target component. The transform will be applied to the entire target
     *    tree in the following way: 
     *    * Positional Matrix (this.getTransform) - Multiplicatively 
     *    * Opacity (this.getOpacity) - Applied multiplicatively.
     *    * Origin (this.getOrigin) - Children shadow parents
     *
     * (Scope: Component developers and deeper)
     * 
     * @name Modifier#modify
     * @function
     * 
     * @param {renderSpec} target (already rendered) renderable component to
     *    which to apply the transform.
     * @returns {renderSpec} render spec for this Modifier, including the
     *    provided target
     */
    Modifier.prototype.modify = function(target) {
        return {
            transform: this.getTransform(),
            opacity: this.getOpacity(),
            origin: this.getOrigin(),
            size: this.getSize(),
            target: target
        };
    };
    module.exports = Modifier;
});

require.register("famous_modules/famous/context/_git_master/index.js", function(exports, require, module) {
    var RenderNode = require("famous/render-node");
    var EventHandler = require("famous/event-handler");
    var SpecParser = require("famous/spec-parser");
    var ElementAllocator = require("famous/element-allocator");
    var Transform = require("famous/transform");
    var Transitionable = require("famous/transitions/transitionable");
    /**
     * @class Context 
     * @description The top-level container for a Famous-renderable piece of the 
     *    document.  It is directly updated
     *   by the process-wide FamousEngine object, and manages one 
     *   render tree–event tree pair, which can contain other
     *   renderables and events.
     *
     * This constructor should only be called by the engine.
     * @name Context
     * @constructor
     * 
     * @example
     *   var mainDiv = document.querySelector('#main'); 
     *   var mainContext = FamousEngine.createContext(mainDiv);
     *   var surface = new FamousSurface([300,50], 'Hello World');
     *   mainContext.link(surface);
     *
     * 
     */
    function Context(container) {
        this.container = container;
        this.allocator = new ElementAllocator(container);
        this.srcNode = new RenderNode();
        this.eventHandler = new EventHandler();
        this._size = _getElementSize(this.container);
        this.perspectiveState = new Transitionable(0);
        this._perspective = undefined;
        this.eventHandler.on("resize", function() {
            this._size = _getElementSize(this.container);
        }.bind(this));
    }
    function _getElementSize(element) {
        return [ element.clientWidth, element.clientHeight ];
    }
    Context.prototype.getAllocator = function() {
        return this.allocator;
    };
    /**
     * Add renderables to this Context
     *
     * @name Context#add
     * @function
     * @param {renderableComponent} obj 
     * @returns {RenderNode} new node wrapping this object
     */
    Context.prototype.add = function(obj) {
        return this.srcNode.add(obj);
    };
    /**
     * Move this context to another container
     *
     * @name Context#migrate
     * @function
     * @param {Node} container Container node to migrate to
     */
    Context.prototype.migrate = function(container) {
        if (container === this.container) return;
        this.container = container;
        this.allocator.migrate(container);
    };
    /**
     * Gets viewport size for Context
     *
     * @name Context#getSize
     * @function
     *
     * @returns {Array} viewport size
     */
    Context.prototype.getSize = function() {
        return this._size;
    };
    /**
     * Sets viewport size for Context
     *
     * @name Context#setSize
     * @function
     */
    Context.prototype.setSize = function(size) {
        if (!size) size = _getElementSize(this.container);
        this._size = size;
    };
    /**
     * Run the render loop and then the run the update loop for the content 
     *   managed by this context. 
     *
     * @name Context#update
     * @function
     */
    Context.prototype.update = function() {
        var perspective = this.perspectiveState.get();
        if (perspective !== this._perspective) {
            this.container.style.perspective = perspective ? perspective.toFixed() + "px" : "";
            this.container.style.webkitPerspective = perspective ? perspective.toFixed() : "";
            this._perspective = perspective;
        }
        if (this.srcNode) {
            this.srcNode.commit({
                allocator: this.getAllocator(),
                transform: Transform.identity,
                opacity: 1,
                origin: [ 0, 0 ],
                size: this._size
            });
        }
    };
    Context.prototype.getPerspective = function() {
        return this.perspectiveState.get();
    };
    Context.prototype.setPerspective = function(perspective, transition, callback) {
        return this.perspectiveState.set(perspective, transition, callback);
    };
    /**
     * Trigger an event, sending to all downstream handlers
     *   matching provided 'type' key.
     *
     * @name Context#emit
     * @function
     *
     * @param {string} type event type key (for example, 'click')
     * @param {Object} event event data
     */
    Context.prototype.emit = function(type, event) {
        return this.eventHandler.emit(type, event);
    };
    /**
     * Bind a handler function to an event type occuring in the context.
     *   These events will either come link calling {@link Context#emit} or
     *   directly link the document.  
     *   Document events have the opportunity to first be intercepted by the 
     *   on() method of the FamousSurface upon which the event occurs, then 
     *   by the on() method of the Context containing that surface, and
     *   finally as a default, the FamousEngine itself. 
     *
     * @name Context#on
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler callback
     */
    Context.prototype.on = function(type, handler) {
        return this.eventHandler.on(type, handler);
    };
    /**
     * Unbind an event by type and handler.  
     *   This undoes the work of {@link Context#on}
     *
     * @name Context#unbind
     * @function
     * @param {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler 
     */
    Context.prototype.unbind = function(type, handler) {
        return this.eventHandler.unbind(type, handler);
    };
    /**
     * Emit Context events to downstream event handler
     *
     * @name Context#pipe
     * @function
     * @param {EventHandler} target downstream event handler
     */
    Context.prototype.pipe = function(target) {
        return this.eventHandler.pipe(target);
    };
    /**
     * Stop emitting events to a downstream event handler
     *
     * @name Context#unpipe
     * @function
     * @param {EventHandler} target downstream event handler
     */
    Context.prototype.unpipe = function(target) {
        return this.eventHandler.unpipe(target);
    };
    module.exports = Context;
});

require.register("famous_modules/famous/engine/_git_master/index.js", function(exports, require, module) {
    /**
     * @namespace Engine
     * 
     * @description The singleton object initiated upon process
     *    startup which manages all active {@link Context} instances, runs
     *    the render dispatch loop, and acts as a global listener and dispatcher
     *    for all events. Public functions include
     *    adding contexts and functions for execution at each render tick.
     * 
     *   On static initialization, window.requestAnimationFrame is called with
     *   the event loop function, step().
     * 
     *   Note: Any window in which Engine runs will prevent default 
     *     scrolling behavior on the 'touchmove' event.
     * @static
     * 
     * @name Engine
     * 
     * @example
     *   var mainDiv = document.querySelector('#main'); 
     *   var mainContext = Engine.createContext(mainDiv);
     *   var surface = new FamousSurface([300,50], 'Hello World');
     *   mainContext.from(helloWorldSurface);
     */
    var Context = require("famous/context");
    var EventHandler = require("famous/event-handler");
    var OptionsManager = require("famous/options-manager");
    var Engine = {};
    var contexts = [];
    var nextTickQueue = [];
    var deferQueue = [];
    var lastTime = Date.now();
    var frameTime = undefined;
    var frameTimeLimit = undefined;
    var loopEnabled = true;
    var eventForwarders = {};
    var eventHandler = new EventHandler();
    var options = {
        containerType: "div",
        containerClass: "famous-container",
        fpsCap: undefined,
        runLoop: true
    };
    var optionsManager = new OptionsManager(options);
    optionsManager.on("change", function(data) {
        if (data.id === "fpsCap") setFPSCap(data.value); else if (data.id === "runLoop") {
            // kick off the loop only if it was stopped
            if (!loopEnabled && data.value) {
                loopEnabled = true;
                requestAnimationFrame(loop);
            }
        }
    });
    /** @const */
    var MAX_DEFER_FRAME_TIME = 10;
    /**
     * Inside requestAnimationFrame loop, this function is called which:
     *   - calculates current FPS (throttling loop if it is over limit set in setFPSCap)
     *   - emits dataless 'prerender' event on start of loop
     *   - calls in order any one-shot functions registered by nextTick on last loop.
     *   - calls Context.update on all {@link Context} objects registered.
     *   - emits dataless 'postrender' event on end of loop
     * @name Engine#step
     * @function
     * @private
     */
    Engine.step = function() {
        var currentTime = Date.now();
        // skip frame if we're over our framerate cap
        if (frameTimeLimit && currentTime - lastTime < frameTimeLimit) return;
        frameTime = currentTime - lastTime;
        lastTime = currentTime;
        eventHandler.emit("prerender");
        // empty the queue
        for (var i = 0; i < nextTickQueue.length; i++) nextTickQueue[i].call(this);
        nextTickQueue.splice(0);
        // limit total execution time for deferrable functions
        while (deferQueue.length && Date.now() - currentTime < MAX_DEFER_FRAME_TIME) {
            deferQueue.shift().call(this);
        }
        for (var i = 0; i < contexts.length; i++) contexts[i].update();
        eventHandler.emit("postrender");
    };
    function loop() {
        if (options.runLoop) {
            Engine.step();
            requestAnimationFrame(loop);
        } else loopEnabled = false;
    }
    requestAnimationFrame(loop);
    /**
     * Upon main document window resize (unless on an "input" HTML element)
     *   - scroll to the top left corner of the window
     *   - For each managed {@link Context}: emit the 'resize' event and update its size 
     * @name Engine#step
     * @function
     * @static
     * @private
     * 
     * @param {Object=} event
     */
    function handleResize(event) {
        if (document.activeElement && document.activeElement.nodeName == "INPUT") {
            document.activeElement.addEventListener("blur", function deferredResize() {
                this.removeEventListener("blur", deferredResize);
                handleResize(event);
            });
            return;
        }
        window.scrollTo(0, 0);
        for (var i = 0; i < contexts.length; i++) {
            contexts[i].emit("resize");
        }
        eventHandler.emit("resize");
    }
    window.addEventListener("resize", handleResize, false);
    handleResize();
    // prevent scrolling via browser
    window.addEventListener("touchmove", function(event) {
        event.preventDefault();
    }, false);
    /**
     * Pipes all events to a target object that implements the #emit() interface.
     * TODO: Confirm that "uncaught" events that bubble up to the document.
     * @name Engine#pipe
     * @function
     * @param {emitterObject} target target emitter object
     * @returns {emitterObject} target emitter object (for chaining)
     */
    Engine.pipe = function(target) {
        if (target.subscribe instanceof Function) return target.subscribe(Engine); else return eventHandler.pipe(target);
    };
    /**
     * Stop piping all events at the Engine level to a target emitter 
     *   object.  Undoes the work of {@link Engine#pipe}.
     * 
     * @name Engine#unpipe
     * @function
     * @param {emitterObject} target target emitter object
     */
    Engine.unpipe = function(target) {
        if (target.unsubscribe instanceof Function) return target.unsubscribe(Engine); else return eventHandler.unpipe(target);
    };
    /**
     * Bind a handler function to a document or Engine event.
     *   These events will either come from calling {@link Engine#emit} or
     *   directly from the document.  The document events to which Engine 
     *   listens by default include: 'touchstart', 'touchmove', 'touchend', 
     *   'touchcancel', 
     *   'click', 'keydown', 'keyup', 'keypress', 'mousemove', 
     *   'mouseover', 'mouseout'.  
     *   Document events have the opportunity to first be intercepted by the 
     *   on() method of the FamousSurface upon which the event occurs, then 
     *   by the on() method of the Context containing that surface, and
     *   finally as a default, the Engine itself.
     * @static
     * @name Engine#on
     * @function
     * @param  {string} type event type key (for example, 'click')
     * @param {function(string, Object)} handler callback
     */
    Engine.on = function(type, handler) {
        if (!(type in eventForwarders)) {
            eventForwarders[type] = eventHandler.emit.bind(eventHandler, type);
            document.body.addEventListener(type, eventForwarders[type]);
        }
        return eventHandler.on(type, handler);
    };
    /**
     * Trigger an event, sending to all downstream handlers
     *   matching provided 'type' key.
     *
     * @static
     * @name Engine#emit
     * @function
     * @param {string} type event type key (for example, 'click')
     * @param {Object} event event data
     */
    Engine.emit = function(type, event) {
        return eventHandler.emit(type, event);
    };
    /**
     * Unbind an event by type and handler.  
     *   This undoes the work of {@link Engine#on}
     * 
     * @static
     * @name Engine#unbind
     * @function
     * @param {string} type 
     * @param {function(string, Object)} handler 
     */
    Engine.unbind = function(type, handler) {
        return eventHandler.unbind(type, handler);
    };
    /**
     * Return the current calculated frames per second of the Engine.
     * 
     * @static
     * @name Engine#getFPS
     * @function
     * @returns {number} calculated fps
     */
    Engine.getFPS = function() {
        return 1e3 / frameTime;
    };
    /**
     * Set the maximum fps at which the system should run. If internal render
     *    loop is called at a greater frequency than this FPSCap, Engine will
     *    throttle render and update until this rate is achieved.
     * 
     * @static
     * @name Engine#setFPS
     * @function
     * @param {number} fps desired fps
     */
    Engine.setFPSCap = function(fps) {
        frameTimeLimit = Math.floor(1e3 / fps);
    };
    /**
     * Return engine options
     * 
     * @static
     * @name Engine#getOptions
     * @function
     * @returns {Object} options
     */
    Engine.getOptions = function() {
        return optionsManager.getOptions.apply(optionsManager, arguments);
    };
    /**
     * Set engine options
     * 
     * @static
     * @name Engine#setOptions
     * @function
     */
    Engine.setOptions = function(options) {
        return optionsManager.setOptions.apply(optionsManager, arguments);
    };
    /**
     * Creates a new context for Famous rendering and event handling with
     *    provided HTML element as top of each tree. This will be tracked by the
     *    process-wide {@link Engine}.
     *
     * Note: syntactic sugar
     *
     * @static
     * @name Engine#createContext
     * @function
     * @param {Element} el Top of document tree
     * @returns {Context}
     */
    Engine.createContext = function(el) {
        if (el === undefined) {
            el = document.createElement(options.containerType);
            el.classList.add(options.containerClass);
            document.body.appendChild(el);
        } else if (!(el instanceof Element)) {
            el = document.createElement(options.containerType);
            console.warn("Tried to create context on non-existent element");
        }
        var context = new Context(el);
        Engine.registerContext(context);
        return context;
    };
    /**
     * Registers a context
     *
     * @static
     * @name FamousEngine#registerContext
     * @function
     * @param {Context} context Context to register
     * @returns {FamousContext}
     */
    Engine.registerContext = function(context) {
        contexts.push(context);
        return context;
    };
    /**
     * Queue a function to be executed on the next tick of the {@link
     *    Engine}.  The function's only argument will be the 
     *    JS window object.
     *    
     * @static
     * @name Engine#nextTick
     * @function
     * @param {Function} fn
     */
    Engine.nextTick = function(fn) {
        nextTickQueue.push(fn);
    };
    /**
     * Queue a function to be executed sometime soon, at a time that is
     *    unlikely to affect framerate.
     *
     * @static
     * @name Engine#defer
     * @function
     * @param {Function} fn
     */
    Engine.defer = function(fn) {
        deferQueue.push(fn);
    };
    module.exports = Engine;
});

require.register("app/main/index.js", function(exports, require, module) {
    require("famous/polyfills");
    var FamousEngine = require("famous/engine");
    var Surface = require("famous/surface");
    var Modifier = require("famous/modifier");
    var mainCtx = FamousEngine.createContext();
    var centerTransform = new Modifier({
        origin: [ .5, .5 ]
    });
    var simpleSurface = new Surface({
        size: [ 100, 100 ],
        content: "hello world",
        classes: [ "layer" ]
    });
    mainCtx.add(centerTransform).add(simpleSurface);
});

require.config({
    map: {
        "famous_modules/famous/polyfills/_git_master/index.js": {
            "./classList.js": "famous_modules/famous/polyfills/_git_master/classList.js",
            "./functionPrototypeBind.js": "famous_modules/famous/polyfills/_git_master/functionPrototypeBind.js",
            "./requestAnimationFrame.js": "famous_modules/famous/polyfills/_git_master/requestAnimationFrame.js"
        },
        "famous_modules/famous/polyfills/_git_master/classList.js": {},
        "famous_modules/famous/polyfills/_git_master/functionPrototypeBind.js": {},
        "famous_modules/famous/polyfills/_git_master/requestAnimationFrame.js": {},
        "famous_modules/famous/entity/_git_master/index.js": {},
        "famous_modules/famous/event-handler/_git_master/index.js": {},
        "famous_modules/famous/options-manager/_git_master/index.js": {
            "famous/event-handler": "famous_modules/famous/event-handler/_git_master/index.js"
        },
        "famous_modules/famous/element-allocator/_git_master/index.js": {},
        "famous_modules/famous/transform/_git_master/index.js": {},
        "famous_modules/famous/surface/_git_master/index.js": {
            "famous/entity": "famous_modules/famous/entity/_git_master/index.js",
            "famous/event-handler": "famous_modules/famous/event-handler/_git_master/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_master/index.js"
        },
        "famous_modules/famous/spec-parser/_git_master/index.js": {
            "famous/transform": "famous_modules/famous/transform/_git_master/index.js"
        },
        "famous_modules/famous/render-node/_git_master/index.js": {
            "famous/entity": "famous_modules/famous/entity/_git_master/index.js",
            "famous/spec-parser": "famous_modules/famous/spec-parser/_git_master/index.js"
        },
        "famous_modules/famous/utilities/utility/_git_master/index.js": {},
        "famous_modules/famous/transitions/multiple-transition/_git_master/index.js": {
            "famous/utilities/utility": "famous_modules/famous/utilities/utility/_git_master/index.js"
        },
        "famous_modules/famous/transitions/tween-transition/_git_master/index.js": {
            "famous/utilities/utility": "famous_modules/famous/utilities/utility/_git_master/index.js"
        },
        "famous_modules/famous/transitions/transitionable/_git_master/index.js": {
            "famous/utilities/utility": "famous_modules/famous/utilities/utility/_git_master/index.js",
            "famous/transitions/multiple-transition": "famous_modules/famous/transitions/multiple-transition/_git_master/index.js",
            "famous/transitions/tween-transition": "famous_modules/famous/transitions/tween-transition/_git_master/index.js"
        },
        "famous_modules/famous/modifier/_git_master/index.js": {
            "famous/transform": "famous_modules/famous/transform/_git_master/index.js",
            "famous/transitions/transitionable": "famous_modules/famous/transitions/transitionable/_git_master/index.js",
            "famous/utilities/utility": "famous_modules/famous/utilities/utility/_git_master/index.js"
        },
        "famous_modules/famous/context/_git_master/index.js": {
            "famous/render-node": "famous_modules/famous/render-node/_git_master/index.js",
            "famous/event-handler": "famous_modules/famous/event-handler/_git_master/index.js",
            "famous/spec-parser": "famous_modules/famous/spec-parser/_git_master/index.js",
            "famous/element-allocator": "famous_modules/famous/element-allocator/_git_master/index.js",
            "famous/transform": "famous_modules/famous/transform/_git_master/index.js",
            "famous/transitions/transitionable": "famous_modules/famous/transitions/transitionable/_git_master/index.js"
        },
        "famous_modules/famous/engine/_git_master/index.js": {
            "famous/context": "famous_modules/famous/context/_git_master/index.js",
            "famous/event-handler": "famous_modules/famous/event-handler/_git_master/index.js",
            "famous/options-manager": "famous_modules/famous/options-manager/_git_master/index.js"
        },
        "app/main/index.js": {
            "famous/polyfills": "famous_modules/famous/polyfills/_git_master/index.js",
            "famous/engine": "famous_modules/famous/engine/_git_master/index.js",
            "famous/surface": "famous_modules/famous/surface/_git_master/index.js",
            "famous/modifier": "famous_modules/famous/modifier/_git_master/index.js"
        }
    }
});
//# sourceMappingURL=build.map.js
