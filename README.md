# aim

A Vanilla JS library that anticipates on which element user is going to hover or click.

The gif animation and algorithm concept is from https://github.com/cihadturhan/jquery-aim

![test](img/demo.gif 'lorem')


## Size

UMD minified 4.7kb, gzipped minified 1.9kb

## Demo

https://s.codepen.io/kunukn/debug/690fb382ae6450c8bf14ad9909a60df2


## Getting started

`npm i @kunukn/aim`<br>
or<br>
`yarn add @kunukn/aim`


## Usage

Call the function on the `querySelectorAll string` to catch user aim and add a class which will be added or removed when aiming starts or ends.

```javascript
import aim from '@kunukn/aim'

// Target all elements who has a class name of target
aim({
  target: '.target',
  className: 'open',
});

aim.start(); // start the aim library, you only need to run this once.
```

Call the function on the element to catch user aim and add a class which will be added or removed when aiming starts or ends.

```javascript
// Target by DOM element
aim({
  target: document.querySelector('#my-element'),
  className: 'open',
});

aim.start(); // start the aim library
```

Call the function on the object to catch user aim for that area.

```js
// Target by manual data
aim({
  target: { x: 10, y: 10, width: 200, height: 200 },
  aimEnter: () => console.log('target enter'),
});

// Target by manual data, full width example
aim({
  target: { y: 10, width: '100%', height: 200 },
  aimEnter: () => console.log('target enter'),
});

aim.start(); // start the aim library
```

If you want to execute a function on aim starts or ends, use the `aimEnter` and `aimExit` options

```javascript
let menu = document.querySelector('#menu');
let id = aim({
  target: '#hamburger',
  aimEnter: () => {
    menu.style.display = 'block';
  },
  aimExit: () => {
    menu.style.display = 'none';
  },
});

aim.start();
```

## CDN

https://unpkg.com/@kunukn/aim/

## Supported browsers

IE11 + Modern browsers


## Debugging

To see where your cursor is aiming and check if it intersects with elements use

```javascript
aim.setDebug(true);
```

You will need to add CSS for the debug object.

```html
<style>
#__aim-debug {
  position: fixed;
  top: 0;
  left: 0;
  border: 2px solid #333;
  opacity: 0.3;
  background-color: yellowgreen;
  pointer-events: none;
}
#__aim-debug.__aim-debug--hit {
  background-color: purple;
}
#__aim-debug.__aim-debug--hit-2 {
  background-color: tomato;
}
</style>
```

Then you will see a rectangle moving around.


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

## Development

- git clone the project
- yarn install
- use a modern browser like Chrome or Firefox

### start dev mode

`yarn dev`

### smoke test the compiled library

`yarn start`

### build

`yarn build`

## Learning materials

If you want to learn how to implement tracking algorithm like this. Then I recommend to explore this resource:
https://natureofcode.com/book/chapter-1-vectors/
