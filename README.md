angularJS-range-slider
======================

Couldn't find one for desktop AND mobile that wasn't flakey so I made my own. Super simple, doesn't require jQuery, images or CSS file.

Use it like this:
<slider min="mileageMin" max="mileageMax" low="mileageLow" high="mileageHigh" setter-low="applyFilter('low', low, 'mileage');" setter-high="applyFilter('high', high, 'mileage');" width="500" interval="5000" width-handle="18" promise-init="inventoryLoaded"></slider>

Details:
All parameters are required

- min is the lowest possible value 
- max highest possible
- low is current low handle setting (>= min)
- high is current high handle setting (<= max)
- setter-low is a "&" callback to set low (see angular docs if this is confusing) where parameter 1 (0 scale) is replaced with a value
  You have to define scope.setterLow yourself
- setter-high - same as setter low but for high handle
- width - the width of the entire widget... sorry.. can't do percentages right now
- interval - change values in increments of some number
- width-handle - how wide to you want the handles to be?
- promise-init - init widget after this promise is resolved
