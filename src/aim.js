let qsa = expr => [].slice.call(document.querySelectorAll(expr), 0);

let uid = () => (Math.random() + "").substr(2);

function aim(params) {
  let { target } = params;
  let options = { ...params };
  delete options.target;

  if (typeof target === "string") {
    let elems = qsa(target);
    if (elems && elems.length) {
      let ids = [];
      elems.forEach(el => {
        let id = uid();
        items.push({ id, target: el, data: getData(el), options });
        ids.push(id);
      });

      if (elems.length === 1) return ids[0];

      return ids;
    }
  }

  let id = uid();
  items.push({ id, target, data: getData(target), options });
  return id;
}

let items = [];
/**
 * pointerVelocity Velocity of the pointer pointer
 * pointerMagnitude Magnitude of velocity
 * pointerPosition Position of the pointer pointer
 * avgDeltaTime Average delta time for a simple calculation of new position, x = x0 +  v * t
 * pointerX the last retrived x coordinate of pointer cursor
 * pointerY the last retrived y coordinate of pointer cursor
 * anticipator an object to debug where pointer is aiming
 * anticipator.size, anticipator.radius, anticipator.center, anticipator.rect anticipator related properties
 * anRad Radius (or size) of the anticipator, increases as pointer move faster
 */

let clamp = (value, min, max) => Math.min(Math.max(value, min), max);

let getMagnitude = ({ x, y }) => Math.sqrt(x * x + y * y);

let getAngle = ({ x, y }) => (Math.atan2(y, x) * 180) / Math.PI;

let createVector = () => ({ x: 0, y: 0 });

let pointerVelocity = createVector(),
  pointerMagnitude = getMagnitude(pointerVelocity),
  pointerPosition = createVector(),
  avgDeltaTime = 12,
  pointerX = 0,
  pointerY = 0,
  DEBUG = false,
  anticipator = {
    size: 50,
    center: createVector(),
    effectiveSize: 1
  };
anticipator.rect = {
  x0: 0,
  y0: 0,
  x1: anticipator.size,
  y1: anticipator.size
};

/*
 * Default anticipate function
 *
 * @function anticipateFunc
 *
 * @param {type} position: position of anticipator
 * @param {type} velocity: velocity of anticipator
 * @param {type} pointerX pointer X coordinate
 * @param {type} pointerY pointer Y coordinate
 * @param {type} anticipator anticipator object
 * @returns {undefined}
 */

let anticipateFunc = ({
  position,
  velocity,
  pointerX,
  pointerY,
  anticipator
}) => {
  let a = anticipator;

  // smoothen velocity values with ratio 0.7 / 0.3
  if (position.x && position.y) {
    velocity.x = velocity.x * 0.7 + (pointerX - position.x) * 0.3;
    velocity.y = velocity.y * 0.7 + (pointerY - position.y) * 0.3;
  }

  position.x = pointerX;
  position.y = pointerY;

  pointerMagnitude = getMagnitude(velocity);
  if (pointerMagnitude < 0.1) {
    velocity.x = 0;
    velocity.y = 0;
  }

  // change radius according to magnitude
  a.effectiveSize = Math.sqrt(a.size * pointerMagnitude + 1);

  /*
      assign anticipator coordinates according to new velocity values
      and smoothen it with ratio 0.7 / 0.3
    */
  a.center.x =
    a.center.x * 0.7 + (position.x + velocity.x * avgDeltaTime) * 0.3;

  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeigh;

  clamp(a.center.x, 0, windowWidth - a.effectiveSize);

  a.rect.x0 = a.center.x - a.effectiveSize;
  a.rect.x1 = a.center.x + a.effectiveSize;

  a.center.y =
    a.center.y * 0.7 + (position.y + velocity.y * avgDeltaTime) * 0.3;

  clamp(a.center.y, 0, windowHeight - a.effectiveSize);

  a.rect.y0 = a.center.y - a.effectiveSize;
  a.rect.y1 = a.center.y + a.effectiveSize;
};

aim.setDebug = isDebugEnabled => {
  let debugElement = document.getElementById("#__aim-debug");

  if (isDebugEnabled) {
    if (debugElement) return;

    anticipator.element = createDebugObject();
  } else {
    anticipator.element = null;
    debugElement && debugElement.remove();
  }
  DEBUG = isDebugEnabled;
};

aim.setAnticipateFunction = func => {
  anticipateFunc = func;
};

let getData = target => {
  let rect = null;
  if (target instanceof HTMLElement) {
    rect = target.getBoundingClientRect();
  }

  let { x, y, width, height } = rect || target;

  if (width === "100%") {
    x = 0;
    width = window.innerWidth;
  }
  if (height === "100%") {
    y = 0;
    height = window.innerHeight;
  }

  return {
    rect: {
      x0: x,
      y0: y,
      x1: x + width,
      y1: y + height
    },
    center: { x, y },
    increment: 0
  };
};

/*
 * Creates a circle object which is to be used to
 * show where the anticipator is at any time
 *
 * @returns {Object}
 */
function createDebugObject() {
  let size = anticipator.size;
  let element = document.createElement("div");
  element.setAttribute("id", "__aim-debug");
  element.style.width = 2 * size + "px";
  element.style.height = 2 * size + "px";
  element.style["margin-left"] = -size + "px";
  element.style["margin-top"] = -size + "px";

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

let getParamsForCallback = ({ item, intersectRatioValue }) => ({
  angle: getAngle(pointerVelocity),
  velocity: pointerVelocity,
  magnitude: pointerMagnitude,
  intersectRatioValue: intersectRatioValue || 0,
  rect: item.data.rect,
  id: item.id,
  target: item.target
});

let tick = () => {
  let a = anticipator;

  if (!items.length) return;

  anticipateFunc({
    position: pointerPosition,
    velocity: pointerVelocity,
    pointerX,
    pointerY,
    anticipator
  });

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
    let { target, data, options } = item;

    let intersectRatioValue = intersectRatio(data.rect, a.rect);

    // check if they intersects and pointer is not on the element
    if (intersectRatioValue && pointerMagnitude !== 0) {
      data.increment += intersectRatioValue * 0.2;
      if (1 < data.increment && data.increment < 2) {
        if (options.className && target instanceof HTMLElement)
          target.classList.add(options.className);
        if (typeof options.aimEnter === "function")
          options.aimEnter.call(
            target,
            getParamsForCallback({
              item,
              intersectRatioValue
            })
          );

        if (DEBUG) {
          a.element.classList.add("__aim-debug--hit");
        }
      } else if (data.increment > 2) {
        data.increment = 2;
        if (DEBUG) a.element.classList.add("__aim-debug--hit-2");
      } else {
      }
      return;
    } else {
      if (DEBUG) {
        setTimeout(() => {
          a.element.classList.remove("__aim-debug--hit");
          a.element.classList.remove("__aim-debug--hit-2");
        }, 0);
      }
    }

    if (data.increment !== 0 && intersectRatioValue === 0) {
      data.increment -= 0.05;
      if (data.increment < 0) {
        data.increment = 0;
        if (options.className && target instanceof HTMLElement)
          target.classList.remove(options.className);
        if (typeof options.aimExit === "function") {
          options.aimExit.call(target, getParamsForCallback({ item }));
        }
      }
    }
  });
};

let isRunning = true;
let run = () => {
  tick();
  if (isRunning) requestAnimationFrame(run);
};

let onMove = e => {
  pointerX = e.clientX;
  pointerY = e.clientY;
};

let aimHasStarted = false;

aim.start = () => {
  if (aimHasStarted) return;

  aimHasStarted = true;
  document.addEventListener("mousemove", onMove);
  isRunning = true;
  run();
};
aim.stop = () => {
  if (!aimHasStarted) return;

  aimHasStarted = false;

  isRunning = false;
  document.removeEventListener("mousemove", onMove);
};

aim.remove = target => {
  let wasRemoved = false;
  if (target instanceof HTMLElement) {
    items.forEach(item => {
      if (item.target === target) {
        item = null;
        wasRemoved = true;
        return;
      }
    });
  } else {
    items.forEach(item => {
      if (item.id === target.id) {
        item = null;
        wasRemoved = true;
        return;
      }
    });
  }
  if (wasRemoved) items = items.filter(Boolean);

  return wasRemoved;
};

aim.updatePosition = target => {
  if (!target) return false;

  let wasUpdated = false;

  if (target === "dom") {
    items.forEach(item => {
      if (item.target instanceof HTMLElement) {
        item.data = getData(item.target);
        wasUpdated = true;
      }
    });
  } else if (target.id) {
    items.forEach(item => {
      if (item.id === target.id) {
        item.data = getData(target);
        wasUpdated = true;
        return;
      }
    });
  } else {
    items.forEach(item => {
      if (item.target === target) {
        item.data = getData(target);
        wasUpdated = true;
        return;
      }
    });
  }
  return wasUpdated;
};

export default aim;
