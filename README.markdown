# cajal #
cajal is a javascript library to draw and animate shapes on the HTML5 canvas element


## Installation ##
Download the source and include the cajal.js file in the head section of your html document:

```html
<script type="text/javascript" src="cajal.js"></script>
```

## Getting an instance of cajal ##
To create a instance of the cajal library call the cajal constructor and pass the id attribute or the DOM-object of your canvas element as an argument

```html
<canvas id="mycanvas" width="800" height="600"></canvas>
<script type="text/javascript">
	//passing the element id attribute
	var c = new cajal('mycanvas');
	//in combination with jQuery
	var c2 = new cajal($('#mycanvas').get(0));
</script>
```

### Global settings ###
There are a few options you can set globally for the cajal instance by passing a literal object as a second parameter to the cajal constructor.

```html
<canvas id="mycanvas" width="800" height="600"></canvas>
<script type="text/javascript">
	var c = new cajal('mycanvas', {
		globalAlpha: 0.5,
		globalCompositeOperation: 'lighter',
	});
</script>
```

This literal object can have the following variables:

* `autoClearCanvas`: Boolean weather the canvas is cleared automatically each `draw()` call [default value *true*]
* `globalAlpha`: Double between 0 and 1 which defines the global alpha value applied to each item drawn
* `globalCompositeOperation`: Describes how the items are drawn to the canvas [default value *source-over*] ([more information](https://developer.mozilla.org/samples/canvas-tutorial/6_1_canvas_composite.html))
* `loopFps`: Frame rate for animations (frames/sec)

##  The shapes  ##
Each shape is an object that is independet from the canvas it is later drawn on. So you can draw the same shape (e.g. a circle) on several canvas elements.


### Circle ###
You can create a circle by calling the circle constructor `cajal.Circle(xPos, yPos, radius)`. The arguments are the x and y position of the circle and the radius.

```javascript
var circle = new cajal.Circle(50, 80, 30);
```

#### Item specific methods ####
* `center()`: The return value is a literal object with the x and the y coordinates of the circle's center. (For example: `{ x: 50, y: 80}`)


### Rectangular ###
Create a rectangular using `cajal.Rect(xPos, yPos, width, height, [radius])`. The parameter `radius` is optional for creating a rectangular with rounded corners.

```javascript
//normal rectangular
var rect = new cajal.Rect(50, 80, 100, 120);

//rounded corners
var roundedRect = new cajal.Rect(50, 80, 100, 120,30);
```

#### Item specific methods ####
* `center()`: The return value is a literal object with the x and the y coordinates of the rectangular's center. (For example: `{ x: 50, y: 80}`)
* `width()`: Returns the width of the rectangular
* `height()`: Returns the height of the rectangular


### Path ###
Create a path object with `cajal.Path(xPos, yPos)`. There are several methods you can call to add points, or bezier curves to this path.

```javascript
var path = cajal.Path(20, 30).to(100, 30).to(100, 80).close();
```

#### Item specific methods ####
* `line(xPos, yPos)`: Draw a line from the last point in path to the position (xPos, yPos)
* `to(xPos, yPos)`: Synonym for `line(xPos, yPos)`
* `quadraticCurve(xPos, yPos, cx, cy)`: Draw a quadratic bezier curve to (xPos, yPos) with the control point (cx, cy)
* `bezierCurve(xPos, yPos, c1x, c1y, c2x, c2y)`: Draw a quadratic bezier curve to (xPos, yPos) with the control points (c1x, c1y) and (c2x, c2y)
* `close()`: Close the path (every path will be automatically closed before drawing it on the canvas)
* `center()`: The return value is a literal object with the **approximate** x and the y coordinates of the path's center. (For example: `{ x: 50, y: 80}`)


### Text ###
Create a text object with `cajal.Text(xPos, yPos, text)`.

```javascript
var text = cajal.Text(20, 30, 'cajal - canvas javascript library');
```

#### Item specific methods ####
* `append(text)`: Append text to the current text
* `prepend(text)`: Prepend text to the current text
* `text(text)`: Set new text
* `center()`: The return value is a literal object with the **approximate** x and the y coordinates of the center. (For example: `{ x: 50, y: 80}`)


### Polygon ###
Create a symmetric polygon object with `cajal.Polygon(xPos, yPos, edges, radius)`.
Example: create a poygon with 5 edges and a radius of 30px

```javascript
var poly = cajal.Polygon(20, 30, 5, 30);
```

#### Item specific methods ####
* `setPoints(n, r)`: Set the number of edges and the radius to new values
* `center()`: The return value is a literal object with the x and the y coordinates of the center. (For example: `{ x: 50, y: 80}`)


### Circle sector ###
A circle sector (circular sector) is the part of a circle defined by a radius and an angle, that you can find in a pie chart for example.
You can create that circle sector with the method `cajal.CircleSector(x, y, r, angle)`
Example: create a circle sector with an angle of 120 Degrees and a radius of 50

```javascript
var csec = cajal.CircleSector(20, 30, 50, 120);
```

### Circle segment ###
A circle segment (circular segment) is a part of a circle defined by a radius and an angle. Compared with the circle sector, a segment does not contain the inner part of a circle. It is cut off by a line from the start and end point of the circular arc.
You can create that circle segment with the method `cajal.CircleSegment(x, y, r, angle)`
Example: create a circle segment with an angle of 120 Degrees and a radius of 50

```javascript
var cseg = cajal.CircleSsegment(20, 30, 50, 120);
```

#### Item specific methods ####
* `close()`: Connect the end and start point of the circular arc with a line.


### Methods for every item ###
There are a bunch of methods that you can call on each item object to modify it.

* `clone()`: Returns a clone of the item
* `hide()`: Hide the item (will not be drawn on the canvas)
* `show()`: Show the item if it was hidden
* `changeMatrix(m11, m12, m21, m22, dy, dx)`: Change the matrix of the canvas element only for this item. The current matrix will be multiplied with your matrix (scaling, rotation and moving can be done in one step if you know the basics of matrix stuff)
* `setMatrix(m11, m12, m21, m22, dy, dx)`: Set the matrix of the canvas element only for this item. The current matrix will be overwritten with your matrix (scaling, rotation and moving can be done in one step if you know the basics of matrix stuff)
* `rotate(angle, [point])`: Rotate the item to the given angle (in degrees). If you want the item not to rotate around its center but around a specific point, can pass a literal object with x and y as the points parameter. (`{x:23, y: 56}` will rotate around the point (23|65) )
* `rotateBy(angle, [point])`: Rotate the item by a given angle (in degrees). If you want the item not to rotate around its center but around a specific point, can pass a literal object with x and y as the points parameter. (`{x:23, y: 56}` will rotate around the point (23|65) )
* `move(x, y)`: Move the item to the given position
* `moveBy(dx, dy)`: Move the item by the given offset
* `scale(dx, dy)`: Scale the item to a given size `item.scale(1.2, 1.2)` will scale your item to 120% of its _initial_ size
* `scaleBy(dx, dy)`: Scale the item by a given size `item.scaleBy(1.5, 1.5)` will scale your item to 150% of its _current_ size
* `options(options)`: Set draw options for this item as described in the chapter below


### Draw options ###
The draw options must be a literal object with the following optional variables. Other variables will be ignored by the script and can be used as a data storage for item relevant information

* `stroke`: Color to stroke, or *null* for no stroke. Accepted values are hexadecimal color codes (e.g. #175175), strings (e.g. *red* or *blue*), rgb(a) values (e.g. *rgba(120,200,85,0.7)* or *rgb(120,200,85)*) [default value: *null*]
* `fill`: Color to fill, or *null* for no filling. Accepted values are hexadecimal color codes (e.g. #175175), strings (e.g. *red* or *blue*), rgb(a) values (e.g. *rgba(120,200,85,0.7)* or *rgb(120,200,85)*) [default value: *null*]
* `width`: Width of the stroke line [default value: 1]
* `font`: Font size and family for text renderings [default value: '13px sans-serif']
* `lineCap`: Accepted values: *butt*, *square* and *round* [default value: *butt*] ([more information](http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#line-styles))
* `lineJoin`: Accepted values: *miter*, *bevel* and *round* [default value: *miter*] ([more information](http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#line-styles))
* `miterLimit`: [default value: 10] ([more information](http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#line-styles))
* `shadowX`: Shadow x offset
* `shadowX`: Shadow y offset
* `shadowBlur`: Shadow blur value
* `shadow`: Shadow color or *null* for no shadow. Accepted values are hexadecimal color codes (e.g. #175175), strings (e.g. *red* or *blue*), rgb(a) values (e.g. *rgba(120,200,85,0.7)* or *rgb(120,200,85)*) [default value: *null*]


## How to add, remove and draw items to the canvas ##
First of all you need an instance of cajal for the canvas element that you want to draw on.


### Add items ###
Then you can add items with the method `add()`. There are two ways to use this method. You can either pass the item as one argument, or you pass an itemId and the item as two arguments.
If you want to change the item you need to specify a name (itemId) for it, so that you can access the item with the get-Method afterwards. In the case of a more simple usage, you can pass only the item object, but you will not be able to change this item afterwards.
If you add an item with an itemId that already exists, it will be overwritten.

Example: drawing a circle

```javascript
// get the cajal instance
var c = cajal('mycanvas');

// create a black circle with a white 2px stroke
var circle = cajal.Circle(30,40,100).options({
	fill   : 'black',
	stroke : 'white',
	width  : 2
});

// add the item to the cajal instance with a name
c.add('myCircle', circle);

// draw all items (in that case only the circle
c.draw();
```


### Get an item for manipulation ###
If you want to manipulate your item after adding it to the cajal instance call `get(itemId)`

Example: fill the circle created above blue and move by 100px right and 50px down

```javascript
c.get('myCircle').move(100, 50).options({
	fill: 'blue'
});

// draw again to see the changes
c.draw()
```


### Overwrite an existing item ###
If you want to overwrite the circle created above use `set(itemid, newItem)`.

Example: Replace the circle with a rectangular

```javascript
c.set('myCircle', new cajal.Rect(30, 40, 100, 200).options({
	fill   : 'blue',
	stroke : 'white',
	width  : 3
}));

// draw again to see changes
c.draw();
```

### Remove items ###
You can remove an item from the canvas with `remove(itemId)` where `itemId` is your name for the item used in the `add` method

Example: removing the circle created above

```javascript
c.remove('myCircle');
```

### Promote and demote items ####
The items are drawn in the order they are added to the cajal instance. That means, that the item that is added first will be on the bottom layer and the item added last on the top layer. To rearrange those layers and promote or demote items you can use the following functions:

* `up()`: Moves the item up one layer
* `down()`: Moves the item down one layer
* `top()`: Moves the item to the top (If another item is added afterwards, the new item will be on the top layer)
* `bottom()`: Move the item to the bottom

Example: Three overlapping circles and some rearrangement

```javascript
var c = new cajal('mycanvas');

var circle = new cajal.Circle(150, 150, 100);

c.add('c1', circle.clone().options({
	fill: 'red'
}));
c.add('c2', circle.clone().moveBy(100,0).options({
	fill: 'green'
}));
c.add('c3', circle.clone().moveBy(50,100).options({
	fill: 'blue'
}));

c.draw();
```

Now you have three circles (red, green and blue one) with the red on the bottom and the blue on the top. `c.get('c1').up()` will bring the red circle one layer up. So now the green one is on the bottom. I think that should be enough to get the concept.


### Clear canvas ###
With the method `clear()` you clear the canvas.

### Define global draw options ###
If you want all items drawn with the same draw options you can pass a literal object with the draw options as a parameter to the `draw()` method. Those draw options will overwrite the draw options of each item only for this draw call. Calling the draw method without a parameter will draw the items with their specific draw options again.
See above for the different draw option variables.


## Animations ##
So after knowing how to draw on the canvas we want to take a look on how to animate our elements. The cajal library has no default animations implemented, so that you must create animations by yourself. A animation is a normal function with some optional parameters.
A basic animation function:

```javascript
var myAnimation = function (frame, duration) {
	// move the item 'myItem' by 0.5px to the right, 0.3px to the bottom and rotate it by 1 degree counter-clockwise
	this.get('myItem').moveBy(0.5,0.3).rotateBy(-1);
}
```

Inside the animation function you can access the cajal instance the animation is running using `this`. That makes an animation independent from the canvas it is called on and you can reuse your animation functions on different canvas elements.
This function can be triggered to start or stop by calling the function `animate(animation, [duration])` and `stop(animation)`. The animation parameter in both functions is the animation function that we created.

```javascript
// start the myAnimation animation and set the lifetime to 500 frames
c.animate(myAnimation, 500);
```

Now this function is called every frame (default framerate is set to 30) and after 500 calls/frames it will be stopped.
The `duration` parameter is optional and leaving it blank will run the animation until you stop it manually.


### Easing functions ###
To get more natural movements cajal comes with some easing functions from [Robert Penner](http://www.robertpenner.com/) which were adopted to work with cajal animations. Here is a complete list of all implemented easing functions:

* `quadIn(d, f, t)`
* `quadIn(d, f, t)`
* `quadIn(d, f, t)`
* `expIn(d, f, t, p)`
* `expOut(d, f, t, p)`
* `expInOut(d, f, t, p)`
* `backIn(d, f, t, a)`
* `backOut(d, f, t, a)`
* `backInOut(d, f, t, a)`
* `bounceIn(d, f, t)`
* `bounceOut(d, f, t)`
* `bounceInOut(d, f, t)`
* `elasticIn(d, f, t, p)`
* `elasticOut(d, f, t, p)`
* `elasticInOut(d, f, t, p)`

Example: using expInOut with a power of 3 to move a rectangular by 300px on the x axis to the right

```javascript
//define the animation function
var myEasingAnimation = function (frame, duration) {
	var dx = cajal.Ease.expInOut(300, frame, duration, 3);
	this.get('myRect').moveBy(dx, 0);
}

//add a rectangular with 5px rounded corners
c.add('myRect', new cajal.Rect(50, 30, 50, 50, 5).options({
	fill: 'black'
}));

//start animation and set lifetime to 350 frames
c.animate(myEasingAnimation, 350);
```
