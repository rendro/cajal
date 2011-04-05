(function () {
    cajal.extend({

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

            // Secondary hitmap canvas
            var map = cajalInstance.canvas.cloneNode(true);

            //make map sthe size of origin canvas
            var width = parseInt(map.width,10);
            var height = parseInt(map.height,10);

            //check if any item was hit
            var imageData = cajalInstance.ctx.getImageData(x, y, 1, 1).data;

            if (imageData[0] === 0 && imageData[1] === 0 && imageData[2] === 0 && imageData[3] === 0) {
                return null;
            }
            //otherwise an item was found, so it's up now to check wich one

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

            //loop through blocks
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
                c.items = [];
                // draw all items to the temp canvas
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
})();