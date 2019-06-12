var aim = (() => {
  // TODO remove jQuery dependency
  let $ = jQuery;

  function aim(element, options) {
    init.call(element, options);
  }

  let items = [];
  /**
   * mouseVelocity Velocity of the mouse pointer
   * mouseMagnitude Magnitude of velocity
   * mousePosition Position of the mouse pointer
   * avgDeltaTime Average delta time for a simple calculation of new position, x = x0 +  v * t
   * mouseX the last retrived x coordinate of mouse cursor
   * mouseY the last retrived y coordinate of mouse cursor
   * anticipator a jquery object to debug where mouse is aiming
   * anticipator.size, anticipator.radius, anticipator.center, anticipator.rect anticipator related properties
   * anRad Radius (or size) of the anticipator, increases as mouse move faster
   */

  let constrain = (value, min, max) => {
    if (value > max) value = max;
    else if (value < min) value = min;
  };

  let getMagnitude = v => Math.sqrt(v.x * v.x + v.y * v.y);

  let createVector = () => ({ x: 0, y: 0 });

  let mouseVelocity = createVector(),
    mouseMagnitude = getMagnitude(mouseVelocity),
    mousePosition = createVector(),
    avgDeltaTime = 12,
    mouseX = 0,
    mouseY = 0,
    DEBUG = false,
    anticipator = {
      size: 50,
      center: createVector(),
      effectiveSize: 1,
    };
  anticipator.rect = {
    x0: 0,
    y0: 0,
    x1: anticipator.size,
    y1: anticipator.size,
  };

  /*
   * Default anticipate function
   *
   * @function anticipateFunc
   *
   * @param {type} position: position of anticipator
   * @param {type} velocity: velocity of anticipator
   * @param {type} mouseX mouse X coordinate
   * @param {type} mouseY mouse Y coordinate
   * @param {type} anticipator anticipator object
   * @returns {undefined}
   */

  function anticipateFunc(position, velocity, mouseX, mouseY, anticipator) {
    let a = anticipator;

    // smoothen velocity values with ratio 0.7 / 0.3
    if (position.x && position.y) {
      velocity.x = velocity.x * 0.7 + (mouseX - position.x) * 0.3;
      velocity.y = velocity.y * 0.7 + (mouseY - position.y) * 0.3;
    }

    position.x = mouseX;
    position.y = mouseY;

    mouseMagnitude = getMagnitude(velocity);
    if (mouseMagnitude < 0.1) {
      velocity.x = 0;
      velocity.y = 0;
    }

    // change radius according to magnitude
    a.effectiveSize = Math.sqrt(a.size * mouseMagnitude + 1);

    /*
      assign anticipator coordinates according to new velocity values
      and smoothen it with ratio 0.7 / 0.3
    */
    a.center.x =
      a.center.x * 0.7 + (position.x + velocity.x * avgDeltaTime) * 0.3;

    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeigh;

    constrain(a.center.x, 0, windowWidth - a.effectiveSize);

    a.rect.x0 = a.center.x - a.effectiveSize;
    a.rect.x1 = a.center.x + a.effectiveSize;

    a.center.y =
      a.center.y * 0.7 + (position.y + velocity.y * avgDeltaTime) * 0.3;

    constrain(a.center.y, 0, windowHeight - a.effectiveSize);

    a.rect.y0 = a.center.y - a.effectiveSize;
    a.rect.y1 = a.center.y + a.effectiveSize;
  }

  // $.fn.aim = function(options) {
  //   // Initialize menu-aim for all elements in collection
  //   this.each(function() {
  //     init.call(this, options);
  //   });

  //   return this;
  // };

  /*
   * Sets debug mode to true or false. If debug mode is set to true, a circle showing the
   * position and radius of anticipator will be created
   *
   * @param {type} val
   * @returns {undefined}
   */

  $.aim = {};

  function setDebug(isDebugEnabled) {
    let debugElement = document.querySelector('#aim-debug');

    if (isDebugEnabled) {
      if (debugElement) return;

      let debugObject = createDebugObject();
      anticipator.element = debugObject;
    } else {
      debugElement && debugElement.remove();
      anticipator.element = null;
    }
    DEBUG = isDebugEnabled;
  }

  $.aim.setDebug = setDebug;
  aim.setDebug = setDebug;

  function setAnticipateFunction(func) {
    if (typeof func === 'function') {
      anticipateFunc = func;
    }
  }

  aim.setAnticipateFunction = setAnticipateFunction;

  function getData(element) {
    let rect = element.getBoundingClientRect();
    let { x, y, width, height } = rect;

    return {
      rect: {
        x0: x,
        y0: y,
        x1: x + width,
        y1: y + height,
      },
      center: { x, y },
      increment: 0,
    };
  }

  /*
   * Creates a circle jquery object which is to be used to
   * show where the anticipator is at any time
   *
   * @returns {Object}
   */
  function createDebugObject() {
    let size = anticipator.size;
    let element = document.createElement('div');
    element.setAttribute('id', 'aim-debug');
    element.className = 'aim-debug';
    element.style.width = 2 * size + 'px';
    element.style.height = 2 * size + 'px';
    element.style['margin-left'] = -size + 'px';
    element.style['margin-top'] = -size + 'px';

    document.body.appendChild(element);

    return element;
  }

  /*
   * Tests rectangle - rectangle intersection and gives the ratio of intersection. Max 1, min 0.
   *
   * @param {type} rect The first rectange
   * @param {type} rect2 The second rectange
   * @returns {Number} Ratio of intersection area to area of tailblazer
   */

  function intersectRatio(rect, rect2) {
    let x_overlap = Math.max(
      0,
      Math.min(rect.x1, rect2.x1) - Math.max(rect.x0, rect2.x0)
    );
    let y_overlap = Math.max(
      0,
      Math.min(rect.y1, rect2.y1) - Math.max(rect.y0, rect2.y0)
    );

    return (
      (x_overlap * y_overlap) /
      (anticipator.effectiveSize * anticipator.effectiveSize)
    );
  }

  function init(options) {
    let duplicate = false;
    items.forEach(item => {
      if (item.element === this) {
        console.warn('init duplicate', this);
        duplicate = true;
        return;
      }
    });

    if (duplicate) return;

    let data = getData(this);
    data.options = options;
    items.push({ element: this, data });
  }

  let tick = () => {
    let a = anticipator;

    if (!items.length) return;

    anticipateFunc(mousePosition, mouseVelocity, mouseX, mouseY, a);

    if (DEBUG) {
      a.element.style.transform = `translate(${a.center.x}px, ${
        a.center.y
      }px) scale(${a.effectiveSize / a.size})`;
    }

    /*
     * Iterate over each elements and calculate increment for all
     * In each cycle, it increases by a value between 0 - 0.2 (reaches max if it fully intersects) and decreases by 0.05
     * Increment can be between 0 and 2
     * If it's greater than 1, aimEnter function will be called
     * if it's less than or equal to 0, aimExit function will be called
     */

    items.forEach(item => {
      let target = item.element;
      let data = item.data;

      let intersectRatioValue = intersectRatio(data.rect, a.rect);

      // check if they intersects and mouse is not on the element
      if (intersectRatioValue && mouseMagnitude !== 0) {
        data.increment = data.increment + intersectRatioValue * 0.2;
        if (data.increment > 1 && data.increment < 2) {
          data.options.className &&
            target.classList.add(data.options.className);
          if (typeof data.options.aimEnter === 'function')
            data.options.aimEnter.call(target, {});

          if (data.increment > 2) data.increment = 2;

          if (DEBUG) a.element.style['background-color'] = 'tomato';
        } else if (data.increment > 2) {
          data.increment = 2;
          if (DEBUG) a.element.style['background-color'] = 'tomato';
        }
        return;
      } else {
        if (DEBUG) a.element.style['background-color'] = 'yellowgreen';
      }

      if (data.increment !== 0) {
        data.increment = data.increment - 0.05;
        if (data.increment < 0) {
          data.increment = 0;
          data.options.className &&
            target.classList.remove(data.options.className);
          if (typeof data.options.aimExit === 'function')
            data.options.aimExit.call(target, {});
        }
      }
    });
  };

  let isRunning = true;
  let run = () => {
    let token;
    tick();
    if (isRunning) {
      token = requestAnimationFrame(run);
    } else {
      cancelAnimationFrame(token);
    }
  };

  let onMouseMove = e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  };

  aim.start = () => {
    document.addEventListener('mousemove', onMouseMove);
    isRunning = true;
    run();
  };
  aim.stop = () => {
    isRunning = false;
    document.removeEventListener('mousemove', onMouseMove);
  };

  aim.updateElement = element => {
    // TODO: find element in array and update getBoundingClientRect
  };

  return aim;
})();
