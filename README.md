# aim

A Vanilla JS library that anticipates on which element user is going to hover or click.

![test](img/demo.gif 'lorem')

## Size

UMD minified 3.82kb, gzipped 1.50kb

## Examples

A couple of examples can be found the [examples page](http://kunukn.github.io/aim/examples/index.html)

## Usage

Call the function on the elements to catch user aim and add a class which will be added or removed when aiming starts or ends

```javascript
// Target by DOM element
let id1 = aim({
  target: document.querySelector('#my-element'),
  className: 'open',
});

// Target by manual data
let id2 = aim({
  target: {x: 0, y: 0, width: 200, height: 200},
  aimEnter: () => console.log('target activated'),
});

aim.start(); // start the aim library
```

If you want to execute a function on aim starts or ends, use the `aimEnter` and `aimExit` options

```javascript
let menu = document.querySelector('#menu');
let id = aim({
  target: document.querySelector('#hamburger'),
  aimEnter: () => {menu.style.display = 'block'},
  aimExit: () => {menu.style.display = 'none'}
});

aim.start();
```

## Debugging

To see where your cursor is aiming and check if it intersects with elements use

```javascript
aim.setDebug(true);
```

and you will see a rectangle moving around.

## Defining own function

If you don't like the default algorithm, define your own by the following procedure

```javascript
function anticipateFunc(position, velocity, pointerX, pointerY, anticipator) {
  /*
  Calculate the new position of anticipator using inputs
  position = {x:number,y:number}
  velocity = {x:number,y:number}
  pointerX = number
  pointerY = number

  Anticipator has some readonly values like the following

  {
      size: 50,
      center: {x: 0, y: 0},
      effectiveSize: 1,
      rect : {x0: 0, y0: 0, x1: 50, y1: 50}
  }

  */
}

aim.setAnticipateFunction(anticipateFunc);
```

## Other methods

`aim.stop()` stop the library

`aim.remove(target)` remove the target. Target can either be a DOM element or an object with id `{id: 'the-given-id-when-the-target-was-added'}`.

`aim.updatePosition(target)` Tell the library to update it's internal information of where the element is positioned. Target can either be a DOM element or an object with id.
